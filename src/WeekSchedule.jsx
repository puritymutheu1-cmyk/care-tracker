import { useEffect, useState } from 'react'
import { loadAll, addItem, removeItem } from './storage'
import AppointmentForm from './AppointmentForm'

const COLORS = [
  { bar: 'bg-sky-400', chip: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { bar: 'bg-amber-400', chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-400' },
  { bar: 'bg-violet-400', chip: 'bg-violet-100 text-violet-800', dot: 'bg-violet-400' },
  { bar: 'bg-emerald-400', chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-400' },
  { bar: 'bg-rose-400', chip: 'bg-rose-100 text-rose-800', dot: 'bg-rose-400' },
]

const parse = (s) => new Date(s + 'T00:00')
const fmt = (d) => d.toLocaleDateString('en-CA')
const todayStr = () => fmt(new Date())
const addDays = (s, n) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return fmt(d)
}
const weekStart = (s) => addDays(s, -((parse(s).getDay() + 6) % 7))

const pretty = (t) => {
  if (!t) return 'Any time'
  const [h, m] = t.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const emojiFor = (a) => (/physio/i.test(`${a.doctor} ${a.note}`) ? '🤸' : '🩺')
const keyOf = (a) => a.doctor || a.hospital

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState(todayStr())

  const refresh = async () => setAppointments(await loadAll('appointments'))

  useEffect(() => {
    refresh()
  }, [])

  async function handleAdd(data) {
    await addItem('appointments', data)
    await refresh()
    setSelected(data.date)
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
  const doctors = [...new Set(appointments.map(keyOf))].sort()
  const colorOf = (a) => COLORS[doctors.indexOf(keyOf(a)) % COLORS.length]

  const now = new Date()
  const nowKey = `${fmt(now)} ${now.toTimeString().slice(0, 5)}`
  const next = sorted.find((a) => `${a.date} ${a.time || '23:59'}` >= nowKey)
  const daysAway = next ? Math.round((parse(next.date) - parse(todayStr())) / 86400000) : 0
  const nextLabel = daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`

  const start = weekStart(selected)
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const onDay = (d) => sorted.filter((a) => a.date === d)
  const dayList = onDay(selected)

  if (adding) {
    return (
      <main className="mx-auto max-w-md p-5 pb-28">
        <AppointmentForm defaultDate={selected} onSave={handleAdd} onCancel={() => setAdding(false)} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md space-y-5 p-5 pb-28">
      {next ? (
        <section className="rounded-3xl bg-linear-to-br from-sky-500 to-sky-600 p-5 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-100">
            Next up · {nextLabel} ·{' '}
            {parse(next.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <p className="mt-1 text-3xl font-extrabold">{pretty(next.time)}</p>
          <p className="mt-1 font-semibold">
            {emojiFor(next)} {next.doctor || 'Appointment'}
          </p>
          <p className="text-sky-100">📍 {next.hospital}</p>
        </section>
      ) : (
        <p className="rounded-3xl bg-white ring-1 ring-sky-100 p-5 text-center text-sky-700">
          No upcoming appointments. Tap a day below and add one 🌤️
        </p>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-sky-900">
            {parse(selected).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(addDays(selected, -7))}
              className="rounded-xl bg-white px-3 py-2 text-sky-700 ring-1 ring-sky-100"
            >
              ◀
            </button>
            <button
              onClick={() => setSelected(todayStr())}
              className="rounded-xl bg-white px-3 py-2 font-semibold text-sky-700 ring-1 ring-sky-100"
            >
              Today
            </button>
            <button
              onClick={() => setSelected(addDays(selected, 7))}
              className="rounded-xl bg-white px-3 py-2 text-sky-700 ring-1 ring-sky-100"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d) => {
            const isSel = d === selected
            const isToday = d === todayStr()
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={`flex flex-col items-center rounded-2xl py-2 ${
                  isSel
                    ? 'bg-sky-500 text-white shadow-md'
                    : isToday
                      ? 'bg-white text-sky-800 ring-2 ring-sky-400'
                      : 'bg-white text-sky-800 ring-1 ring-sky-100'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase">
                  {parse(d).toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
                <span className="text-lg font-extrabold">{parse(d).getDate()}</span>
                <span className="mt-1 flex h-2 gap-0.5">
                  {onDay(d)
                    .slice(0, 3)
                    .map((a) => (
                      <span
                        key={a.id}
                        className={`h-2 w-2 rounded-full ${isSel ? 'bg-white' : colorOf(a).dot}`}
                      />
                    ))}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-sky-800">
          {parse(selected).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>

        {dayList.length === 0 ? (
          <p className="rounded-3xl bg-white ring-1 ring-sky-100 p-5 text-center text-sky-700">
            Nothing on this day 🌤️
          </p>
        ) : (
          <ul className="space-y-3">
            {dayList.map((a) => {
              const c = colorOf(a)
              return (
                <li key={a.id} className="flex overflow-hidden rounded-3xl bg-white shadow ring-1 ring-sky-100">
                  <div className={`w-2 ${c.bar}`} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xl font-extrabold text-sky-900">{pretty(a.time)}</p>
                        <p className="font-semibold text-sky-800">
                          {emojiFor(a)} {a.doctor || 'Appointment'}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-sm text-red-500">
                        Delete
                      </button>
                    </div>
                    <p className="mt-1 text-sky-700">📍 {a.hospital}</p>
                    {a.note && (
                      <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${c.chip}`}>
                        {a.note}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <button
          onClick={() => setAdding(true)}
          className="mt-4 w-full rounded-2xl bg-sky-500 py-5 text-lg font-semibold text-white"
        >
          📅 Add appointment
        </button>
      </section>
    </main>
  )
}
