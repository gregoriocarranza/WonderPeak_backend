export class PostInputDTO {
  userUuid: string | null;
  postUuid: string | null;
  title: string | null;
  text: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  multimediaUrl: string | null;

  constructor(data: any) {
    this.userUuid = data.userUuid;
    this.postUuid = data.postUuid;
    this.title = data.title;
    this.text = data.text;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.mapsUrl = data.mapsUrl || null;
    this.multimediaUrl = data.multimediaUrl;
  }

  public build(): PostInputDTO {
    return this;
  }
}
