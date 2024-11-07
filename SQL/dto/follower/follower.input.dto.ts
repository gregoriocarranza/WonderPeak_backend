export class FollowerInputDTO {
  userFollowerUuid: string | null;
  userFollowedUuid: string | null;

  constructor(data: any) {
    this.userFollowerUuid = data.followerUuid;
    this.userFollowedUuid = data.followedUuid;
  }

  public build(): FollowerInputDTO {
    return this;
  }
}
