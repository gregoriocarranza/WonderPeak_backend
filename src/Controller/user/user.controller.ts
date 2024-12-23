import { UserInputDTO } from '../../../SQL/dto/user/user.input.dto';
import { FollowerInputDTO } from '../../../SQL/dto/follower/follower.input.dto';
import { SqlValidatorError } from '../../../SQL/error/sql.validator.error';
import { IUser } from '../../../SQL/Interface/IUser';
import { UuidInputDTO } from '../../dto/input/uuid.input.dto';
import { UserDTO } from '../../dto/user/user.dto';
import { UserMiscUpdateInputDTO } from '../../dto/user/user.misc.update.dto';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';
import { IDataPaginator } from '../../Services/interfaces/IDataPaginator';
import { UserService } from '../../Services/User/user.service';
import { inputValidator } from '../../utils/inputValidator';
import { paginationHelper } from '../../utils/pagination.helper';
import { parseError } from '../../utils/parseError';
import { IInputValidator, IRequestExtended } from '../../utils/types';
import { IUserController } from './user.controller.interface';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { AuthService } from '../../Services/auth/auth.service';
import multer from 'multer';
import { PostService } from '../../Services/Post/post.service';

const DEFAULT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) * 1024 * 1024;

const fileSizeLimit =
  !isNaN(MAX_FILE_SIZE) && MAX_FILE_SIZE > 0
    ? MAX_FILE_SIZE
    : DEFAULT_FILE_SIZE;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileSizeLimit }, // Define el límite de tamaño de archivo
}).fields([
  { name: 'profileUserImage', maxCount: 1 },
  { name: 'profileCoverImage', maxCount: 1 },
]);

export class UserController implements IUserController {
  private _userService: UserService = new UserService();
  private _postService: PostService = new PostService();
  private readonly _authService: AuthService = new AuthService();

  constructor() {}

  public async getAll(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { query } = req.query || null;
      const { page, limit } = paginationHelper(req);
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const result: IDataPaginator<IUser> = await this._userService.getAll(
        offset,
        newLimit,
        query
      );
      const usersPromises: Promise<UserDTO>[] =
        result.data?.map(async (a) => await new UserDTO(a).build()) || [];
      const usersDTO: UserDTO[] = await Promise.all(usersPromises);
      res.json({ ...result, ...{ data: usersDTO } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Users'));
      }
    }
  }

  public async create(
    req: IRequestExtended,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userInputDTO: UserInputDTO = new UserInputDTO({
      userUuid: uuidv4(),
      ...req.body,
    }).build();

    const user: IUser | null = await this._userService.create(userInputDTO);
    const userDTO: UserDTO = await new UserDTO(user).build();
    res.json({
      success: true,
      data: userDTO,
    });
  }

