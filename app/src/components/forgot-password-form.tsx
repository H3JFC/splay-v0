import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useResetPassword } from "@/lib/hooks/use-reset-password"
import { AuthFormWrapper, Footer, AuthType } from "./auth-form"

export type ForgotPasswordSubmit = {
  email: string;
}
export type ForgotPasswordFormProps = {} & React.ComponentPropsWithoutRef<"div">;
export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const { mutate: resetPassword } = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const authType = AuthType.ForgotPassword;

  const onSubmit = async (data: any) => resetPassword(data?.email as string);

  return (
    <AuthFormWrapper authType={AuthType.ForgotPassword} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register("email", { required: true, pattern: /^[^@\s]*@[^\s@]*$/ })}
              />
              <div className="text-red-400 text-sm">
                {errors.email && errors.email.type === "required" && <span>Email is required</span>}
                {errors.email && errors.email.type === "pattern" && <span>Email must be valid</span>}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Reset password
            </Button>
          </div>
          <Footer authType={authType} />
        </div>
      </form>
    </AuthFormWrapper>
  )
}
