import { useLogin, LoginSubmit } from "@/lib/hooks/use-login"
import { useForm } from "react-hook-form";
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthFormWrapper, OAuthSection, Footer, AuthType } from "./auth-form"

export type LoginFormProps = {} & React.ComponentPropsWithoutRef<"div">;

export function LoginForm({
  ...props
}: LoginFormProps) {
  const { mutate: login } = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data: any) => login(data as LoginSubmit)

  return (
    <AuthFormWrapper authType={AuthType.Login} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <OAuthSection authType={AuthType.Login} />
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password"
                {...register("password", { required: true, minLength: 8, maxLength: 71 })}
              />
              <div className="text-red-400 text-sm">
                {errors.password && errors.password.type === "required" && <span>Password is required</span>}
                {errors.password && errors.password.type === "maxLength" && <span>Password must be 71 characters or less</span>}
                {errors.password && errors.password.type === "minLength" && <span>Password must be at least 8 characters</span>}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </div>
          <Footer authType={AuthType.Login} />
        </div>
      </form>
    </AuthFormWrapper>
  )
}
