import { NextFunction, Response } from 'express';
import { ICrudController } from '../ICRUDController';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';

export interface IUserController extends ICrudController {
  getByJwt(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  updateMisc(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  changeStatus(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  followUser(req: IRequestExtendedUser, res: Response, next: NextFunction): Promise<void>;
}
