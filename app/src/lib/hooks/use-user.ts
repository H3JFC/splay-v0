import { User } from '@/lib/models';
import {
  useQueryClient,
} from '@tanstack/react-query';
import { useAPI } from '@/lib/hooks/use-api';

export const useUser: () => Promise<User> = () => {
  const api = useAPI();
  if (api.isLoggedIn() === false) {
    throw new Error('User is not logged in');
  }

  const queryClient = useQueryClient();
  const user = queryClient.ensureQueryData({
    queryKey: ['user'],
    queryFn: () => api.userRefresh(),
  })

  return user
}
