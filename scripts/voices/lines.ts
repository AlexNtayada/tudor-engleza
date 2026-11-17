// Every line the app speaks, grouped by voice. Mirrors the speak() calls in src/: when you add a new
// spoken line in the app, add it here too, then run the generator (it only records what is new).
// Lines missing a clip still work: the browser voice reads them.

import { UNITS } from '../../src/content'
import { BOSSES } from '../../src/components/Boss'
import { MASCOTS, type MascotInfo } from '../../src/mascots'
import { PACKS } from '../../src/propozitii/data'
import { splitAtKey } from '../../src/propozitii/lessons'
import { RO_NUMBERS, SOUNDS, SOUND_SAY, sillyForm } from '../../src/logopedie/data'
import { ITEMS } from '../../src/gamify'
import { normalize } from '../../src/clips'

export interface Line {
  voice: string
  lang: 'en' | 'ro'
  text: string
}

const CHILD = 'Tudor'
const MAX_LEVEL = 40
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
    'Pick a friend!', 'Pick a game!', 'Finish the first lesson on the map to open the games!', 'Not yet! First the lesson next to me.', 'Do you want to play with me?', "Let's learn English!",
    'Now you say it!', 'Now you say it:', 'Try again!', 'Good try! Say it with me:', 'Listen!', 'Listen and find the picture:',
    'What is missing?', 'Listen! Is it true?', "Let's say whole sentences!", 'You passed the test!',
    'You got a new sticker!', 'Look, a treasure chest! Open it!', 'You worked hard. Do you want a little break?',
    'This one is a present! Collect all the stickers.', 'Collect more stars!', 'Answer right the first time to win!',
  ]
  for (const u of UNITS)
    for (const w of u.words)
      out.push(`This is ${w.say}.`, `Where is ${w.say}?`, `Who is it? Where is ${w.say}?`, `Pop the balloon with ${w.say}!`)
  for (const m of MASCOTS) {
    out.push(`${m.name} is hungry!`, `${m.name} wants to get dressed!`, `Hi! I am ${m.name}.`)
    out.push(`Album complete! A present for ${m.name}!`)
    for (let l = 2; l <= MAX_LEVEL; l++) out.push(`Hooray! ${m.name} is now level ${l}!`)
  }
  for (const b of Object.values(BOSSES))
    out.push(`Here comes ${b.name}! Answer right the first time to win!`, `${b.name} got away this time. Let's practice and try again!`)
  return out
}

/** Short English cheers said by the friend, in the friend's own voice. */
function friendEnglish(m: MascotInfo): string[] {
  return [
    m.hello, 'Hello.', `Good try, ${CHILD}!`, `Great job, ${CHILD}!`,
    'Great job!', 'Yes!', 'Awesome!', 'Super!', 'Well done!', 'Perfect!', 'Super combo!', 'Thank you!', 'Yummy!',
    'Not that one!', 'No, thank you!', 'Wow! Thank you!', 'Hooray! You beat the boss!', 'Yes! That is right!', "No! It's not.",
  ]
}

/** Romanian lines said by the friend: instructions, praise and the whole speech-therapy module. */
function friendRomanian(m: MascotInfo): string[] {
  const g = (masc: string, fem: string) => (m.fem ? fem : masc)
  const out = [
    'Alege-ți un prieten!', 'Hai să învățăm engleză.', 'Alege un joc!',
    'Termină prima lecție de pe hartă și aici se deschid jocurile!',
    `Eu sunt ${m.title}. ${m.blurb}!`, `Salut! Eu sunt ${m.title}.`,
    'Încă nu! Mai întâi lecția de lângă mine.',
    'Spune și tu!', 'Acum spune tu:', 'Unde este', 'Cine e la fereastră? Unde este', 'Sparge balonul cu', 'Mai încearcă!',
    `${m.name} e ${g('flămând', 'flămândă')}! Dă-i ce cere.`, `${m.name} vrea să se îmbrace! Dă-i ce cere.`,
    'Bravo! Încă o dată, cu mine:',
    'Ascultă și alege poza:', 'Ce cuvânt lipsește?', 'Ascultă! Este adevărat?',
    'Hai să spunem propoziții întregi, ca un ninja adevărat!',
    `Album complet! Ai primit un cadou pentru ${m.name}!`, `Ura! ${m.name} a crescut!`,
    'Bravo! Ai câștigat un abțibild nou!', 'Uite, un cufăr! Deschide-l!', 'Ai lucrat frumos. Vrei o mică pauză?',
  ]
  for (let l = 2; l <= MAX_LEVEL; l++) out.push(`Nivelul ${l}!`)
  for (const u of UNITS) for (const w of u.words) out.push(`${cap(w.ro)}. În engleză se spune:`)
  for (const p of PACKS) for (const s of p.sentences) out.push(`${s.ro} În engleză spunem:`)
  for (const b of Object.values(BOSSES)) {
    out.push(
      `A venit ${b.name}, ${b.title}! ${b.taunt} Răspunde bine din prima ca să-l învingi!`,
      `L-ai învins pe ${b.name}!`,
      `${b.name} a scăpat de data asta. Mai exersăm puțin și îl prindem!`,
      `Ai trecut testul! ${b.name} a fost învins!`,
    )
  }
  for (const item of ITEMS) {
    if (item.setOf) {
      const unit = UNITS.find((u) => u.id === item.setOf)
      out.push(`Acesta e un cadou! Strânge toate abțibildurile de la ${unit?.title ?? ''}.`)
    }
  }
  const maxPrice = Math.max(...ITEMS.map((i) => i.price))
  for (let n = 1; n <= maxPrice; n++) out.push(`Mai adună ${n} stele!`)

  // Speech therapy (Romanian only).
  out.push(
    `Salut, ${CHILD}! Hai să ne jucăm cu sunetele!`, `Bravo, ${CHILD}!`, 'Motorașul: rrrr!', 'Cântecul: la, la, la!',
    'Bravo!', 'Bravo! Încă o dată!', 'Spune după mine:', 'Tu-tuuu! Bravo!', 'Ascultă bine!', 'Corect este:',
    `Exact! ${m.name} a greșit. Corect este:`, `Da! ${m.name} a spus bine:`, `Ascultă: ${m.name} a zis`, `${m.name} a spus bine:`,
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
