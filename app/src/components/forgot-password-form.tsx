import { useToast } from "@/lib/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePocketBase, ClientResponseError } from "@/lib/pocketbase"
import { AuthFormWrapper, Footer, AuthType } from "./auth-form"

export type ForgotPasswordSubmit = {
  email: string;
}
export type ForgotPasswordFormProps = {} & React.ComponentPropsWithoutRef<"div">;
export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const pb = usePocketBase();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const authType = AuthType.ForgotPassword;

  const onSubmit = async (data: any) => {
    const { email } = data as ForgotPasswordSubmit
    try {
      await pb.collection('users').requestPasswordReset(email)
      toast({
        title: "Password reset email sent.",
        description: "Please check your email for instructions on how to reset your password.",
      })
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      let { message } = (error as ClientResponseError);
      console.error(error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
    }
  }

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
