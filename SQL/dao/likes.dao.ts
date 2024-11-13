import { KnexConnection } from '../Connection';

import { IInteractions, IInteractionsDAO } from '../Interface/IInteractions';
import { InteractionsInputDTO } from '../dto/interactions/interaction.dto';

export class LikesDAO
  implements IInteractionsDAO<InteractionsInputDTO, IInteractions>
{
  private _knexConnection: KnexConnection = new KnexConnection();

  constructor() {}

  /**
   * @deprecated use searchAll insted
   */
  public async getAll(offset: number = 0, limit: number = 20): Promise<any> {
    const data = await this._knexConnection
      .knex<IInteractions>('likes')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('likes')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const users: IInteractions[] = data.map((d: any) => this.toILikes(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.floor(totalCount / limit);
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
  public async getAllByPost(
    postUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    const data = await this._knexConnection
      .knex<IInteractions>('likes')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('post_uuid', postUuid)
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('likes')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const users: IInteractions[] = data.map((d: any) => this.toILikes(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.floor(totalCount / limit);
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
  public async getAllByUser(
    userUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    const data = await this._knexConnection
      .knex<IInteractions>('likes')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('user_uuid', userUuid)
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('likes')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const likes: IInteractions[] = data.map((d: any) => this.toILikes(d));
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.floor(totalCount / limit);
    return {
      success: true,
      data: likes,
      page,
      limit,
      count: likes.length,
      totalCount,
      totalPages,
    };
  }

  public async getById(id: number): Promise<IInteractions | null> {
    const data = await this._knexConnection
      .knex<IInteractions>('likes')
      .select()
      .where('likes.id', id)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toILikes(data) : null;
  }

  public async getLike(
    userUuid: string,
    postUuid: string
  ): Promise<IInteractions | null> {
    const data = await this._knexConnection
      .knex<IInteractions>('likes')
      .select()
      .where('user_uuid', userUuid)
      .where('post_uuid', postUuid)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toILikes(data) : null;
  }

  public async create(
    like: InteractionsInputDTO
  ): Promise<IInteractions | null> {
    const [id] = await this._knexConnection
      .knex<IInteractions>('likes')
      .insert(this.fromILikes(like));
    return this.getById(id);
  }

  public async delete(userUuid: string, postUuid: string): Promise<void> {
    await this._knexConnection
      .knex<IInteractions>('likes')
      .where('user_uuid', userUuid)
      .where('post_uuid', postUuid)
      .del();
  }

  private fromILikes(like: InteractionsInputDTO): any {
    return {
      user_uuid: like.userUuid,
      post_uuid: like.postUuid,
    };
  }

  public toILikes(data: any): IInteractions {
    return {
      id: data.likes.id,
      userUuid: data.likes.user_uuid,
      postUuid: data.likes.post_uuid,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
