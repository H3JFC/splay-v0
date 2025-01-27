import Root from '@/routes/root'
import Login from '@/routes/login'
import SignUp from '@/routes/sign-up'
import ForgotPassword from '@/routes/forgot-password'
import ErrorPage from "@/error-page"
import PrivacyPolicy from '@/routes/privacy-policy'
import TermsOfService from '@/routes/terms-of-service'
import BucketsPage from '@/routes/buckets'
import BucketSlugPage from '@/routes/buckets/slug'
import { RouteObject } from "react-router-dom"

export const routes: RouteObject[] = ([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
  {
    path: "/buckets",
    element: <BucketsPage />,
  },
  {
    path: "/buckets/:slug",
    element: <BucketSlugPage />,
  }
])

// export default routes;
