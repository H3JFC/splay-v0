import { useToast } from "@/lib/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
} from '@tanstack/react-query';

export type Success = boolean;
export type Email = string;

export function useResetPassword(): UseMutationResult<Success, DefaultError, Email> {
  const api = useAPI();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation<boolean,
    DefaultError,
    Email
  >({
    mutationFn: (email: Email) => api.resetPassword(email),
    mutationKey: ['resetPassword'],
    onError: (e) => {
      let { message } = (e as ClientResponseError);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
      console.error(e);
    },
    onSuccess: (_success: boolean) => {
      toast({
        title: "Password reset email sent.",
        description: "Please check your email for instructions on how to reset your password.",
      })
      setTimeout(() => navigate("/login"), 1000);
    }
  });
}

