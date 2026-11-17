import { describe, expect, it } from 'vitest'
import { DEFAULT_PROGRESS, exportProgress, importProgress } from './progress'

describe('progress file', () => {
  it('round-trips through export and import', () => {
    const p = { ...structuredClone(DEFAULT_PROGRESS), stars: { 'colors-1': 3 }, mascot: 'pip' as const, wallet: 7 }
    expect(importProgress(exportProgress(p))).toEqual(p)
  })

  it('fills in fields missing from older saves', () => {
    const text = JSON.stringify({ kind: 'tudoo-progress', version: 1, progress: { stars: { a: 2, b: 1 } } })
    const p = importProgress(text)!
    expect(p.wallet).toBe(3)
    expect(p.settings.childName).toBe('Tudor')
    expect(p.boss).toEqual({})
  })

  it('rejects files that are not Tudoo! progress', () => {
    expect(importProgress('not json')).toBeUndefined()
    expect(importProgress(JSON.stringify({ stars: {} }))).toBeUndefined()
    expect(importProgress(JSON.stringify({ kind: 'tudoo-progress', progress: { stars: null } }))).toBeUndefined()
  })
})
