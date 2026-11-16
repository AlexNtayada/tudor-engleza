import { ALL_LESSONS, UNITS } from './content'

export interface Settings {
  childName: string
  /** Language the mascot uses for instructions. English words are always English. */
  instructions: 'ro' | 'en'
  slowVoice: boolean
}

export interface Progress {
  /** Best stars per lesson id. */
  stars: Record<string, number>
  stickers: string[]
  /** Seconds played per day, keyed YYYY-MM-DD. */
  playSeconds: Record<string, number>
  settings: Settings
}

const KEY = 'dino-english-progress-v1'

export const DEFAULT_PROGRESS: Progress = {
  stars: {},
  stickers: [],
  playSeconds: {},
  settings: { childName: 'Tudor', instructions: 'ro', slowVoice: false },
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULT_PROGRESS)
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      ...parsed,
      settings: { ...DEFAULT_PROGRESS.settings, ...parsed.settings },
    }
  } catch {
    return structuredClone(DEFAULT_PROGRESS)
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable (private mode) — progress lives for this visit only */
  }
}

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Index in ALL_LESSONS of the first lesson not finished yet (lessons unlock in order). */
export function currentLessonIndex(p: Progress): number {
  const i = ALL_LESSONS.findIndex(({ lesson }) => !p.stars[lesson.id])
  return i === -1 ? ALL_LESSONS.length : i
}

export function learnedWordIds(p: Progress): Set<string> {
  const ids = new Set<string>()
  for (const { lesson } of ALL_LESSONS) {
    if (p.stars[lesson.id]) lesson.newWords.forEach((w) => ids.add(w))
  }
  return ids
}

export function totalStars(p: Progress): number {
  return Object.values(p.stars).reduce((a, b) => a + b, 0)
}

export const TOTAL_WORDS = UNITS.reduce((n, u) => n + u.words.length, 0)

export const ALL_LESSONS_COUNT = ALL_LESSONS.length
