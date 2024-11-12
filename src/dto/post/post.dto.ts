export class PostDTO {
  postUuid: string | null;
  userUuid: string | null;
  title: string | null;
  text: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    mapsUrl: string | null;
  } | null;
  multimediaUrl: string | null;
  commentsCount: number | null;
  likesCount: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: any) {
    this.postUuid = data.postUuid || null;
    this.userUuid = data.userUuid || null;
    this.title = data.title || null;
    this.text = data.text || null;
    this.location = {
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      mapsUrl: data.mapsUrl || null,
    };
    this.multimediaUrl = data.multimediaUrl || null;
    this.commentsCount = data.commentCount || null;
    this.likesCount = data.likesCount || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
  }

  public build(): PostDTO {
    return this;
  }
}
