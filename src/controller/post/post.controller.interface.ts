import { NextFunction, Response } from 'express';
import { ICrudController } from '../ICRUDController';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';

export interface IUserController extends ICrudController {
  getFeed(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  update(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getAllByUserUuid(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  favorite(req: IRequestExtendedUser | any, res: Response, next: NextFunction): Promise<void>;
  like(req: IRequestExtendedUser | any, res: Response, next: NextFunction): Promise<void>;
}
