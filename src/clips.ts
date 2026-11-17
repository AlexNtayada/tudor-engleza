// Pre-recorded voice clips (made once with ElevenLabs by scripts/voices/generate.ts).
// Every spoken line has a key made from the voice and the exact text; the manifest lists which keys
// exist, so the app knows synchronously whether a clip can be played or the browser voice must speak.

import manifest from '../public/audio/manifest.json'

/** 'en' is the American voice for English words and sentences; the others are the mascots' voices. */
export type VoiceId = string

export interface Manifest {
  voices: Record<VoiceId, string[]>
}

/** Same text, same clip: trims and collapses spaces so small formatting changes don't miss a clip. */
export function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Short stable hash (cyrb53, base36) of voice + text; also the clip's file name. */
export function clipHash(voice: VoiceId, text: string): string {
  const str = `${voice}|${normalize(text)}`
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

export function clipPath(voice: VoiceId, text: string): string {
  return `audio/${voice}/${clipHash(voice, text)}.mp3`
}

const sets: Record<VoiceId, Set<string>> = {}
for (const [voice, hashes] of Object.entries((manifest as Manifest).voices)) sets[voice] = new Set(hashes)

export function hasClip(voice: VoiceId, text: string): boolean {
  return !!sets[voice]?.has(clipHash(voice, text))
}

/** True when the mascot has recorded Romanian lines, so Romanian works even without a device voice. */
export function hasVoiceClips(voice: VoiceId): boolean {
  return (sets[voice]?.size ?? 0) > 0
}

// Lines that were spoken without a clip, so a parent (or the next generation run) can add them.
const missing = new Set<string>()
export function noteMissing(voice: VoiceId, text: string) {
  const key = `${voice}|${normalize(text)}`
  if (missing.has(key)) return
  missing.add(key)
  if (import.meta.env?.DEV) console.info('[voice] no clip for', key)
}
export function missingClips(): string[] {
  return [...missing]
}
