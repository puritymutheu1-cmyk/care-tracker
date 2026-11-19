import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import Appointments from './Appointments'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <p className="p-6">Loading…</p>
  if (!session) return <Login />

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <button onClick={() => supabase.auth.signOut()} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold">
          Sign out
        </button>
      </div>
      <Appointments />
    </div>
  )
}
