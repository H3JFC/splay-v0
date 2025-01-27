import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  UseQueryResult,
} from '@tanstack/react-query';
import { Bucket } from "@/lib/api";

export type useBucketParams = useBucketSlug
type useBucketSlug = { slug: string }

export function useBucket(params: useBucketParams): UseQueryResult<Bucket, DefaultError> {
  const api = useAPI()
  const { slug } = params
  return useQuery<Bucket, DefaultError>({
    queryKey: ['bucket', 'slug', slug],
    queryFn: () => api.getBucketBySlug(slug),
  });
}
