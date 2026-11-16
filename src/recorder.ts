// Microphone: record a short clip of the child saying a word, play it back,
// and (where the browser supports it) check what was said with speech recognition.

type RecognitionCtor = new () => {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function micSupported(): boolean {
  return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
}

export function recognitionSupported(): boolean {
  return typeof window !== 'undefined' && !!recognitionCtor()
}

let stream: MediaStream | undefined
let denied = false

export function micDenied() {
  return denied
}

async function getStream(): Promise<MediaStream | undefined> {
  if (stream && stream.getTracks().every((t) => t.readyState === 'live')) return stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    denied = false
    return stream
  } catch {
    denied = true
    return undefined
  }
}

export interface Take {
  /** Recorded clip, if the microphone worked. */
  audio?: Blob
  /** What speech recognition heard (all alternatives, lowercase). Empty when not available. */
  heard: string[]
}

export interface Recording {
  /** Stop early (otherwise it stops by itself after maxMs). */
  stop: () => void
  done: Promise<Take>
}

export async function startRecording(opts: { maxMs?: number; recognize: boolean }): Promise<Recording | undefined> {
  const s = await getStream()
  if (!s) return undefined
  const maxMs = opts.maxMs ?? 3000

  const chunks: Blob[] = []
  const rec = new MediaRecorder(s)
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)

  const audioDone = new Promise<Blob | undefined>((resolve) => {
    rec.onstop = () => resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType || 'audio/webm' }) : undefined)
    rec.onerror = () => resolve(undefined)
  })

  let heardDone: Promise<string[]> = Promise.resolve([])
  let recognizer: InstanceType<RecognitionCtor> | undefined
  const Ctor = opts.recognize ? recognitionCtor() : undefined
  if (Ctor) {
    recognizer = new Ctor()
    recognizer.lang = 'en-US'
    recognizer.interimResults = false
    recognizer.maxAlternatives = 5
    recognizer.continuous = false
    heardDone = new Promise((resolve) => {
      const heard: string[] = []
      recognizer!.onresult = (e) => {
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i]
          for (let j = 0; j < r.length; j++) heard.push(r[j].transcript.toLowerCase().trim())
        }
      }
      recognizer!.onerror = () => resolve(heard)
      recognizer!.onend = () => resolve(heard)
      // Never wait forever on recognition.
      setTimeout(() => resolve(heard), maxMs + 2500)
    })
    try {
      recognizer.start()
    } catch {
      heardDone = Promise.resolve([])
    }
  }

  rec.start()
  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    if (rec.state !== 'inactive') rec.stop()
    try {
      recognizer?.stop()
    } catch {
      /* already stopped */
    }
  }
  setTimeout(stop, maxMs)

  return {
    stop,
    done: Promise.all([audioDone, heardDone]).then(([audio, heard]) => ({ audio, heard })),
  }
}

export function playBlob(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const a = new Audio(url)
    const end = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    a.onended = end
    a.onerror = end
    a.play().catch(end)
    setTimeout(end, 6000)
  })
}

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

// Recognizers often write numbers as digits, or pick a sound-alike word.
const ALIASES: Record<string, string[]> = {
  one: ['1', 'won'],
  two: ['2', 'to', 'too'],
  three: ['3', 'tree'],
  four: ['4', 'for'],
  five: ['5'],
  six: ['6'],
  seven: ['7'],
  eight: ['8', 'ate'],
  nine: ['9'],
  ten: ['10'],
  red: ['read'],
  blue: ['blew'],
}

/** Lenient check: did any heard alternative contain the word (or something close to it)? */
export function saidWord(heard: string[], word: string): boolean {
  const target = word.toLowerCase()
  const exact = new Set([target, ...(ALIASES[target] ?? [])])
  const tolerance = target.length <= 3 ? 1 : 2
  return heard.some((h) => {
    const clean = h.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
    if (target.includes(' ')) return clean.includes(target) || distance(clean, target) <= tolerance
    return clean
      .split(' ')
      .filter(Boolean)
      .some((w) => exact.has(w) || (w.length > 1 && distance(w, target) <= tolerance))
  })
}
