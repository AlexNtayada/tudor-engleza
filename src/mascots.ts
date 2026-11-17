// The friend the child plays with. Picked once in the intro, changeable later from the friend's page
// or the Parents area. Every mascot shares the same body layout, so wardrobe items fit all of them.

export type MascotId = 'ninja' | 'rici' | 'pip' | 'bobo' | 'bip' | 'zuzu'

export interface MascotInfo {
  id: MascotId
  /** Short name used in sentences ("Pip e flămândă"). */
  name: string
  /** Full name used for introductions ("Vulpița Pip"). */
  title: string
  /** Romanian grammar: feminine adjectives and pronouns. */
  fem: boolean
  /** One line for the picker card. */
  blurb: string
  /** What the friend says when picked (English). */
  hello: string
  /** Main colour, used for the picker card. */
  color: string
}

export const MASCOTS: MascotInfo[] = [
  { id: 'ninja', name: 'Ninja', title: 'Ninja', fem: false, blurb: 'Rapid și curajos', hello: "Hi! I'm Ninja!", color: '#1f9e8f' },
  { id: 'pip', name: 'Pip', title: 'Vulpița Pip', fem: true, blurb: 'Isteață și jucăușă', hello: "Hi! I'm Pip!", color: '#ff8a3d' },
  { id: 'bobo', name: 'Bobo', title: 'Ursulețul Bobo', fem: false, blurb: 'Pufos și blând', hello: "Hi! I'm Bobo!", color: '#b9824f' },
  { id: 'rici', name: 'Rici', title: 'Ariciul Rici', fem: false, blurb: 'Mic, dar țepos', hello: "Hi! I'm Rici!", color: '#9a6a45' },
  { id: 'bip', name: 'Bip', title: 'Robo Bip', fem: false, blurb: 'Știe toate butoanele', hello: "Beep boop! I'm Bip!", color: '#4a9ab8' },
  { id: 'zuzu', name: 'Zuzu', title: 'Dragonița Zuzu', fem: true, blurb: 'Zboară și scuipă scântei', hello: "Hi! I'm Zuzu!", color: '#3fae55' },
]

export function mascotById(id: string | undefined): MascotInfo {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0]
}

// The app re-renders from the top whenever progress changes, so the active mascot is kept here and
// set by App before rendering; plain functions that build spoken sentences can read it too.
let active: MascotInfo = MASCOTS[0]

export function setActiveMascot(id: string | undefined) {
  active = mascotById(id)
}

/** The mascot the child picked. */
export function mascot(): MascotInfo {
  return active
}

/** Pick the masculine or feminine form for the active mascot ("flămând" / "flămândă"). */
export function g(masc: string, fem: string): string {
  return active.fem ? fem : masc
}
