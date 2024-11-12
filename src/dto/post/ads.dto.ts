export class AdsDTO {
  commerceName: string | null;
  commerceUrl: string | null;
  commerceImage: string | null;
  multimediaUrl: string | null;
  title: string | null;
  text: string | null;
  startDate: Date | null;
  endDate: Date | null;

  constructor(data: any) {
    this.title = data.title || null;
    this.text = data.text || null;
    this.commerceUrl = data.Url || null;
    this.commerceName = data.commerce || null;
    this.commerceImage = data.imagePath[0].landscape || null;
    this.multimediaUrl = data.imagePath[0].portraite || null;
    this.startDate = data.date?.start ? new Date(data.date.start * 1000) : null;
    this.endDate = data.date?.end ? new Date(data.date.end * 1000) : null;
  }

  public build(): AdsDTO {
    return this;
  }
}
