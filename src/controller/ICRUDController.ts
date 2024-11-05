import { NextFunction, Request, Response } from 'express';

export interface ICrudController {
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByUuid(req: Request, res: Response, next: NextFunction): Promise<void>;
  // update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
