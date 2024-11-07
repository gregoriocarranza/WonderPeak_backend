export class FollowerInputDTO {
  userFollowerUuid: string | null;
  userFollowedUuid: string | null;
  favorite: boolean | null;
  constructor(data: any) {
    this.userFollowerUuid = data.followerUuid;
    this.userFollowedUuid = data.followedUuid;
    this.favorite = data.favorite;
  }

  public build(): FollowerInputDTO {
    return this;
  }
}
