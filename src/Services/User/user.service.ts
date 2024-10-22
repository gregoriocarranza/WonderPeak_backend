import { UserDAO } from '../../../SQL/dao/user.dao';
import { UserInputDTO } from '../../../SQL/dto/user/user.input.dto';
import { IUser } from '../../../SQL/Interface/IUser';
import { IDataPaginator } from '../interfaces/IDataPaginator';

export class UserService {
  private _userDAO: UserDAO = new UserDAO();
  constructor() {}

  async getAll(
    searchTerm: string | null,
    offset: number,
    limit: number
  ): Promise<IDataPaginator<IUser>> {
    return await this._userDAO.searchAll(searchTerm, offset, limit);
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

  set userDAO(userDAO: UserDAO) {
    this._userDAO = userDAO;
  }
}
