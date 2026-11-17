import { mascot } from '../mascots'
// Speech-therapy content (in Romanian) for the sounds R and L.
// Playful practice at home; it complements, never replaces, a speech therapist.

export type SoundId = 'r' | 'l'
export type Position = 'start' | 'middle' | 'end'
export type ActivityId = 'warmup' | 'sound' | 'syllables' | 'words' | 'listen'

export type MouthAnim = 'smile-kiss' | 'lick' | 'clock' | 'lips' | 'horse' | 'woodpecker' | 'painter' | 'swing'

export interface Exercise {
  id: MouthAnim
  name: string
  emoji: string
  /** What Ninja says (and the bubble shows). */
  say: string
  count: number
}

export interface SpeechWord {
  text: string
  emoji: string
  /** Syllables separated by "-", for the slow (turtle) button. */
  syl: string
  /** Leave out of the listening game when the "silly" version is a real word (cal → cai). */
  noListen?: boolean
}

export interface SoundInfo {
  id: SoundId
  letter: string
  title: string
  /** Long sound for the "hold the sound" game. */
  long: string
  vehicle: string
  goal: string
  vehicleName: string
  color: string
  colorDark: string
  exercises: Exercise[]
  rows: { name: string; items: string[] }[]
  words: Record<Position, SpeechWord[]>
  tips: string[]
}

const EX: Record<MouthAnim, Exercise> = {
  'smile-kiss': {
    id: 'smile-kiss',
    name: 'Zâmbet și pupic',
    emoji: '😁',
    say: 'Zâmbește larg, apoi fă un pupic. Zâmbet, pupic!',
    count: 5,
  },
  lick: {
    id: 'lick',
    name: 'Pisica bea lapte',
    emoji: '🐱',
    say: 'Scoate limba ca pisica și linge sus și jos.',
    count: 5,
  },
  clock: {
    id: 'clock',
    name: 'Ceasul',
    emoji: '⏰',
    say: 'Scoate limba și mișc-o stânga, dreapta, ca un ceas. Tic, tac!',
    count: 6,
  },
  lips: {
    id: 'lips',
    name: 'Mustața de ciocolată',
    emoji: '🍫',
    say: 'Linge buzele de jur împrejur, ca după o înghețată.',
    count: 4,
  },
  horse: {
    id: 'horse',
    name: 'Căluțul',
    emoji: '🐴',
    say: 'Lipește limba sus, de cerul gurii, și dă-i drumul: clop, clop!',
    count: 6,
  },
  woodpecker: {
    id: 'woodpecker',
    name: 'Ciocănitoarea',
    emoji: '🐦',
    say: 'Gura deschisă. Bate repede cu vârful limbii sus, după dinți: d, d, d, d!',
    count: 5,
  },
  painter: {
    id: 'painter',
    name: 'Pictorul',
    emoji: '🖌️',
    say: 'Gura deschisă. Cu vârful limbii, vopsește cerul gurii, de la dinți spre spate.',
    count: 5,
  },
  swing: {
    id: 'swing',
    name: 'Leagănul',
    emoji: '🎠',
    say: 'Gura deschisă. Vârful limbii urcă la dinții de sus, apoi coboară la dinții de jos.',
    count: 6,
  },
}

const w = (text: string, emoji: string, syl: string, noListen = false): SpeechWord => ({ text, emoji, syl, noListen })

