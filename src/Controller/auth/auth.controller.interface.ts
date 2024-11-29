import { NextFunction, Response } from 'express';

import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';

export interface IAuthController {
  register(
    req: Request | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  login(req: Request | any, res: Response, next: NextFunction): Promise<void>;
  logOut(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  registerPushToken(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
