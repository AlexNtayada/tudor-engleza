import { describe, expect, it } from 'vitest'
import { UNITS } from '../content'
import { BIOMES } from './biomes'
import { crossing, layoutUnit } from './geometry'

describe('biome map', () => {
  it('gives every unit its own biome', () => {
    for (const u of UNITS) expect(BIOMES[u.id]).toBeDefined()
    expect(new Set(UNITS.map((u) => BIOMES[u.id].name)).size).toBe(UNITS.length)
  })

  it('keeps every stone on screen, from phone to desktop', () => {
    for (const width of [300, 390, 800, 1200])
      UNITS.forEach((u, i) => {
        const l = layoutUnit(width, u.lessons.length, i, true)
        for (const n of l.nodes) {
          expect(n.x).toBeGreaterThan(60)
          expect(n.x).toBeLessThan(width - 60)
        }
        expect(l.height).toBeGreaterThan(l.nodes[l.nodes.length - 1].y)
      })
  })

  it('crosses the river and the cliff between two stones', () => {
    const l = layoutUnit(390, 5, 0, true)
    const c = crossing(l.samples, l.riverY)
    expect(c.x).toBeGreaterThan(0)
    expect(c.x).toBeLessThan(390)
  })
})
