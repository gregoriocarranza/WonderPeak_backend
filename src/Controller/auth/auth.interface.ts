export interface IAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

export interface PasswordResetPayload {
  email: string;
  password: string;
}
