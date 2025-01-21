import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  UseQueryResult,
} from '@tanstack/react-query';
import { Bucket, ListForwardSettings } from "../api";

export function useForwardSettings(bucket: Bucket): UseQueryResult<ListForwardSettings, DefaultError> {
  const api = useAPI()

  return useQuery<ListForwardSettings, DefaultError>({
    queryKey: ['bucket', 'slug', bucket.slug, 'forward-settings'],
    queryFn: () => api.listForwardSettings(bucket.id),
  });
}
