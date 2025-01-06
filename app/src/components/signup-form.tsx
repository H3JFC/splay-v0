import { useState } from "react"
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthFormWrapper, OAuthSection, Footer, AuthType } from "./auth-form"
import { useSignup, SignUpSubmit } from "@/lib/hooks/use-signup";

export type SignUpFormProps = {} & React.ComponentPropsWithoutRef<"div">;
export function SignUpForm({
  ...props
}: SignUpFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null)
  const { mutate: signup } = useSignup();

  const validateAndSubmit = (e?: React.BaseSyntheticEvent): Promise<void> => {
    return validate(e)
      .then(handleSubmit((data: any) => signup(data as SignUpSubmit)))
      .catch(setPasswordConfirmError);
  }

  return (
    <AuthFormWrapper authType={AuthType.SignUp} {...props}>
      <form onSubmit={validateAndSubmit}>
        <div className="grid gap-6">
          <OAuthSection authType={AuthType.SignUp} />
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="passwordConfirm">Password Confirmation</Label>
              </div>
              <Input id="passwordConfirm" type="password" onClick={() => setPasswordConfirmError(null)}
                {...register("passwordConfirm", { required: true })}
              />
              <div className="text-red-400 text-sm">
                {errors.passwordConfirm && errors.passwordConfirm.type === "required" && <div>Password Confirmation is required</div>}
                {passwordConfirmError && <div>{passwordConfirmError}</div>}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </div>
          <Footer authType={AuthType.SignUp} />
        </div>
      </form>
    </AuthFormWrapper>
  )
}

function validate(e?: React.BaseSyntheticEvent): Promise<React.BaseSyntheticEvent | undefined> {
  e?.preventDefault();
  const formData = new FormData(e?.target as HTMLFormElement);
  let data: Partial<SignUpSubmit> = {};
  for (const [key, value] of formData.entries()) {
    // @ts-ignore
    data[key] = value;
  }

  const { password, passwordConfirm } = data as SignUpSubmit;
  if (password !== passwordConfirm) {
    // setPasswordConfirmError("Password Confirmation does not match Password");
    return Promise.reject("Password Confirmation does not match Password");
  }

  return Promise.resolve(e);
}
