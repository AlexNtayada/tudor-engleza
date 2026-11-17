import { describe, expect, it } from 'vitest'
import { UNITS } from './content'
import { BOSS_HP, BOSS_QUESTIONS, buildFreePlay, buildLesson, CHOICE_COUNT, starsFor, wordsUpTo } from './lessons'

describe('buildLesson', () => {
  it('introduces every new word, then quizzes each new word at least twice', () => {
    for (const unit of UNITS) {
      unit.lessons.forEach((lesson, i) => {
        const steps = buildLesson(unit, i)
        const intros = steps.filter((s) => s.type === 'intro').map((s) => (s.type === 'intro' ? s.word.id : ''))
        expect(intros).toEqual(unit.words.filter((w) => lesson.newWords.includes(w.id)).map((w) => w.id))
        const quiz = steps.filter((s) => s.type !== 'intro' && s.type !== 'speak')
        expect(quiz.length).toBeGreaterThanOrEqual(lesson.newWords.length === 0 ? 8 : 4)
        for (const id of lesson.newWords) {
          expect(quiz.filter((s) => 'target' in s && s.target.id === id).length).toBeGreaterThanOrEqual(2)
        }
      })
    }
  })

  it('always offers the right answer exactly once and no duplicate choices', () => {
    for (const unit of UNITS) {
      for (let i = 0; i < unit.lessons.length; i++) {
        for (const s of buildLesson(unit, i)) {
          if (s.type === 'intro' || s.type === 'speak') continue
          expect(s.choices.filter((c) => c.id === s.target.id)).toHaveLength(1)
          expect(new Set(s.choices.map((c) => c.id)).size).toBe(s.choices.length)
          expect(s.choices.length).toBe(CHOICE_COUNT[s.type])
        }
      }
    }
  })

  it('has exactly one speak step, for a word already introduced', () => {
    for (const unit of UNITS) {
      unit.lessons.forEach((lesson, i) => {
        if (lesson.boss) return
        const speakSteps = buildLesson(unit, i).filter((s) => s.type === 'speak')
        expect(speakSteps).toHaveLength(unit.lessons[i].bonusSpeak ? 2 : 1)
        const known = new Set(wordsUpTo(unit, i).map((w) => w.id))
        expect(known.has(speakSteps[0].type === 'speak' ? speakSteps[0].target.id : '')).toBe(true)
      })
    }
  })

  it('uses every game of the unit, including the special family and food games', () => {
    for (const unit of UNITS) {
      const types = new Set(unit.lessons.flatMap((_, i) => buildLesson(unit, i).map((s) => s.type)))
      for (const g of unit.games) expect(types.has(g)).toBe(true)
    }
    expect(UNITS.find((u) => u.id === 'family')!.games).toContain('house')
    expect(UNITS.find((u) => u.id === 'food')!.games).toContain('feed')
  })

  it('ends the last family and food lessons before the boss with a phrase to say', () => {
    for (const id of ['family', 'food']) {
      const unit = UNITS.find((u) => u.id === id)!
      const steps = buildLesson(unit, unit.lessons.length - 2)
      const last = steps[steps.length - 1]
      expect(last.type).toBe('speak')
    }
  })

  it('only quizzes words already introduced in the unit', () => {
    for (const unit of UNITS) {
      unit.lessons.forEach((_, i) => {
        const known = new Set(wordsUpTo(unit, i).map((w) => w.id))
        for (const s of buildLesson(unit, i))
          if (s.type !== 'intro' && s.target !== unit.lessons[i].bonusSpeak) expect(known.has(s.target.id)).toBe(true)
      })
    }
  })
})

describe('boss stage', () => {
  it('closes every unit with a boss test over all its words', () => {
    for (const unit of UNITS) {
      const last = unit.lessons[unit.lessons.length - 1]
      expect(last.boss).toBe(true)
      const steps = buildLesson(unit, unit.lessons.length - 1)
      expect(steps).toHaveLength(BOSS_QUESTIONS)
      expect(steps.every((s) => s.type !== 'intro' && s.type !== 'speak')).toBe(true)
      const asked = new Set(steps.map((s) => ('target' in s ? s.target.id : '')))
      expect(asked.size).toBe(Math.min(unit.words.length, BOSS_QUESTIONS))
    }
    expect(BOSS_HP).toBeLessThanOrEqual(BOSS_QUESTIONS)
  })

  it('gives every unit a set reward and unique stickers', () => {
    const stickers = UNITS.flatMap((u) => u.lessons.map((l) => l.sticker))
    expect(new Set(stickers).size).toBe(stickers.length)
    for (const u of UNITS) expect(u.setReward).toBeTruthy()
  })
})

describe('buildFreePlay', () => {
  it('uses only learned words as targets', () => {
    const learned = new Set(['red', 'blue', 'yellow', 'cat'])
    const steps = buildFreePlay(learned, 12)
    expect(steps).toHaveLength(12)
    for (const s of steps) if (s.type !== 'intro') expect(learned.has(s.target.id)).toBe(true)
  })
  it('is empty when nothing is learned', () => {
    expect(buildFreePlay(new Set())).toEqual([])
  })
})

it('gives at least one star', () => {
  expect(starsFor(0)).toBe(3)
  expect(starsFor(2)).toBe(2)
  expect(starsFor(20)).toBe(1)
})

import { saidWord } from './recorder'

describe('saidWord', () => {
  it('accepts the word inside a phrase, digits and close mishearings', () => {
    expect(saidWord(['a cat'], 'cat')).toBe(true)
    expect(saidWord(['3'], 'three')).toBe(true)
    expect(saidWord(['to'], 'two')).toBe(true)
    expect(saidWord(['yello'], 'yellow')).toBe(true)
    expect(saidWord(['Purple!'], 'purple')).toBe(true)
    expect(saidWord(['I like ice cream'], 'ice cream')).toBe(true)
    expect(saidWord(['i love you mom'], 'love')).toBe(true)
  })
  it('rejects a different word', () => {
    expect(saidWord(['dog'], 'cat')).toBe(false)
    expect(saidWord(['banana'], 'yellow')).toBe(false)
    expect(saidWord([], 'cat')).toBe(false)
  })
})

import { buy, ITEMS, levelFor, toggleWear } from './gamify'
import { DEFAULT_PROGRESS } from './progress'

describe('rewards', () => {
  it('buys an item only with enough stars and wears it', () => {
    const hat = ITEMS[0]
    const poor = { ...structuredClone(DEFAULT_PROGRESS), wallet: hat.price - 1 }
    expect(buy(poor, hat)).toBe(poor)
    const rich = buy({ ...structuredClone(DEFAULT_PROGRESS), wallet: 30 }, hat)
    expect(rich.wallet).toBe(30 - hat.price)
    expect(rich.owned).toContain(hat.id)
    expect(rich.outfit[hat.slot]).toBe(hat.id)
    expect(buy(rich, hat)).toBe(rich)
    expect(toggleWear(rich, hat).outfit[hat.slot]).toBeUndefined()
  })
  it('levels up every 15 stars', () => {
    expect(levelFor(0)).toBe(1)
    expect(levelFor(14)).toBe(2 - 1)
    expect(levelFor(15)).toBe(2)
  })
})

describe('spoken words', () => {
  it('says every word without "a"/"an" in front', () => {
    for (const u of UNITS) for (const w of u.words) expect(w.say).not.toMatch(/^an? /)
  })
})
