import { describe, expect, it } from 'vitest'
import { DEFAULT_PROGRESS } from '../progress'
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

  it('friends stop enemies, and a game with steady answers is won', () => {
    let g = startWave(newGame())
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
})
