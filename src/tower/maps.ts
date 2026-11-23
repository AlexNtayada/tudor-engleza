// The castle's lands: each map has its own scenery, path and monster colours, and they get
// a little faster from one map to the next. A map opens once the one before it is won.

import { makePath, type Path } from './engine'

export type Deco = 'forest' | 'desert' | 'snow' | 'beach' | 'volcano' | 'candy'

export interface TowerMap {
  id: string
  name: string
  icon: string
  deco: Deco
  path: Path
  /** Monster speed (1 = the forest). */
  speed: number
  /** Checkerboard ground, light and dark squares. */
  ground: [string, string]
  /** Sand under the stones, and the stones. */
  road: [string, string]
  /** The hill or mountain around the cave, and the swirl inside it. */
  hill: string
  glow: string
  /** Colour of the slimes and of the boss. */
  slime: string
  boss: string
  /** Edge under the board (its "soil"). */
  edge: string
}

export const MAPS: TowerMap[] = [
  {
    id: 'forest',
    name: 'Pădurea',
    icon: '🌳',
    deco: 'forest',
    path: makePath([
      [200, 92],
      [200, 150],
      [128, 200],
      [128, 280],
      [272, 340],
      [272, 410],
      [200, 455],
      [200, 512],
    ]),
    speed: 1,
    ground: ['#8ad464', '#82cc5c'],
    road: ['#e8d3a0', '#cfc8b8'],
    hill: '#8c93a8',
    glow: '#c77dff',
    slime: '#7fd858',
    boss: '#c05be0',
    edge: '#5fa63f',
  },
  {
    id: 'desert',
    name: 'Deșertul',
    icon: '🌵',
    deco: 'desert',
    path: makePath([
      [200, 92],
      [200, 140],
      [290, 180],
      [290, 250],
      [110, 300],
      [110, 380],
      [200, 430],
      [200, 512],
    ]),
    speed: 1.08,
    ground: ['#f6dc9a', '#efd18a'],
    road: ['#d9b46a', '#c79f58'],
    hill: '#d49a5a',
    glow: '#ff9f43',
    slime: '#ffd23f',
    boss: '#ff8c1a',
    edge: '#c9a25e',
  },
  {
    id: 'snow',
    name: 'Țara zăpezii',
    icon: '⛄',
    deco: 'snow',
    path: makePath([
      [200, 92],
      [200, 140],
      [120, 170],
      [120, 230],
      [280, 260],
      [280, 320],
      [120, 360],
      [120, 420],
      [200, 455],
      [200, 512],
    ]),
    speed: 1.15,
    ground: ['#f4f9ff', '#e6f0fb'],
    road: ['#c9dcef', '#a9c3dc'],
    hill: '#9fb4cc',
    glow: '#5fd4ff',
    slime: '#7fd3ff',
    boss: '#4f86f7',
    edge: '#a9c3dc',
  },
  {
    id: 'beach',
    name: 'Plaja',
    icon: '🏝️',
    deco: 'beach',
    path: makePath([
      [200, 92],
      [200, 150],
      [300, 210],
      [300, 290],
      [200, 340],
      [100, 390],
      [100, 450],
      [200, 480],
      [200, 512],
    ]),
    speed: 1.22,
    ground: ['#ffeec2', '#fbe5b0'],
    road: ['#f2d08e', '#e0c08a'],
    hill: '#a78b6d',
    glow: '#3ec6c6',
    slime: '#ff8fb1',
    boss: '#ff5a5f',
    edge: '#3ea7d6',
  },
  {
    id: 'volcano',
    name: 'Vulcanul',
    icon: '🌋',
    deco: 'volcano',
    path: makePath([
      [200, 92],
      [200, 130],
      [110, 170],
      [290, 230],
      [290, 290],
      [110, 340],
      [110, 400],
      [290, 440],
      [200, 480],
      [200, 512],
    ]),
    speed: 1.3,
    ground: ['#a58e7c', '#9a8270'],
    road: ['#7d6758', '#5f4d42'],
    hill: '#5b4a43',
    glow: '#ff5a1f',
    slime: '#ff7043',
    boss: '#e0352b',
    edge: '#5f4d42',
  },
  {
    id: 'candy',
    name: 'Țara dulciurilor',
    icon: '🍭',
    deco: 'candy',
    path: makePath([
      [200, 92],
      [200, 150],
      [110, 190],
      [110, 250],
      [290, 290],
      [290, 350],
      [110, 390],
      [200, 450],
      [200, 512],
    ]),
    speed: 1.38,
    ground: ['#ffe3f1', '#ffd3ea'],
    road: ['#fff6fb', '#ffb3d6'],
    hill: '#c79bd9',
    glow: '#ff7eb6',
    slime: '#b07de0',
    boss: '#7b4fc9',
    edge: '#e58bbb',
  },
]

export const mapById = (id: string): TowerMap => MAPS.find((m) => m.id === id) ?? MAPS[0]

/** A map is open when it is the first one or the one before it has been won. */
export function mapOpen(wins: string[], index: number): boolean {
  return index === 0 || wins.includes(MAPS[index - 1].id)
}
