// "Apără castelul": a tiny tower-defense game. Enemies walk down a path from a cave towards the
// castle; every right answer earns a coin, and coins send friends up the path to stop them.
// This file holds only the rules (no drawing), so they can be tested.

import { UNITS, type Unit, type Word } from '../content'
import { learnedWordIds, type Progress } from '../progress'

/** The board is drawn in a 400 x 640 box; the path runs from the cave (top) to the castle gate (bottom). */
export const BOARD = { w: 400, h: 640 }
export const PATH: [number, number][] = [
  [200, 92],
  [200, 150],
  [128, 200],
  [128, 280],
  [272, 340],
  [272, 410],
  [200, 455],
  [200, 512],
]

const segLen = PATH.slice(1).map(([x, y], i) => Math.hypot(x - PATH[i][0], y - PATH[i][1]))
export const PATH_LEN = segLen.reduce((a, b) => a + b, 0)

/** Board point at distance `s` along the path (0 = cave, PATH_LEN = castle gate). */
export function pointAt(s: number): { x: number; y: number } {
  let d = Math.max(0, Math.min(PATH_LEN, s))
  for (let i = 0; i < segLen.length; i++) {
    if (d <= segLen[i] || i === segLen.length - 1) {
      const t = segLen[i] ? Math.min(1, d / segLen[i]) : 0
      const [ax, ay] = PATH[i]
      const [bx, by] = PATH[i + 1]
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t }
    }
    d -= segLen[i]
  }
  return { x: PATH[0][0], y: PATH[0][1] }
}

export type EnemyKind = 'slime' | 'bat' | 'rock' | 'boss'
export type AllyKind = 'archer' | 'knight' | 'dragon'

export const ENEMIES: Record<EnemyKind, { hp: number; speed: number; name: string }> = {
  slime: { hp: 1, speed: 13, name: 'Gelatinel' },
  bat: { hp: 2, speed: 17, name: 'Liliecel' },
  rock: { hp: 4, speed: 9, name: 'Bolovănel' },
  boss: { hp: 8, speed: 7, name: 'Șeful' },
}

export const ALLIES: Record<AllyKind, { cost: number; power: number; speed: number; name: string }> = {
  archer: { cost: 1, power: 1, speed: 70, name: 'Arcașul' },
  knight: { cost: 2, power: 3, speed: 55, name: 'Cavalerul' },
  dragon: { cost: 3, power: 6, speed: 95, name: 'Dragonelul' },
}
export const ALLY_ORDER: AllyKind[] = ['archer', 'knight', 'dragon']

/** Who comes out of the cave in each wave. The last wave ends with a boss. */
export const WAVES: EnemyKind[][] = [
  ['slime', 'slime', 'slime'],
  ['slime', 'bat', 'slime', 'slime'],
  ['slime', 'bat', 'slime', 'bat', 'slime'],
  ['bat', 'slime', 'rock', 'slime', 'bat'],
  ['slime', 'bat', 'slime', 'rock', 'boss'],
]
/** Seconds between two enemies leaving the cave. */
export const SPAWN_EVERY = 6
export const CASTLE_HP = 5
export const START_COINS = 2

export interface Enemy {
  id: number
  kind: EnemyKind
  hp: number
  s: number
  /** Seconds left of the "ouch" flash. */
  hurt: number
}

export interface Ally {
  id: number
  kind: AllyKind
  power: number
  s: number
}

export type Phase = 'ready' | 'wave' | 'between' | 'won' | 'lost'

export type GameEvent =
  | { type: 'hit'; x: number; y: number }
  | { type: 'defeat'; x: number; y: number; kind: EnemyKind }
  | { type: 'castle' }
  | { type: 'waveDone' }
  | { type: 'won' }
  | { type: 'lost' }

export interface Game {
  wave: number
  phase: Phase
  enemies: Enemy[]
  allies: Ally[]
  /** Enemies of this wave still in the cave. */
  queue: EnemyKind[]
  spawnIn: number
  castle: number
  coins: number
  nextId: number
  /** Enemies stopped so far (for the result screen). */
  stopped: number
}

export function newGame(): Game {
  return {
    wave: 0,
    phase: 'ready',
    enemies: [],
    allies: [],
    queue: [],
    spawnIn: 0,
    castle: CASTLE_HP,
    coins: START_COINS,
    nextId: 1,
    stopped: 0,
  }
}

/** Open the cave: the next wave starts walking. */
export function startWave(g: Game): Game {
  if (g.phase !== 'ready' && g.phase !== 'between') return g
  return { ...g, phase: 'wave', queue: [...WAVES[g.wave]], spawnIn: 1 }
}

export function canSend(g: Game, kind: AllyKind): boolean {
  return g.coins >= ALLIES[kind].cost && g.phase !== 'won' && g.phase !== 'lost'
}

