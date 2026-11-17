import { useState } from 'react'
import Appointments from './Appointments'
import Medicines from './Medicines'

const tabs = [
  { id: 'medicines', emoji: '💊', label: 'Medicines' },
  { id: 'appointments', emoji: '📅', label: 'Appointments' },
]

export default function App() {
  const [tab, setTab] = useState('medicines')
  const current = tabs.find((t) => t.id === tab)

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-200 via-sky-50 to-white">
      <header className="mx-auto flex max-w-md items-center gap-3 px-5 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500 text-3xl shadow-lg">
          👣
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-900">Little Steps</h1>
          <p className="font-semibold text-sky-600">
            {current.emoji} {current.label}
          </p>
        </div>
      </header>

      {tab === 'medicines' ? <Medicines /> : <Appointments />}

      <nav className="fixed inset-x-0 bottom-0 border-t border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2 p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-2xl py-3 text-base font-bold ${
                tab === t.id ? 'bg-sky-500 text-white shadow' : 'text-sky-400'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
