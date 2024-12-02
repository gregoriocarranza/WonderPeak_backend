import { PostInputDTO } from '../../../SQL/dto/post/post.input.dto';
import { SqlValidatorError } from '../../../SQL/error/sql.validator.error';
import { IPost } from '../../../SQL/Interface/IPost';
import { PostService } from '../../Services/Post/post.service';
import { UuidInputDTO } from '../../dto/input/uuid.input.dto';
import { PostDTO } from '../../dto/post/post.dto';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';
import { IDataPaginator } from '../../Services/interfaces/IDataPaginator';
import { inputValidator } from '../../utils/inputValidator';
import { paginationHelper } from '../../utils/pagination.helper';
import { parseError } from '../../utils/parseError';
import { IInputValidator } from '../../utils/types';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IPostController } from './post.controller.interface';
import { PostMiscUpdateInputDTO } from '../../dto/post/post.misc.update.dto';
import { AdService } from '../../Services/Ad/ad.service';
import { AdsDTO } from '../../dto/post/ads.dto';
import { InteractionsInputDTO } from '../../../SQL/dto/interactions/interaction.dto';
import { IInteractions } from '../../../SQL/Interface/IInteractions';
import { IUser } from '../../../SQL/Interface/IUser';
import { UserService } from '../../Services/User/user.service';
import multer from 'multer';

const DEFAULT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) * 1024 * 1024;

const fileSizeLimit =
  !isNaN(MAX_FILE_SIZE) && MAX_FILE_SIZE > 0
    ? MAX_FILE_SIZE
    : DEFAULT_FILE_SIZE;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileSizeLimit },
}).single('multimediaFile');

export class PostController implements IPostController {
  private _postService: PostService = new PostService();
  private _adService: AdService = new AdService();
  private _userService: UserService = new UserService();

  constructor() {}

  public async getAll(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { mine } = req.query;
      const { page, limit } = paginationHelper(req);
      const { userUuid } = req.user;
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const followings: IDataPaginator<IUser> =
        await this._userService.getAllFollowers(
          false,
          userUuid,
          offset,
          newLimit
        );
      let followersUuidsLists: Array<string> = [];

      if (mine == 'true') {
        followersUuidsLists.push(userUuid);
      }

      followings.data.forEach((user) => {
        followersUuidsLists.push(user.userUuid);
      });

      const result: IDataPaginator<IPost> = await this._postService.getFeed(
        offset,
        newLimit,
        followersUuidsLists
      );

      const postsPromises: Promise<PostDTO>[] =
        result.data?.map(
          async (a: IPost) =>
            await new PostDTO({
              ...a,
              isLiked: await this._postService.isLiked(userUuid, a.postUuid),
              isFavorite: await this._postService.isFavorite(
                userUuid,
                a.postUuid
              ),
            }).build()
        ) || [];
      const postsDTO: PostDTO[] = await Promise.all(postsPromises);

      // Fetch ads
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const ads = await this._adService.getAds();

      const adsPromises: Promise<AdsDTO>[] =
        ads
          .filter(
            (a) =>
              a.date.start <= currentTimestamp && a.date.end >= currentTimestamp
          )
          .map(async (a) => await new AdsDTO(a).build()) || [];

      const adsDTO: AdsDTO[] = await Promise.all(adsPromises);

      // Mix posts and ads
      const mixedContent = [];
      let adIndex = 0;
      for (let i = 0; i < postsDTO.length; i++) {
        mixedContent.push(postsDTO[i]);
        if ((i + 1) % 3 === 0 && adIndex < adsDTO.length) {
          mixedContent.push(adsDTO[adIndex]);
          adIndex++;
        }
      }

      res.json({ ...result, ...{ data: mixedContent } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Feed'));
      }
    }
  }

  public async getAllByUserUuid(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.params;
      const { userUuid: jwtUserUuid } = req.user;
      const { page, limit } = paginationHelper(req);
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const result: IDataPaginator<IPost> =
        await this._postService.getAllByUserUuid(userUuid, offset, newLimit);
      const postsPromises: Promise<PostDTO>[] =
        result.data?.map(
          async (a) =>
            await new PostDTO({
              ...a,
              isLiked: await this._postService.isLiked(jwtUserUuid, a.postUuid),
              isFavorite: await this._postService.isFavorite(
                jwtUserUuid,
                a.postUuid
              ),
            }).build()
        ) || [];
      const postsDTO: PostDTO[] = await Promise.all(postsPromises);
      res.json({ ...result, ...{ data: postsDTO } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Feed'));
      }
    }
  }

