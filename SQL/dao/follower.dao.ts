import { KnexConnection } from '../Connection';
import { IFollower } from '../Interface/IUser';
import { FollowerInputDTO } from '../dto/follower/follower.input.dto';

export class FollowerDAO implements IFollower {
  private _knexConnection: KnexConnection = new KnexConnection();
  public followerUuid!: string;
  public followedUuid!: string;

  constructor() {}


  public async follow(followDTO: FollowerInputDTO): Promise<void> {
    await this._knexConnection
      .knex('follower')
      .insert({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
        created_at: this._knexConnection.knex.fn.now(),
        updated_at: this._knexConnection.knex.fn.now()
      })
      .onConflict(['follower_uuid', 'followed_uuid'])
      .ignore();
  }
  public async unfollow(followDTO: FollowerInputDTO): Promise<void> {
    await this._knexConnection
      .knex('follower')
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid
      })
      .del();
  }
  public async isFollowing(followDTO: FollowerInputDTO): Promise<boolean> {
    const data = await this._knexConnection
      .knex('follower')
      .select()
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid
      })
      .first();
    return !!data;
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
