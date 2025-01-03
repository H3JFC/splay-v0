import { createContext, useContext, useState } from 'react';
import PocketBase from 'pocketbase';

export const PocketBaseContext = createContext<PocketBase | null>(null);

export type PocketBaseProviderProps = {
  url: string;
  children: any;
};

export function PocketBaseProvider({ url, children }: PocketBaseProviderProps) {
  const [pb] = useState(new PocketBase(url));

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