/** Spend coins and send a friend out of the castle gate, up the path. */
export function send(g: Game, kind: AllyKind): Game {
  if (!canSend(g, kind)) return g
  const a = ALLIES[kind]
  return {
    ...g,
    coins: g.coins - a.cost,
    allies: [...g.allies, { id: g.nextId, kind, power: a.power, s: PATH_LEN }],
    nextId: g.nextId + 1,
  }
}

export function earn(g: Game, coins = 1): Game {
  if (g.phase === 'won' || g.phase === 'lost') return g
  return { ...g, coins: g.coins + coins }
}

/** Move everything forward by `dt` seconds. Returns the new game and what happened (for sounds). */
export function step(g: Game, dt: number): { game: Game; events: GameEvent[] } {
  if (g.phase !== 'wave' && g.allies.length === 0) return { game: g, events: [] }
  const events: GameEvent[] = []
  let { queue, spawnIn, nextId, castle, stopped } = g
  let enemies = g.enemies.map((e) => ({ ...e, hurt: Math.max(0, e.hurt - dt) }))
  let allies = g.allies.map((a) => ({ ...a }))

  if (g.phase === 'wave' && queue.length) {
    spawnIn -= dt
    if (spawnIn <= 0) {
      const [kind, ...rest] = queue
      enemies.push({ id: nextId++, kind, hp: ENEMIES[kind].hp, s: 0, hurt: 0 })
      queue = rest
      spawnIn = SPAWN_EVERY
    }
  }

  for (const e of enemies) e.s += ENEMIES[e.kind].speed * dt
  for (const a of allies) a.s -= ALLIES[a.kind].speed * dt

  // A friend meets the enemy closest to the castle that is at (or past) its spot on the path.
  for (const a of allies) {
    while (a.power > 0) {
      const target = enemies
        .filter((e) => e.hp > 0 && e.s >= a.s - 4)
        .sort((x, y) => y.s - x.s)[0]
      if (!target) break
      const dmg = Math.min(a.power, target.hp)
      target.hp -= dmg
      a.power -= dmg
      target.hurt = 0.35
      const p = pointAt(target.s)
      if (target.hp <= 0) {
        stopped++
        events.push({ type: 'defeat', ...p, kind: target.kind })
      } else events.push({ type: 'hit', ...p })
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
  allies = allies.filter((a) => a.power > 0 && a.s > 0)

  // Enemies that reach the gate knock a heart off the castle and go away.
  const arrived = enemies.filter((e) => e.s >= PATH_LEN)
  if (arrived.length) {
    castle = Math.max(0, castle - arrived.reduce((n, e) => n + (e.kind === 'boss' ? 2 : 1), 0))
    enemies = enemies.filter((e) => e.s < PATH_LEN)
    events.push({ type: 'castle' })
  }

  let phase: Phase = g.phase
  let wave = g.wave
  if (castle <= 0) {
    phase = 'lost'
    events.push({ type: 'lost' })
  } else if (phase === 'wave' && !queue.length && !enemies.length) {
    wave++
    if (wave >= WAVES.length) {
      phase = 'won'
      events.push({ type: 'won' })
    } else {
      phase = 'between'
      events.push({ type: 'waveDone' })
    }
  }

  return { game: { ...g, queue, spawnIn, nextId, castle, stopped, enemies, allies, phase, wave }, events }
}

/** Stars for a finished game: a win is worth 5, otherwise one per wave survived (only if a monster was stopped). */
export function starsFor(g: Game): number {
  return g.phase === 'won' ? 5 : Math.min(g.wave, g.stopped)
}

// ---------- Questions ----------

export interface Question {
  target: Word
  options: Word[]
}

/** Words the questions use: the ones learned on the map, or the first worlds for a new player. */
export function questionUnits(p: Progress): Unit[] {
  const learned = learnedWordIds(p)
  const units = UNITS.map((u) => ({ ...u, words: u.words.filter((w) => learned.has(w.id)) })).filter((u) => u.words.length >= 3)
  return units.length ? units : UNITS.slice(0, 3)
}

/** "Where is the …?" with three pictures from the same world (so they are easy to tell apart). */
export function makeQuestion(units: Unit[], rnd = Math.random, avoid?: string): Question {
  const unit = units[Math.floor(rnd() * units.length)]
  // The distractors come from the whole world, even words not learned yet: the target is a learned one.
  const full = UNITS.find((u) => u.id === unit.id)?.words ?? unit.words
  let pool = unit.words.filter((w) => w.id !== avoid)
  if (!pool.length) pool = unit.words
  const target = pool[Math.floor(rnd() * pool.length)]
  const others = shuffle(
    full.filter((w) => w.id !== target.id && visualKey(w) !== visualKey(target)),
    rnd,
  ).slice(0, 2)
  return { target, options: shuffle([target, ...others], rnd) }
}

function visualKey(w: Word): string {
  return `${w.visual.kind}:${w.visual.value}`
}

function shuffle<T>(xs: T[], rnd: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
