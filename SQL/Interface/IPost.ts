export interface IPost {
  id?: number;
  postUuid: string;
  userUuid: string;
  title: string;
  text: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  multimediaUrl: string;
  commentCount: number;
  likesCount: number;
  createdAt: Date;
}