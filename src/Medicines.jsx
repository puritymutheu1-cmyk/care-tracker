import { useEffect, useState } from 'react'
import { loadAll, addItem, removeItem, updateItem } from './storage'
import MedicineForm from './MedicineForm'
import { SLOTS } from './slots'

const todayStr = () => new Date().toLocaleDateString('en-CA')
const hasStock = (m) => m.stock !== '' && m.stock != null

function stockInfo(m) {
  if (!hasStock(m)) return null
  const days = Math.floor(m.stock / (m.times.length || 1))
  if (m.stock <= 0) return { text: 'Out of stock', cls: 'bg-red-100 text-red-700' }
  if (days <= 5)
    return {
      text: `About ${days} day${days === 1 ? '' : 's'} left. Time to buy more`,
      cls: 'bg-amber-100 text-amber-800',
    }
  return { text: `${m.stock} doses left (about ${days} days)`, cls: 'bg-sky-100 text-sky-800' }
}

export default function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [logs, setLogs] = useState([])
  const [adding, setAdding] = useState(false)

  const refresh = async () => {
    setMedicines(await loadAll('medicines'))
    setLogs(await loadAll('doseLogs'))
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleAdd(data) {
    await addItem('medicines', data)
    await refresh()
    setAdding(false)
  }

  async function handleDelete(m) {
    if (!confirm(`Delete ${m.name}?`)) return
    await removeItem('medicines', m.id)
    await refresh()
  }

  const findLog = (m, slot) =>
    logs.find((l) => l.medicineId === m.id && l.date === todayStr() && l.slot === slot)

  async function toggleDose(m, slot) {
    const existing = findLog(m, slot)
    if (existing) {
      await removeItem('doseLogs', existing.id)
      if (hasStock(m)) await updateItem('medicines', m.id, { stock: m.stock + 1 })
    } else {
      await addItem('doseLogs', {
        medicineId: m.id,
        date: todayStr(),
        slot,
        givenAt: new Date().toISOString(),
      })
      if (hasStock(m)) await updateItem('medicines', m.id, { stock: Math.max(0, m.stock - 1) })
    }
    await refresh()
  }

  const rows = SLOTS.map((s) => ({
    ...s,
    meds: medicines.filter((m) => m.times.includes(s.id)),
  })).filter((s) => s.meds.length > 0)

  return (
    <main className="mx-auto max-w-md p-5 pb-28">

      {adding ? (
        <MedicineForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      ) : (
        <>
          <button
            onClick={() => setAdding(true)}
            className="mb-6 w-full rounded-2xl bg-sky-500 py-5 text-lg font-semibold text-white"
          >
            💊 Add medicine
          </button>

          {medicines.length === 0 && (
            <p className="rounded-3xl bg-white ring-1 ring-sky-100 p-5 text-center text-sky-700">
              Nothing here yet. Tap the button above to add the first medicine.
            </p>
          )}

          {rows.length > 0 && (
            <>
              <h2 className="mb-2 font-semibold text-sky-800">Today</h2>
              <div className="mb-6 space-y-4">
                {rows.map((s) => (
                  <section key={s.id}>
                    <h3 className="mb-1 text-sm uppercase tracking-wide text-sky-700">{s.label}</h3>
                    <ul className="space-y-2">
                      {s.meds.map((m) => {
                        const given = !!findLog(m, s.id)
                        return (
                          <li
                            key={m.id}
                            className="flex items-center justify-between gap-3 rounded-3xl bg-white ring-1 ring-sky-100 p-4 shadow"
                          >
                            <div>
                              <p className="text-lg font-semibold text-sky-900">{m.name}</p>
                              {m.dose && <p className="text-sm text-sky-700">{m.dose}</p>}
                            </div>
                            <button
                              onClick={() => toggleDose(m, s.id)}
                              className={`rounded-xl px-5 py-3 text-lg font-semibold ${
                                given
                                  ? 'bg-sky-500 text-white'
                                  : 'border border-sky-500 text-sky-700'
                              }`}
                            >
                              {given ? '✓ Given' : 'Mark given'}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}

          {medicines.length > 0 && (
            <>
              <h2 className="mb-2 font-semibold text-sky-800">All medicines</h2>
              <ul className="space-y-3">
                {medicines.map((m) => {
                  const info = stockInfo(m)
                  return (
                    <li key={m.id} className="rounded-3xl bg-white ring-1 ring-sky-100 p-4 shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-sky-900">{m.name}</p>
                          <p className="text-sm text-sky-700">
                            {m.dose && `${m.dose} · `}
                            {m.times.map((t) => SLOTS.find((s) => s.id === t)?.label).join(', ')}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(m)} className="px-2 py-1 text-sm text-red-600">
                          Delete
                        </button>
                      </div>
                      {info && (
                        <p className={`mt-2 rounded-lg px-3 py-2 text-sm font-medium ${info.cls}`}>
                          {info.text}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </>
      )}
    </main>
  )
}
