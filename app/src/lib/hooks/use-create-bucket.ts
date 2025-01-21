import { useToast } from "@/lib/hooks/use-toast"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import { Bucket, BucketParams } from "@/lib/models"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

export function useCreateBucket(): UseMutationResult<Bucket, DefaultError, BucketParams> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<Bucket,
    DefaultError,
    BucketParams
  >({
    mutationFn: ({
      name,
      slug,
      description,
      user
    }: BucketParams) => api.createBucket({ name, slug, description, user }),
    mutationKey: ['buckets', 'new'],
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
      const { name, slug } = bucket;
      toast({
        title: "Bucket Created!",
        description: `"${name}" bucket with slug: "${slug}" created!`,
      })
      queryClient.setQueryData(['bucket', 'slug', slug], bucket);
      queryClient.invalidateQueries({
        queryKey: ['buckets'],
      })
    }
  });
}

