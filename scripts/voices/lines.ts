// Every line the app speaks, grouped by voice. Mirrors the speak() calls in src/: when you add a new
// spoken line in the app, add it here too, then run the generator (it only records what is new).
// Lines missing a clip still work: the browser voice reads them.

import { UNITS } from '../../src/content'
import { BOSSES } from '../../src/components/Boss'
import { MASCOTS, type MascotInfo } from '../../src/mascots'
import { PACKS } from '../../src/propozitii/data'
import { splitAtKey } from '../../src/propozitii/lessons'
import { RO_NUMBERS, SOUNDS, SOUND_SAY, sillyForm } from '../../src/logopedie/data'
import { normalize } from '../../src/clips'

export interface Line {
  voice: string
  lang: 'en' | 'ro'
  text: string
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** English words and sentences, read by the American word voice. */
function wordLines(englishInstructions: boolean): string[] {
  const out: string[] = []
  for (const u of UNITS)
    for (const w of u.words) {
      out.push(w.say, `I want ${w.say}!`, `I need my ${w.say}!`)
    }
  // Only the games that use these phrases need them; keep the list tight to save credits.
  const feedOrDress = new Set<string>()
  for (const u of UNITS) {
    const wantsFeed = u.games.includes('feed')
    const wantsDress = u.games.includes('dress')
    for (const w of u.words) {
      if (wantsFeed) feedOrDress.add(`I want ${w.say}!`)
      if (wantsDress) feedOrDress.add(`I need my ${w.say}!`)
    }
  }
  const filtered = out.filter((t) => !/^I (want|need my) /.test(t) || feedOrDress.has(t))
  for (const p of PACKS)
    for (const s of p.sentences) {
      const { before, after } = splitAtKey(s)
      filtered.push(s.text, s.key, `${before}... hmm?`)
      if (after) filtered.push(after)
    }
  if (englishInstructions) filtered.push(...englishInstructionLines())
  return filtered
}

/** The English versions of the instructions (only used when a parent switches instructions to English). */
function englishInstructionLines(): string[] {
  const out = [
    'Pick a friend!', 'Pick a game!', 'First a lesson on the map!', 'Not yet. This lesson first.', "Let's learn English!",
    'Now you say it!', 'Your turn:', 'Try again!', 'Again:', 'Listen!', 'Find the picture:', 'What is missing?', 'Is it true?',
    "Let's make sentences!", "I'm hungry!", 'Dress me up!', "Let's try again!", 'You won!', 'A present!', 'New level!',
    'A treasure chest!', 'New sticker!', 'A little break?', "It's a present. Collect the stickers!", 'Collect more stars!',
  ]
  for (const u of UNITS)
    for (const w of u.words) out.push(`This is ${w.say}.`, `Where is ${w.say}?`, `Pop the balloon with ${w.say}!`)
  for (const m of MASCOTS) out.push(`I'm ${m.name}!`)
  for (const b of Object.values(BOSSES)) out.push(`Here comes ${b.name}!`)
  return out
}

/** Short English cheers said by the friend, in the friend's own voice. */
function friendEnglish(m: MascotInfo): string[] {
  return [
    'Hello.', 'Yes!', 'No!', 'Perfect!', 'Yummy!', 'Not that one!', 'You won!',
  ]
}

/**
 * Romanian lines said by the friend: instructions, praise and the whole speech-therapy module.
 * Keep them short and simple: a few everyday words a five-year-old understands.
 */
function friendRomanian(m: MascotInfo): string[] {
  const out = [
    'Alege un prieten!', 'Hai să învățăm engleză.', 'Alege un joc!', 'Întâi o lecție pe hartă!', `Eu sunt ${m.title}!`,
    'Încă nu. Întâi lecția asta.',
    'Spune și tu!', 'Spune tu:', 'Unde e', 'Sparge balonul cu', 'Mai încearcă!', 'Mi-e foame!', 'Mă îmbraci?', 'Încă o dată:',
    'Alege poza:', 'Ce lipsește?', 'E adevărat?', 'Hai la propoziții!',
    'Mai încercăm!', 'Ai câștigat!', 'Ai un cadou!', 'Nivel nou!', 'Un cufăr!', 'Abțibild nou!', 'Facem o pauză?',
    'E un cadou. Strânge abțibildurile!', 'Mai strânge stele!',
  ]
  for (const u of UNITS) for (const w of u.words) out.push(`${cap(w.ro)}. În engleză:`)
  for (const p of PACKS) for (const s of p.sentences) out.push(`${s.ro} În engleză:`)
  for (const b of Object.values(BOSSES)) out.push(`A venit ${b.name}!`)

  // Speech therapy (Romanian only).
  out.push(
    'Hai la sunete!', 'Motorașul: rrrr!', 'Cântecul: la, la, la!',
    'Bravo!', 'Bravo! Încă o dată!', 'Spune după mine:', 'Tu-tuuu! Bravo!', 'Ascultă bine!',
    'Exact! Corect e:', 'Da, e bine:', 'Am zis', 'Corect e:', 'Am zis bine:',
    ...RO_NUMBERS,
  )
  for (const say of Object.values(SOUND_SAY)) out.push(say.ask, say.goal)
  for (const s of Object.values(SOUNDS)) {
    for (const ex of s.exercises) out.push(ex.say)
    for (const row of s.rows) for (const item of row.items) out.push(item.toLowerCase())
    for (const w of Object.values(s.words).flat()) {
      out.push(w.text, ...w.syl.split('-'))
      if (!w.noListen) out.push(sillyForm(w.text, s.id))
    }
  }
  return out
}

export function collectLines(opts: { englishInstructions?: boolean } = {}): Line[] {
  const seen = new Set<string>()
  const lines: Line[] = []
  const add = (voice: string, lang: Line['lang'], text: string) => {
    const t = normalize(text)
    if (!t) return
    const key = `${voice}|${t}`
    if (seen.has(key)) return
    seen.add(key)
    lines.push({ voice, lang, text: t })
  }
  for (const t of wordLines(!!opts.englishInstructions)) add('en', 'en', t)
  for (const m of MASCOTS) {
    for (const t of friendEnglish(m)) add(m.id, 'en', t)
    for (const t of friendRomanian(m)) add(m.id, 'ro', t)
  }
  return lines
}
