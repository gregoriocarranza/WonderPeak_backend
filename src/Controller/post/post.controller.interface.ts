import { NextFunction, Response } from 'express';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';
import { ICrudController } from '../ICRUDController';

export interface IPostController extends ICrudController {
  updateMiscs(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getAllByUserUuid(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  favorite(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  like(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
