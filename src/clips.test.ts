import { describe, expect, it } from 'vitest'
import { clipHash, clipPath, normalize } from './clips'
import { collectLines } from '../scripts/voices/lines'
import { MASCOTS } from './mascots'
import { UNITS } from './content'

describe('voice clips', () => {
  it('hashes are stable and ignore extra spaces', () => {
    expect(clipHash('en', 'cat')).toBe(clipHash('en', '  cat '))
    expect(clipHash('en', 'cat')).not.toBe(clipHash('ninja', 'cat'))
    expect(clipPath('en', 'cat')).toMatch(/^audio\/en\/[0-9a-z]+\.mp3$/)
    expect(normalize(' a  b ')).toBe('a b')
  })

  it('collects every word and a Romanian line set for each friend, without hash collisions', () => {
    const lines = collectLines()
    const keys = new Set(lines.map((l) => `${l.voice}/${clipHash(l.voice, l.text)}`))
    expect(keys.size).toBe(lines.length)
    for (const u of UNITS) for (const w of u.words) expect(lines.some((l) => l.voice === 'en' && l.text === w.say)).toBe(true)
    for (const m of MASCOTS) {
      expect(lines.some((l) => l.voice === m.id && l.text === 'Hai să învățăm engleză.')).toBe(true)
      expect(lines.some((l) => l.voice === m.id && l.text === 'Mai încearcă!')).toBe(true)
    }
  })
})
