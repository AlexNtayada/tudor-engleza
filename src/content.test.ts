import { describe, expect, it } from 'vitest'
import { UNITS } from './content'
import { BOSSES } from './components/Boss'
import { itemById } from './gamify'

describe('content', () => {
  it('has 20 worlds of 10 words and 5 lessons each', () => {
    expect(UNITS).toHaveLength(20)
    for (const u of UNITS) {
      expect(u.words).toHaveLength(10)
      expect(u.lessons).toHaveLength(5)
    }
  })

  it('never reuses a word id or a sticker, so albums and lessons stay apart', () => {
    const words = UNITS.flatMap((u) => u.words.map((w) => w.id))
    expect(new Set(words).size).toBe(words.length)
    const stickers = UNITS.flatMap((u) => u.lessons.map((l) => l.sticker))
    expect(new Set(stickers).size).toBe(stickers.length)
  })

  it('gives every world its own boss and its own album gift', () => {
    for (const u of UNITS) {
      expect(BOSSES[u.id]).toBeDefined()
      expect(itemById(u.setReward)?.setOf).toBe(u.id)
    }
    expect(new Set(UNITS.map((u) => BOSSES[u.id].name)).size).toBe(UNITS.length)
  })
})
