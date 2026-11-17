import { useRef, useState } from 'react'
import { exportAll, importAll } from './storage'

const META = 'littlesteps-meta:lastBackup'

const readLast = () => {
  try {
    return localStorage.getItem(META)
  } catch {
    return null
  }
}

const canShareFiles = (() => {
  try {
    const test = new File(['{}'], 'a.json', { type: 'application/json' })
    return !!navigator.canShare?.({ files: [test] })
  } catch {
    return false
  }
})()

async function makeFile() {
  const backup = await exportAll()
  const name = `little-steps-backup-${new Date().toLocaleDateString('en-CA')}.json`
  return new File([JSON.stringify(backup, null, 2)], name, { type: 'application/json' })
}

const card = 'rounded-3xl bg-white ring-1 ring-sky-100 p-5 shadow'

export default function Backup() {
  const [message, setMessage] = useState('')
  const [last, setLast] = useState(readLast())
  const fileInput = useRef(null)

  function markDone() {
    const now = new Date().toISOString()
    try {
      localStorage.setItem(META, now)
    } catch {
      /* ignore */
    }
    setLast(now)
  }

  async function save() {
    const file = await makeFile()
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    markDone()
    setMessage('Backup saved. Look in your Downloads folder.')
  }

  async function share() {
    const file = await makeFile()
    try {
      await navigator.share({ files: [file], title: 'Little Steps backup' })
      markDone()
      setMessage('Backup shared.')
    } catch {
      /* cancelled */
    }
  }

  async function restore(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const backup = JSON.parse(await file.text())
      if (!confirm('This will replace everything now in the app with the backup. Continue?')) return
      await importAll(backup)
      setMessage('Restored. Reloading...')
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setMessage(
        err instanceof SyntaxError ? 'That file is not a valid backup.' : err.message || 'Could not read that file.'
      )
    }
  }

  const old = !last || Date.now() - new Date(last).getTime() > 7 * 24 * 60 * 60 * 1000
  const lastText = last
    ? new Date(last).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Never'

  return (
    <main className="mx-auto max-w-md space-y-4 p-5 pb-28">
      <section className={card}>
        <p className="text-sky-900">
          Everything in this app is saved on this phone only. Save a backup now and then, so nothing is
          lost if the phone is lost or reset.
        </p>
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
            old ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
          }`}
        >
          Last backup: {lastText}
        </p>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-semibold text-sky-800">Save a backup</h2>
        <button onClick={save} className="w-full rounded-2xl bg-sky-500 py-4 text-lg font-semibold text-white">
          💾 Save to phone
        </button>
        {canShareFiles && (
          <button
            onClick={share}
            className="w-full rounded-2xl bg-sky-100 py-4 text-lg font-semibold text-sky-800"
          >
            📤 Share (Drive, email...)
          </button>
        )}
        <p className="text-sm text-sky-700">
          The file has private health information. Only keep it somewhere safe, and only send it to
          people you trust.
        </p>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-semibold text-sky-800">Restore a backup</h2>
        <button
          onClick={() => fileInput.current.click()}
          className="w-full rounded-2xl bg-sky-100 py-4 text-lg font-semibold text-sky-800"
        >
          📥 Choose a backup file
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          onChange={restore}
          className="hidden"
        />
        <p className="text-sm text-sky-700">This replaces what is in the app now with the file's contents.</p>
      </section>

      {message && <p className="rounded-2xl bg-sky-100 p-4 text-center text-sky-900">{message}</p>}
    </main>
  )
}
