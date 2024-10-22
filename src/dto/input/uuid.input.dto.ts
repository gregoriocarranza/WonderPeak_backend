export class UuidInputDTO {
  private _uuid: string;
  constructor(uuid: string) {
    this._uuid = uuid;
  }

  public build() {
    return this;
  }

  get uuid() {
    return this._uuid;
  }
}
