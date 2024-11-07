import { UserDAO } from '../../../SQL/dao/user.dao';
import { UserInputDTO } from '../../../SQL/dto/user/user.input.dto';
import { FollowerInputDTO } from '../../../SQL/dto/follower/follower.input.dto';
import { IUser } from '../../../SQL/Interface/IUser';
import { IDataPaginator } from '../interfaces/IDataPaginator';

export class UserService {
  private _userDAO: UserDAO = new UserDAO();
  constructor() {}

  async getAll(
    offset: number,
    limit: number,
    searchTerm?: string | null
  ): Promise<IDataPaginator<IUser>> {
    return await this._userDAO.searchAll(offset, limit, searchTerm);
  }

  async getById(id: number): Promise<IUser | null> {
    return await this._userDAO.getById(id);
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return await this._userDAO.getByEmail(email);
  }

  async getByFirsName(email: string): Promise<IUser | null> {
    return await this._userDAO.getByFirsName(email);
  }
  async getByAuth0ID(id: string): Promise<IUser | null> {
    return await this._userDAO.getByAuth0ID(id);
  }

  async getByUuid(uuid: string): Promise<IUser | null> {
    return await this._userDAO.getByUuid(uuid);
  }

  async create(user: UserInputDTO | any): Promise<IUser | null> {
    return await this._userDAO.create(user);
  }

  async update(user: any): Promise<IUser | null> {
    return await this._userDAO.update(user);
  }

  async delete(uuid: string): Promise<void> {
    return await this._userDAO.delete(uuid);
  }

  public async followUser(followDTO: FollowerInputDTO): Promise<void> {
    return await this._userDAO.follow(followDTO);
  }
  public async unfollowUser(followDTO: FollowerInputDTO): Promise<void> {
    return await this._userDAO.unfollow(followDTO);
  }
  public async isFollowing(followDTO: FollowerInputDTO): Promise<boolean> {
    return await this._userDAO.isFollowing(followDTO);
  }

  set userDAO(userDAO: UserDAO) {
    this._userDAO = userDAO;
  }
}
