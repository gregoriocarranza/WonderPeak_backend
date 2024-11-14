export class AuthService {
  private AUTH0_DOMAIN: string | undefined;
  private AUTH0_CLIENT_ID: string | undefined;
  private AUTH0_CLIENT_SECRET: string | undefined;
  private AUTH0_AUDIENCE: string | undefined;
  //   private AUTH0_ROOT_ROLE_ID: string | undefined;
  private GRANT_TYPE: string;
  constructor() {
    this.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
    this.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
    this.AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
    this.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
    // this.AUTH0_ROOT_ROLE_ID = process.env.AUTH0_ROOT_ROLE_ID;
    this.GRANT_TYPE = 'password';
  }
  private async getAccessToken(): Promise<string> {
    const url = `https://${this.AUTH0_DOMAIN}/oauth/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.AUTH0_CLIENT_ID,
        client_secret: this.AUTH0_CLIENT_SECRET,
        audience: this.AUTH0_AUDIENCE,
        scope: '',
      }),
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error_description);
    }
    return responseData.access_token;
  }

  public async createUser(data: any): Promise<any> {
    const url = `https://${this.AUTH0_DOMAIN}/api/v2/users`;
    const accessToken: string = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          connection: 'Username-Password-Authentication',
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error(result);
        throw new Error(`Error creating the User: ${result.message}`);
      }

      return {
        result,
        accessToken,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error creating the User');
    }
  }

  public async login(userdata: any): Promise<any> {
    try {
      const response: any = await fetch(
        `https://${this.AUTH0_DOMAIN}/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: this.GRANT_TYPE,
            username: userdata.email,
            password: userdata.password,
            client_id: this.AUTH0_CLIENT_ID,
            client_secret: this.AUTH0_CLIENT_SECRET,
            audience: this.AUTH0_AUDIENCE,
            scope: 'read:current_user offline_access',
            connection: 'Username-Password-Authentication',
          }),
        }
      );
      const data: any = await response.json();

      if (response.status >= 400) {
        throw new Error(
          data.error || 'Failed to login, retry user and password'
        );
      }

      return data;
    } catch (error: Error | any) {
      console.error(error.message);
      throw new Error(`Error while login the User: ${error.message}`);
    }
  }

  public async LogOut(accessToken: string): Promise<boolean> {
    const response = await fetch(`https://${this.AUTH0_DOMAIN}/v2/logout`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      return true;
    } else {
      throw new Error('Error during signout');
    }
  }

  public async changeUserEmail(
    userId: string,
    newEmail: string
  ): Promise<void> {
    const accessToken: string = await this.getAccessToken();
    const url = `https://${this.AUTH0_DOMAIN}/api/v2/users/${userId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email: newEmail,
        verify_email: true,
      }),
    });
    const data = await response.json();
    if (response.status >= 400) {
      throw new Error(data.error || 'Failed to update user email');
    }
    console.log('Email updated successfully');
    return data;
  }

  public async changeUserPassword(
    userId: string,
    newPassword: string
  ): Promise<any> {
    try {
      const accessToken: string = await this.getAccessToken();
      const url = `https://${this.AUTH0_DOMAIN}/api/v2/users/${userId}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          password: newPassword,
          connection: 'Username-Password-Authentication',
        }),
      });

      const data = await response.json();
      if (response.status >= 400) {
        throw new Error(data.message || 'Failed to update user password');
      }

      console.log('Password updated successfully');
      return data;
    } catch (error: Error | any) {
      console.error(error.message);
      throw new Error(`Error while changing password: ${error.message}`);
    }
  }
}
