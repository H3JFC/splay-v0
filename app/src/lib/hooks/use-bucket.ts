import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  useQueryClient,
} from '@tanstack/react-query';
import { Bucket } from "@/lib/api";

export type useBucketParams = useBucketSlug
type useBucketSlug = { slug: string }

export function useBucket(params: useBucketParams): any {
  const api = useAPI()
  const queryClient = useQueryClient();
  const { slug } = params
  return useQuery<Bucket, DefaultError>({
    queryKey: ['bucket', 'slug', slug],
    queryFn: () => api.getBucketBySlug(slug)
      .then((bucket) => {
        queryClient.setQueryData(['bucket', 'id', bucket.id], bucket);

        return bucket
      }),
  });
}
