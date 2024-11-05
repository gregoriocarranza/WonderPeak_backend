import { UserInputDTO } from '../../../SQL/dto/user/user.input.dto';
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

export class UserController implements IUserController {
  private _userService: UserService = new UserService();

  constructor() {}

  public async getAll(
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
      const result: IDataPaginator<IUser> = await this._userService.getAll(
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
      const { uuid } = req.params;
      const inputDto: UuidInputDTO = new UuidInputDTO(uuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const user: IUser | null = await this._userService.getByUuid(uuid);
      if (!user) {
        return next(await parseError('User not found', 404));
      }
      const userDTO: UserDTO = await new UserDTO(user).build();
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
      const { uuid } = req.params;
      const userMiscUpdateInputDTO: UserMiscUpdateInputDTO =
        new UserMiscUpdateInputDTO({
          ...req.body,
        }).build();
      const validation: IInputValidator = await inputValidator(
        userMiscUpdateInputDTO
      );
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      Object.assign(userMiscUpdateInputDTO, { userUuid: uuid });
      const user: IUser | null = await this._userService.update(
        userMiscUpdateInputDTO
      );
      if (!user) {
        return next(await parseError('User not found', 404));
      }
      const userDTO: UserDTO = await new UserDTO(user).build();
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
    req: IRequestExtended,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { uuid } = req.params;
      const inputDto: UuidInputDTO = new UuidInputDTO(uuid).build();
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
}
