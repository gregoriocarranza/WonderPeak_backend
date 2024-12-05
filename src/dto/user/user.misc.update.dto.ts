export class UserMiscUpdateInputDTO {
  name: string | null;
  lastname: string | null;
  nickname: string | null;
  profileImage: string | null;
  coverImage: string | null;
  description: string | null;
  gender: string | null;

  constructor(data: any) {
    this.name = data.name;
    this.nickname = data.nickname;
    this.lastname = data.lastname;
    this.description = data.bio;
    this.gender = data.gender;
    this.profileImage = data.profileUserImage;
    this.coverImage = data.profileCoverImage;
  }

  public build(): UserMiscUpdateInputDTO {
    for (const prop in this) {
      if (this[prop] === undefined || this[prop] === null) {
        delete this[prop];
      }
    }
    return this;
  }
}
