export const SCHEDULE = [
  { weekdays: [1, 3, 5], doctor: 'Dr. Felix', hospital: "Gertrude's Hospital", time: '08:30', color: 'teal' },
  { weekdays: [2, 4], doctor: 'Dr. Nyota', hospital: 'Makadara Hospital', time: '07:30', color: 'indigo' },
]

export function visitsOn(date) {
  return SCHEDULE.filter((s) => s.weekdays.includes(date.getDay()))
}

export function atTime(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

export function nextVisit(now = new Date()) {
  for (let i = 0; i < 8; i++) {
    const day = new Date(now)
    day.setDate(now.getDate() + i)
    for (const v of visitsOn(day)) {
      const at = atTime(day, v.time)
      if (at > now) return { ...v, at }
    }
  }
  return null
}

export function startOfWeek(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
