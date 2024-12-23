export class PostInputDTO {
  userUuid: string | null;
  postUuid: string | null;
  title: string | null;
  text: string | null;
  placeHolder: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  multimediaUrl: string | null;
  likesCount: number | null;

  constructor(data: any) {
    this.userUuid = data.userUuid;
    this.postUuid = data.postUuid;
    this.title = data.title;
    this.text = data.text;
    this.placeHolder = data.placeHolder;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.mapsUrl = data.mapsUrl || null;
    this.multimediaUrl = data.multimediaUrl;
    this.likesCount = data.likesCount || 0;
  }

  public build(): PostInputDTO {
    return this;
  }
}
