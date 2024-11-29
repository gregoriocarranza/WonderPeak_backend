import { KnexConnection } from '../Connection';
import { IUser, IUserDAO } from '../Interface/IUser';
import { UserInputDTO } from '../dto/user/user.input.dto';

export class UserDAO implements IUserDAO<UserInputDTO, IUser> {
  private _knexConnection: KnexConnection = new KnexConnection();

  constructor() {}

  /**
   * @deprecated use searchAll insted
   */
  public async getAll(offset: number = 0, limit: number = 20): Promise<any> {
    const data = await this._knexConnection
      .knex<IUser>('user')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);
    const count: any = await this._knexConnection
      .knex<IUser>('user')
      .count('user_uuid as total');
    const totalCount: number = count[0]?.total;
    const users: IUser[] = data.map((d: any) => this.toIUser(d));
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

  public async searchAll(
    offset: number = 0,
    limit: number = 20,
    searchTerm?: string | null
  ): Promise<any> {
    const query = this._knexConnection
      .knex<IUser>('user')
      .select()
      .options({ nestTables: true, rowMode: 'object' })
      .offset(offset)
      .limit(limit);

    if (searchTerm != null) {
      query.where((builder) => {
        builder
          .where('user.name', 'like', `%${searchTerm}%`)
          .orWhere('user.lastname', 'like', `%${searchTerm}%`)
          .orWhere('user.nickname', 'like', `%${searchTerm}%`);
      });
    }

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
  public async getById(id: number): Promise<IUser | null> {
    const data = await this._knexConnection
      .knex<IUser>('user')
      .select()
      .where('user.id', id)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIUser(data) : null;
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
  public async getByAuth0ID(auth0Id: string): Promise<IUser | null> {
    const data = await this._knexConnection
      .knex<IUser>('user')
      .select()
      .where('user.auth0_id', auth0Id)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIUser(data) : null;
  }
  public async getByFirsName(firstName: string): Promise<IUser | null> {
    const data = await this._knexConnection
      .knex<IUser>('user')
      .select()
      .where('user.name', firstName)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIUser(data) : null;
  }
  public async getByEmail(email: string): Promise<IUser | null> {
    const data = await this._knexConnection
      .knex<IUser>('user')
      .select()
      .where('user.email', email)
      .options({ nestTables: true, rowMode: 'object' })
      .first();
    return data ? this.toIUser(data) : null;
  }

  public async create(user: UserInputDTO): Promise<IUser | null> {
    const [id] = await this._knexConnection
      .knex<IUser>('user')
      .insert(this.fromIUser(user));
    return this.getById(id);
  }

  public async update(user: UserInputDTO): Promise<IUser | null> {
    await this._knexConnection
      .knex<IUser>('user')
      .update(this.fromIUser(user))
      .where('user_uuid', user?.userUuid);
    return user.userUuid ? await this.getByUuid(user?.userUuid) : null;
  }

  public async delete(userUuid: string): Promise<void> {
    await this._knexConnection
      .knex<IUser>('user')
      .where('user_uuid', userUuid)
      .del();
  }

  private fromIUser(user: UserInputDTO): any {
    return {
      user_uuid: user?.userUuid,
      name: user?.name,
      lastname: user?.lastname,
      nickname: user?.nickname,
      email: user?.email,
      profile_image: user?.profileImage,
      cover_image: user?.coverImage,
      description: user?.description,
      gender: user?.gender,
      gamification_level: user?.gamificationLevel,
      active: user.active,
      auth0_id: user?.auth0Id,
      push_token: user?.pushToken,
    };
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
      pushToken: data.user.push_token,
    };
  }

  set knexConnection(knexConnection: KnexConnection) {
    this._knexConnection = knexConnection;
  }
}
