import { supabase } from './supabase'

const TABLES = { medicines: 'medicines', appointments: 'appointments', doseLogs: 'dose_logs' }
const CACHE = 'littlesteps-cache:'

// app shape <-> database shape
function fromDb(name, row) {
  if (name === 'medicines') return { ...row, stock: row.stock ?? '' }
  if (name === 'doseLogs') {
    const { medicine_id, given_at, given_by, ...rest } = row
    return { ...rest, medicineId: medicine_id, givenAt: given_at, givenBy: given_by }
  }
  return row
}

function toDb(name, item) {
  if (name === 'medicines') {
    if (!('stock' in item)) return item
    return { ...item, stock: item.stock === '' || item.stock == null ? null : Number(item.stock) }
  }
  if (name === 'doseLogs') {
    const { medicineId, givenAt, ...rest } = item
    return { ...rest, medicine_id: medicineId, ...(givenAt ? { given_at: givenAt } : {}) }
  }
  return item
}

function fail(error) {
  console.error(error)
  alert('Could not save. Please check your internet and try again.')
  throw error
}

export async function loadAll(name) {
  let query = supabase.from(TABLES[name]).select('*')
  if (name !== 'doseLogs') query = query.order('created_at', { ascending: true })
  const { data, error } = await query
  if (error) {
    // offline or a problem: show the last copy this phone saw
    try {
      return JSON.parse(localStorage.getItem(CACHE + name)) ?? []
    } catch {
      return []
    }
  }
  const items = data.map((row) => fromDb(name, row))
  try {
    localStorage.setItem(CACHE + name, JSON.stringify(items))
  } catch {
    /* ignore */
  }
  return items
}

export async function addItem(name, item) {
  const row = toDb(name, item)
  if (name === 'doseLogs') {
    const { data: auth } = await supabase.auth.getSession()
    row.given_by = auth.session?.user?.email ?? null
  }
  const { data, error } = await supabase.from(TABLES[name]).insert(row).select().single()
  if (error) {
    if (error.code === '23505') return null // someone already marked this dose
    fail(error)
  }
  return fromDb(name, data)
}

export async function removeItem(name, id) {
  const { error } = await supabase.from(TABLES[name]).delete().eq('id', id)
  if (error) fail(error)
}

export async function updateItem(name, id, changes) {
  const { error } = await supabase.from(TABLES[name]).update(toDb(name, changes)).eq('id', id)
  if (error) fail(error)
}

export async function exportAll() {
  const data = {}
  for (const name of Object.keys(TABLES)) data[name] = await loadAll(name)
  return { app: 'little-steps', version: 2, exportedAt: new Date().toISOString(), data }
}
