export class PostUpdateDTO {
  title: string | null;
  text: string | null;
  image: string | null;

  constructor(data: any) {
    this.title = data.title;
    this.text = data.text;
    this.image = data.image;
  }

  public build(): PostUpdateDTO {
    return this;
  }
}