export const SOUNDS: Record<SoundId, SoundInfo> = {
  r: {
    id: 'r',
    letter: 'R',
    title: 'Motorașul',
    long: 'rrrrrr',
    vehicle: '🏍️',
    goal: '🏁',
    vehicleName: 'motorașul',
    color: '#ff8a3d',
    colorDark: '#c95c14',
    exercises: [EX['smile-kiss'], EX.lick, EX.clock, EX.horse, EX.painter, EX.woodpecker],
    rows: [
      { name: 'Silabe', items: ['RA', 'RE', 'RI', 'RO', 'RU', 'RĂ'] },
      { name: 'Între vocale', items: ['ARA', 'ERE', 'IRI', 'ORO', 'URU'] },
      { name: 'La sfârșit', items: ['AR', 'ER', 'IR', 'OR', 'UR'] },
      { name: 'Trenul cu D', items: ['DRA', 'DRE', 'DRI', 'DRO', 'DRU'] },
    ],
    words: {
      start: [
        w('rață', '🦆', 'ra-ță'),
        w('rac', '🦞', 'rac'),
        w('robot', '🤖', 'ro-bot'),
        w('rachetă', '🚀', 'ra-che-tă'),
        w('rucsac', '🎒', 'ruc-sac'),
        w('rochie', '👗', 'ro-chi-e'),
        w('roșie', '🍅', 'ro-și-e'),
        w('rege', '🤴', 're-ge'),
      ],
      middle: [
        w('pară', '🍐', 'pa-ră'),
        w('mare', '🌊', 'ma-re'),
        w('soare', '☀️', 'soa-re'),
        w('ureche', '👂', 'u-re-che'),
        w('coroană', '👑', 'co-roa-nă'),
        w('morcov', '🥕', 'mor-cov'),
        w('vioară', '🎻', 'vi-oa-ră'),
      ],
      end: [
        w('nor', '☁️', 'nor'),
        w('zar', '🎲', 'zar'),
        w('măr', '🍎', 'măr'),
        w('pahar', '🥛', 'pa-har'),
        w('tractor', '🚜', 'trac-tor'),
        w('dinozaur', '🦕', 'di-no-za-ur'),
      ],
    },
    tips: [
      'Pentru R, vârful limbii stă sus, în spatele dinților de sus, și vibrează când trece aerul. Când Tudor spune „i” în loc de „r”, limba lui rămâne jos.',
      'Un truc des folosit: „d-d-d-d” spus foarte repede, cu gura deschisă, apoi suflat mai tare, „d-d-drrr”. Exercițiul „Ciocănitoarea” și „Trenul cu D” fac exact asta.',
      'R între vocale („a-ra”, „o-ro”) e de obicei mai ușor decât la începutul cuvântului. Dacă merge acolo, e un semn foarte bun.',
    ],
  },
  l: {
    id: 'l',
    letter: 'L',
    title: 'Cântecul',
    long: 'llllll',
    vehicle: '🐦',
    goal: '🌳',
    vehicleName: 'păsărica',
    color: '#1fa596',
    colorDark: '#137a6e',
    exercises: [EX['smile-kiss'], EX.lips, EX.clock, EX.horse, EX.swing, EX.painter],
    rows: [
      { name: 'Silabe', items: ['LA', 'LE', 'LI', 'LO', 'LU', 'LĂ'] },
      { name: 'Între vocale', items: ['ALA', 'ELE', 'ILI', 'OLO', 'ULU'] },
      { name: 'La sfârșit', items: ['AL', 'EL', 'IL', 'OL', 'UL'] },
    ],
    words: {
      start: [
        w('lup', '🐺', 'lup'),
        w('lună', '🌙', 'lu-nă'),
        w('leu', '🦁', 'leu'),
        w('lapte', '🥛', 'lap-te'),
        w('lămâie', '🍋', 'lă-mâ-ie'),
        w('lalea', '🌷', 'la-lea'),
        w('lebădă', '🦢', 'le-bă-dă'),
      ],
      middle: [
        w('balon', '🎈', 'ba-lon'),
        w('melc', '🐌', 'melc'),
        w('elefant', '🐘', 'e-le-fant'),
        w('delfin', '🐬', 'del-fin'),
        w('salată', '🥗', 'sa-la-tă'),
        w('ciocolată', '🍫', 'cio-co-la-tă'),
        w('telefon', '📱', 'te-le-fon'),
      ],
      end: [
        w('cal', '🐴', 'cal', true),
        w('cățel', '🐶', 'că-țel', true),
        w('fotbal', '⚽', 'fot-bal'),
        w('castel', '🏰', 'cas-tel'),
        w('inel', '💍', 'i-nel'),
        w('spital', '🏥', 'spi-tal'),
      ],
    },
    tips: [
      'Pentru L, vârful limbii se lipește sus, în spatele dinților de sus, iar aerul iese pe lângă limbă. Când Tudor spune „i” în loc de „l”, limba lui stă jos.',
      'Cereți-i un „llll” lung cu limba sus, la oglindă, apoi „la-la-la” ca un cântec. Abia după aceea treceți la cuvinte.',
      'Exercițiul „Leagănul” (limba sus la dinți, jos la dinți) îl ajută să simtă unde trebuie să stea limba.',
    ],
  },
}

