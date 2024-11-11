export class PostMiscUpdateInputDTO {
  title: string | null;
  text: string | null;
  multimediaUrl: string | null;

  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;

  constructor(data: any) {
    console.log(data);

    this.title = data.title;
    this.text = data.text;
    this.multimediaUrl = data.image;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.mapsUrl = data.mapsUrl;
  }

  public build(): PostMiscUpdateInputDTO {
    for (const prop in this) {
      if (this[prop] === undefined) {
        delete this[prop];
      }
    }
    return this;
  }
}

/* 
{
  "title": "Nature Adventures",
  "text": "Exploring the vast forests!",
  "location": {
    "latitud": 17.562,
    "longitude": -3.625,
    "mapsUrl": "https://maps.app.goo.gl/3u6hnvrzZTV4WeVw5"
  },
  "image": "https://example.com/image.jpg"
}
  */
