// Children on this device. Each child has its own progress (map, stars, wardrobe, friend);
// the list and the active child live in localStorage next to the progress saves.
import { freshProgress, loadProgress, parseProgress, progressKey, saveProgress, type Progress } from './progress'

export interface ProfileMeta {
  id: string
  name: string
}

export interface ProfileStore {
  active: string
  list: ProfileMeta[]
  /** When any child's progress last changed on this device (ISO), to compare with the account copy. */
  updatedAt: string
}

/** Everything an account keeps: every child with its progress. */
export interface Family {
  active: string
  profiles: (ProfileMeta & { progress: Progress })[]
  savedAt: string
}

export const MAX_CHILDREN = 4
const STORE = 'tudoo-profiles'

export function loadStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(STORE)
    if (raw) {
      const s = JSON.parse(raw) as ProfileStore
      if (Array.isArray(s.list) && s.list.length && s.list.some((p) => p.id === s.active)) return s
    }
  } catch {
    /* fall through to the default */
  }
  // Before profiles existed there was one child, stored under the old key.
  return { active: 'p1', list: [{ id: 'p1', name: loadProgress('p1').settings.childName }], updatedAt: '' }
}

export function saveStore(s: ProfileStore) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s))
  } catch {
    /* storage unavailable */
  }
}

/** Adds a new child with empty progress and makes it active. */
export function addChild(s: ProfileStore): ProfileStore {
  let n = s.list.length + 1
  while (s.list.some((p) => p.id === `p${n}`)) n++
  const id = `p${n}`
  saveProgress(freshProgress(), id)
  return { ...s, active: id, list: [...s.list, { id, name: '' }], updatedAt: new Date().toISOString() }
}

export function removeChild(s: ProfileStore, id: string): ProfileStore {
  if (s.list.length <= 1) return s
  try {
    localStorage.removeItem(progressKey(id))
  } catch {
    /* ignore */
  }
  const list = s.list.filter((p) => p.id !== id)
  return { ...s, list, active: s.active === id ? list[0].id : s.active, updatedAt: new Date().toISOString() }
}

/** The whole family as saved in the account; `current` is the active child's live progress. */
export function familyFrom(s: ProfileStore, current: Progress): Family {
  return {
    active: s.active,
    savedAt: s.updatedAt || new Date().toISOString(),
    profiles: s.list.map((p) => {
      const progress = p.id === s.active ? current : loadProgress(p.id)
      return { id: p.id, name: progress.settings.childName || p.name, progress }
    }),
  }
}

/** Replaces the children on this device with the ones from the account. */
export function applyFamily(f: Family): ProfileStore | undefined {
  const profiles = (f.profiles ?? [])
    .map((p) => ({ id: String(p.id), name: String(p.name ?? ''), progress: parseProgress(p.progress) }))
    .filter((p): p is ProfileMeta & { progress: Progress } => !!p.progress && /^p\d+$/.test(p.id))
    .slice(0, MAX_CHILDREN)
  if (!profiles.length) return undefined
  for (const p of profiles) saveProgress(p.progress, p.id)
  const active = profiles.some((p) => p.id === f.active) ? f.active : profiles[0].id
  const store = { active, list: profiles.map(({ id, name }) => ({ id, name })), updatedAt: f.savedAt }
  saveStore(store)
  return store
}
