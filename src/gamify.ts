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
]

export const itemById = (id: string) => ITEMS.find((i) => i.id === id)

/** Stars added on top of the lesson stars when a boss is beaten. */
export const BOSS_BONUS = 5

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
