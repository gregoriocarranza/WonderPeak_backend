import { IRegisterUser } from '../../../SQL/Interface/IUser';

export class RegisterDTO {
  private image: string | null;
  private email: string;
  private name: string;
  private lastName: string;
  private password: string;
  constructor(data: IRegisterUser | any) {
    this.image = data.image || null;
    this.email = data.email;
    this.name = data.firstname;
    this.lastName = data.lastname || null;
    this.password = data.password;
  }
  build() {
    return {
      image: this.image,
      email: this.email,
      name: this.name,
      lastName: this.lastName,
      password: this.password,
    };
  }
}
