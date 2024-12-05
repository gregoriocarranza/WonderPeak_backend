import { KnexConnection } from '../Connection';
import { IComment, ICommentDAO } from '../Interface/IComment';
import { CommentInputDTO } from '../dto/comment/comment.input.dto';

export class CommentDAO implements ICommentDAO<CommentInputDTO, IComment> {
  private _knexConnection: KnexConnection = new KnexConnection();
  constructor() {}

  /**
   *
   * @deprecate use getAllByPost insted
   */
  public async getAll(offset: number = 0, limit: number = 20): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IComment>('comments')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);

    const data = await query;
    const count: any = await this._knexConnection
      .knex<IComment>('comments')
      .count('comment_uuid as total');
    const totalCount: number = count[0]?.total;

    const comments: IComment[] = data.map((d: any) => this.toIComment(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: comments,
      page,
      limit,
      count: comments.length,
      totalCount,
      totalPages,
    };
  }

  public async getAllByPost(
    postUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    let query: any;
    query = this._knexConnection
      .knex<IComment>('comments')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('post_uuid', postUuid)
      .offset(offset)
      .limit(limit);

    const data = await query;
    const count: any = await this._knexConnection
      .knex<IComment>('comments')
      .where('post_uuid', postUuid)
      .count('comment_uuid as total');
    const totalCount: number = count[0]?.total;

    const comments: IComment[] = data.map((d: any) => this.toIComment(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: comments,
      page,
      limit,
      count: comments.length,
      totalCount,
      totalPages,
    };
  }

  public async getByUuid(commentUuid: string): Promise<IComment | null> {
    const data = await this._knexConnection
      .knex<IComment>('comments')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('comments.comment_uuid', commentUuid)
      .first();
    return data ? this.toIComment(data) : null;
  }

  public async getById(id: number): Promise<IComment | null> {
    const data = await this._knexConnection
      .knex<IComment>('comments')
      .select()
      .where('comments.id', id)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIComment(data) : null;
  }

  public async create(comment: CommentInputDTO): Promise<IComment | null> {
    const [id] = await this._knexConnection
      .knex<IComment>('comments')
      .insert(this.fromIComment(comment));
    return this.getById(id);
  }

  public async update(comment: CommentInputDTO): Promise<IComment | null> {
    await this._knexConnection
      .knex<IComment>('comments')
      .update(this.fromIComment(comment))
      .where('comment_uuid', comment?.commentUuid);
    return comment.commentUuid
      ? await this.getByUuid(comment?.commentUuid)
      : null;
  }

  public async delete(commentUuid: string): Promise<void> {
    await this._knexConnection
      .knex<IComment>('comments')
      .where('comment_uuid', commentUuid)
      .del();
  }

  private fromIComment(comment: CommentInputDTO): any {
    return {
      user_uuid: comment?.userUuid,
      post_uuid: comment?.postUuid,
      comment_uuid: comment?.commentUuid,
      text: comment?.text,
    };
  }

  public toIComment(data: any): IComment {
    return {
      id: data.comments.id,
      userUuid: data.comments.user_uuid,
      postUuid: data.comments.post_uuid,
      commentUuid: data.comments.comment_uuid,
      text: data.comments.text,
      createdAt: data.comments.created_at,
      updateAt: data.comments.updated_at,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
