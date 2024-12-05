export class CommentInputDTO {
  userUuid: string | null;
  postUuid: string | null;
  commentUuid: string | null;
  text: string | null;


  constructor(data: any) {
    this.userUuid = data.userUuid;
    this.postUuid = data.postUuid;
    this.commentUuid = data.commentUuid;
    this.text = data.text;

  }

  public build(): CommentInputDTO {
    return this;
  }
}
