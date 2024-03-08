import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login';
import Index from "./pages/Index.jsx";

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? <Login /> : <Index key={session.user.id} session={session} />}
    </div>
  )
}

export default App