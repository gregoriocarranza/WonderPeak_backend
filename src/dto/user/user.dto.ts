export class UserDTO {
  userUuid: string | null;
  name: string | null;
  lastname: string | null;
  nickname: string | null;
  email: string | null;
  profileImage: string | null;
  coverImage: string | null;
  description: string | null;
  gender: string | null;
  gamificationLevel: number | null;
  active: boolean;

  constructor(data: any) {
    this.userUuid = data.userUuid;
    this.name = data.name;
    this.lastname = data.lastname;
    this.nickname = data.nickname;
    this.email = data.email;
    this.profileImage = data.profileImage;
    this.coverImage = data.coverImage;
    this.description = data.description;
    this.gender = data.gender;
    this.gamificationLevel = data.gamificationLevel;
    this.active = data.active;
  }

  public build(): UserDTO {
    return this;
  }
}