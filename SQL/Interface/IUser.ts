import { IBaseDAO } from "./IBaseDAO";

export interface IUser {
  id?: number;
  userUuid: string;
  name: string;
  lastname: string;
  nickname: string;
  email: string;
  profileImage: string;
  coverImage: string;
  description?: string;
  gender?: string;
  gamificationLevel: number;
  active: boolean;
  auth0Id: string;
}

export interface IRegisterUser {
  email: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  password: string;
  gender?: string;
}

export interface IUserDAO<I, O> extends IBaseDAO<I, O> {
  searchAll: (
    searchTerm: string | null,
    offset: number,
    limit: number
  ) => Promise<any>;
}
