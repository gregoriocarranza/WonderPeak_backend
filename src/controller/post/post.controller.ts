import { PostInputDTO } from '../../../SQL/dto/post/post.input.dto';
import { SqlValidatorError } from '../../../SQL/error/sql.validator.error';
import { IPost } from '../../../SQL/Interface/IPost';
import { PostService } from '../../Services/Post/post.service';
import { UuidInputDTO } from '../../dto/input/uuid.input.dto';
import { PostDTO } from '../../dto/post/post.dto';
import { UserMiscUpdateInputDTO } from '../../dto/user/user.misc.update.dto';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';
import { IDataPaginator } from '../../Services/interfaces/IDataPaginator';
import { inputValidator } from '../../utils/inputValidator';
import { paginationHelper } from '../../utils/pagination.helper';
import { parseError } from '../../utils/parseError';
import { IInputValidator, IRequestExtended } from '../../utils/types';
import { IPostController } from './post.controller.interface';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export class PostController implements IPostController {
  private _postService: PostService = new PostService();

  constructor() {}

  public async getFeed(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = paginationHelper(req);
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const result: IDataPaginator<IPost> = await this._postService.getFeed(
        offset,
        newLimit,
      );
      const postsPromises: Promise<PostDTO>[] =
        result.data?.map(async (a) => await new PostDTO(a).build()) || [];
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

  public async getAllByUserUuid(
      req: IRequestExtendedUser | any,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const { userUuid } = req.params;
        const inputDto: UuidInputDTO = new UuidInputDTO(userUuid).build();
        const validation: IInputValidator = await inputValidator(inputDto);
        if (!validation.success) {
          return next(await parseError(validation.message, 400));
        }
        const posts: IPost[] | null = await this._postService.getAllByUserUuid(userUuid);
        if (!posts) {
          return next(await parseError('Posts not found', 404));
        }
        const postsPromises: Promise<PostDTO>[] = posts.map(async (a) => await new PostDTO(a).build());
        const postsDTO: PostDTO[] = await Promise.all(postsPromises);
        res.status(200).json({
          success: true,
          data: postsDTO,
        });
      } catch (err: any) {
        next(err);
      }
    }

  public async getByUuid(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postUuid } = req.params;
      const inputDto: UuidInputDTO = new UuidInputDTO(postUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const post: IPost | null = await this._postService.getByUuid(postUuid);
      if (!post) {
        return next(await parseError('Post not found', 404));
      }
      const postDTO: PostDTO = await new PostDTO(post).build();
      res.status(200).json({
        success: true,
        data: postDTO,
      });
    } catch (err: any) {
      next(err);
    }
  }

  public async create(
    req: IRequestExtended,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const postInputDTO: PostInputDTO = new PostInputDTO({
      postUuid: uuidv4(),
      ...req.body,
    }).build();

    const post: IPost | null = await this._postService.create(postInputDTO);
    const postDTO: PostDTO = await new PostDTO(post).build();
    res.json({
      success: true,
      data: postDTO,
    });
  }

  public async update(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postUuid } = req.params;
      const postUpdateInputDTO: PostUpdateInputDTO =
        new PostUpdateInputDTO({
          ...req.body,
        }).build();
      const validation: IInputValidator = await inputValidator(
        postUpdateInputDTO
      );
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      Object.assign(postUpdateInputDTO, { postUuid });
      const post: IPost | null = await this._postService.update(
        postUpdateInputDTO
      );
      if (!post) {
        return next(await parseError('Post not found', 404));
      }
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
      const inputDto: UuidInputDTO = new UuidInputDTO(postUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
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

  public async favorite(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid: followerUuid }= req.user
      const { userUuid: followedUuid } = req.params;

      if (followerUuid === followedUuid) {
        throw new Error('Cannot favorite yourself');
      }

      const favoriteDTO = new FollowerInputDTO({
        followerUuid,
        followedUuid,
      });

      const isFavorite = await this._userService.favoriteUser(favoriteDTO);

      if (isFavorite) {
        res.status(200).json({
          success: true,
          message: 'Successfully add user to favorites'
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Successfully remove user from favorites'
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  public async like(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid: followerUuid }= req.user
      const { userUuid: followedUuid } = req.params;

      if (followerUuid === followedUuid) {
        throw new Error('Cannot favorite yourself');
      }

      const favoriteDTO = new FollowerInputDTO({
        followerUuid,
        followedUuid,
      });

      const isFavorite = await this._userService.favoriteUser(favoriteDTO);

      if (isFavorite) {
        res.status(200).json({
          success: true,
          message: 'Successfully add user to favorites'
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Successfully remove user from favorites'
        });
      }
    } catch (error: any) {
      next(error);
    }
  }
}
