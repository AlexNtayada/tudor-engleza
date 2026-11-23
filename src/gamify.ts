// Rewards: Ninja's wardrobe, levels, daily chest. No lives, no timers, nothing is ever taken away.
import { UNITS, type Unit } from './content'
import type { Progress } from './progress'

export type Slot = 'head' | 'face' | 'neck' | 'back' | 'hand'

export const SLOTS: { id: Slot; label: string }[] = [
  { id: 'head', label: 'Cap' },
  { id: 'face', label: 'Față' },
  { id: 'neck', label: 'Gât' },
  { id: 'back', label: 'Spate' },
  { id: 'hand', label: 'Mână' },
]

export interface Item {
  id: string
  name: string
  slot: Slot
  price: number
  /** Not for sale: given when the sticker album of this unit is complete. */
  setOf?: string
}

export const ITEMS: Item[] = [
  { id: 'party-hat', name: 'Coif de petrecere', slot: 'head', price: 5 },
  { id: 'bow-tie', name: 'Papion', slot: 'neck', price: 6 },
  { id: 'sunglasses', name: 'Ochelari de soare', slot: 'face', price: 8 },
  { id: 'flower', name: 'Floare', slot: 'head', price: 8 },
  { id: 'scarf', name: 'Fular', slot: 'neck', price: 10 },
  { id: 'cap', name: 'Șapcă', slot: 'head', price: 12 },
  { id: 'star-glasses', name: 'Ochelari-stea', slot: 'face', price: 15 },
  { id: 'crown', name: 'Coroană', slot: 'head', price: 20 },
  { id: 'mustache', name: 'Mustață', slot: 'face', price: 9 },
  { id: 'balloon', name: 'Balon', slot: 'hand', price: 10 },
  { id: 'lollipop', name: 'Acadea', slot: 'hand', price: 12 },
  { id: 'backpack', name: 'Rucsac', slot: 'back', price: 14 },
  { id: 'bunny-ears', name: 'Urechi de iepuraș', slot: 'head', price: 16 },
  { id: 'red-cape', name: 'Pelerină roșie', slot: 'back', price: 18 },
  { id: 'heart-glasses', name: 'Ochelari-inimioară', slot: 'face', price: 18 },
  { id: 'pirate-hat', name: 'Pălărie de pirat', slot: 'head', price: 22 },
  { id: 'medal', name: 'Medalie', slot: 'neck', price: 25 },
  { id: 'star-wand', name: 'Baghetă cu stea', slot: 'hand', price: 25 },
  { id: 'wizard-hat', name: 'Pălărie de vrăjitor', slot: 'head', price: 28 },
  { id: 'wings', name: 'Aripi', slot: 'back', price: 35 },
  // Album rewards (one per unit), never sold.
  { id: 'rainbow-cape', name: 'Pelerină curcubeu', slot: 'back', price: 0, setOf: 'colors' },
  { id: 'cat-ears', name: 'Urechi de pisică', slot: 'head', price: 0, setOf: 'animals' },
  { id: 'rocket-pack', name: 'Rachetă de spate', slot: 'back', price: 0, setOf: 'numbers' },
  { id: 'heart-balloon', name: 'Balon-inimă', slot: 'hand', price: 0, setOf: 'family' },
  { id: 'chef-hat', name: 'Bonetă de bucătar', slot: 'head', price: 0, setOf: 'food' },
  { id: 'super-mask', name: 'Mască de erou', slot: 'face', price: 0, setOf: 'clothes' },
  { id: 'headphones', name: 'Căști', slot: 'head', price: 0, setOf: 'body' },
  { id: 'umbrella', name: 'Umbrelă', slot: 'hand', price: 0, setOf: 'weather' },
  { id: 'house-key', name: 'Cheiță la gât', slot: 'neck', price: 0, setOf: 'house' },
  { id: 'propeller-hat', name: 'Șapcă cu elice', slot: 'head', price: 0, setOf: 'toys' },
  { id: 'pilot-goggles', name: 'Ochelari de pilot', slot: 'face', price: 0, setOf: 'transport' },
  { id: 'giant-pencil', name: 'Creion uriaș', slot: 'hand', price: 0, setOf: 'school' },
  { id: 'butterfly-wings', name: 'Aripi de fluture', slot: 'back', price: 0, setOf: 'nature' },
  { id: 'diving-mask', name: 'Mască de scafandru', slot: 'face', price: 0, setOf: 'ocean' },
  { id: 'explorer-hat', name: 'Pălărie de explorator', slot: 'head', price: 0, setOf: 'jungle' },
  { id: 'bee-antennae', name: 'Antene de albină', slot: 'head', price: 0, setOf: 'bugs' },
  { id: 'watering-can', name: 'Stropitoare', slot: 'hand', price: 0, setOf: 'garden' },
  { id: 'smile-badge', name: 'Insignă cu zâmbet', slot: 'neck', price: 0, setOf: 'feelings' },
  { id: 'gold-cup', name: 'Cupa de campion', slot: 'hand', price: 0, setOf: 'actions' },
  { id: 'fire-helmet', name: 'Cască de pompier', slot: 'head', price: 0, setOf: 'jobs' },
]

