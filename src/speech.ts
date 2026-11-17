// Voice output. Each part is played from a pre-recorded clip when one exists (see clips.ts):
// Romanian lines in the chosen friend's voice, English words in a clear American voice.
// Anything without a clip falls back to the browser's speech engine, as before.

import { clipPath, hasClip, hasVoiceClips, noteMissing, type VoiceId } from './clips'
import { mascot } from './mascots'

export interface Part {
  text: string
  lang: 'en' | 'ro'
}

/** Voice for English words and sentences shared by every friend. */
export const WORD_VOICE = 'en'

let voices: SpeechSynthesisVoice[] = []
const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined

function refreshVoices() {
  if (synth) voices = synth.getVoices()
}
refreshVoices()
synth?.addEventListener?.('voiceschanged', refreshVoices)

const EN_PREFERRED = [/aria/i, /jenny/i, /ava/i, /samantha/i, /google us english/i, /zira/i, /natural/i]

function pickVoice(lang: 'en' | 'ro'): SpeechSynthesisVoice | undefined {
  if (lang === 'ro') return voices.find((v) => v.lang.toLowerCase().startsWith('ro'))
  const us = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === 'en-us')
  for (const re of EN_PREFERRED) {
    const v = us.find((x) => re.test(x.name))
    if (v) return v
  }
  return us[0] ?? voices.find((v) => v.lang.toLowerCase().startsWith('en'))
}

/** Romanian can be spoken: recorded lines for the current friend, or a Romanian device voice. */
export function hasRomanianVoice(): boolean {
  if (hasVoiceClips(mascot().id)) return true
  refreshVoices()
  return !!pickVoice('ro')
}

export function speechSupported(): boolean {
  return !!synth || hasVoiceClips(WORD_VOICE)
}

let slow = false
export function setSlowVoice(v: boolean) {
  slow = v
}

/** Which recorded voice has this part, if any. English phrases can belong to the friend or the word voice. */
function clipVoice(part: Part, friend: VoiceId): VoiceId | undefined {
  if (hasClip(friend, part.text)) return friend
  if (part.lang === 'en' && hasClip(WORD_VOICE, part.text)) return WORD_VOICE
  noteMissing(part.lang === 'ro' ? friend : WORD_VOICE, part.text)
  return undefined
}

let token = 0
let current: HTMLAudioElement | undefined
let stopCurrent: (() => void) | undefined

function playClip(src: string, rate: number, volume = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const a = new Audio(src)
    a.playbackRate = rate
    a.volume = volume
    a.preservesPitch = true
    current = a
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(guard)
      if (current === a) current = undefined
      resolve(ok)
    }
    stopCurrent = () => {
      a.pause()
      finish(true)
    }
    // Safety net in case neither "ended" nor "error" ever fires.
    const guard = setTimeout(() => finish(true), 15000)
    a.onended = () => finish(true)
    a.onerror = () => finish(false)
    a.play().catch(() => finish(false))
  })
}

function sayWithBrowser(part: Part, rate: number, volume = 1): Promise<void> {
  if (!synth) return Promise.resolve()
  const voice = pickVoice(part.lang)
  if (part.lang === 'ro' && !voice) return Promise.resolve()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(part.text)
    if (voice) u.voice = voice
    u.lang = part.lang === 'en' ? 'en-US' : 'ro-RO'
    u.rate = rate
    u.pitch = 1.1
    u.volume = volume
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(guard)
      resolve()
    }
    stopCurrent = () => {
      synth.cancel()
      finish()
    }
    // Some browsers never fire onend.
    const guard = setTimeout(finish, 2500 + part.text.length * 120)
    u.onend = finish
    u.onerror = finish
    synth.speak(u)
  })
}

function halt() {
  stopCurrent?.()
  stopCurrent = undefined
  current?.pause()
  synth?.cancel()
}

/**
 * Speak parts in order, cancelling anything still playing. Resolves when done (or interrupted).
 * `friend` makes another friend talk (the picker lets each one introduce itself).
 * `volume` (0-1) plays it softer, e.g. the greeting when the app opens.
 */
export async function speak(
  parts: Part[],
  opts: { slow?: boolean; roRate?: number; friend?: VoiceId; volume?: number } = {},
): Promise<void> {
  halt()
  refreshVoices()
  const my = ++token
  const s = opts.slow ?? slow
  for (const part of parts) {
    if (my !== token) return
    if (!part.text.trim()) continue
    const voice = clipVoice(part, opts.friend ?? mascot().id)
    if (voice) {
      // Clips are recorded at a natural pace; slow mode just plays them slower.
      const rate = part.lang === 'en' ? (s ? 0.7 : 1) : opts.roRate !== undefined && opts.roRate < 0.8 ? 0.75 : 1
      const ok = await playClip(`${import.meta.env.BASE_URL}${clipPath(voice, part.text)}`, rate, opts.volume)
      if (ok) continue
      if (my !== token) return
    }
    await sayWithBrowser(part, part.lang === 'en' ? (s ? 0.5 : 0.8) : (opts.roRate ?? 0.95), opts.volume)
  }
}

export function stopSpeaking() {
  token++
  halt()
}

/**
 * Build an instruction: Romanian lead-in + English word when Romanian is chosen and available,
 * otherwise a full English sentence.
 */
export function instruction(
  mode: 'ro' | 'en',
  ro: string,
  en: string,
  englishWord?: string,
): Part[] {
  if (mode === 'ro' && hasRomanianVoice()) {
    return englishWord ? [{ text: ro, lang: 'ro' }, { text: englishWord, lang: 'en' }] : [{ text: ro, lang: 'ro' }]
  }
  return [{ text: en, lang: 'en' }]
}

/** Speak Romanian text (speech-therapy module). Silent when there is neither a clip nor a Romanian voice. */
export function speakRo(text: string | string[], opts: { slow?: boolean } = {}): Promise<void> {
  const parts = (Array.isArray(text) ? text : [text]).map((t) => ({ text: t, lang: 'ro' as const }))
  return speak(parts, { roRate: opts.slow ? 0.6 : 0.85 })
}
