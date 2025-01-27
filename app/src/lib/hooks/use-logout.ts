import { ClientResponseError } from "@/lib/pocketbase"
import { useToast } from "@/lib/hooks/use-toast"
import { useAPI } from "@/lib/hooks/use-api"
import { useNavigate } from "react-router-dom"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

export function useLogout(): UseMutationResult<void, DefaultError, void> {
  const api = useAPI()
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void,
    DefaultError,
    void
  >({
    mutationFn: () => api.logout(),
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
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      toast({
        title: "Goodbye! 👋",
        description: "You have been logged out.",
      })
      setTimeout(() => navigate("/"), 250);
    }
  });
}
