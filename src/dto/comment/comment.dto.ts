export class CommentDTO {
  commentUuid: string | null;
  userUuid: string | null;
  postUuid: string | null;
  text: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: any) {
    this.commentUuid = data.commentUuid || null;
    this.postUuid = data.postUuid || null;
    this.userUuid = data.userUuid || null;
    this.text = data.text || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
  }

  public build(): CommentDTO {
    return this;
  }
}
