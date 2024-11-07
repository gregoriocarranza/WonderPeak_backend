import { Request } from 'express';
import { IPaginationHelper } from './types';

export const paginationHelper = (req: Request): IPaginationHelper => {
  let page: any = req.query.page;
  let limit: any = req.query.limit;
  page = !isNaN(parseInt(page)) ? parseInt(page) : 0;
  limit = !isNaN(parseInt(limit)) ? parseInt(limit) : 20;
  if (limit > 20) {
    limit = 20;
  }
  if (limit < 1) {
    limit = 1;
  }
  if (page < 0) {
    page = 0;
  }
  return {
    page,
    limit,
  };
};
