import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import './index.css'
import { PocketBaseProvider } from '@/lib/pocketbase'
import { Toaster } from "@/components/ui/toaster"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { routes as R } from '@/routes'
import { UserProvider } from '@/lib/auth'

const router = createBrowserRouter(R)
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
        <UserProvider>
          <RouterProvider router={router} />
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </UserProvider>
      </QueryClientProvider>
    </PocketBaseProvider>
  </StrictMode>,
)

