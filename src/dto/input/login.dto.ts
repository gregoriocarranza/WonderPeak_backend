export class LoginDto {
  private email: string;
  private password: string;
  constructor(data: any) {
    this.email = data.email;
    this.password = data.password;
  }
  build() {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
