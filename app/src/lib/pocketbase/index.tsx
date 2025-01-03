import { createContext, useContext, useState } from 'react';
import PocketBase, { RecordService } from 'pocketbase';

interface User {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  name: string;
  avatar: string;
  created: string;
  updated: string;
}

interface Bucket {
  id: string;
  slug: string;
  name: string;
  user: string;
  description: string;
  created: string;
  updated: string;
}

interface ForwardSetting {
  id: string;
  bucket: string;
  name: string;
  url: string;
  created: string;
  updated: string;
}

interface BucketReceiveLog {
  id: string;
  bucket: string;
  body: Record<string, any>;
  headers: Record<string, any>;
  ip: string;
  created: string;
  updated: string;
}

interface BucketForwardLog {
  id: string;
  bucket: string;
  bucket_receive_log: string;
  destination_url: string;
  body: Record<string, any>;
  headers: Record<string, any>;
  status_code: number;
  created: string;
  updated: string;
}

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService;
  collection(idOrName: 'users'): RecordService<User>;
  collection(idOrName: 'buckets'): RecordService<Bucket>;
  collection(idOrName: 'forward_settings'): RecordService<ForwardSetting>;
  collection(idOrName: 'bucket_receive_logs'): RecordService<BucketReceiveLog>;
  collection(idOrName: 'bucket_forward_logs'): RecordService<BucketForwardLog>;
}

export const PocketBaseContext = createContext<TypedPocketBase | null>(null);

export type PocketBaseProviderProps = {
  url: string;
  children: any;
};

export function PocketBaseProvider({ url, children }: PocketBaseProviderProps) {
  const [pb] = useState(new PocketBase(url) as TypedPocketBase);
  console.log(pb)

  return (
    <PocketBaseContext.Provider value={pb}>
      {children}
    </PocketBaseContext.Provider>
  )
}

export const usePocketBase = () => {
  const context = useContext(PocketBaseContext);
  if (context === undefined || context === null) {
    throw new Error('usePocketBase must be used within a PocketBaseProvider');
  }

  return context;
}
