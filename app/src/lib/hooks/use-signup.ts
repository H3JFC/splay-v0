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

export type SignUpSubmit = {
  email: string;
  password: string;
  passwordConfirm: string;
}

export function useSignup(): UseMutationResult<User, DefaultError, SignUpSubmit> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<User,
    DefaultError,
    SignUpSubmit
  >({
    mutationFn: ({
      email,
      password,
      passwordConfirm
    }: SignUpSubmit) => api.signup({ email, password, passwordConfirm }),
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
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })
      setTimeout(() => navigate("/login"), 500);
    }
  });
}

