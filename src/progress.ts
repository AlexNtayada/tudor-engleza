import { ALL_LESSONS, UNITS } from './content'
import type { Slot } from './gamify'
import type { MascotId } from './mascots'

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
  /** Sound effects (taps, bravo, balloons). */
  sfx: boolean
  /** The friend suggests a break after about 15 minutes. */
  breaks: boolean
  /** Units skipped at the start of the map (chosen in onboarding: 0 = from zero). */
  skipUnits: number
}

export interface Progress {
  /** Best stars per lesson id. */
  stars: Record<string, number>
  stickers: string[]
  /** Seconds played per day, keyed YYYY-MM-DD. */
  playSeconds: Record<string, number>
  settings: Settings
  /** Stars Tudor can spend in the friend's wardrobe. */
  wallet: number
  /** All stars ever earned (drives the friend's level). */
  earned: number
  /** Days (YYYY-MM-DD) with at least one finished lesson. */
  daysPlayed: string[]
  /** Last day the daily chest was opened. */
  lastChest: string
  /** Wardrobe items bought, and what the friend wears per slot. */
  owned: string[]
  outfit: Partial<Record<Slot, string>>
  /** Boss tests per unit id: best score (0..1), tries, and whether the boss was beaten. */
  boss: Record<string, BossRecord>
  /** Speech-therapy practice: per day, the activities finished (e.g. "r:words"). */
  speechLog: Record<string, string[]>
  /** Sentence packs: best stars per pack id. */
  sentences: Record<string, number>
  /** Castle game: lands won (each one gives a castle sticker), and the castle the child picked. */
  towerWins?: string[]
  castle?: string
  /** The friend picked in the intro; unset until the child picks one. */
  mascot?: MascotId
  /** False only for a brand-new child who has not gone through the first-run steps yet. */
  onboarded?: boolean
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
  sentences: {},
  settings: { childName: 'Tudor', instructions: 'ro', slowVoice: false, mic: true, micCheck: true, speechSave: true, sfx: true, breaks: true, skipUnits: 0 },
}

/** Fills in fields that older saves (or saves from another device) may lack. */
function normalize(parsed: Partial<Progress>): Progress {
  // Older saves had no wallet: start it from the stars already won.
  const fromStars = Object.values(parsed.stars ?? {}).reduce((a, b) => a + b, 0)
  return {
    ...structuredClone(DEFAULT_PROGRESS),
    wallet: fromStars,
    earned: fromStars,
    // Saves from before onboarding existed belong to children who already play.
    onboarded: true,
    ...parsed,
    settings: { ...DEFAULT_PROGRESS.settings, ...parsed.settings },
  }
}

/** A brand-new child: nothing played yet, first-run steps still to do. */
export function freshProgress(childName = ''): Progress {
  const p = structuredClone(DEFAULT_PROGRESS)
  return { ...p, onboarded: false, settings: { ...p.settings, childName } }
}

/** Whether a save holds anything worth keeping (used when an account and a device both have progress). */
export function hasPlayed(p: Progress): boolean {
  return p.earned > 0 || Object.keys(p.stars).length > 0 || p.daysPlayed.length > 0
}

/** Storage key of a child's progress; the first child keeps the key used before profiles existed. */
export function progressKey(profileId = 'p1'): string {
  return profileId === 'p1' ? KEY : `${KEY}:${profileId}`
}

export function loadProgress(profileId?: string): Progress {
  try {
    const raw = localStorage.getItem(progressKey(profileId))
    if (!raw) return freshProgress()
    return normalize(JSON.parse(raw) as Partial<Progress>)
  } catch {
    return freshProgress()
  }
}

/** Normalizes progress that came from elsewhere (an account). */
export function parseProgress(p: unknown): Progress | undefined {
  if (!p || typeof p !== 'object' || typeof (p as Progress).stars !== 'object') return undefined
  return normalize(p as Partial<Progress>)
}

const EXPORT_KIND = 'tudoo-progress'

/** The progress as a small file the parent can move to another device or address (Parents area). */
export function exportProgress(p: Progress): string {
  return JSON.stringify({ kind: EXPORT_KIND, version: 1, savedAt: new Date().toISOString(), progress: p })
}

/** Reads a file made by exportProgress; undefined when it is not a Tudoo! progress file. */
export function importProgress(text: string): Progress | undefined {
  try {
    const data = JSON.parse(text) as { kind?: string; progress?: Partial<Progress> }
    const p = data?.kind === EXPORT_KIND ? data.progress : undefined
    if (!p || typeof p !== 'object' || typeof p.stars !== 'object' || p.stars === null) return undefined
    return normalize(p)
  } catch {
    return undefined
  }
}

export function saveProgress(p: Progress, profileId?: string) {
  try {
    localStorage.setItem(progressKey(profileId), JSON.stringify(p))
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
  const skip = startIndex(p.settings.skipUnits)
  const i = ALL_LESSONS.findIndex(({ lesson }, g) => g >= skip && !p.stars[lesson.id])
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

/** Index in ALL_LESSONS of the first lesson of the unit the map starts at. */
export function startIndex(skipUnits: number): number {
  return UNITS.slice(0, Math.max(0, skipUnits)).reduce((n, u) => n + u.lessons.length, 0)
}
