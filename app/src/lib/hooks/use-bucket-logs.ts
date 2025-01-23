import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ListLogs, Bucket } from "../api";
import { ToString } from '@/lib/datetime'
import { Log } from '@/lib/models'

export function useBucketLogs(bucket: Bucket, page = 1, perPage = 25, start: Date, end: Date): UseQueryResult<ListLogs, DefaultError> {
  const api = useAPI()
  const queryClient = useQueryClient();

  return useQuery<ListLogs, DefaultError>({
    queryKey: ['bucket', 'slug', bucket.slug, 'logs'],
    queryFn: () => api.
      listLogs({ bucketID: bucket.id, page, perPage, start: ToString(start), end: ToString(end) }).
      then((list: ListLogs) => {
        list.items.forEach((log: Log) => {
          queryClient.setQueryData(['bucket', 'slug', bucket.slug, 'log', log.id], log);
        });

        return list
      }),
  });
}
