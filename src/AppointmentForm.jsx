import { useState } from 'react'

const empty = { date: '', time: '', hospital: '', doctor: '', note: '' }

const input =
  'mt-1 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-lg'

export default function AppointmentForm({ onSave, onCancel }) {
  const [form, setForm] = useState(empty)
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  function submit(e) {
    e.preventDefault()
    if (!form.date || !form.hospital.trim()) return
    onSave({ ...form, hospital: form.hospital.trim(), doctor: form.doctor.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 shadow">
      <h2 className="text-xl font-semibold text-teal-800">New appointment</h2>

      <label className="block text-teal-900">
        Day
        <input type="date" value={form.date} onChange={set('date')} className={input} required />
      </label>

      <label className="block text-teal-900">
        Time (optional)
        <input type="time" value={form.time} onChange={set('time')} className={input} />
      </label>

      <label className="block text-teal-900">
        Hospital
        <input value={form.hospital} onChange={set('hospital')} className={input} required />
      </label>

      <label className="block text-teal-900">
        Doctor (optional)
        <input value={form.doctor} onChange={set('doctor')} className={input} />
      </label>

      <label className="block text-teal-900">
        Note (optional)
        <textarea value={form.note} onChange={set('note')} rows={3} className={input} />
      </label>

      <button type="submit" className="w-full rounded-2xl bg-teal-700 py-4 text-lg font-semibold text-white">
        Save
      </button>
      <button type="button" onClick={onCancel} className="w-full rounded-2xl py-3 text-lg text-teal-700">
        Cancel
      </button>
    </form>
  )
}
