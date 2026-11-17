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
  const [editing, setEditing] = useState(null)
  const [restockId, setRestockId] = useState(null)
  const [restockAmount, setRestockAmount] = useState('')

  const refresh = async () => {
    setMedicines(await loadAll('medicines'))
    setLogs(await loadAll('doseLogs'))
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSave(data) {
    if (editing) {
      await updateItem('medicines', editing.id, data)
    } else {
      await addItem('medicines', data)
    }
    await refresh()
    setAdding(false)
    setEditing(null)
  }

  async function handleDelete(m) {
    if (!confirm(`Delete ${m.name}?`)) return
    await removeItem('medicines', m.id)
    await refresh()
  }

  async function handleRestock(m) {
    const amount = Number(restockAmount)
    if (!amount || amount < 1) return
    await updateItem('medicines', m.id, { stock: (hasStock(m) ? m.stock : 0) + amount })
    setRestockId(null)
    setRestockAmount('')
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

  const showForm = adding || editing

  return (
    <main className="mx-auto max-w-md p-5 pb-28">
      {showForm ? (
        <MedicineForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => {
            setAdding(false)
            setEditing(null)
          }}
        />
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
                      <p className="text-lg font-semibold text-sky-900">{m.name}</p>
                      <p className="text-sm text-sky-700">
                        {m.dose && `${m.dose} · `}
                        {m.times.map((t) => SLOTS.find((s) => s.id === t)?.label).join(', ')}
                      </p>

                      {info && (
                        <p className={`mt-2 rounded-lg px-3 py-2 text-sm font-medium ${info.cls}`}>
                          {info.text}
                        </p>
                      )}

                      {restockId === m.id ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="number"
                            min="1"
                            inputMode="numeric"
                            placeholder="How many doses?"
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(e.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-sky-200 px-4 py-3 text-lg"
                          />
                          <button
                            onClick={() => handleRestock(m)}
                            className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white"
                          >
                            Add
                          </button>
                          <button onClick={() => setRestockId(null)} className="px-2 text-sky-600">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setRestockId(m.id)
                              setRestockAmount('')
                            }}
                            className="flex-1 rounded-xl bg-sky-100 py-3 font-semibold text-sky-800"
                          >
                            ➕ Add stock
                          </button>
                          <button
                            onClick={() => setEditing(m)}
                            className="flex-1 rounded-xl bg-sky-100 py-3 font-semibold text-sky-800"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="rounded-xl px-3 py-3 text-sm text-red-600"
                          >
                            Delete
                          </button>
                        </div>
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
