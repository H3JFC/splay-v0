import { createContext, useContext, useState } from 'react';
import PocketBase, { RecordService } from 'pocketbase';
import { Bucket, BucketForwardLog, BucketReceiveLog, ForwardSetting, User } from '@/lib/models';
export * from 'pocketbase';

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
