import { IUser } from '../../../SQL/Interface/IUser';
import { IRequestExtended } from '../../utils/types';

export interface IRequestExtendedUser extends IRequestExtended {
  user: IUser;
}
