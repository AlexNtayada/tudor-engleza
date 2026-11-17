import { describe, expect, it } from 'vitest'
import { g, MASCOTS, mascot, mascotById, setActiveMascot } from './mascots'

describe('mascots', () => {
  it('has unique ids and names', () => {
    expect(new Set(MASCOTS.map((m) => m.id)).size).toBe(MASCOTS.length)
    expect(new Set(MASCOTS.map((m) => m.name)).size).toBe(MASCOTS.length)
  })
  it('falls back to Ninja for unknown or unset ids', () => {
    expect(mascotById(undefined).id).toBe('ninja')
    expect(mascotById('nope').id).toBe('ninja')
  })
  it('switches the active friend and its grammar', () => {
    setActiveMascot('pip')
    expect(mascot().name).toBe('Pip')
    expect(g('flămând', 'flămândă')).toBe('flămândă')
    setActiveMascot('bobo')
    expect(g('flămând', 'flămândă')).toBe('flămând')
    setActiveMascot(undefined)
  })
})
