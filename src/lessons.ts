import { UNITS, type Unit, type Word } from './content'

export type Step =
  | { type: 'intro'; word: Word }
  | { type: 'listen'; target: Word; choices: Word[] }
  | { type: 'balloons'; target: Word; choices: Word[] }

type Rng = () => number

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Words a child has met in this unit up to and including lesson index `upTo`. */
export function wordsUpTo(unit: Unit, upTo: number): Word[] {
  const ids = new Set(unit.lessons.slice(0, upTo + 1).flatMap((l) => l.newWords))
  return unit.words.filter((w) => ids.has(w.id))
}

function pickChoices(target: Word, pool: Word[], fallback: Word[], count: number, rng: Rng): Word[] {
  const others = shuffle(pool.filter((w) => w.id !== target.id), rng)
  if (others.length < count - 1) {
    const extra = shuffle(
      fallback.filter((w) => w.id !== target.id && !others.some((o) => o.id === w.id)),
      rng,
    )
    others.push(...extra)
  }
  return shuffle([target, ...others.slice(0, count - 1)], rng)
}

/** Order targets so the same word never appears twice in a row (when avoidable). */
function spread(targets: Word[], rng: Rng): Word[] {
  for (let attempt = 0; attempt < 30; attempt++) {
    const s = shuffle(targets, rng)
    if (s.every((w, i) => i === 0 || s[i - 1].id !== w.id)) return s
  }
  return shuffle(targets, rng)
}

function exercises(targets: Word[], poolFor: (w: Word) => { pool: Word[]; fallback: Word[] }, rng: Rng): Step[] {
  return spread(targets, rng).map((target, i) => {
    const { pool, fallback } = poolFor(target)
    return i % 2 === 0
      ? { type: 'listen' as const, target, choices: pickChoices(target, pool, fallback, 3, rng) }
      : { type: 'balloons' as const, target, choices: pickChoices(target, pool, fallback, 4, rng) }
  })
}

export function buildLesson(unit: Unit, lessonIndex: number, rng: Rng = Math.random): Step[] {
  const lesson = unit.lessons[lessonIndex]
  const known = wordsUpTo(unit, lessonIndex)
  const newWords = unit.words.filter((w) => lesson.newWords.includes(w.id))
  const older = known.filter((w) => !lesson.newWords.includes(w.id))

  const steps: Step[] = newWords.map((word) => ({ type: 'intro', word }))
  let targets: Word[]
  if (newWords.length === 0) {
    // Review lesson: 8 exercises over everything learned in the unit.
    targets = shuffle(known, rng).slice(0, 8)
    while (targets.length < 8) targets.push(known[targets.length % known.length])
  } else {
    // Each new word twice, plus up to two older words for spaced review.
    targets = [...newWords, ...newWords, ...shuffle(older, rng).slice(0, 2)]
  }
  steps.push(...exercises(targets, () => ({ pool: known, fallback: unit.words }), rng))
  return steps
}

/** Free play: endless-feeling mixed practice over every word already learned. */
export function buildFreePlay(learnedIds: Set<string>, count = 10, rng: Rng = Math.random): Step[] {
  const learned = UNITS.flatMap((u) => u.words.filter((w) => learnedIds.has(w.id)))
  if (learned.length === 0) return []
  const targets: Word[] = []
  while (targets.length < count) targets.push(...shuffle(learned, rng))
  const unitOf = (w: Word) => UNITS.find((u) => u.words.includes(w))!
  return exercises(
    targets.slice(0, count),
    (w) => {
      const unit = unitOf(w)
      return { pool: unit.words.filter((x) => learnedIds.has(x.id)), fallback: unit.words }
    },
    rng,
  )
}

export function starsFor(mistakes: number): 1 | 2 | 3 {
  if (mistakes <= 1) return 3
  if (mistakes <= 3) return 2
  return 1
}
