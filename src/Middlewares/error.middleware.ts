import { NextFunction, Response } from 'express';
import { IRequestAuth } from '../utils/types';

export const errorMiddleware = (
  err: any,
  _req: IRequestAuth,
  res: Response,
  _next: NextFunction
) => {
  const statusCode: number = err.statusCode || 500;
  console.error('Error: ', err.message);
  console.error('Error Code : ', statusCode);

  console.error('Error: ', err);
  res.status(statusCode).json({
    success: false,
    message: err.message,
  });
};
