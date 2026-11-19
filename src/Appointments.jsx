import { useState } from 'react'
import { visitsOn, nextVisit, startOfWeek, fmtTime, atTime } from './schedule'

const STRIPE = { teal: 'border-teal-500', indigo: 'border-indigo-500' }
const DOT = { teal: 'bg-teal-500', indigo: 'bg-indigo-500' }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function sameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

export default function Appointments() {
  const now = new Date()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState(now)

  const monday = startOfWeek(now)
  monday.setDate(monday.getDate() + weekOffset * 7)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const next = nextVisit(now)
  const todays = visitsOn(now)
  const selectedVisits = visitsOn(selected)

  return (
    <div className="space-y-5">
      {/* Today */}
      <div className="rounded-2xl bg-white p-5 shadow">
        <p className="text-sm font-semibold uppercase text-slate-500">Today</p>
        {todays.length === 0 ? (
          <p className="mt-1 text-xl text-slate-700">No appointment today 🎉</p>
        ) : (
          todays.map((v) => {
            const over = atTime(now, v.time) < now
            return (
              <p key={v.doctor} className="mt-1 text-xl font-semibold text-slate-800">
                {v.doctor} · {v.hospital} · {fmtTime(v.time)}
                {over && <span className="ml-2 text-base font-normal text-slate-500">(time has passed)</span>}
              </p>
            )
          })
        )}
      </div>

      {/* Next up */}
      {next && (
        <div className="rounded-2xl bg-blue-600 p-5 text-white shadow">
          <p className="text-sm font-semibold uppercase opacity-80">Next up</p>
          <p className="mt-1 text-2xl font-bold">{next.doctor}</p>
          <p className="opacity-90">
            {next.hospital} ·{' '}
            {next.at.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'short' })} ·{' '}
            {fmtTime(next.time)}
          </p>
        </div>
      )}

      {/* Week strip */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="rounded-xl bg-slate-200 px-4 py-2 text-lg">◀</button>
          <p className="font-semibold text-slate-700">
            {week[0].toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} –{' '}
            {week[6].toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
          </p>
          <button onClick={() => setWeekOffset(weekOffset + 1)} className="rounded-xl bg-slate-200 px-4 py-2 text-lg">▶</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {week.map((d, i) => {
            const isSel = sameDay(d, selected)
            return (
              <button
                key={i}
                onClick={() => setSelected(d)}
                className={`rounded-xl p-2 text-center ${isSel ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'} ${sameDay(d, now) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="text-xs">{DAYS[i]}</div>
                <div className="text-lg font-semibold">{d.getDate()}</div>
                <div className="mt-1 flex h-2 justify-center gap-1">
                  {visitsOn(d).map((v) => (
                    <span key={v.doctor} className={`h-2 w-2 rounded-full ${DOT[v.color]}`} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day */}
      <div className="space-y-3">
        {selectedVisits.length === 0 ? (
          <p className="text-slate-500">No appointments on this day.</p>
        ) : (
          selectedVisits.map((v) => (
            <div key={v.doctor} className={`rounded-2xl border-l-8 bg-white p-4 shadow ${STRIPE[v.color]}`}>
              <p className="text-lg font-bold text-slate-800">{v.doctor}</p>
              <p className="text-slate-600">{v.hospital}</p>
              <p className="text-slate-600">{fmtTime(v.time)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
