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

const router = createBrowserRouter([
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
  }
])

const pocketbaseURL = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8090' : '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PocketBaseProvider url={pocketbaseURL}>
      <RouterProvider router={router} />
      <Toaster />
    </PocketBaseProvider>
  </StrictMode>,
)
