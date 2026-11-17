import { ALL_LESSONS, UNITS } from './content'
import type { Slot } from './gamify'

export interface Settings {
  childName: string
  /** Language the mascot uses for instructions. English words are always English. */
  instructions: 'ro' | 'en'
  slowVoice: boolean
  /** Show the microphone ("say it yourself") steps. */
  mic: boolean
  /** Use the browser's speech recognition to check the word (audio goes to the browser's speech service). */
  micCheck: boolean
  /** Keep speech-therapy recordings on this device so a parent can listen later. */
  speechSave: boolean
}

export interface Progress {
  /** Best stars per lesson id. */
  stars: Record<string, number>
  stickers: string[]
  /** Seconds played per day, keyed YYYY-MM-DD. */
  playSeconds: Record<string, number>
  settings: Settings
  /** Stars Tudor can spend in Ninja's wardrobe. */
  wallet: number
  /** All stars ever earned (drives Ninja's level). */
  earned: number
  /** Days (YYYY-MM-DD) with at least one finished lesson. */
  daysPlayed: string[]
  /** Last day the daily chest was opened. */
  lastChest: string
  /** Wardrobe items bought, and what Ninja wears per slot. */
  owned: string[]
  outfit: Partial<Record<Slot, string>>
  /** Boss tests per unit id: best score (0..1), tries, and whether the boss was beaten. */
  boss: Record<string, BossRecord>
  /** Speech-therapy practice: per day, the activities finished (e.g. "r:words"). */
  speechLog: Record<string, string[]>
}

export interface BossRecord {
  best: number
  tries: number
  beaten: boolean
  last: number
  lastDay: string
}

const KEY = 'dino-english-progress-v1'

export const DEFAULT_PROGRESS: Progress = {
  stars: {},
  stickers: [],
  playSeconds: {},
  wallet: 0,
  earned: 0,
  daysPlayed: [],
  lastChest: '',
  owned: [],
  outfit: {},
  boss: {},
  speechLog: {},
  settings: { childName: 'Tudor', instructions: 'ro', slowVoice: false, mic: true, micCheck: true, speechSave: true },
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULT_PROGRESS)
    const parsed = JSON.parse(raw) as Partial<Progress>
    // Older saves had no wallet: start it from the stars already won.
    const fromStars = Object.values(parsed.stars ?? {}).reduce((a, b) => a + b, 0)
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      wallet: fromStars,
      earned: fromStars,
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
