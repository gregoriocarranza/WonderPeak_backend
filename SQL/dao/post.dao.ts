import { KnexConnection } from '../Connection';
import { IPost } from '../Interface/IPost';
import { PostInputDTO } from '../dto/post/post.input.dto';

export class PostDAO implements IPost {
  private _knexConnection: KnexConnection = new KnexConnection();
  public postUuid!: string;
  public userUuid!: string;
  public title!: string;
  public text!: string;
  public image!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public commentCount!: number;
  public likesCount!: number;
  public latitude!: number;
  public longitude!: number;
  public mapsUrl!: string;
  public multimediaUrl!: string;

  constructor() {}

  public async getFeed(
    offset: number = 0,
    limit: number = 20,
  ): Promise<any> {
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

  public async getAllByUserUuid(
    userUuid: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IPost>('posts')
      .select()
      .where('user_uuid', userUuid)
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

  public async favorite(postDTO: PostInputDTO): Promise<boolean> {
    // TODO: Implement favorite
    return true;
  }

  public async like(postDTO: PostInputDTO): Promise<boolean> {
    // TODO: Implement like
    return true;
  }

  private fromIPost(post: PostInputDTO): any {
    return {
      user_uuid: post?.userUuid,
      post_uuid: post?.postUuid,
      title: post?.title,
      text: post?.text,
      latitude: post?.latitude,
      longitude: post?.longitude,
      mapsUrl: post?.mapsUrl,
      multimedia_url: post?.multimediaUrl,
    };
  }
  
  public toIPost(data: any): IPost {
    return {
      id: data.posts.id,
      userUuid: data.posts.user_uuid,
      postUuid: data.posts.post_uuid,
      title: data.posts.title,
      text: data.posts.text,
      latitude: data.posts.latitude,
      longitude: data.posts.longitude,
      mapsUrl: data.posts.mapsUrl,
      multimediaUrl: data.posts.multimedia_url,
      createdAt: data.posts.created_at,
      commentCount: data.posts.comment_count,
      likesCount: data.posts.likes_count,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
