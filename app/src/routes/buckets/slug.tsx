import { ChangeEvent, useState, useEffect } from "react";
import LogOutRedirect from "@/components/log-out-redirect"
import { useForm } from "react-hook-form";
import { useBucket } from "@/lib/hooks/use-bucket"
import { useParams, useSearchParams } from "react-router"
import { useDeleteForwardSetting } from "@/lib/hooks/use-delete-forward-setting";
import { useDeleteBucket } from "@/lib/hooks/use-delete-bucket";
import { useUpdateBucket } from "@/lib/hooks/use-update-bucket";
import { useForwardSettings } from "@/lib/hooks/use-forward-settings";
import { useBucketLogs } from "@/lib/hooks/use-bucket-logs";
import { useNavigate } from "react-router-dom"
import { BucketUpdateParams, Bucket, ForwardSetting } from "@/lib/models"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { IForwardSettingParams, useCreateForwardSettingBucket } from "@/lib/hooks/use-create-forward-setting";
import { TimeAgo, Now } from '@/lib/datetime'

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
        <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
          List Logs
          {bucket && (<ListLogs bucket={bucket} />)}
        </div>
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
  const { data: listForwardSettings } = useForwardSettings(bucket);
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

type FooParams = {
  bucket: Bucket;
};

function ListLogs({ bucket }: FooParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const startString = searchParams.get('start');
  const endString = searchParams.get('end');
  const pageString = searchParams.get('page');
  const perPageString = searchParams.get('perPage');
  const liveString = searchParams.get('live');

  const [page, setPage] = useState(pageString && parseInt(pageString) || 1);
  const [perPage, setPerPage] = useState(perPageString && parseInt(perPageString) || 25);
  const [live, setLive] = useState(liveString && liveString === 'true' || false);

  let defaultStart, defaultEnd;
  try {
    if (live) {
      defaultEnd = Now()
    } else {
      defaultEnd = endString ? new Date(endString) : Now();
    }
  } catch {
    defaultEnd = Now();
  }

  try {
    defaultStart = startString ? new Date(startString) : TimeAgo(Now(), { days: 1 });
  } catch {
    defaultStart = TimeAgo(Now(), { days: 1 });
  }
  if (defaultStart >= defaultEnd) {
    defaultStart = TimeAgo(Now(), { days: 1 });
  }

  const [end, setEnd] = useState(defaultEnd);
  const [start, setStart] = useState(defaultStart);

  const { data: listLogs, refetch } = useBucketLogs(bucket, page, perPage, start, end);

  const handleSetDate = (option: 'start' | 'end') => (event: ChangeEvent) => {
    try {
      const d = new Date((event.target as any).value);
      if (option === 'start') setStart(d);
      if (option === 'end') setEnd(d);
    } catch {}
  }

  useEffect(() => {
    setSearchParams(params => {
      params.set('start', start.toISOString());
      params.set('end', end.toISOString());
      params.set('page', page.toString());
      params.set('perPage', perPage.toString());
      live ? params.set('live', 'true') : params.set('live', 'false');

      return params;
    })

    refetch();
  }, [start, end, page, perPage, live])

  return (
    <>
      <div>
        <div>Total Items: {listLogs?.totalItems}</div>
        <div>Total Pages: {listLogs?.totalPages}</div>
        <div>
          <Label htmlFor="live">Live</Label>
          <input
            type="checkbox"
            onChange={() => setLive(!live)}
            checked={live}
          />
        </div>
        <div>
          <Label htmlFor="page">Page</Label>
          <input
            type="number"
            onChange={(event) => setPage(parseInt((event?.target as any).value))}
            defaultValue={listLogs?.page}
          />
        </div>
        <div>
          <Label htmlFor="perPage">perPage</Label>
          <input
            type="number"
            onChange={(event) => setPerPage(parseInt((event?.target as any).value))}
            defaultValue={listLogs?.perPage}
          />
        </div>
        <div>
          <Label htmlFor="start">Start</Label>
          <input
            type="date"
            onChange={handleSetDate('start')}
            defaultValue={start.toISOString()}
          />
        </div>
        <div>
          <Label htmlFor="end">End</Label>
          <input
            type="date"
            onChange={handleSetDate('end')}
            defaultValue={end.toISOString()}
          />
        </div>
        {listLogs?.items && listLogs.items.map((log) => (
          <div key={log.id} className="flex flex-row gap-2 justify-between">
            <div className="flex items-center self-start font-medium">
              Created: {log.created}
              Body: <pre>
                {JSON.stringify(log.body)}
              </pre>
              Headers: <pre>
                {JSON.stringify(log.headers)}
              </pre>
              Forwards Count: {log.forward_logs.length}
              Forwards: {log.forward_logs.map((forwardLog) => (
                <div key={forwardLog.id}>
                  Created: {log.created}
                  <pre>
                    {JSON.stringify(forwardLog.body)}
                  </pre>
                  <pre>
                    {JSON.stringify(forwardLog.headers)}
                  </pre>
                  Destination URL: {forwardLog.destination_url}
                  Status Code: {forwardLog.status_code}
                </div>
              ))}
              IP: {log.ip}
            </div>
            <div className="flex items-center font-medium">
              <Button onClick={() => console.log("log", log)}
                className="bg-red-400">View</Button>
            </div>
          </div>
        ))}
      </div>
    </>)
}
