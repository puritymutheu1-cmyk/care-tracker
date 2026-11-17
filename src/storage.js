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
