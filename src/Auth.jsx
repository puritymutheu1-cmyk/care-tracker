import { useState } from 'react'
import { supabase } from './supabase'

const input = 'mt-1 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-lg'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const creds = { email: email.trim(), password }
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        ...creds,
        options: { emailRedirectTo: window.location.origin },
      })
      setMessage(
        error
          ? error.message
          : 'Almost there! We sent a link to your email. Open it to finish, then come back and sign in.'
      )
    } else {
      const { error } = await supabase.auth.signInWithPassword(creds)
      if (error) setMessage(error.message)
    }
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-200 via-sky-50 to-white">
      <div className="mx-auto max-w-md p-5 pt-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500 text-3xl shadow-lg">
            👣
          </div>
          <h1 className="text-2xl font-extrabold text-sky-900">Little Steps</h1>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white ring-1 ring-sky-100 p-5 shadow">
          <h2 className="text-xl font-semibold text-sky-800">
            {mode === 'signin' ? 'Sign in' : 'Create your account'}
          </h2>

          <label className="block text-sky-900">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={input}
            />
          </label>

          <label className="block text-sky-900">
            Password (at least 6 characters)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              required
              className={input}
            />
          </label>

          {message && <p className="rounded-xl bg-sky-100 p-3 text-sky-900">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-sky-500 py-4 text-lg font-semibold text-white disabled:opacity-60"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setMessage('')
            }}
            className="w-full py-2 text-sky-700"
          >
            {mode === 'signin' ? 'First time? Create an account' : 'Already have an account? Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-sky-700">
          Only family members who have been added can see the information.
        </p>
      </div>
    </div>
  )
}
