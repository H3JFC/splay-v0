import { useToast } from "@/lib/hooks/use-toast"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

type UseDeleteBucketParams = {
  onSuccess?: (success: boolean) => void;
};

export function useDeleteBucket(params: UseDeleteBucketParams = {}): UseMutationResult<boolean, DefaultError, string> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onSuccess } = params;


  return useMutation<boolean, DefaultError, string>({
    mutationFn: (id: string) => api.deleteBucket(id),
    mutationKey: ['buckets', 'delete'],
    onError: (e) => {
      let { message } = (e as ClientResponseError);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
      console.error(e);
    },
    onSuccess: (success: boolean) => {
      onSuccess && onSuccess(success);
      toast({
        title: "Bucket Deleted!",
        description: `Successfully deleted bucket`,
      })
      queryClient.invalidateQueries({
        queryKey: ['buckets'],
      })
    }
  });
}

