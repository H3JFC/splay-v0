import { useToast } from "@/lib/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import { User } from "@/lib/models"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

export type Provider = 'github' | 'google';
export function useOAuth(): UseMutationResult<User, DefaultError, Provider> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<User,
    DefaultError,
    Provider
  >({
    mutationFn: (provider: Provider) => api.oauthLogin(provider),
    mutationKey: ['user'],
    onError: (e) => {
      let { message } = (e as ClientResponseError);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
      console.error(e);
    },
      onSuccess: (user: User) => {
      queryClient.setQueryData(['user'], user);
      const { email } = user;
      toast({
        title: "Welcome back!",
        description: `You are now logged in as ${email}`,
      })
      setTimeout(() => navigate("/"), 250);
    }
  });
}
