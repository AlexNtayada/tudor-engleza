import { describe, expect, it } from 'vitest'
import { PACKS } from './data'
import { buildSentenceLesson, splitAtKey } from './lessons'

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

describe('sentence packs', () => {
  it('have unique ids and a key word inside every sentence', () => {
    const ids = PACKS.flatMap((p) => p.sentences.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(PACKS.map((p) => p.id)).size).toBe(PACKS.length)
    for (const p of PACKS)
      for (const s of p.sentences) {
        expect(s.text.split(' ').map((w) => w.toLowerCase())).toContain(s.key.toLowerCase())
        expect(s.scene.length).toBeGreaterThan(0)
      }
  })

  it('give every pack at least two different key words for "what is missing?"', () => {
    for (const p of PACKS) expect(new Set(p.sentences.map((s) => s.key)).size).toBeGreaterThanOrEqual(2)
  })

  it('split a sentence around its key word', () => {
    const count = PACKS.find((p) => p.id === 'count')!.sentences[0]
    expect(splitAtKey(count)).toEqual({ before: 'I see', after: 'dogs' })
  })
})

describe('buildSentenceLesson', () => {
  for (const pack of PACKS) {
    it(`builds a valid round for ${pack.id}`, () => {
      for (let seed = 1; seed < 20; seed++) {
        const steps = buildSentenceLesson(pack, seeded(seed))
        const intros = steps.filter((s) => s.type === 'intro')
        expect(intros.map((s) => s.sentence.id)).toEqual(pack.sentences.map((s) => s.id))
        expect(steps.slice(0, intros.length).every((s) => s.type === 'intro')).toBe(true)
        expect(steps.filter((s) => s.type === 'say')).toHaveLength(2)
        expect(steps.at(-1)!.type).toBe('say')
        const truths = steps.filter((s) => s.type === 'truth')
        expect(truths).toHaveLength(2)
        // one true and one not true
        expect(truths.filter((s) => s.type === 'truth' && s.said.id === s.sentence.id)).toHaveLength(1)
        for (const s of steps) {
          if (s.type === 'pick') {
            expect(s.choices.filter((c) => c.id === s.sentence.id)).toHaveLength(1)
            expect(new Set(s.choices.map((c) => c.id)).size).toBe(s.choices.length)
          }
          if (s.type === 'fill') {
            const keys = s.choices.map((c) => c.key)
            expect(keys.filter((k) => k === s.sentence.key)).toHaveLength(1)
            expect(new Set(keys).size).toBe(keys.length)
            expect(keys.length).toBeGreaterThanOrEqual(2)
          }
        }
      }
    })
  }
})
