import { describe, expect, it } from 'vitest'
import { UNITS } from './content'
import { buildFreePlay, buildLesson, starsFor, wordsUpTo } from './lessons'

describe('buildLesson', () => {
  it('introduces every new word, then quizzes each new word at least twice', () => {
    for (const unit of UNITS) {
      unit.lessons.forEach((lesson, i) => {
        const steps = buildLesson(unit, i)
        const intros = steps.filter((s) => s.type === 'intro').map((s) => (s.type === 'intro' ? s.word.id : ''))
        expect(intros).toEqual(unit.words.filter((w) => lesson.newWords.includes(w.id)).map((w) => w.id))
        const quiz = steps.filter((s) => s.type === 'listen' || s.type === 'balloons')
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
          expect(s.choices.length).toBe(s.type === 'listen' ? 3 : 4)
        }
      }
    }
  })

  it('has exactly one speak step, for a word already introduced', () => {
    for (const unit of UNITS) {
      unit.lessons.forEach((_, i) => {
        const speakSteps = buildLesson(unit, i).filter((s) => s.type === 'speak')
        expect(speakSteps).toHaveLength(1)
        const known = new Set(wordsUpTo(unit, i).map((w) => w.id))
        expect(known.has(speakSteps[0].type === 'speak' ? speakSteps[0].target.id : '')).toBe(true)
      })
    }
  })

  it('only quizzes words already introduced in the unit', () => {
    for (const unit of UNITS) {
      unit.lessons.forEach((_, i) => {
        const known = new Set(wordsUpTo(unit, i).map((w) => w.id))
        for (const s of buildLesson(unit, i)) if (s.type !== 'intro') expect(known.has(s.target.id)).toBe(true)
      })
    }
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
  })
  it('rejects a different word', () => {
    expect(saidWord(['dog'], 'cat')).toBe(false)
    expect(saidWord(['banana'], 'yellow')).toBe(false)
    expect(saidWord([], 'cat')).toBe(false)
  })
})
