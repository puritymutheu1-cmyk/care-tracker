import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import Appointments from './Appointments'
import Medicines from './Medicines'
import Account from './Account'

const tabs = [
  { id: 'medicines', emoji: '💊', label: 'Medicines' },
  { id: 'appointments', emoji: '📅', label: 'Appointments' },
  { id: 'account', emoji: '👤', label: 'Account' },
]

const screen = 'flex min-h-screen items-center justify-center bg-sky-50 p-6 text-center text-sky-800'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const [isMember, setIsMember] = useState(null)
  const [tab, setTab] = useState('medicines')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase
      .from('members')
      .select('email')
      .then(({ data, error }) => setIsMember(error ? true : data.length > 0))
  }, [session])

  if (session === undefined) return <div className={screen}>Loading...</div>
  if (!session) return <Auth />
  if (isMember === null) return <div className={screen}>Loading...</div>
  if (!isMember)
    return (
      <div className={screen}>
        <div>
          <p className="mb-4 text-lg">
            You're signed in as {session.user.email}, but this email is not on the family list yet.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    )

  const current = tabs.find((t) => t.id === tab)

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-200 via-sky-50 to-white">
      <header className="mx-auto flex max-w-md items-center gap-3 px-5 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500 text-3xl shadow-lg">
          👣
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-900">Little Steps</h1>
          <p className="font-semibold text-sky-600">
            {current.emoji} {current.label}
          </p>
        </div>
      </header>

      {tab === 'medicines' && <Medicines />}
      {tab === 'appointments' && <Appointments />}
      {tab === 'account' && <Account email={session.user.email} />}

      <nav className="fixed inset-x-0 bottom-0 border-t border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2 p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold ${
                tab === t.id ? 'bg-sky-500 text-white shadow' : 'text-sky-400'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
