// Records the app's spoken lines with ElevenLabs into public/audio/<voice>/<hash>.mp3 and rewrites
// public/audio/manifest.json. Only lines without a clip are recorded, so re-running is cheap.
//
//   ELEVENLABS_API_KEY=... npx vite-node scripts/voices/generate.ts -- [options]
//
//   --dry-run                 count what would be recorded (characters ≈ credits), record nothing
//   --voices ninja,en         only these voices (default: all)
//   --sample                  a few lines per voice, to listen before recording everything
//   --limit 500               stop after this many clips
//   --english-instructions    also record the English versions of the instructions
//   --list-voices             print the voices on the account and exit
//   --redo                    record again even when a clip exists (use with --voices)

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clipHash } from '../../src/clips'
import { collectLines, type Line } from './lines'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const audioDir = join(root, 'public', 'audio')
const config = JSON.parse(readFileSync(join(here, 'voices.json'), 'utf8'))
const API = 'https://api.elevenlabs.io/v1'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const value = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const key = process.env.ELEVENLABS_API_KEY?.trim()

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'xi-api-key': key!, ...(init.headers ?? {}) } })
  if (!res.ok) throw new Error(`${res.status} ${path}: ${(await res.text()).slice(0, 300)}`)
  return res
}

async function listVoices() {
  const data = (await (await api('/voices')).json()) as { voices: { voice_id: string; name: string; labels?: Record<string, string> }[] }
  for (const v of data.voices) console.log(`${v.voice_id}  ${v.name}  ${JSON.stringify(v.labels ?? {})}`)
}

async function credits() {
  try {
    const s = (await (await api('/user/subscription')).json()) as { tier: string; character_count: number; character_limit: number }
    return s
  } catch (e) {
    console.log('(could not read subscription:', String(e).slice(0, 120), ')')
    return undefined
  }
}

async function record(line: Line): Promise<Buffer> {
  const voice = config.voices[line.voice]
  const model = config.models[line.lang]
  const body: Record<string, unknown> = { text: line.text, model_id: model, voice_settings: config.settings }
  if (/v2_5|v3/.test(model)) body.language_code = line.lang
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await api(`/text-to-speech/${voice.voiceId}?output_format=mp3_44100_64`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify(body),
      })
      return Buffer.from(await res.arrayBuffer())
    } catch (e) {
      const msg = String(e)
      // Out of credits or a bad key: stop, retrying won't help.
      if (/\b(401|402)\b|quota|insufficient/i.test(msg) || attempt >= 4) throw e
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
}

function writeManifest() {
  const voices: Record<string, string[]> = {}
  if (existsSync(audioDir))
    for (const d of readdirSync(audioDir, { withFileTypes: true })) {
      if (!d.isDirectory()) continue
      const hashes = readdirSync(join(audioDir, d.name))
        .filter((f) => f.endsWith('.mp3'))
        .map((f) => f.slice(0, -4))
        .sort()
      if (hashes.length) voices[d.name] = hashes
    }
  writeFileSync(join(audioDir, 'manifest.json'), JSON.stringify({ voices }) + '\n')
  return voices
}

const SAMPLE = (l: Line) =>
  /^(Eu sunt .*Hai să învățăm engleză!|Mai încearcă!|Bravo!|Great job!|apple|cat|I like apples|rață)$/.test(l.text)

async function main() {
  if (flag('list-voices')) {
    if (!key) throw new Error('ELEVENLABS_API_KEY is not set')
    return listVoices()
  }
  const only = value('voices')?.split(',').map((s) => s.trim())
  let todo = collectLines({ englishInstructions: flag('english-instructions') })
    .filter((l) => !only || only.includes(l.voice))
    .filter((l) => flag('redo') || !existsSync(join(audioDir, l.voice, `${clipHash(l.voice, l.text)}.mp3`)))
  if (flag('sample')) todo = todo.filter(SAMPLE)
  const limit = Number(value('limit') ?? Infinity)
  todo = todo.slice(0, limit)

  const chars = todo.reduce((n, l) => n + l.text.length, 0)
  const cost = todo.reduce((n, l) => n + l.text.length * (/flash|turbo/.test(config.models[l.lang]) ? 0.5 : 1), 0)
  const perVoice: Record<string, number> = {}
  for (const l of todo) perVoice[l.voice] = (perVoice[l.voice] ?? 0) + 1
  console.log(`To record: ${todo.length} clips, ${chars} characters, about ${Math.ceil(cost)} credits`)
  console.table(perVoice)

  if (key) {
    const sub = await credits()
    if (sub) console.log(`Plan: ${sub.tier}, used ${sub.character_count} of ${sub.character_limit} credits this period`)
  }
  if (flag('dry-run') || todo.length === 0) return
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set')

  let done = 0
  try {
    for (const l of todo) {
      const mp3 = await record(l)
      mkdirSync(join(audioDir, l.voice), { recursive: true })
      writeFileSync(join(audioDir, l.voice, `${clipHash(l.voice, l.text)}.mp3`), mp3)
      done++
      if (done % 50 === 0) console.log(`${done}/${todo.length}`)
    }
  } finally {
    const v = writeManifest()
    console.log(`Recorded ${done} clips. Manifest now has`, Object.fromEntries(Object.entries(v).map(([k, h]) => [k, h.length])))
  }
}

main().catch((e) => {
  console.error(String(e))
  process.exit(1)
})
