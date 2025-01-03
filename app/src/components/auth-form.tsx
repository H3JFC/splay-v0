import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePocketBase } from "@/lib/pocketbase"
import { useForm } from "react-hook-form";
import { ClientResponseError } from "pocketbase"

enum AuthType {
  Login,
  SignUp,
  ForgotPassword,
};

type LoginSubmit = {
  email: string;
  password: string;
}

type SignUpSubmit = {
  email: string;
  password: string;
  passwordConfirm: string;
}

type ForgotPasswordSubmit = {
  email: string;
}

type AuthFormProps = {
  authType: AuthType.Login | AuthType.SignUp;
} & React.ComponentPropsWithoutRef<"div">;

type LoginFormProps = {} & React.ComponentPropsWithoutRef<"div">;
type SignUpFormProps = {} & React.ComponentPropsWithoutRef<"div">;
type ForgotPasswordFormProps = {} & React.ComponentPropsWithoutRef<"div">;

export function LoginForm({
  ...props
}: LoginFormProps) {
  const { toast } = useToast();
  const pb = usePocketBase();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const { email: usernameOrEmail, password } = data as LoginSubmit;
      await pb.collection('users').authWithPassword(usernameOrEmail, password)
      navigate("/");
    } catch (e) {
      let { message } = (e as ClientResponseError);
      console.error(e);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
    }
  }

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

export function SignUpForm({
  ...props
}: SignUpFormProps) {
  const { toast } = useToast();
  const pb = usePocketBase();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null)
  const navigate = useNavigate();

  const validateAndSubmit = (e?: React.BaseSyntheticEvent): Promise<void> => {
    e?.preventDefault();
    const formData = new FormData(e?.target as HTMLFormElement);
    let data: Partial<SignUpSubmit> = {};
    for (const [key, value] of formData.entries()) {
      // @ts-ignore
      data[key] = value;
    }

    const { password, passwordConfirm } = data as SignUpSubmit;
    if (password !== passwordConfirm) {
      setPasswordConfirmError("Password Confirmation does not match Password");
    }

    return handleSubmit(onSubmit)(e)
  }

  const onSubmit = async (data: any) => {
    const { email, password } = data as SignUpSubmit;
    try {
      await pb.collection('users').create({ email, password })
      await pb.collection('users').authWithPassword(email, password)
      navigate("/");
    } catch (e) {
      let { message } = (e as ClientResponseError);
      console.error(e);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
    }
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

export function AuthFormWrapper({
  authType,
  className,
  children,
  ...props
}: AuthFormProps) {
  const action = getAction(authType);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <Header authType={authType} />
        <CardContent>
          {children}
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-slate-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-slate-900  dark:text-slate-400 dark:[&_a]:hover:text-slate-50">
        By clicking "{action}", you agree to our <Link to="/terms-of-service">Terms of Service</Link>{" "}
        and <Link to="/privacy-policy">Privacy Policy</Link>.
      </div>
    </div>
  )
}

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const pb = usePocketBase();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const authType = AuthType.ForgotPassword;

  const onSubmit = async (data: any) => {
    const { email } = data as ForgotPasswordSubmit
    try {
      await pb.collection('users').requestPasswordReset(email)
      toast({
        title: "Password reset email sent.",
        description: "Please check your email for instructions on how to reset your password.",
      })
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <Header authType={authType} />
        <CardContent>
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
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-slate-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-slate-900  dark:text-slate-400 dark:[&_a]:hover:text-slate-50">
        By clicking "Reset password", you agree to our <Link to="/terms-of-service">Terms of Service</Link>{" "}
        and <Link to="/privacy-policy">Privacy Policy</Link>.
      </div>
    </div>
  )
}

type FooterProps = {
  authType: AuthType;
}

function Footer({ authType }: FooterProps) {
  switch (authType) {
    case AuthType.Login:
      return (
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      )
    case AuthType.SignUp:
      return (
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      )
    case AuthType.ForgotPassword:
      return (
        <div className="text-center text-sm">
          Back to{" "}
          <Link to="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      )
  }
}

type OAuthSectionProps = {
  authType: AuthType.Login | AuthType.SignUp;
}

function OAuthSection({ authType }: OAuthSectionProps) {
  const { toast } = useToast();
  const pb = usePocketBase();
  const action = getAction(authType);
  const handleOAuth = (provider = "") => {
    return (async () => {
      try {
        await pb.collection('users').authWithOAuth2({ provider });
      } catch (e) {
        const { message } = e as ClientResponseError
        console.error(e);
        toast({
          title: "Uh oh! Something went wrong.",
          description: message,
          variant: "destructive",
        })
      }
    })
  }

  switch (authType) {
    case AuthType.Login:
    case AuthType.SignUp:
      return (
        <>
          <div className="flex flex-col gap-4">
            <Button onClick={handleOAuth('github')} type="button" variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              {action} with GitHub
            </Button>
            <Button onClick={handleOAuth('google')} type="button" variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {action} with Google
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
            <span className="relative z-10 bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </>
      )
  }
}

function getAction(authType: AuthType): string {
  switch (authType) {
    case AuthType.Login:
      return "Login";
    case AuthType.SignUp:
      return "Sign up";
    case AuthType.ForgotPassword:
      return "Reset password";
  }
}

type HeaderProps = {
  authType: AuthType;
}

function Header({ authType }: HeaderProps) {
  const action = getAction(authType);
  const title = authType === AuthType.Login ? "Welcome back" : "Welcome";
  switch (authType) {
    case AuthType.Login:
    case AuthType.SignUp:
      return (
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>
            {action} with your Github or Google account
          </CardDescription>
        </CardHeader>
      )
    case AuthType.ForgotPassword:
      return (
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
      )
  }
}
