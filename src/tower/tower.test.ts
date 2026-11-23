import { describe, expect, it } from 'vitest'
import { DEFAULT_PROGRESS } from '../progress'
import { CASTLES, ownedCastles } from './castles'
import { MAPS, mapOpen } from './maps'
import {
  CASTLE_HP,
  PATH_LEN,
  START_COINS,
  WAVES,
  earn,
  makeQuestion,
  newGame,
  pointAt,
  questionUnits,
  send,
  startWave,
  step,
  type Game,
} from './engine'

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

function run(g: Game, seconds: number, each?: (g: Game) => Game): Game {
  for (let t = 0; t < seconds; t += 0.05) {
    if (each) g = each(g)
    g = step(g, 0.05).game
  }
  return g
}

describe('tower defense', () => {
  it('path starts at the cave and ends at the gate', () => {
    expect(pointAt(0)).toEqual({ x: 200, y: 92 })
    expect(pointAt(PATH_LEN)).toEqual({ x: 200, y: 512 })
  })

  it('sending a friend costs coins', () => {
    let g = newGame()
    expect(g.coins).toBe(START_COINS)
    g = send(g, 'knight')
    expect(g.coins).toBe(START_COINS - 2)
    expect(g.allies).toHaveLength(1)
    expect(send(g, 'archer')).toBe(g) // no coins left
    expect(earn(g).coins).toBe(1)
  })

  it('an unanswered wave hurts the castle but is not lost at once', () => {
    let g = startWave(newGame())
    g = run(g, 80)
    expect(g.castle).toBe(CASTLE_HP - WAVES[0].length)
    expect(g.phase).toBe('between')
    expect(g.wave).toBe(1)
  })

  it.each(MAPS.map((m) => [m.id, m] as const))('%s: friends stop enemies, and steady answers win', (_id, map) => {
    let g = startWave(newGame(map.path, map.speed))
    // Answer a question every 4 seconds and always send the best friend we can pay for.
    let clock = 0
    g = run(g, 600, (x) => {
      clock += 0.05
      if (x.phase === 'between') x = startWave(x)
      if (clock >= 4) {
        clock = 0
        x = earn(x)
      }
      if (x.enemies.length) {
        const kind = x.coins >= 3 ? 'dragon' : x.coins >= 2 ? 'knight' : 'archer'
        if (x.enemies.some((e) => e.s > 80) && x.allies.length === 0) x = send(x, kind)
      }
      return x
    })
    expect(g.phase).toBe('won')
    expect(g.stopped).toBeGreaterThan(0)
  })

  it('questions have three different pictures including the target', () => {
    const units = questionUnits(DEFAULT_PROGRESS)
    expect(units.length).toBeGreaterThan(0)
    const rnd = seeded(7)
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion(units, rnd)
      expect(q.options).toHaveLength(3)
      expect(q.options.map((w) => w.id)).toContain(q.target.id)
      expect(new Set(q.options.map((w) => JSON.stringify(w.visual))).size).toBe(3)
    }
  })

  it('questions change their wording and skip the words just asked', () => {
    const units = questionUnits(DEFAULT_PROGRESS)
    const rnd = seeded(3)
    let q = makeQuestion(units, rnd)
    const recent: string[] = []
    for (let i = 0; i < 100; i++) {
      recent.push(q.target.id)
      recent.splice(0, recent.length - 5)
      const next = makeQuestion(units, rnd, recent, q.ask)
      expect(next.ask).not.toBe(q.ask)
      expect(recent).not.toContain(next.target.id)
      q = next
    }
  })

  it('every map runs from the cave to the gate, and castles come with the maps', () => {
    for (const m of MAPS) {
      expect(m.path.points[0]).toEqual([200, 92])
      expect(m.path.points[m.path.points.length - 1]).toEqual([200, 512])
    }
    expect(CASTLES.map((c) => c.id)).toEqual(MAPS.map((m) => m.id))
    expect(mapOpen([], 0)).toBe(true)
    expect(mapOpen([], 1)).toBe(false)
    expect(mapOpen(['forest'], 1)).toBe(true)
    expect(ownedCastles([])).toEqual(['forest'])
    expect(ownedCastles(['desert'])).toEqual(['forest', 'desert'])
  })
})
