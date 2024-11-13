export class InteractionsInputDTO {
    userUuid: string;
    postUuid: string;

  constructor(data: any) {
    this.userUuid = data.userUuid;
    this.postUuid = data.postUuid;

  }

  public build(): InteractionsInputDTO {
    return this;
  }
}
