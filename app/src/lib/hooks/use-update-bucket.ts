import { useToast } from "@/lib/hooks/use-toast"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import { Bucket, BucketUpdateParams } from "@/lib/models"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

export function useUpdateBucket(): UseMutationResult<Bucket, DefaultError, BucketUpdateParams> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();


  return useMutation<Bucket,
    DefaultError,
    BucketUpdateParams
  >({
    mutationFn: ({
      id,
      name,
      description,
      user
    }: BucketUpdateParams) => api.updateBucket(id, { name, description, user }),
    mutationKey: ['buckets', 'update'],
    onError: (e) => {
      let { message } = (e as ClientResponseError);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
      console.error(e);
    },
    onSuccess: (bucket: Bucket) => {
      const { name, slug, id } = bucket;
      toast({
        title: "Bucket Updated!",
        description: `"${name}" bucket with slug: "${slug}" updated!`,
      })
      queryClient.setQueryData(['bucket', 'id', id], bucket);
      queryClient.invalidateQueries({
        queryKey: ['buckets'],
      })
    }
  });
}

