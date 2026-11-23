import { describe, expect, it } from 'vitest'
import { BOSS_BONUS, xpFor } from './gamify'

describe('xpFor', () => {
  it('multiplies the base by the stars earned', () => {
    expect(xpFor(1, 2).gained).toBe(3)
    expect(xpFor(2, 2).gained).toBe(8)
    expect(xpFor(3, 2).gained).toBe(15)
    expect(xpFor(3, 2).multiplier).toBe(3)
  })

  it('adds the boss bonus before multiplying', () => {
    expect(xpFor(3, 1, { defeated: true }).gained).toBe((3 + 1 + BOSS_BONUS) * 3)
  })

  it('gives just 1 star for a boss that got away', () => {
    expect(xpFor(0, 4, { defeated: false })).toEqual({ base: 1, multiplier: 1, gained: 1 })
  })
})
