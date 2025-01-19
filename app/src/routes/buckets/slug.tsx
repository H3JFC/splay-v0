import LogOutRedirect from "@/components/log-out-redirect"
import { useForm } from "react-hook-form";
import { useBucket } from "@/lib/hooks/use-bucket"
import { useParams } from "react-router"
import { useDeleteForwardSetting } from "@/lib/hooks/use-delete-forward-setting";
import { useDeleteBucket } from "@/lib/hooks/use-delete-bucket";
import { useUpdateBucket } from "@/lib/hooks/use-update-bucket";
import { useForwardSettings } from "@/lib/hooks/use-forward-settings";
import { useNavigate } from "react-router-dom"
import { BucketUpdateParams, Bucket, ForwardSetting } from "@/lib/models"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { IForwardSettingParams, useCreateForwardSettingBucket } from "@/lib/hooks/use-create-forward-setting";

export type BucketSlugProps = {};
export default function BucketSlugPage({ }: BucketSlugProps) {
  const { slug } = useParams() as { slug: string }
  const navigate = useNavigate();
  const onSuccess = () => navigate("/buckets");
  const { mutate: deleteBucket } = useDeleteBucket({ onSuccess })
  const { data: bucket } = useBucket({ slug })
  const handleDelete = () => {
    bucket && deleteBucket(bucket?.id)
  }

  return (
    <LogOutRedirect>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
          Bucket
          {bucket && (
            <div key={bucket.id} className="flex flex-row gap-2 justify-between">
              <div className="flex items-center self-start font-medium">
                Name: {bucket.name} Slug: {bucket.slug}  Desc: {bucket.description}
              </div>
              <div className="flex items-center font-medium">
                <Button onClick={handleDelete}
                  className="bg-red-400">Delete</Button>
              </div>
            </div>
          )}
        </div>
        {!bucket && <div>Loading...</div>}
        {bucket && (<>
          <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
            <UpdateForm bucket={bucket} />
          </div>
          <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
            <ListForwardSettings bucket={bucket} />
          </div>
        </>)
        }
      </div>
    </LogOutRedirect>
  )
}

type UpdateFormParams = {
  bucket: Bucket
}
function UpdateForm({ bucket }: UpdateFormParams) {
  const { id, name, slug, description } = bucket;
  const { mutate: updateBucket } = useUpdateBucket()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name, slug, description }
  });

  const onSubmit = (data: any) => {
    const bucketParams: BucketUpdateParams = { ...data, id };
    updateBucket(bucketParams);
  }

  return (
    <>
      Update Bucket
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="name"
            placeholder="name"
            {...register("name", { required: true, minLength: 2, maxLength: 200 })}
          />
          <div className="text-red-400 text-sm">
            {errors.name && errors.name.type === "required" && <span>Name is required</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            disabled
            id="slug"
            type="slug"
            placeholder="slug"
            {...register("slug", { required: false, minLength: 6, maxLength: 256, pattern: /^[a-zA-Z0-9]+([-][a-zA-Z0-9]+)*$/ })}
          />
          <div className="text-red-400 text-sm">
            {errors.slug && errors.slug.type === "required" && <span>Slug is required</span>}
            {errors.slug && errors.slug.type === "pattern" && <span>Slug must be alphanumeric. Dashes "-" are allowed.</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="description"
            placeholder="description"
            {...register("description", { required: false })}
          />
        </div>

        <Button type="submit" className="w-full">
          Update Bucket
        </Button>
      </form>
    </>
  )
}

type ForwardSettingProps = {
  bucket: Bucket;
};
function ListForwardSettings({ bucket }: ForwardSettingProps) {
  const { data: listForwardSettings } = useForwardSettings(bucket.id);
  const { mutate: deleteForwardSetting } = useDeleteForwardSetting({ bucket })
  return (
    <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
      ForwardSettings
      {listForwardSettings?.items && listForwardSettings.items.map((forwardSetting: ForwardSetting) => (
        <div key={forwardSetting.id} className="flex flex-row gap-2 justify-between">
          <div className="flex items-center self-start font-medium">
            Name: {forwardSetting.name} URL: {forwardSetting.url}
          </div>
          <div className="flex items-center font-medium">
            <Button onClick={() => deleteForwardSetting(forwardSetting.id)}
              className="bg-red-400">Delete</Button>
          </div>
        </div>
      ))}
      <CreateForwardSettingForm bucket={bucket} />
    </div>
  )
}

type CreateForwardSettingFormParams = {
  bucket: Bucket;
}
function CreateForwardSettingForm({ bucket }: CreateForwardSettingFormParams) {
  const { mutate: createForwardSetting } = useCreateForwardSettingBucket({ bucket })
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data: any) => {
    const forwardSettingParams: IForwardSettingParams = { ...data };
    createForwardSetting(forwardSettingParams)
  }
  return (
    <>
      Create Forward Settings

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="name"
            placeholder="name"
            {...register("name", { required: true, minLength: 1 })}
          />
          <div className="text-red-400 text-sm">
            {errors.name && errors.name.type === "required" && <span>Name is required</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="url"
            {...register("url", { required: true, minLength: 1, maxLength: 3000 })}
          />
          <div className="text-red-400 text-sm">
            {errors.url && errors.url.type === "required" && <span>URL is required</span>}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Forward Setting
        </Button>
      </form>
    </>
  )
}
