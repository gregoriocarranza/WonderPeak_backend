export class PostInputDTO {
  title: string | null;
  text: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  multimediaUrl: string | null;

  constructor(data: any) {
    this.title = data.title;
    this.text = data.text;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.mapsUrl = data.mapsUrl;
    this.multimediaUrl = data.multimediaUrl;
  }

  public build(): PostInputDTO {
    return this;
  }
}
