import { NextFunction, Request, Response } from 'express';

export interface IHealthController {
  getHealth(req: Request, res: Response, next: NextFunction): void;
}
