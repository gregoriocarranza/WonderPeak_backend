export class CommentMiscUpdateInputDTO {
  commentUuid: string | null;
  userUuid: string | null;
  text: string | null;
  updateAt: Date | null;


  constructor(data: any) {
    this.commentUuid = data.commentUuid;
    this.userUuid = data.userUuid;
    this.text = data.text;
    this.updateAt = new Date();
  }

  public build(): CommentMiscUpdateInputDTO {
    for (const prop in this) {
      if (this[prop] === undefined) {
        delete this[prop];
      }
    }
    return this;
  }
}
