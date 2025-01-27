import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAPI } from "@/lib/hooks/use-api"

export default function LoggedInRedirect({ children }: { children: React.ReactNode }) {
  const api = useAPI();
  const navigate = useNavigate();

  useEffect(() => {
    if (api.isLoggedIn()) navigate("/");
  }, [api, navigate])

  return <>{children}</>
}

