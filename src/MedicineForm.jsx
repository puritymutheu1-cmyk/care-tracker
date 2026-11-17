import { useState } from 'react'
import { SLOTS } from './slots'

const input =
  'mt-1 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-lg'

export default function MedicineForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    dose: initial?.dose ?? '',
    times: initial?.times ?? [],
    stock: initial?.stock ?? '',
  })
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const toggleTime = (id) =>
    setForm((f) => ({
      ...f,
      times: f.times.includes(id) ? f.times.filter((t) => t !== id) : [...f.times, id],
    }))

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Please type the medicine name.')
    if (form.times.length === 0) return setError('Choose at least one time of day.')
    onSave({
      name: form.name.trim(),
      dose: form.dose.trim(),
      times: form.times,
      stock: form.stock === '' ? '' : Number(form.stock),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white ring-1 ring-sky-100 p-5 shadow">
      <h2 className="text-xl font-semibold text-sky-800">
        {initial ? 'Edit medicine' : 'New medicine'}
      </h2>

      <label className="block text-sky-900">
        Medicine name
        <input value={form.name} onChange={set('name')} className={input} />
      </label>

      <label className="block text-sky-900">
        Dose (optional, e.g. 5ml or 1 tablet)
        <input value={form.dose} onChange={set('dose')} className={input} />
      </label>

      <div>
        <p className="text-sky-900">When is it given?</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {SLOTS.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => toggleTime(s.id)}
              className={`rounded-xl border py-4 text-lg font-semibold ${
                form.times.includes(s.id)
                  ? 'border-sky-500 bg-sky-500 text-white'
                  : 'border-sky-200 bg-white text-sky-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sky-900">
        How many doses are left? (optional)
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={form.stock}
          onChange={set('stock')}
          className={input}
        />
      </label>

      {error && <p className="text-red-600">{error}</p>}

      <button type="submit" className="w-full rounded-2xl bg-sky-500 py-4 text-lg font-semibold text-white">
        Save
      </button>
      <button type="button" onClick={onCancel} className="w-full rounded-2xl py-3 text-lg text-sky-700">
        Cancel
      </button>
    </form>
  )
}
