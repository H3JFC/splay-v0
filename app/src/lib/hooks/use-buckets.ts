import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  UseQueryResult,
} from '@tanstack/react-query';
import { ListBuckets } from "../api";

export function useBuckets(): UseQueryResult<ListBuckets, DefaultError> {
  const api = useAPI()

  return useQuery<ListBuckets, DefaultError>({
    queryKey: ['buckets'],
    queryFn: () => api.listBuckets(),
  });
}
