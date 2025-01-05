import { useState } from 'react'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'
import { usePocketBase,  ClientResponseError } from "@/lib/pocketbase"
import { useToast } from "@/lib/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import {
  useMutation,
  DefaultError,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

function useLogout(): UseMutationResult<void, DefaultError, void> {
  const pb = usePocketBase();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void,
    DefaultError,
    void
  >({
    mutationFn: () => Promise.resolve(pb.authStore.clear()),
    mutationKey: ['user'],
    onError: (e) => {
      let { message } = (e as ClientResponseError);
      toast({
        title: "Uh oh! Something went wrong.",
        description: message,
        variant: "destructive",
      })
      console.error(e);
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      toast({
        title: "Goodbye! 👋",
        description: "You have been logged out.",
      })
      setTimeout(() => navigate("/"), 250);
    }
  });
}

function App() {
  const [count, setCount] = useState(0)
  const { mutate: logout } = useLogout()

  return (
    <>
      <button onClick={() => logout()}>logout</button>
      <div className="text-red-500">
        Hello World!
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
