import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import './index.css'
import Root from '@/routes/root'
import Login from '@/routes/login'
import SignUp from '@/routes/sign-up'
import ForgotPassword from '@/routes/forgot-password'
import ErrorPage from "@/error-page"
import { PocketBaseProvider } from '@/lib/pocketbase'
import { Toaster } from "@/components/ui/toaster"
import PrivacyPolicy from './routes/privacy-policy'
import TermsOfService from './routes/terms-of-service'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import LoggedInRedirect from '@/components/logged-in-redirect'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoggedInRedirect><Login /></LoggedInRedirect>,
  },
  {
    path: "/sign-up",
    element: <LoggedInRedirect><SignUp /></LoggedInRedirect>,
  },
  {
    path: "/forgot-password",
    element: <LoggedInRedirect><ForgotPassword /></LoggedInRedirect>,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  }
])
const TEN_MINUTES = 10 * 60 * 1000

const pocketbaseURL = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8090' : '/';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TEN_MINUTES,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PocketBaseProvider url={pocketbaseURL}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PocketBaseProvider>
  </StrictMode>,
)
