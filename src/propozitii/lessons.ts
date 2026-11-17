import { shuffle } from '../lessons'
import type { Pack, Sentence } from './data'

export type SentenceStep =
  | { type: 'intro'; sentence: Sentence }
  /** Hear the sentence, tap the matching picture. */
  | { type: 'pick'; sentence: Sentence; choices: Sentence[] }
  /** See the picture, find the missing word. Choices are sentences with different key words. */
  | { type: 'fill'; sentence: Sentence; choices: Sentence[] }
  /** See one picture, hear a sentence: is it true? */
  | { type: 'truth'; sentence: Sentence; said: Sentence }
  | { type: 'say'; sentence: Sentence }

type Rng = () => number

export const PICK_CHOICES = 3

/** Words before and after the key word, for "I see ... dogs". */
export function splitAtKey(s: Sentence): { before: string; after: string } {
  const words = s.text.split(' ')
  const i = words.findIndex((w) => w.toLowerCase() === s.key.toLowerCase())
  return { before: words.slice(0, i).join(' '), after: words.slice(i + 1).join(' ') }
}

function pickChoices(target: Sentence, pack: Pack, rng: Rng): Sentence[] {
  const others = shuffle(
    pack.sentences.filter((x) => x.id !== target.id),
    rng,
  ).slice(0, PICK_CHOICES - 1)
  return shuffle([target, ...others], rng)
}

function fillChoices(target: Sentence, pack: Pack, rng: Rng): Sentence[] {
  const seen = new Set([target.key])
  const others: Sentence[] = []
  for (const x of shuffle(pack.sentences, rng)) {
    if (seen.has(x.key) || others.length >= PICK_CHOICES - 1) continue
    seen.add(x.key)
    others.push(x)
  }
  return shuffle([target, ...others], rng)
}

/** Shuffle so the same sentence never comes twice in a row (when avoidable). */
function spread<T extends { sentence: Sentence }>(steps: T[], rng: Rng): T[] {
  for (let attempt = 0; attempt < 40; attempt++) {
    const s = shuffle(steps, rng)
    if (s.every((x, i) => i === 0 || s[i - 1].sentence.id !== x.sentence.id)) return s
  }
  return shuffle(steps, rng)
}

/**
 * One round of a pack: meet every sentence, then mixed games
 * (pick the picture for each, three "what is missing?", two "true or not?"),
 * with "say it" steps in the middle and at the end (dropped later if there is no microphone).
 */
export function buildSentenceLesson(pack: Pack, rng: Rng = Math.random): SentenceStep[] {
  const all = pack.sentences
  const steps: SentenceStep[] = all.map((sentence) => ({ type: 'intro', sentence }))
  const quiz: SentenceStep[] = [
    ...all.map((sentence) => ({ type: 'pick' as const, sentence, choices: pickChoices(sentence, pack, rng) })),
    ...shuffle(all, rng)
      .slice(0, 3)
      .map((sentence) => ({ type: 'fill' as const, sentence, choices: fillChoices(sentence, pack, rng) })),
    ...shuffle(all, rng)
      .slice(0, 2)
      .map((sentence, i) => {
        // One true, one not true, so the answer is never always "yes".
        const said = i === 0 ? sentence : shuffle(all.filter((x) => x.id !== sentence.id), rng)[0]
        return { type: 'truth' as const, sentence, said }
      }),
  ]
  const mixed: SentenceStep[] = spread(quiz, rng)
  const [first, second] = shuffle(all, rng)
  mixed.splice(Math.floor(mixed.length / 2), 0, { type: 'say', sentence: first })
  mixed.push({ type: 'say', sentence: second })
  steps.push(...mixed)
  return steps
}
