import { useAPI } from "@/lib/hooks/use-api"
import {
  useQuery,
  DefaultError,
  UseQueryResult,
} from '@tanstack/react-query';
import { ListForwardSettings } from "../api";

export function useForwardSettings(bucketID: string): UseQueryResult<ListForwardSettings, DefaultError> {
  const api = useAPI()

  return useQuery<ListForwardSettings, DefaultError>({
    queryKey: ['bucket', 'id', bucketID, 'forward-settings'],
    queryFn: () => api.listForwardSettings(bucketID),
  });
}
