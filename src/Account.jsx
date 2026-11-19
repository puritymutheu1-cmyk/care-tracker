import { exportAll } from './storage'
import { supabase } from './supabase'

const card = 'rounded-3xl bg-white ring-1 ring-sky-100 p-5 shadow'

export default function Account({ email }) {
  async function save() {
    const backup = await exportAll()
    const name = `little-steps-copy-${new Date().toLocaleDateString('en-CA')}.json`
    const file = new File([JSON.stringify(backup, null, 2)], name, { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5 pb-28">
      <section className={card}>
        <p className="text-sky-700">Signed in as</p>
        <p className="break-all text-lg font-semibold text-sky-900">{email}</p>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-semibold text-sky-800">Keep a copy</h2>
        <p className="text-sky-900">
          Everything is saved online for the family. You can also save a copy to this phone.
        </p>
        <button onClick={save} className="w-full rounded-2xl bg-sky-500 py-4 text-lg font-semibold text-white">
          💾 Save a copy to phone
        </button>
        <p className="text-sm text-sky-700">
          The file has private health information. Keep it somewhere safe.
        </p>
      </section>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full rounded-2xl bg-sky-100 py-4 text-lg font-semibold text-sky-800"
      >
        Sign out
      </button>
    </main>
  )
}
