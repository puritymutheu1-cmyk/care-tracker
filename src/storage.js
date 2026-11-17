// All saving goes through this file. Today it uses the phone's storage;
// later we swap the inside for Supabase and the screens stay the same.
const PREFIX = 'littlesteps:'

export async function loadAll(name) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name)) ?? []
  } catch {
    return []
  }
}

async function saveAll(name, items) {
  localStorage.setItem(PREFIX + name, JSON.stringify(items))
}

export async function addItem(name, item) {
  const items = await loadAll(name)
  const saved = { ...item, id: crypto.randomUUID() }
  await saveAll(name, [...items, saved])
  return saved
}

export async function removeItem(name, id) {
  const items = await loadAll(name)
  await saveAll(name, items.filter((i) => i.id !== id))
}

export async function updateItem(name, id, changes) {
  const items = await loadAll(name)
  await saveAll(name, items.map((i) => (i.id === id ? { ...i, ...changes } : i)))
}

export async function exportAll() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(PREFIX)) {
      data[key.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(key))
    }
  }
  return { app: 'little-steps', version: 1, exportedAt: new Date().toISOString(), data }
}

export async function importAll(backup) {
  if (backup?.app !== 'little-steps' || typeof backup.data !== 'object' || !backup.data) {
    throw new Error('This is not a Little Steps backup file.')
  }
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(PREFIX)) keys.push(key)
  }
  keys.forEach((k) => localStorage.removeItem(k))
  for (const [name, items] of Object.entries(backup.data)) {
    if (Array.isArray(items)) await saveAll(name, items)
  }
}
