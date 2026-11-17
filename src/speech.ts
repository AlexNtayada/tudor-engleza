// Voice output via the browser's speech engine.
// English uses an American voice; Romanian is used only when the device has a Romanian voice.

export interface Part {
  text: string
  lang: 'en' | 'ro'
}

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

export function hasRomanianVoice(): boolean {
  refreshVoices()
  return !!pickVoice('ro')
}

export function speechSupported(): boolean {
  return !!synth
}

let slow = false
export function setSlowVoice(v: boolean) {
  slow = v
}

let token = 0

/** Speak parts in order, cancelling anything still playing. Resolves when done (or interrupted). */
export function speak(parts: Part[], opts: { slow?: boolean; roRate?: number } = {}): Promise<void> {
  if (!synth) return Promise.resolve()
  refreshVoices()
  synth.cancel()
  const my = ++token
  const usable = parts.filter((p) => p.lang === 'en' || pickVoice('ro'))
  return new Promise((resolve) => {
    if (usable.length === 0) return resolve()
    let left = usable.length
    const done = () => {
      left--
      if (left <= 0 || my !== token) resolve()
    }
    for (const part of usable) {
      const u = new SpeechSynthesisUtterance(part.text)
      const voice = pickVoice(part.lang)
      if (voice) u.voice = voice
      u.lang = part.lang === 'en' ? 'en-US' : 'ro-RO'
      const s = opts.slow ?? slow
      u.rate = part.lang === 'en' ? (s ? 0.5 : 0.8) : (opts.roRate ?? 0.95)
      u.pitch = 1.1
      u.onend = done
      u.onerror = done
      synth.speak(u)
    }
    // Safety net: some browsers never fire onend.
    setTimeout(resolve, 2500 + usable.reduce((n, p) => n + p.text.length * 120, 0))
  })
}

export function stopSpeaking() {
  token++
  synth?.cancel()
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
  if (mode === 'ro' && pickVoice('ro')) {
    return englishWord ? [{ text: ro, lang: 'ro' }, { text: englishWord, lang: 'en' }] : [{ text: ro, lang: 'ro' }]
  }
  return [{ text: en, lang: 'en' }]
}

/** Speak Romanian text (speech-therapy module). Silent when the device has no Romanian voice. */
export function speakRo(text: string | string[], opts: { slow?: boolean } = {}): Promise<void> {
  const parts = (Array.isArray(text) ? text : [text]).map((t) => ({ text: t, lang: 'ro' as const }))
  return speak(parts, { roRate: opts.slow ? 0.6 : 0.85 })
}
