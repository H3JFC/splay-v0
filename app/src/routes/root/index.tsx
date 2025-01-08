import { useState } from 'react'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'
import { useLogout } from '@/lib/hooks/use-logout';
import { useAPI } from '@/lib/hooks/use-api';

function App() {
  const [count, setCount] = useState(0)
  const api = useAPI()
  const { mutate: logout } = useLogout()
  const isLoggedIn = api.isLoggedIn()
  console.log(api)

  return (
    <>
      { isLoggedIn ? <p>You are logged in</p> : <p>You are logged out</p> }
      { isLoggedIn && (<button onClick={() => logout()}>logout</button>) }
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
