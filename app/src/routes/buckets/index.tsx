import LogOutRedirect from "@/components/log-out-redirect"
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BucketParams } from "@/lib/models"
import { useBuckets } from "@/lib/hooks/use-buckets"
import { useCreateBucket } from "@/lib/hooks/use-create-bucket";
import { useDeleteBucket } from "@/lib/hooks/use-delete-bucket";
import { useUser } from "@/lib/auth";
import { Bucket } from "@/lib/models";
import { Link } from "react-router"

export default function BucketsPage() {
  const { id: user } = useUser()
  const { data: listBuckets } = useBuckets()
  const { mutate: createBucket } = useCreateBucket()
  const { mutate: deleteBucket } = useDeleteBucket()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data: any) => {
    const bucketParams: BucketParams = { ...data, user };
    createBucket(bucketParams)
  }

  return (
    <LogOutRedirect>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-2 md:p-10">
        <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
          Buckets
          {listBuckets?.items && listBuckets.items.map((bucket: Bucket) => (
            <div key={bucket.id} className="flex flex-row gap-2 justify-between">
              <div className="flex items-center self-start font-medium">
                <Link to={`/buckets/${bucket.slug}`}>
                  Name: {bucket.name} Slug: {bucket.slug}  Desc: {bucket.description}
                </Link>
              </div>
              <div className="flex items-center font-medium">
                <Button onClick={() => deleteBucket(bucket.id)}
                  className="bg-red-400">Delete</Button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: '100%' }} className="flex w-full max-w-sm flex-col gap-6 text-wrap">
          Create Buckets

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
              Create Bucket
            </Button>
          </form>
        </div>
      </div>
    </LogOutRedirect>
  )
}
