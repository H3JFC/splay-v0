import { useToast } from "@/lib/hooks/use-toast"
import { ClientResponseError } from "@/lib/pocketbase"
import { useAPI } from "@/lib/hooks/use-api"
import { Bucket, ForwardSettingParams, ForwardSetting } from "@/lib/models"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

export type IForwardSettingParams = Omit<ForwardSettingParams, 'bucket'>
type UseCreateForwardSettingParams = {
  bucket: Bucket;
};
export function useCreateForwardSettingBucket({ bucket }: UseCreateForwardSettingParams): UseMutationResult<ForwardSetting, DefaultError, IForwardSettingParams> {
  const api = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<ForwardSetting,
    DefaultError,
    IForwardSettingParams
  >({
    mutationFn: ({
      name,
      url
    }: IForwardSettingParams) => api.createForwardSetting({ bucket: bucket.id, name, url }),
    mutationKey: ['bucket', 'id', bucket.id, 'forward-setting', 'new'],
    onError: (e) => {
      let { message } = (e as ClientResponseError);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
      console.error(e);
    },
    onSuccess: (forwardSetting: ForwardSetting) => {
      const { name, url} = forwardSetting;
      toast({
        title: "ForwardSetting Created!",
        description: `"${name}" forward-setting with url: "${url}" created!`,
      })
      queryClient.invalidateQueries({ queryKey: ['bucket', 'id', bucket.id, 'forward-settings'] });
    }
  });
}

