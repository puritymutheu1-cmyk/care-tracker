import { useEffect, useState } from 'react'
import { loadAll, addItem, removeItem } from './storage'
import AppointmentForm from './AppointmentForm'

const todayStr = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

const formatDay = (date) =>
  new Date(date + 'T00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

function Card({ a, onDelete }) {
  return (
    <li className="rounded-3xl bg-white ring-1 ring-sky-100 p-4 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-sky-800">
            {formatDay(a.date)}
            {a.time && ` · ${a.time}`}
          </p>
          <p className="text-sky-900">
            {a.hospital}
            {a.doctor && ` · ${a.doctor}`}
          </p>
          {a.note && <p className="mt-1 text-sm text-sky-700">{a.note}</p>}
        </div>
        <button onClick={() => onDelete(a.id)} className="px-2 py-1 text-sm text-red-600">
          Delete
        </button>
      </div>
    </li>
  )
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [adding, setAdding] = useState(false)

  const refresh = async () => setAppointments(await loadAll('appointments'))

  useEffect(() => {
    refresh()
  }, [])

  async function handleAdd(data) {
    await addItem('appointments', data)
    await refresh()
    setAdding(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this appointment?')) return
    await removeItem('appointments', id)
    await refresh()
  }

  const sorted = [...appointments].sort((a, b) =>
    (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))
  )
  const upcoming = sorted.filter((a) => a.date >= todayStr())
  const past = sorted.filter((a) => a.date < todayStr()).reverse()

  return (
    <main className="mx-auto max-w-md p-5 pb-28">

      {adding ? (
        <AppointmentForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      ) : (
        <>
          <button
            onClick={() => setAdding(true)}
            className="mb-6 w-full rounded-2xl bg-sky-500 py-5 text-lg font-semibold text-white"
          >
            📅 Add appointment
          </button>

          {appointments.length === 0 && (
            <p className="rounded-3xl bg-white ring-1 ring-sky-100 p-5 text-center text-sky-700">
              Nothing here yet. Tap the button above to add the first appointment.
            </p>
          )}

          {upcoming.length > 0 && (
            <>
              <h2 className="mb-2 font-semibold text-sky-800">Coming up</h2>
              <ul className="mb-6 space-y-3">
                {upcoming.map((a) => (
                  <Card key={a.id} a={a} onDelete={handleDelete} />
                ))}
              </ul>
            </>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mb-2 font-semibold text-sky-800">Past</h2>
              <ul className="space-y-3 opacity-70">
                {past.map((a) => (
                  <Card key={a.id} a={a} onDelete={handleDelete} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </main>
  )
}
