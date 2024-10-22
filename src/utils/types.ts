import { Request } from 'express';

export type TypeMongoUri = string | null;
export interface IInputValidator {
  success: boolean;
  message?: string;
}
export interface IRequestExtended extends Request {
  statusCode?: number;
  auth?: any;
}

export interface IRequestAuth extends Request {
  statusCode?: number;
}

export interface IPaginationHelper {
  page: number;
  limit: number;
}