  public async getByUuid(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postUuid } = req.params;
      const { userUuid } = req.user;
      const inputDto: UuidInputDTO = new UuidInputDTO(postUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const post: IPost | null = await this._postService.getByUuid(postUuid);
      if (!post) {
        return next(await parseError('Post not found', 404));
      }
      const postDTO: PostDTO = await new PostDTO({
        ...post,
        isLiked: await this._postService.isLiked(userUuid, post.postUuid),
        isFavorite: await this._postService.isFavorite(userUuid, post.postUuid),
      }).build();

      res.status(200).json({
        success: true,
        data: postDTO,
      });
    } catch (err: any) {
      next(err);
    }
  }

  public async create(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      upload(req, res, async (err) => {
        if (!req.file) {
          return next(parseError('Archivo multimedia requerido', 400));
        }
        if (err) {
          console.error(err.message);
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: `El archivo es demasiado grande. Máximo permitido: ${MAX_FILE_SIZE + ' MB' || '10 MB'}.`,
            });
          }
          console.error(err);
          return next(parseError('Error al procesar el archivo', 400));
        }

        if (req?.file?.size) {
          const fileSizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);
          console.info(`Tamaño del archivo subido: ${fileSizeInMB} MB`);
        }

        const { userUuid } = req.user;
        const locationData = JSON.parse(req.body.location);

        let multimediaUrl: string = '';
        let multimediaFileType: 'png' | 'mp4' = 'png';
        switch (req.body?.multimediaFileType.split('/')[0]) {
          case 'image':
            multimediaFileType = 'png';
            break;
          case 'video':
            multimediaFileType = 'mp4';
            break;

          default:
            throw new Error('multimediaFileType not suported');
        }
        console.info(
          `Archivo con extension ${req.body?.multimediaFileType}. Guardandolo como ${multimediaFileType} `
        );

        try {
          multimediaUrl = await this._postService.uploadFileToCloudinary(
            req.file.buffer,
            multimediaFileType,
            userUuid
          );
        } catch (uploadError) {
          console.error('Error al subir el archivo:', uploadError);
          return next(parseError('Error al subir el archivo', 500));
        }

        // Crear el objeto Post
        const postInputDTO: PostInputDTO = new PostInputDTO({
          postUuid: uuidv4(),
          userUuid,
          placeHolder: locationData.placeHolder,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          mapsUrl: locationData.mapsUrl,
          multimediaUrl,
          ...req.body,
        }).build();

        const validation = await inputValidator(postInputDTO);
        if (!validation.success) {
          return next(parseError(validation.message, 400));
        }

        const post = await this._postService.create(postInputDTO);
        const postDTO = new PostDTO(post).build();

        res.json({
          success: true,
          data: postDTO,
        });
      });
    } catch (err: any) {
      console.error(err.message, err.stack);
      next(new Error('Error creating an Post'));
    }
  }

  public async updateMiscs(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      const { postUuid } = req.params;
      const postUpdateInputDTO: PostMiscUpdateInputDTO =
        new PostMiscUpdateInputDTO({
          ...req.body,
        }).build();
      const validation: IInputValidator =
        await inputValidator(postUpdateInputDTO);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const postData: IPost | null =
        await this._postService.getByUuid(postUuid);
      if (!postData) {
        return next(await parseError('Post not found', 404));
      }
      if (userUuid != postData.userUuid) {
        return next(
          await parseError(
            'You do not have permission to perform this operation',
            403
          )
        );
      }
      Object.assign(postUpdateInputDTO, { postUuid });
      const post: IPost | null =
        await this._postService.update(postUpdateInputDTO);
      const postDTO: PostDTO = await new PostDTO(post).build();
      res.json({
        success: true,
        data: postDTO,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error updating an Post'));
      }
    }
  }

  public async delete(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postUuid } = req.params;
      const { userUuid } = req.user;
      const inputDto: UuidInputDTO = new UuidInputDTO(postUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const postData: IPost | null =
        await this._postService.getByUuid(postUuid);
      if (!postData) {
        return next(await parseError('Post not found', 404));
      }

      if (postData.userUuid != userUuid) {
        return next(
          await parseError(
            'You do not have permission to perform this operation',
            403
          )
        );
      }
      await this._postService.delete(inputDto.uuid);
      res.json({
        success: true,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error deleting an Post'));
      }
    }
  }

  public async putLike(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postUuid } = req.params;
      const user: IUser = req.user;
      const inputDto: InteractionsInputDTO = new InteractionsInputDTO({
        userUuid: user.userUuid,
        postUuid,
      }).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const like: IInteractions | null = await this._postService.getLike(
        inputDto.userUuid,
        inputDto.postUuid
      );
      let result: any = {};
      let data: any = {};

      if (!like) {
        data = await this._postService.like(inputDto);
        result = 'Like Creado correctamente';
      } else {
        await this._postService.removeLike(
          inputDto.userUuid,
          inputDto.postUuid
        );
        result = 'Like Eliminado correctamente';
      }

      res.status(200).json({
        success: true,
        message: result,
        data,
      });
    } catch (error: any) {
      next(error);
    }
  }

  public async putFavorite(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postUuid } = req.params;
      const user: IUser = req.user;
      const inputDto: InteractionsInputDTO = new InteractionsInputDTO({
        userUuid: user.userUuid,
        postUuid,
      }).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const favorite: IInteractions | null =
        await this._postService.getFavorite(
          inputDto.userUuid,
          inputDto.postUuid
        );
      let result: any = {};
      let data: any = {};

      if (!favorite) {
        data = await this._postService.favorite(inputDto);
        result = 'Favorite Creado correctamente';
      } else {
        await this._postService.removeFavorite(
          inputDto.userUuid,
          inputDto.postUuid
        );
        result = 'Favorite Eliminado correctamente';
      }

      res.status(200).json({
        success: true,
        message: result,
        data,
      });
    } catch (error: any) {
      next(error);
    }
  }

  public async getFavorites(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = paginationHelper(req);
      const { userUuid } = req.user;
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;

      const result: any = await this._postService.getFavoritePosts(
        userUuid,
        offset,
        newLimit
      );
      const postsPromises: Promise<PostDTO>[] =
        result.data?.map(
          async (a: IPost) =>
            await new PostDTO({
              ...a,
              isLiked: await this._postService.isLiked(userUuid, a.postUuid),
              isFavorite: await this._postService.isFavorite(
                userUuid,
                a.postUuid
              ),
            }).build()
        ) || [];
      const postsDTO: PostDTO[] = await Promise.all(postsPromises);

      res.status(200).json({
        success: true,
        message: 'Favorites list retrieved',
        data: postsDTO,
      });
    } catch (error: any) {
      console.error('Error retrieving favorite posts:', error);
      next(error);
    }
  }
}