export const COMMON_TIPS = [
  'Puțin și des: 5–10 minute pe zi ajută mai mult decât o oră o dată pe săptămână.',
  'Lucrați în fața oglinzii (butonul 🪞), ca Tudor să-și vadă limba și buzele.',
  'Nu-i spuneți „nu e bine”. Repetați voi cuvântul corect, cu voce caldă: „Da, o rață!” și lăudați încercarea.',
  'Mergeți în ordine: încălzirea gurii, sunetul singur, silabe, apoi cuvinte. Dacă un pas e greu, întoarceți-vă la cel dinainte.',
]

export const POSITIONS: { id: Position; label: string; mark: (l: string) => string }[] = [
  { id: 'start', label: 'La început', mark: (l) => `${l}__` },
  { id: 'middle', label: 'La mijloc', mark: (l) => `_${l}_` },
  { id: 'end', label: 'La sfârșit', mark: (l) => `__${l}` },
]

export const ACTIVITIES: { id: ActivityId; name: string; emoji: (s: SoundInfo) => string; hint: string }[] = [
  { id: 'warmup', name: 'Gimnastica limbii', emoji: () => '👅', get hint() { return `Imită gura lui ${mascot().name}` } },
  { id: 'sound', name: 'Sunetul', emoji: (s) => s.vehicle, hint: 'Ține sunetul lung' },
  { id: 'syllables', name: 'Trenul silabelor', emoji: () => '🚂', hint: 'ra, re, ri…' },
  { id: 'words', name: 'Cuvinte', emoji: () => '🖼️', hint: 'La început, mijloc, sfârșit' },
  { id: 'listen', name: 'Urechiușa', emoji: () => '👂', get hint() { return `A greșit ${mascot().name}?` } },
]

/** The way Tudor sometimes says it: the sound replaced by "i" (rață → iață). */
export function sillyForm(word: string, sound: SoundId): string {
  return word.replace(new RegExp(sound, 'g'), 'i')
}

/** Where in the word the sound sits. */
export function positionOf(word: string, sound: SoundId): Position | undefined {
  const i = word.indexOf(sound)
  if (i === -1) return undefined
  if (i === 0) return 'start'
  if (word.lastIndexOf(sound) === word.length - 1) return 'end'
  return 'middle'
}

export interface ListenRound {
  word: SpeechWord
  silly: boolean
}

/** Listening game: half the time Ninja says it right, half the time the "silly" way. */
export function buildListenRounds(sound: SoundId, n: number, rnd: () => number = Math.random): ListenRound[] {
  const all = Object.values(SOUNDS[sound].words)
    .flat()
    .filter((x) => !x.noListen)
  const pool = [...all].sort(() => rnd() - 0.5).slice(0, n)
  const sillyCount = Math.round(pool.length / 2)
  const flags = pool.map((_, i) => i < sillyCount).sort(() => rnd() - 0.5)
  return pool.map((word, i) => ({ word, silly: flags[i] }))
}

export const RO_NUMBERS = ['unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă', 'zece']
