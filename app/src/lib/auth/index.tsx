import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/models';
import {
  useQueryClient,
} from '@tanstack/react-query';
import { useAPI } from '@/lib/hooks/use-api';

const NOT_INITIALIZED = null;
const INITIALIZED = -1;
const DEFAULT_USER: User = {
  id: '-1',
  email: '',
  name: '',
  created: '',
  updated: '',
  emailVisibility: false,
  verified: false,
  avatar: '',
}

type UserProviderInitialized = -1;
type UserProviderNotInitialized = null;
export type UserProviderProps = {
  children: any;
};

export const UserContext = createContext<User | UserProviderInitialized | UserProviderNotInitialized>(NOT_INITIALIZED);

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | UserProviderInitialized | UserProviderNotInitialized>(INITIALIZED);
  const api = useAPI();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (api.isLoggedIn() === false) return

    queryClient.ensureQueryData({
      queryKey: ['user'],
      queryFn: () => api.userRefresh(),
    }).then((user: User) => {
      setUser(user)
    })
  }, [])

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const user = useContext(UserContext);
  if (user === undefined || user === null) {
    throw new Error('useUser must be used within an AuthProvider');
  }

  if (user === -1) {
    return DEFAULT_USER;
  }

  return user;
}
