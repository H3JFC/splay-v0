import { useToast } from "@/lib/hooks/use-toast"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import { Bucket } from "@/lib/models"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

type UseDeleteForwardSettingParams = {
  bucket: Bucket;
  onSuccess?: (success: boolean) => void;
};

export function useDeleteForwardSetting({ bucket, onSuccess }: UseDeleteForwardSettingParams): UseMutationResult<boolean, DefaultError, string> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();


  return useMutation<boolean, DefaultError, string>({
    mutationFn: (id: string) => api.deleteForwardSetting(id),
    mutationKey: ['forward-setting', 'delete'],
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
        title: "Forward Setting Deleted!",
        description: `Successfully deleted buckets forward setting`,
      })
      queryClient.invalidateQueries({ queryKey: ['bucket', 'slug', bucket.slug, 'forward-settings'] });
    }
  });
}

