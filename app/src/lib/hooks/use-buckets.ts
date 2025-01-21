import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ListBuckets } from "../api";

export function useBuckets(): UseQueryResult<ListBuckets, DefaultError> {
  const api = useAPI()
  const queryClient = useQueryClient();

  return useQuery<ListBuckets, DefaultError>({
    queryKey: ['buckets'],
    queryFn: () => api.listBuckets()
      .then((list: ListBuckets) => {
        list.items.forEach((bucket) => {
          queryClient.setQueryData(['bucket', 'slug', bucket.slug], bucket);
        });

        return list
      }),
  });
}
