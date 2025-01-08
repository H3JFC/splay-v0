import { CommonOptions, ListResult, RecordListOptions, RecordOptions, TypedPocketBase } from "../pocketbase";
import { User, Bucket, BucketParams, ForwardSetting, ForwardSettingParams, BucketForwardLog, BucketReceiveLog } from '@/lib/models';

type ListForwardLogParams = { bucketID: string } | { bucketReceiveLogID: string };

interface APIInterface {
  isLoggedIn: () => boolean;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  oauthLogin: (provider: Provider) => Promise<User>;
  resetPassword: (email: string) => Promise<boolean>;
  signup: ({ email, password, passwordConfirm }: SignupParams) => Promise<User>;
  logout: () => Promise<void>;
  createBucket: (params: BucketParams, options?: RecordOptions) => Promise<Bucket>;
  getBucket: (id: string) => Promise<Bucket>;
  listBuckets: (page?: number, perPage?: number, options?: RecordListOptions) => Promise<ListResult<Bucket>>;
  updateBucket: (id: string, params: Partial<BucketParams>, options?: RecordOptions) => Promise<Bucket>;
  deleteBucket: (id: string, options?: CommonOptions) => Promise<boolean>;
  createForwardSetting: (params: ForwardSettingParams, options?: RecordOptions) => Promise<ForwardSetting>;
  getForwardSetting: (id: string) => Promise<ForwardSetting>;
  listForwardSettings: (bucketID: string, page?: number, perPage?: number, options?: RecordListOptions) => Promise<ListResult<ForwardSetting>>;
  updateForwardSetting: (id: string, params: Partial<ForwardSettingParams>, options?: RecordOptions) => Promise<ForwardSetting>;
  deleteForwardSetting: (id: string, options?: CommonOptions) => Promise<boolean>;
  getBucketReceiveLog: (id: string) => Promise<BucketReceiveLog>;
  listBucketReceiveLogs: (bucketID: string, page?: number, perPage?: number, options?: RecordListOptions) => Promise<ListResult<BucketReceiveLog>>;
  getBucketForwardLog: (id: string) => Promise<BucketForwardLog>;
  listBucketForwardLogs: (params: ListForwardLogParams, page?: number, perPage?: number, options?: RecordListOptions) => Promise<ListResult<BucketForwardLog>>;
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
      .then(({ record }) => record)
  }

  async oauthLogin(provider: Provider): Promise<User> {
    return await this.pb.collection('users')
      .authWithOAuth2({ provider })
      .then(({ record }) => record)
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

  async createBucket(params: BucketParams, options: RecordOptions = {}): Promise<Bucket> {
    return await this.pb.collection('buckets').create(params, options)
  }

  async getBucket(id: string): Promise<Bucket> {
    return await this.pb.collection('buckets').getOne(id)
  }

  async listBuckets(page: number = 1, perPage: number = 10, options: RecordListOptions = {}): Promise<ListResult<Bucket>> {
    return await this.pb.collection('buckets')
      .getList(page, perPage, options)
  }

  async updateBucket(id: string, params: Partial<BucketParams>, options: RecordOptions = {}): Promise<Bucket> {
    return await this.pb.collection('buckets').update(id, params, options)
  }

  async deleteBucket(id: string, options: CommonOptions = {}): Promise<boolean> {
    return await this.pb.collection('buckets').delete(id, options)
  }

  async createForwardSetting(params: ForwardSettingParams, options: RecordOptions = {}): Promise<ForwardSetting> {
    return await this.pb.collection('forward_settings').create(params, options)
  }

  async getForwardSetting(id: string): Promise<ForwardSetting> {
    return await this.pb.collection('forward_settings').getOne(id)
  }

  async listForwardSettings(bucketID: string, page: number = 1, perPage: number = 10, options: RecordListOptions = {}): Promise<ListResult<ForwardSetting>> {
    options = {
      ...options,
      filter: this.pb.filter("bucket == {:bucket}", { bucket: bucketID })
    }
    return await this.pb.collection('forward_settings')
      .getList(page, perPage, options)
  }

  async updateForwardSetting(id: string, params: Partial<ForwardSettingParams>, options: RecordOptions = {}): Promise<ForwardSetting> {
    return await this.pb.collection('forward_settings').update(id, params, options)
  }

  async deleteForwardSetting(id: string, options: CommonOptions = {}): Promise<boolean> {
    return await this.pb.collection('forward_settings').delete(id, options)
  }

  async getBucketReceiveLog(id: string): Promise<BucketReceiveLog> {
    return await this.pb.collection('bucket_receive_logs').getOne(id)
  }

  async listBucketReceiveLogs(bucketID: string, page: number = 1, perPage: number = 10, options: RecordListOptions = {}): Promise<ListResult<BucketReceiveLog>> {
    options = {
      ...options,
      filter: this.pb.filter("bucket == {:bucket}", { bucket: bucketID })
    }
    return await this.pb.collection('bucket_receive_logs')
      .getList(page, perPage, options)
  }

  async getBucketForwardLog(id: string): Promise<BucketForwardLog> {
    return await this.pb.collection('bucket_forward_logs').getOne(id)
  }

  async listBucketForwardLogs(params: ListForwardLogParams, page: number = 1, perPage: number = 10, options: RecordListOptions = {}): Promise<ListResult<BucketForwardLog>> {
    if ('bucketID' in params) {
      const { bucketID } = params;
      options = {
        ...options,
        filter: this.pb.filter("bucket == {:bucket}", { bucket: bucketID })
      }
    } else {
      const { bucketReceiveLogID } = params;
      options = {
        ...options,
        filter: this.pb.filter("bucket_receive_log == {:bucket_receive_log}", { bucket_receive_log: bucketReceiveLogID })
      }
    }

    return await this.pb.collection('bucket_forward_logs')
      .getList(page, perPage, options)
  }
}
