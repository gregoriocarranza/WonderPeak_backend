import { KnexConnection } from '../Connection';
import { IPost, IPostDAO } from '../Interface/IPost';
import { PostInputDTO } from '../dto/post/post.input.dto';

export class PostDAO implements IPostDAO<PostInputDTO, IPost> {
  private _knexConnection: KnexConnection = new KnexConnection();
  constructor() {}

  /**
   * @deprecated use getFeed inted
   */

  public async getAll(offset: number = 0, limit: number = 20): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IPost>('posts')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);

    const data = await query;
    const count: any = await this._knexConnection
      .knex<IPost>('posts')
      .count('post_uuid as total');
    const totalCount: number = count[0]?.total;

    const posts: IPost[] = data.map((d: any) => this.toIPost(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: posts,
      page,
      limit,
      count: posts.length,
      totalCount,
      totalPages,
    };
  }

  public async getFeed(
    offset: number = 0,
    limit: number = 20,
    followersUuidsLists: Array<string>
  ): Promise<any> {
    const query = this._knexConnection
      .knex<IPost>('posts')
      .select()
      .leftJoin('user', 'posts.user_uuid', 'user.user_uuid')
      .modify((builder) => {
        if (followersUuidsLists.length > 0) {
          builder.whereIn('posts.user_uuid', followersUuidsLists);
        }
      })
      .options({ nestTables: true, rowMode: 'object' })
      .orderBy('posts.created_at', 'desc')
      .offset(offset)
      .limit(limit);

    const data = await query;

    const count: any = await this._knexConnection
      .knex<IPost>('posts')
      .leftJoin('user', 'posts.user_uuid', 'user.user_uuid')
      .modify((builder) => {
        if (followersUuidsLists.length > 0) {
          builder.whereIn('posts.user_uuid', followersUuidsLists);
        }
      })
      .count('posts.post_uuid as total');

    const totalCount: number = count[0]?.total;

    const posts: IPost[] = data.map((d: any) => this.toIPost(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: posts,
      page,
      limit,
      count: posts.length,
      totalCount,
      totalPages,
    };
  }

  public async getAllByUserUuid(
    userUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IPost>('posts')
      .select()
      .where('user_uuid', userUuid)
      .options({ nestTables: true, rowMode: 'object' })
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(limit);

    const data = await query;
    const count: any = await this._knexConnection
      .knex<IPost>('posts')
      .count('post_uuid as total');
    const totalCount: number = count[0]?.total;

    const posts: IPost[] = data.map((d: any) => this.toIPost(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: posts,
      page,
      limit,
      count: posts.length,
      totalCount,
      totalPages,
    };
  }

  public async getByUuid(postUuid: string): Promise<IPost | null> {
    const data = await this._knexConnection
      .knex<IPost>('posts')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('posts.post_uuid', postUuid)
      .first();
    return data ? this.toIPost(data) : null;
  }

  public async getById(id: number): Promise<IPost | null> {
    const data = await this._knexConnection
      .knex<IPost>('posts')
      .select()
      .where('posts.id', id)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIPost(data) : null;
  }

  public async create(post: PostInputDTO): Promise<IPost | null> {
    const [id] = await this._knexConnection
      .knex<IPost>('posts')
      .insert(this.fromIPost(post));
    return this.getById(id);
  }

  public async update(post: PostInputDTO): Promise<IPost | null> {
    await this._knexConnection
      .knex<IPost>('posts')
      .update(this.fromIPost(post))
      .where('post_uuid', post?.postUuid);
    return post.postUuid ? await this.getByUuid(post?.postUuid) : null;
  }

  public async delete(postUuid: string): Promise<void> {
    await this._knexConnection
      .knex<IPost>('posts')
      .where('post_uuid', postUuid)
      .del();
  }

  private fromIPost(post: PostInputDTO): any {
    return {
      user_uuid: post?.userUuid,
      post_uuid: post?.postUuid,
      title: post?.title,
      text: post?.text,
      place_holder: post?.placeHolder,
      latitude: post?.latitude,
      longitude: post?.longitude,
      mapsUrl: post?.mapsUrl,
      multimedia_url: post?.multimediaUrl,
      likes_count: post?.likesCount,
    };
  }

  public toIPost(data: any): IPost {
    return {
      id: data.posts.id,
      userUuid: data.posts.user_uuid,
      postUuid: data.posts.post_uuid,
      title: data.posts.title,
      text: data.posts.text,
      placeHolder: data.posts.place_holder,
      latitude: data.posts.latitude,
      longitude: data.posts.longitude,
      mapsUrl: data.posts.mapsUrl,
      multimediaUrl: data.posts.multimedia_url,
      createdAt: data.posts.created_at,
      updateAt: data.posts.updated_at,
      commentCount: data.posts.comment_count,
      likesCount: data.posts.likes_count,

      name: data?.user?.name || null,
      lastName: data?.user?.lastname || null,
      nickname: data?.user?.nickname || null,
      profileUserImage: data?.user?.profile_image || null,
      level: data?.user?.gamification_level || null,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
