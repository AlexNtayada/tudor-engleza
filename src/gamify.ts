// Rewards: Ninja's wardrobe, levels, daily chest. No lives, no timers, nothing is ever taken away.
import type { Progress } from './progress'

export type Slot = 'head' | 'face' | 'neck'

export interface Item {
  id: string
  name: string
  slot: Slot
  price: number
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
]

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
  if (p.owned.includes(item.id) || p.wallet < item.price) return p
  return { ...p, wallet: p.wallet - item.price, owned: [...p.owned, item.id], outfit: { ...p.outfit, [item.slot]: item.id } }
}

export function toggleWear(p: Progress, item: Item): Progress {
  if (!p.owned.includes(item.id)) return p
  const wearing = p.outfit[item.slot] === item.id
  return { ...p, outfit: { ...p.outfit, [item.slot]: wearing ? undefined : item.id } }
}
