export class PostDTO {
  postUuid: string | null;
  userUuid: string | null;
  title: string | null;
  text: string | null;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: any) {
    this.postUuid = data.postUuid;
    this.userUuid = data.userUuid;
    this.title = data.title;
    this.text = data.text;
    this.image = data.image;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public build(): PostDTO {
    return this;
  }
}
