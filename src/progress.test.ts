import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, UNITS } from './content'
import { applyFamily, familyFrom, loadStore, removeChild, addChild, saveStore } from './profiles'
import {
  currentLessonIndex,
  DEFAULT_PROGRESS,
  exportProgress,
  freshProgress,
  importProgress,
  loadProgress,
  saveProgress,
} from './progress'

describe('progress file', () => {
  it('round-trips through export and import', () => {
    const p = { ...structuredClone(DEFAULT_PROGRESS), stars: { 'colors-1': 3 }, mascot: 'pip' as const, wallet: 7, onboarded: true }
    expect(importProgress(exportProgress(p))).toEqual(p)
  })

  it('fills in fields missing from older saves', () => {
    const text = JSON.stringify({ kind: 'tudoo-progress', version: 1, progress: { stars: { a: 2, b: 1 } } })
    const p = importProgress(text)!
    expect(p.wallet).toBe(3)
    expect(p.settings.childName).toBe('Tudor')
    expect(p.boss).toEqual({})
    expect(p.onboarded).toBe(true)
    expect(p.settings.sfx).toBe(true)
    expect(p.settings.skipUnits).toBe(0)
  })

  it('rejects files that are not Tudoo! progress', () => {
    expect(importProgress('not json')).toBeUndefined()
    expect(importProgress(JSON.stringify({ stars: {} }))).toBeUndefined()
    expect(importProgress(JSON.stringify({ kind: 'tudoo-progress', progress: { stars: null } }))).toBeUndefined()
  })
})

describe('starting level', () => {
  it('skips the first units of the map without giving stars', () => {
    const p = freshProgress('Ana')
    expect(currentLessonIndex(p)).toBe(0)
    p.settings.skipUnits = 1
    expect(currentLessonIndex(p)).toBe(UNITS[0].lessons.length)
    expect(ALL_LESSONS[currentLessonIndex(p)].unit.id).toBe(UNITS[1].id)
    expect(Object.keys(p.stars)).toEqual([])
  })
})

describe('children on one device', () => {
  const mem = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  } as Storage

  it('starts with the existing save as the first child and adds new ones', () => {
    mem.clear()
    saveProgress({ ...structuredClone(DEFAULT_PROGRESS), earned: 9 })
    const s = loadStore()
    expect(s.list.map((c) => c.id)).toEqual(['p1'])
    expect(loadProgress('p1').earned).toBe(9)
    const s2 = addChild(s)
    expect(s2.active).toBe('p2')
    expect(loadProgress('p2').onboarded).toBe(false)
    expect(removeChild(s2, 'p2').list.map((c) => c.id)).toEqual(['p1'])
  })

  it('moves the whole family through an account copy', () => {
    mem.clear()
    const s = addChild(loadStore())
    saveStore(s)
    const kid = { ...freshProgress('Mara'), onboarded: true, earned: 4 }
    const fam = JSON.parse(JSON.stringify(familyFrom(s, kid)))
    mem.clear()
    const back = applyFamily(fam)!
    expect(back.active).toBe('p2')
    expect(back.list.map((c) => c.name)).toEqual(['', 'Mara'])
    expect(loadProgress('p2').earned).toBe(4)
    expect(applyFamily({ active: 'x', savedAt: '', profiles: [{ id: '../evil', name: 'x', progress: kid }] })).toBeUndefined()
  })
})
