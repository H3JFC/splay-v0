import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router"
import { LoginForm } from "@/components/login-form"
import LoggedInRedirect from '@/components/logged-in-redirect'

export default function LoginPage() {
  return (
    <LoggedInRedirect>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link to="/" className="flex items-center gap-2 self-center font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Splay
          </Link>
          <LoginForm />
        </div>
      </div>
    </LoggedInRedirect>
  )
}
