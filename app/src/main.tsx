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
