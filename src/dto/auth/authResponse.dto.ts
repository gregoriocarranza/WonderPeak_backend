export class authResponseDTO {
  private accessToken: string;
  private tokenType: string;
  private expiresIn: number;
  private refreshToken: string;
  constructor(data: any) {
    this.accessToken = data.access_token;
    this.tokenType = data.token_type;
    this.expiresIn = data.expires_in;
    this.refreshToken = data.refresh_token;
  }
  build() {
    return {
      accessToken: this.accessToken,
      tokenType: this.tokenType,
      expiresIn: this.expiresIn,
      refreshToken: this.refreshToken,
    };
  }
}