  public async getByJwt(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user: IUser = req.user;
      const userDTO: UserDTO = await new UserDTO(user).build();
      res.status(200).json({
        success: true,
        data: userDTO,
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
      const { userUuid } = req.params;
      const { userUuid: jwtUserUuid } = req.user;
      const inputDto: UuidInputDTO = new UuidInputDTO(userUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const user: IUser | null = await this._userService.getByUuid(userUuid);
      if (!user) {
        return next(await parseError('User not found', 404));
      }

      const imFollower = new FollowerInputDTO({
        followerUuid: jwtUserUuid,
        followedUuid: userUuid,
      });
      const isFollowing = new FollowerInputDTO({
        followedUuid: jwtUserUuid,
        followerUuid: userUuid,
      });
      const userDTO: UserDTO = await new UserDTO({
        ...user,
        imFollower: await this._userService.isFollowing(imFollower),
        isFollowing: await this._userService.isFollowing(isFollowing),
        isFavorite: await this._userService.isFavorite(imFollower),
      }).build();
      res.status(200).json({
        success: true,
        data: userDTO,
      });
    } catch (err: any) {
      next(err);
    }
  }

  public async updateMisc(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      upload(req, res, async (err) => {
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

        const { userUuid } = req.user;

        let profileImageUrl: string | null = null;
        let coverImageUrl: string | null = null;

        if (req.files?.profileUserImage) {
          const profileUserImageFile = req.files.profileUserImage[0];

          if (profileUserImageFile.size) {
            const fileSizeInMB = (
              profileUserImageFile.size /
              (1024 * 1024)
            ).toFixed(2);
            console.info(
              `Tamaño del archivo profileUserImage subido: ${fileSizeInMB} MB`
            );
          }

          profileImageUrl = await this._postService.uploadFileToCloudinary(
            profileUserImageFile.buffer,
            'png',
            userUuid
          );
        }

        if (req.files?.profileCoverImage) {
          const profileCoverImageFile = req.files.profileCoverImage[0];

          if (profileCoverImageFile.size) {
            const fileSizeInMB = (
              profileCoverImageFile.size /
              (1024 * 1024)
            ).toFixed(2);
            console.info(
              `Tamaño del archivo profileCoverImage subido: ${fileSizeInMB} MB`
            );
          }

          coverImageUrl = await this._postService.uploadFileToCloudinary(
            profileCoverImageFile.buffer,
            'png',
            userUuid
          );
        }

        const userMiscUpdateInputDTO: UserMiscUpdateInputDTO =
          new UserMiscUpdateInputDTO({
            ...req.body,
            profileUserImage: profileImageUrl,
            profileCoverImage: coverImageUrl,
          }).build();

        const validation = await inputValidator(userMiscUpdateInputDTO);
        if (!validation.success) {
          return next(parseError(validation.message, 400));
        }

        Object.assign(userMiscUpdateInputDTO, { userUuid });
        const user = await this._userService.update(userMiscUpdateInputDTO);

        if (!user) {
          return next(parseError('User not found', 404));
        }

        const userDTO = new UserDTO(user).build();

        res.json({
          success: true,
          data: userDTO,
        });
      });
    } catch (err: any) {
      console.error(err.message, err.stack);
      next(new Error('Error updating user data'));
    }
  }

  public async updatePassword(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      const { password, newPassword } = req.body;

      const user: IUser | null = await this._userService.getByUuid(userUuid);
      if (_.isNil(user)) {
        const error: any = new Error('User is not valid for a password change');
        error.statusCode = 400;
        return next(error);
      }

      const loginResponse: any = await this._authService.login({
        email: user.email,
        password: password,
      });
      if (!loginResponse.access_token) {
        const error: any = new Error('Password is not valid');
        error.statusCode = 400;
        return next(error);
      }
      await this._authService.changeUserPassword(user.auth0Id, newPassword);
      await this._userService.update({
        active: false,
        pushToken: null,
        userUuid,
      });
      res.json({
        success: true,
        data: 'User signed out',
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Password is not valid'));
      }
    }
  }

  public async changeStatus(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // const { status } = req.params;
      const { userUuid } = req.user;
      // const statusFormatted = status === 'true' ? true : false;
      const user: IUser | null = await this._userService.getByUuid(userUuid);
      if (!user) {
        return next(await parseError('User not found', 404));
      }
      Object.assign(user, {
        userUuid: user.userUuid,
        active: !user.active,
      });
      const userUpdated: IUser | null = await this._userService.update(user);
      if (!userUpdated) {
        return next(await parseError('User not updated', 404));
      }

      const userDTO: UserDTO = await new UserDTO(userUpdated).build();
      res.json({
        success: true,
        data: userDTO,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error updating an User'));
      }
    }
  }

  public async delete(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      const inputDto: UuidInputDTO = new UuidInputDTO(userUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      await this._userService.delete(inputDto.uuid);
      res.json({
        success: true,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error deleting an User'));
      }
    }
  }

  public async getAllFollowing(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.params.userUuid ? req.params : req.user;
      console.log(req.params);
      const { page, limit } = paginationHelper(req);
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const is_follower = false;
      const result: IDataPaginator<IUser> =
        await this._userService.getAllFollowers(
          is_follower,
          userUuid,
          offset,
          newLimit
        );
      const usersPromises: Promise<UserDTO>[] =
        result.data?.map(async (a) => await new UserDTO(a).build()) || [];
      const usersDTO: UserDTO[] = await Promise.all(usersPromises);
      res.json({ ...result, ...{ data: usersDTO } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Users'));
      }
    }
  }

  public async getAllFollowers(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.params.userUuid ? req.params : req.user;
      const { page, limit } = paginationHelper(req);
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const is_follower = true;
      const offset = newpage * newLimit;
      const result: IDataPaginator<IUser> =
        await this._userService.getAllFollowers(
          is_follower,
          userUuid,
          offset,
          newLimit
        );
      const usersPromises: Promise<UserDTO>[] =
        result.data?.map(async (a) => await new UserDTO(a).build()) || [];
      const usersDTO: UserDTO[] = await Promise.all(usersPromises);
      res.json({ ...result, ...{ data: usersDTO } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Users'));
      }
    }
  }

  public async followUser(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid: followerUuid } = req.user;
      const { userUuid: followedUuid } = req.params;

      if (followerUuid === followedUuid) {
        throw new Error('Cannot follow yourself');
      }

      const followDTO = new FollowerInputDTO({
        followerUuid,
        followedUuid,
      });

      const isFollowing = await this._userService.isFollowing(followDTO);

      if (isFollowing) {
        await this._userService.unfollowUser(followDTO);
        res.status(200).json({
          success: true,
          message: 'Successfully unfollowed user',
        });
      } else {
        await this._userService.followUser(followDTO);
        res.status(200).json({
          success: true,
          message: 'Successfully followed user',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  public async removeFollower(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      const { userUuid: followerUuid } = req.params;
      const inputDto: UuidInputDTO = new UuidInputDTO(userUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const followDTO = new FollowerInputDTO({
        followerUuid,
        followedUuid: userUuid,
      });
      await this._userService.removeFollower(followDTO);
      res.json({
        success: true,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error deleting an User'));
      }
    }
  }

  public async getAllFavorites(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user; // not using params because it's a favorite
      const { page, limit } = paginationHelper(req);
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const result: IDataPaginator<IUser> =
        await this._userService.getAllFavorites(userUuid, offset, newLimit);
      const usersPromises: Promise<UserDTO>[] =
        result.data?.map(async (a) => await new UserDTO(a).build()) || [];
      const usersDTO: UserDTO[] = await Promise.all(usersPromises);
      res.json({ ...result, ...{ data: usersDTO } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Users'));
      }
    }
  }

  public async favoriteUser(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid: followerUuid } = req.user;
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
          message: 'Successfully add user to favorites',
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Successfully remove user from favorites',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }
}
