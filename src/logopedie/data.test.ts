import { describe, expect, it } from 'vitest'
import { buildListenRounds, positionOf, sillyForm, SOUNDS, type Position, type SoundId } from './data'

const ids: SoundId[] = ['r', 'l']

describe('speech-therapy words', () => {
  it('each word has its sound in the promised position and never the other sound', () => {
    for (const id of ids) {
      const other = id === 'r' ? 'l' : 'r'
      for (const [pos, words] of Object.entries(SOUNDS[id].words)) {
        for (const w of words) {
          expect(positionOf(w.text, id), w.text).toBe(pos as Position)
          expect(w.text.includes(other), w.text).toBe(false)
          expect(w.syl.replace(/-/g, ''), w.text).toBe(w.text)
        }
      }
    }
  })

  it('syllable rows only practise their own sound', () => {
    for (const id of ids) for (const row of SOUNDS[id].rows) for (const it of row.items) expect(it.toLowerCase()).toContain(id)
  })

  it('silly form swaps the sound for "i", like Tudor does', () => {
    expect(sillyForm('rață', 'r')).toBe('iață')
    expect(sillyForm('tractor', 'r')).toBe('tiactoi')
    expect(sillyForm('balon', 'l')).toBe('baion')
  })

  it('listening rounds mix right and silly, without words whose silly form is real', () => {
    for (const id of ids) {
      const rounds = buildListenRounds(id, 6)
      expect(rounds).toHaveLength(6)
      expect(new Set(rounds.map((r) => r.word.text)).size).toBe(6)
      expect(rounds.filter((r) => r.silly)).toHaveLength(3)
      expect(rounds.some((r) => r.word.noListen)).toBe(false)
    }
  })
})
