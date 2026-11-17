// Voice Design: lets ElevenLabs invent a new voice from a description, so each friend can sound
// like a cartoon character instead of a stock narrator.
//
//   npx vite-node scripts/voices/design.ts -- design ninja "Playful young cartoon ninja..."
//       → 3 previews per description in auditions/ninja/*.mp3 (+ ids in auditions/ninja/previews.json)
//   npx vite-node scripts/voices/design.ts -- save ninja <generated_voice_id>
//       → saves that preview as a voice on the account and puts it in voices.json for "ninja"

import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mascotById } from '../../src/mascots'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const API = 'https://api.elevenlabs.io/v1'
const key = process.env.ELEVENLABS_API_KEY?.trim()
if (!key) throw new Error('ELEVENLABS_API_KEY is not set')

async function post(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'xi-api-key': key!, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res
}

async function postOk(paths: string[], body: unknown) {
  let last = ''
  for (const p of paths) {
    const res = await post(p, body)
    if (res.ok) return res.json()
    last = `${res.status} ${p}: ${(await res.text()).slice(0, 400)}`
    if (res.status !== 404 && res.status !== 405 && res.status !== 422) break
  }
  throw new Error(last)
}

const sampleText = (id: string) => {
  const m = mascotById(id)
  return `Salut, Tudor! Eu sunt ${m.title}! Hai să învățăm engleză împreună. Ascultă bine: apple! Bravo, ai spus perfect! Mai încercăm o dată? Hai, că ne distrăm!`
}

async function design(id: string, descriptions: string[]) {
  const dir = join(root, 'auditions', id)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const index: { file: string; generated_voice_id: string; description: string }[] = []
  let n = 0
  for (const description of descriptions) {
    const body = { voice_description: description, text: sampleText(id), model_id: 'eleven_ttv_v3', guidance_scale: 5 }
    let data: { previews: { audio_base_64: string; generated_voice_id: string }[] }
    try {
      data = await postOk(['/text-to-voice/design'], body)
    } catch (e) {
      console.log('v3 design failed, trying the older endpoint:', String(e).slice(0, 200))
      data = await postOk(['/text-to-voice/create-previews'], { voice_description: description, text: sampleText(id) })
    }
    for (const p of data.previews) {
      n++
      const file = `${id}-${n}.mp3`
      writeFileSync(join(dir, file), Buffer.from(p.audio_base_64, 'base64'))
      index.push({ file, generated_voice_id: p.generated_voice_id, description })
      console.log(`${file}  ${p.generated_voice_id}`)
    }
  }
  writeFileSync(join(dir, 'previews.json'), JSON.stringify(index, null, 2) + '\n')
}

async function save(id: string, generated: string) {
  const m = mascotById(id)
  const prevFile = join(root, 'auditions', id, 'previews.json')
  const prev = existsSync(prevFile) ? (JSON.parse(readFileSync(prevFile, 'utf8')) as { generated_voice_id: string; description: string }[]) : []
  const description = prev.find((p) => p.generated_voice_id === generated)?.description ?? `Tudoo! ${m.title}`
  const body = { voice_name: `Tudoo ${m.title}`, voice_description: description.slice(0, 1000), generated_voice_id: generated }
  const voice = (await postOk(['/text-to-voice', '/text-to-voice/create-voice-from-preview'], body)) as { voice_id: string }
  const cfgFile = join(here, 'voices.json')
  const cfg = JSON.parse(readFileSync(cfgFile, 'utf8'))
  cfg.voices[id] = { name: `${m.title} (Voice Design)`, voiceId: voice.voice_id }
  writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + '\n')
  // The old clips were made with the previous voice: drop them so the next run records them again.
  rmSync(join(root, 'public', 'audio', id), { recursive: true, force: true })
  const manFile = join(root, 'public', 'audio', 'manifest.json')
  const man = JSON.parse(readFileSync(manFile, 'utf8'))
  delete man.voices[id]
  writeFileSync(manFile, JSON.stringify(man) + '\n')
  console.log(`Saved ${m.title} as ${voice.voice_id}`)
}

const [cmd, id, ...rest] = process.argv.slice(2).filter((a) => a !== '--')
if (cmd === 'design') await design(id, rest.join(' ').split('||').map((s) => s.trim()).filter(Boolean))
else if (cmd === 'save') await save(id, rest[0])
else throw new Error('usage: design <friend> "<description>||<description>" | save <friend> <generated_voice_id>')
