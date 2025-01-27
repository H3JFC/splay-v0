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

export type LoginSubmit = {
  email: string;
  password: string;
}

export function useLogin(): UseMutationResult<User, DefaultError, LoginSubmit> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<User,
    DefaultError,
    LoginSubmit
  >({
    mutationFn: ({
      email,
      password
    }: LoginSubmit) => api.login(email, password),
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

