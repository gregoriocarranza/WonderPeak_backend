import { IBaseDAO } from './IBaseDAO';

export interface IComment {
  id?: number;
  postUuid: string;
  userUuid: string;
  commentUuid: string;
  text: string;
  createdAt: Date;
  updateAt: Date;
}

export interface ICommentDAO<I, O> extends IBaseDAO<I, O> {
  getAll: (postUuid: string, offset: number, limit: number) => Promise<any>;
}
