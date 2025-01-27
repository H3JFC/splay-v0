interface Base {
  id: string;
  created: string;
  updated: string;
}

export interface User extends Base {
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  name: string;
  avatar: string;
}

export interface Bucket extends Base {
  slug: string;
  name: string;
  user: string;
  description: string;
}

export type BucketParams = Omit<Bucket, 'id' | 'created' | 'updated'>;
export type BucketUpdateParams = Omit<Bucket, 'slug' | 'created' | 'updated'>;

export interface ForwardSetting extends Base {
  bucket: string;
  name: string;
  url: string;
}

export type ForwardSettingParams = Omit<ForwardSetting, 'id' | 'created' | 'updated'>;

export interface BucketReceiveLog extends Base {
  bucket: string;
  body: Record<string, any>;
  headers: Record<string, any>;
  ip: string;
}

export interface BucketForwardLog extends Base {
  bucket: string;
  bucket_receive_log: string;
  destination_url: string;
  body: Record<string, any>;
  headers: Record<string, any>;
  status_code: number;
}

export interface Log extends BucketReceiveLog {
  forward_logs: BucketForwardLog[];
}
