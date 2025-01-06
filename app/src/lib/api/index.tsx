import { TypedPocketBase } from "../pocketbase";
import { User } from '@/lib/models';

interface APIInterface {
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  oauthLogin: (provider: Provider) => Promise<User>;
  resetPassword: (email: string) => Promise<boolean>;
}

export type Provider = 'github' | 'google';

export class API implements APIInterface {
  private pb: TypedPocketBase;

  constructor(pb: TypedPocketBase) {
    this.pb = pb;
  }

  async login(usernameOrEmail: string, password: string): Promise<User> {
    return await this.pb.collection('users')
      .authWithPassword(usernameOrEmail, password)
      .then(({ record }) => record )
  }

  async oauthLogin(provider: Provider): Promise<User> {
    return await this.pb.collection('users')
      .authWithOAuth2({ provider })
      .then(({ record }) => record )
  }

  async resetPassword(email: string): Promise<boolean> {
    return await this.pb.collection('users')
      .requestPasswordReset(email)
  }
}
