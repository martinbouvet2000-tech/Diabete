// Stockage local (IndexedDB) — les données ne quittent jamais l'appareil.
import { DB_NAME, DB_VERSION } from './config.js'

let dbPromise = null

function open() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id' })
        store.createIndex('ts', 'ts')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(mode, fn) {
  return open().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction('entries', mode)
        const store = t.objectStore('entries')
        const out = fn(store)
        t.oncomplete = () => resolve(out && 'result' in out ? out.result : undefined)
        t.onerror = () => reject(t.error)
      })
  )
}

export function newId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

export function addEntry(entry) {
  return tx('readwrite', (s) => s.put(entry))
}

export function deleteEntry(id) {
  return tx('readwrite', (s) => s.delete(id))
}

export function clearAll() {
  return tx('readwrite', (s) => s.clear())
}

// Toutes les entrées depuis `fromTs`, triées de la plus récente à la plus ancienne.
export async function getEntriesSince(fromTs) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction('entries', 'readonly')
    const idx = t.objectStore('entries').index('ts')
    const req = idx.getAll(IDBKeyRange.lowerBound(fromTs))
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.ts - a.ts))
    req.onerror = () => reject(req.error)
  })
}

export async function getAllEntries() {
  return getEntriesSince(0)
}

export async function importEntries(entries) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction('entries', 'readwrite')
    const s = t.objectStore('entries')
    for (const e of entries) s.put(e)
    t.oncomplete = () => resolve(entries.length)
    t.onerror = () => reject(t.error)
  })
}
