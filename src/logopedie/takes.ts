// Recordings from the speech-therapy module, kept only on this device (IndexedDB)
// so a parent can listen later and hear progress over the weeks.
import type { ActivityId, SoundId } from './data'

export interface Take {
  id: string
  sound: SoundId
  activity: ActivityId
  /** What Tudor was asked to say ("rață", "RA", "rrrr"). */
  label: string
  /** Milliseconds since epoch. */
  at: number
  audio: Blob
}

const DB = 'ninja-logopedie'
const STORE = 'takes'
/** Oldest recordings are removed beyond this, so the device never fills up. */
export const MAX_TAKES = 200

let dbp: Promise<IDBDatabase> | undefined

function db(): Promise<IDBDatabase> {
  dbp ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const s = req.result.createObjectStore(STORE, { keyPath: 'id' })
      s.createIndex('at', 'at')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbp = undefined
      reject(req.error)
    }
  })
  return dbp
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function listTakes(): Promise<Take[]> {
  try {
    const d = await db()
    const req = d.transaction(STORE).objectStore(STORE).getAll()
    const all = await new Promise<Take[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as Take[])
      req.onerror = () => reject(req.error)
    })
    return all.sort((a, b) => b.at - a.at)
  } catch {
    return []
  }
}

export async function saveTake(t: Omit<Take, 'id' | 'at'>): Promise<void> {
  try {
    const d = await db()
    const at = Date.now()
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ ...t, at, id: `${at}-${Math.random().toString(36).slice(2, 8)}` })
    await done(tx)
    const all = await listTakes()
    if (all.length > MAX_TAKES) {
      const tx2 = d.transaction(STORE, 'readwrite')
      for (const old of all.slice(MAX_TAKES)) tx2.objectStore(STORE).delete(old.id)
      await done(tx2)
    }
  } catch {
    /* storage unavailable: the take was still played back */
  }
}

export async function deleteTake(id: string): Promise<void> {
  try {
    const tx = (await db()).transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    await done(tx)
  } catch {
    /* ignore */
  }
}

export async function clearTakes(): Promise<void> {
  try {
    const tx = (await db()).transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    await done(tx)
  } catch {
    /* ignore */
  }
}
