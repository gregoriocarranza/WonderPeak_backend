import { IBaseDAO } from './IBaseDAO';

export interface IPost {
  id?: number;
  postUuid: string;
  userUuid: string;
  title: string;
  text: string;
  placeHolder: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  multimediaUrl: string;
  commentCount: number;
  likesCount: number;
  createdAt: Date;
  updateAt: Date;

  name:string
  lastName:string
  nickname:string
  profileUserImage:string
  level:number
}

export interface IPostDAO<I, O> extends IBaseDAO<I, O> {
  getFeed: (offset: number, limit: number) => Promise<any>;
}
