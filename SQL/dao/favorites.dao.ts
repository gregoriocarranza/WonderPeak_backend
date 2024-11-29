import { KnexConnection } from '../Connection';

import { IInteractions, IInteractionsDAO } from '../Interface/IInteractions';
import { InteractionsInputDTO } from '../dto/interactions/interaction.dto';
import { PostDAO } from './post.dao';

export class FavoritesDAO
  implements IInteractionsDAO<InteractionsInputDTO, IInteractions>
{
  private _knexConnection: KnexConnection = new KnexConnection();
  private _postDao: PostDAO = new PostDAO();

  constructor() {}

  /**
   * @deprecated use searchAll insted
   */
  public async getAll(offset: number = 0, limit: number = 20): Promise<any> {
    const data = await this._knexConnection
      .knex<IInteractions>('favorites')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('favorites')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const users: IInteractions[] = data.map((d: any) => this.toIFavorites(d));
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
      .knex<IInteractions>('favorites')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('post_uuid', postUuid)
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('favorites')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const users: IInteractions[] = data.map((d: any) => this.toIFavorites(d));
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
      .knex<IInteractions>('favorites')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .where('user_uuid', userUuid)
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('favorites')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const favorites: IInteractions[] = data.map((d: any) =>
      this.toIFavorites(d)
    );
    const page: number = offset === 0 ? offset : offset / limit;
    const totalPages: number = Math.floor(totalCount / limit);
    return {
      success: true,
      data: favorites,
      page,
      limit,
      count: favorites.length,
      totalCount,
      totalPages,
    };
  }

  public async getById(id: number): Promise<IInteractions | null> {
    const data = await this._knexConnection
      .knex<IInteractions>('favorites')
      .select()
      .where('favorites.id', id)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIFavorites(data) : null;
  }

  public async getFavorites(
    userUuid: string,
    postUuid: string
  ): Promise<IInteractions | null> {
    const data = await this._knexConnection
      .knex<IInteractions>('favorites')
      .select()
      .where('user_uuid', userUuid)
      .where('post_uuid', postUuid)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIFavorites(data) : null;
  }

  public async getFavoritePosts(
    userUuid: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<any> {
    const data = await this._knexConnection
      .knex<IInteractions>('favorites')
      .leftJoin('posts', 'posts.post_uuid', 'favorites.post_uuid')
      .select()
      .where('favorites.user_uuid', userUuid)
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IInteractions>('favorites')
      .where('user_uuid', userUuid)
      .count('post_uuid as total');
    console.log(data);

    const totalCount: number = count[0]?.total;
    const users: IInteractions[] = data.map((d: any) =>
      this._postDao.toIPost(d)
    );
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

  public async create(
    favorite: InteractionsInputDTO
  ): Promise<IInteractions | null> {
    const [id] = await this._knexConnection
      .knex<IInteractions>('favorites')
      .insert(this.fromIFavorites(favorite));
    return this.getById(id);
  }

  public async delete(userUuid: string, postUuid: string): Promise<void> {
    await this._knexConnection
      .knex<IInteractions>('favorites')
      .where('user_uuid', userUuid)
      .where('post_uuid', postUuid)
      .del();
  }

  private fromIFavorites(favorite: InteractionsInputDTO): any {
    return {
      user_uuid: favorite.userUuid,
      post_uuid: favorite.postUuid,
    };
  }

  public toIFavorites(data: any): IInteractions {
    return {
      id: data.favorites.id,
      userUuid: data.favorites.user_uuid,
      postUuid: data.favorites.post_uuid,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
