import { CommonOptions, ListResult, RecordListOptions, RecordOptions, TypedPocketBase } from "../pocketbase";
import { User, Bucket, BucketParams, ForwardSetting, ForwardSettingParams, BucketForwardLog, BucketReceiveLog, Log } from '@/lib/models';
import { Start, End, NowString, OneDayAgo } from "@/lib/datetime";
export * from "@/lib/models";

export type ListReceiveLogParams = { bucketID?: string, start?: Start, end?: End, page?: number, perPage?: number, filterRaw?: string, filterParams?: filterParams };
export type ListForwardLogParams = { bucketID?: string, bucketReceiveLogID?: string, start?: Start, end?: End, page?: number, perPage?: number, filterRaw?: string, filterParams?: filterParams };
export type filterParams = { [key: string]: any }
export type ListBuckets = ListResult<Bucket>;
export type ListForwardSettings = ListResult<ForwardSetting>;
export type ListReceiveLogs = ListResult<BucketReceiveLog>;
export type ListForwardLogs = ListResult<BucketForwardLog>;
export type ListLogs = ListResult<Log>;
export type IndexedBucketForwardLogs = { [key: string]: BucketForwardLog[] }

interface APIInterface {
  isLoggedIn: () => boolean;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  userRefresh: () => Promise<User>;
  oauthLogin: (provider: Provider) => Promise<User>;
  resetPassword: (email: string) => Promise<boolean>;
  signup: ({ email, password, passwordConfirm }: SignupParams) => Promise<User>;
  logout: () => Promise<void>;
  createBucket: (params: BucketParams, options?: RecordOptions) => Promise<Bucket>;
  getBucket: (id: string) => Promise<Bucket>;
  getBucketBySlug: (slug: string) => Promise<Bucket>;
  listBuckets: (page?: number, perPage?: number, options?: RecordListOptions) => Promise<ListBuckets>;
  updateBucket: (id: string, params: Partial<BucketParams>, options?: RecordOptions) => Promise<Bucket>;
  deleteBucket: (id: string, options?: CommonOptions) => Promise<boolean>;
  createForwardSetting: (params: ForwardSettingParams, options?: RecordOptions) => Promise<ForwardSetting>;
  getForwardSetting: (id: string) => Promise<ForwardSetting>;
  listForwardSettings: (bucketID: string, page?: number, perPage?: number, options?: RecordListOptions) => Promise<ListForwardSettings>;
  updateForwardSetting: (id: string, params: Partial<ForwardSettingParams>, options?: RecordOptions) => Promise<ForwardSetting>;
  deleteForwardSetting: (id: string, options?: CommonOptions) => Promise<boolean>;
  getBucketReceiveLog: (id: string) => Promise<BucketReceiveLog>;
  listBucketReceiveLogs: (params: ListReceiveLogParams, options?: Omit<RecordListOptions, 'filter'>) => Promise<ListReceiveLogs>;
  getBucketForwardLog: (id: string) => Promise<BucketForwardLog>;
  listBucketForwardLogs: (params: ListForwardLogParams, options?: RecordListOptions) => Promise<ListForwardLogs>;
  listLogs: (params: ListReceiveLogParams, options?: Omit<RecordListOptions, 'filter'>) => Promise<ListLogs>;
}

export type Provider = 'github' | 'google';

export interface SignupParams {
  email: string;
  password: string;
  passwordConfirm: string;
}

const DEFAULT_FILTER_RAW = "bucket = {:bucketID} && created >= {:start} && created < {:end}";

export class API implements APIInterface {
  private pb: TypedPocketBase;

  constructor(pb: TypedPocketBase) {
    this.pb = pb;
  }

  isLoggedIn(): boolean {
    return !!this.pb.authStore.isValid;
  }

  async userRefresh(): Promise<User> {
    return await this.pb.collection('users')
      .authRefresh()
      .then(({ record }) => record)
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

  async getBucketBySlug(slug: string): Promise<Bucket> {
    const filter = this.pb.filter("slug = {:slug}", { slug })
    return await this.pb.collection('buckets').getFirstListItem(filter)
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
      filter: this.pb.filter("bucket = {:bucket}", { bucket: bucketID })
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

  async listBucketReceiveLogs({
    page = 1,
    perPage = 10,
    bucketID,
    start = OneDayAgo(),
    end = NowString(),
    filterRaw = DEFAULT_FILTER_RAW,
    filterParams = {} }: ListReceiveLogParams,
    options: Omit<RecordListOptions, 'filter'> = {}): Promise<ListResult<BucketReceiveLog>> {

    if (filterRaw === DEFAULT_FILTER_RAW) {
      filterParams = {
        bucketID,
        start,
        end,
        ...filterParams,
      }
    }

    options = {
      sort: '-created,+id',
      ...options,
      filter: this.pb.filter(filterRaw, filterParams),
    }
    return await this.pb.collection('bucket_receive_logs')
      .getList(page, perPage, options)
  }

  async getBucketForwardLog(id: string): Promise<BucketForwardLog> {
    return await this.pb.collection('bucket_forward_logs').getOne(id)
  }

  async listBucketForwardLogs({
    page = 1,
    perPage = 1000,
    bucketID,
    start = OneDayAgo(),
    end = NowString(),
    filterRaw = DEFAULT_FILTER_RAW,
    filterParams = {} }: ListForwardLogParams,
    options: Omit<RecordListOptions, 'filter'> = {}): Promise<ListResult<BucketForwardLog>> {

    if (filterRaw === DEFAULT_FILTER_RAW) {
      filterParams = {
        bucketID,
        start,
        end,
        ...filterParams,
      }
    }

    options = {
      sort: '-created,+id',
      ...options,
      filter: this.pb.filter(filterRaw, filterParams),
    }

    return await this.pb.collection('bucket_forward_logs')
      .getList(page, perPage, options)
  }

  async listLogs(params: ListReceiveLogParams, options: Omit<RecordListOptions, 'filter'> = {}): Promise<ListLogs> {
    return Promise.all(
      [
        this.listBucketReceiveLogs(params, options),
        // this doesn't scale if any one bucket has more than 1000 logs in a single query
        this.listBucketForwardLogs({ ...params, page: 1, perPage: 1000 }, options),
      ]
    ).then(([{ items, totalItems, totalPages, page, perPage }, forwardLogs]) => {
      const indexedForwardLogs: IndexedBucketForwardLogs = forwardLogs.items.reduce((acc = {}, forwardLog) => {
        if (!acc[forwardLog.bucket_receive_log]) acc[forwardLog.bucket_receive_log] = [];

        acc[forwardLog.bucket_receive_log].push(forwardLog);
        return acc;
      }, {} as IndexedBucketForwardLogs)

      return {
        items: items.map((receiveLog) => {
          const forward_logs = indexedForwardLogs[receiveLog.id] || [];
          return {
            ...receiveLog,
            forward_logs,
          }
        }),
        totalItems,
        totalPages,
        page,
        perPage,
      }
    })
  }

  subUserBucketNotifications(user: User, bucket: Bucket, cb: (data: any) => void) {
    return this.pb.collection('users').subscribe(this.userBucketTopic(user, bucket), cb)
  }

  unsubUserBucketNotifications(user: User, bucket: Bucket) {
    return this.pb.collection('users').unsubscribe(this.userBucketTopic(user, bucket))
  }

  private userBucketTopic(user: User, bucket: Bucket) {
    return `${user.id}/buckets/${bucket.id}/logs`
  }
}