export const itemById = (id: string) => ITEMS.find((i) => i.id === id)

/** Stars added on top of the lesson stars when a boss is beaten. */
export const BOSS_BONUS = 5

/**
 * Experience for one play: the base (stars + combos + boss bonus) multiplied by the stars earned,
 * so 1 star gives the base, 2 stars double and 3 stars triple (the parent asked for "3 stars = 3x").
 * A boss that got away still gives just 1 star for trying.
 */
export function xpFor(stars: number, combos: number, boss?: { defeated: boolean }): { base: number; multiplier: number; gained: number } {
  if (boss && !boss.defeated) return { base: 1, multiplier: 1, gained: 1 }
  const multiplier = Math.max(1, stars)
  const base = stars + combos + (boss ? BOSS_BONUS : 0)
  return { base, multiplier, gained: base * multiplier }
}

export function setProgress(p: Progress, unit: Unit): { have: number; total: number } {
  const total = unit.lessons.length
  const have = unit.lessons.filter((l) => p.stickers.includes(l.sticker)).length
  return { have, total }
}

/** Give the album reward of every unit whose stickers are all collected. Returns the new progress and what was given. */
export function claimSetRewards(p: Progress): { progress: Progress; given: Item[] } {
  const given: Item[] = []
  for (const unit of UNITS) {
    const { have, total } = setProgress(p, unit)
    const item = itemById(unit.setReward)
    if (item && have === total && !p.owned.includes(item.id) && !given.includes(item)) given.push(item)
  }
  if (!given.length) return { progress: p, given }
  return { progress: { ...p, owned: [...p.owned, ...given.map((i) => i.id)] }, given }
}

export const STARS_PER_LEVEL = 15
export const CHEST_STARS = 5
export const COMBO_EVERY = 3

export function levelFor(earned: number): number {
  return Math.floor(earned / STARS_PER_LEVEL) + 1
}

/** 0..1 progress inside the current level. */
export function levelProgress(earned: number): number {
  return (earned % STARS_PER_LEVEL) / STARS_PER_LEVEL
}

export function chestAvailable(p: Progress, day: string): boolean {
  return p.lastChest !== day
}

export function buy(p: Progress, item: Item): Progress {
  if (item.setOf || p.owned.includes(item.id) || p.wallet < item.price) return p
  return { ...p, wallet: p.wallet - item.price, owned: [...p.owned, item.id], outfit: { ...p.outfit, [item.slot]: item.id } }
}

export function toggleWear(p: Progress, item: Item): Progress {
  if (!p.owned.includes(item.id)) return p
  const wearing = p.outfit[item.slot] === item.id
  return { ...p, outfit: { ...p.outfit, [item.slot]: wearing ? undefined : item.id } }
}

/** Days in a row with a finished lesson, ending today (or yesterday, so the streak isn't lost before today's lesson). */
export function streakDays(daysPlayed: string[], now = new Date()): number {
  const played = new Set(daysPlayed)
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const d = new Date(now)
  if (!played.has(key(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (played.has(key(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
