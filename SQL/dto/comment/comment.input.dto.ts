export class CommentInputDTO {
  userUuid: string | null;
  postUuid: string | null;
  commentUuid: string | null;
  text: string | null;
  createdAt: Date | null;

  constructor(data: any) {
    this.userUuid = data.userUuid;
    this.postUuid = data.postUuid;
    this.commentUuid = data.commentUuid;
    this.text = data.text;
    this.createdAt = data.createdAt || null;
  }

  public build(): CommentInputDTO {
    return this;
  }
}
