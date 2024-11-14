export class PostDTO {
  postUuid: string | null;
  userUuid: string | null;
  title: string | null;
  text: string | null;
  location: {
    placeHolder: string | null;
    latitude: number | null;
    longitude: number | null;
    mapsUrl: string | null;
  } | null;
  user: {
    name: string | null;
    lastName: string | null;
    nickname: string | null;
    profileUserImage: string | null;
    level: number | null;
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
      placeHolder: data.placeHolder || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      mapsUrl: data.mapsUrl || null,
    };
    this.multimediaUrl = data.multimediaUrl || null;
    this.commentsCount = data.commentCount || null;
    this.likesCount = data.likesCount || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
    this.user = null;
    if (data.name) {
      this.user = {
        name: data.name,
        lastName: data.lastName || null,
        nickname: data.nickname || null,
        profileUserImage: data.profileUserImage || null,
        level: data.level || null,
      };
    }
  }

  public build(): PostDTO {
    return this;
  }
}
