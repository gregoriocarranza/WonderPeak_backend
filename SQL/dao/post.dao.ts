import { KnexConnection } from '../Connection';
import { IPost } from '../Interface/IPost';
import { PostInputDTO } from '../dto/post/post.input.dto';
import { IUser } from '../Interface/IUser';

export class PostDAO implements IPost {
  private _knexConnection: KnexConnection = new KnexConnection();
  public postUuid!: string;
  public userUuid!: string;
  public title!: string;
  public text!: string;
  public image!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  constructor() {}

  public async getFeed(
    offset: number = 0,
    limit: number = 20,
  ): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IPost>('post')
      .select()
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

  public async getAllByUserUuid(
    userUuid: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<IPost[] | null> {
    let query: any;
    query = this._knexConnection
      .knex<IPost>('post')
      .select()
      .where('user_uuid', userUuid)
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

  public async getByUuid(userUuid: string): Promise<IUser | null> {
    const data = await this._knexConnection
      .knex<IUser>('user')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('user.user_uuid', userUuid)
      .first();
    return data ? this.toIUser(data) : null;
  }

  public async create(post: PostInputDTO): Promise<IPost | null> {
    const [id] = await this._knexConnection
      .knex<IPost>('post')
      .insert(this.fromIUser(user));
    return this.getById(id);
  }

  public async update(post: PostInputDTO): Promise<IPost | null> {
    await this._knexConnection
      .knex<IPost>('post')
      .update(this.fromIUser(user))
      .where('post_uuid', post?.postUuid);
    return post.postUuid ? await this.getByUuid(post?.postUuid) : null;
  }

  public async delete(postUuid: string): Promise<void> {
    await this._knexConnection
      .knex<IPost>('post')
      .where('post_uuid', postUuid)
      .del();
  }

  public async favorite(postDTO: PostInputDTO): Promise<boolean> {
    const data = await this._knexConnection
      .knex('follower')
      .update({
        updated_at: this._knexConnection.knex.fn.now(),
        favorite: this._knexConnection.knex.raw('NOT favorite')
      })
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid
      })
      .returning('favorite');
    return !!data;
  }

  public async like(postDTO: PostInputDTO): Promise<boolean> {
    const data = await this._knexConnection
      .knex('follower')
      .update({
        updated_at: this._knexConnection.knex.fn.now(),
        favorite: this._knexConnection.knex.raw('NOT favorite')
      })
      .where({
        follower_uuid: followDTO.userFollowerUuid,
        followed_uuid: followDTO.userFollowedUuid
      })
      .returning('favorite');
    return !!data;
  }

  public toIPost(data: any): IPost {
    return {
      id: data.post.id,
      postUuid: data.post.post_uuid,
      title: data.post.title,
      text: data.post.text,
      latitude: data.post.latitude,
      longitude: data.post.longitude,
      mapsUrl: data.post.maps_url,
      multimediaUrl: data.post.multimedia_url,
      createdAt: data.post.created_at,
      updatedAt: data.post.updated_at,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
