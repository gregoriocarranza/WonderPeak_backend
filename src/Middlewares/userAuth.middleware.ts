import { NextFunction, Response } from 'express';
import { IRequestExtendedUser } from './interfaces/user.middleware.interfaces';
import { getEmailByAuthData } from '../utils/jwt/jwt.utils';
import { IUser } from '../../SQL/Interface/IUser';
import { UserDAO } from '../../SQL/dao/user.dao';

export const userMandatory = async (
  req: IRequestExtendedUser | any,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const userDAO: UserDAO = new UserDAO();
  try {
    const user: IUser | any = await userDAO.getByEmail(
      getEmailByAuthData(req.auth)
    );
    if (!user) {
      const error: any = new Error('Token user not found');
      error.statusCode = 403;
      return next(error);
    }
    req.user = user;
    next();
  } catch (err: any) {
    next(err);
  }
};
