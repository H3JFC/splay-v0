import { TypedPocketBase } from "../pocketbase";
import { User } from '@/lib/models';

interface APIInterface {
  isLoggedIn: () => boolean;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  oauthLogin: (provider: Provider) => Promise<User>;
  resetPassword: (email: string) => Promise<boolean>;
  signup: ({ email, password, passwordConfirm }: SignupParams) => Promise<User>;
  logout: () => Promise<void>;
}

export type Provider = 'github' | 'google';

export interface SignupParams {
  email: string;
  password: string;
  passwordConfirm: string;
}

export class API implements APIInterface {
  private pb: TypedPocketBase;

  constructor(pb: TypedPocketBase) {
    this.pb = pb;
  }

  isLoggedIn(): boolean {
    return !!this.pb.authStore.isValid;
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

  async signup({ email, password, passwordConfirm }: SignupParams): Promise<User> {
    return await this.pb.collection('users')
      .create({ email, password, passwordConfirm })
  }

  async logout(): Promise<void> {
    return Promise.resolve(this.pb.authStore.clear())
  }
}
