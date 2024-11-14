import { KnexConnection } from '../Connection';
import { IFollower } from '../Interface/IUser';
import { FollowerInputDTO } from '../dto/follower/follower.input.dto';
import { IUser } from '../Interface/IUser';

export class FollowerDAO implements IFollower {
  private _knexConnection: KnexConnection = new KnexConnection();
  public followerUuid!: string;
  public followedUuid!: string;
  public favorite!: boolean;

  constructor() {}

  public async getAllFollowers(
    is_follower: boolean, // true: followers, false: following
    userUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    let query: any;
    let count: any;
    if (is_follower) {
      query = this._knexConnection
        .knex<any>('follower')
        .select()
        .join('user', 'user.user_uuid', '=', 'follower.follower_uuid')
        .where('follower.followed_uuid', userUuid)
        .options({ nestTables: true, rowMode: 'object' })
        .offset(offset)
        .limit(limit);

      count = await this._knexConnection
        .knex<any>('follower')
        .where('follower.followed_uuid', userUuid)
        .count('followed_uuid as total');
    } else {
      query = this._knexConnection
        .knex<any>('follower')
        .select()
        .join('user', 'user.user_uuid', '=', 'follower.followed_uuid')
        .where('follower.follower_uuid', userUuid)
        .options({ nestTables: true, rowMode: 'object' })
        .offset(offset)
        .limit(limit);

      count = await this._knexConnection
        .knex<any>('follower')
        .where('follower.follower_uuid', userUuid)
        .count('follower_uuid as total');
    }

    const data = await query;

    const totalCount: number = count[0]?.total;

    const users: IUser[] = data.map((d: any) => this.toIUser(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: users,
      page,
      limit,
      count: users.length,
      totalCount,
      totalPages,
    };
  }

  public async follow(followDTO: FollowerInputDTO): Promise<void> {
    await this._knexConnection
      .knex('follower')
      .insert({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
        created_at: this._knexConnection.knex.fn.now(),
        updated_at: this._knexConnection.knex.fn.now(),
      })
      .onConflict(['follower_uuid', 'followed_uuid'])
      .ignore();
  }
  public async unfollow(followDTO: FollowerInputDTO): Promise<void> {
    await this._knexConnection
      .knex('follower')
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
      })
      .del();
  }
  public async isFollowing(followDTO: FollowerInputDTO): Promise<boolean> {
    const data = await this._knexConnection
      .knex('follower')
      .select()
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
      })
      .first();
    return !!data;
  }

  public async removeFollower(followDTO: FollowerInputDTO): Promise<void> {
    await this._knexConnection
      .knex('follower')
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
      })
      .del();
  }

  public async getAllFavorites(
    userUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IUser>('follower')
      .select()
      .join('user', 'user.user_uuid', '=', 'follower.followed_uuid')
      .where('follower.follower_uuid', userUuid)
      .andWhere('follower.favorite', true)
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);

    const data = await query;
    const count: any = await this._knexConnection
      .knex<IUser>('user')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;

    const users: IUser[] = data.map((d: any) => this.toIUser(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: users,
      page,
      limit,
      count: users.length,
      totalCount,
      totalPages,
    };
  }

  public async favoriteUser(followDTO: FollowerInputDTO): Promise<boolean> {
    await this._knexConnection
      .knex('follower')
      .update({
        updated_at: this._knexConnection.knex.fn.now(),
        favorite: this._knexConnection.knex.raw('NOT favorite'),
      })
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
      });

    const [data] = await this._knexConnection
      .knex('follower')
      .select('favorite')
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid,
      });

    return !!data.favorite;
  }

  public toIUser(data: any): IUser {
    return {
      id: data.user.id,
      userUuid: data.user.user_uuid,
      name: data.user.name,
      lastname: data.user.lastname,
      nickname: data.user.nickname,
      email: data.user.email,
      profileImage: data.user.profile_image,
      coverImage: data.user.cover_image,
      description: data.user.description,
      gender: data.user.gender,
      gamificationLevel: data.user.gamification_level,
      auth0Id: data.user.auth0_id,
      active: data.user.active,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
