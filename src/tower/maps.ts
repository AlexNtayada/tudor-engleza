// The castle's lands: each map has its own scenery, path and monster colours, and they get
// a little faster from one map to the next. A map opens once the one before it is won.

import { makePath, type Path } from './engine'

export type Deco = 'forest' | 'desert' | 'snow' | 'beach' | 'volcano' | 'candy' | 'farm' | 'jungle' | 'sea' | 'clouds' | 'space'

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

/**
 * A smooth path that swings left and right as it comes down: `turns` full swings,
 * `amp` wide, shrinking by `shrink` towards the castle (a funnel), from y=130 to y=460.
 */
function swing(turns: number, amp: number, shrink = 0): [number, number][] {
  const pts: [number, number][] = [[200, 92]]
  const n = 48
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push([Math.round(200 + amp * (1 - shrink * t) * Math.sin(2 * Math.PI * turns * t)), Math.round(130 + 330 * t)])
  }
  pts.push([200, 512])
  return pts
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
  {
    // A big square loop round the edge of the farm.
    id: 'farm',
    name: 'Ferma',
    icon: '🐄',
    deco: 'farm',
    path: makePath([
      [200, 92],
      [200, 125],
      [62, 125],
      [62, 300],
      [338, 300],
      [338, 425],
      [200, 445],
      [200, 512],
    ]),
    speed: 1.42,
    ground: ['#b9e27a', '#aed66c'],
    road: ['#d9b77a', '#b98f55'],
    hill: '#9a8a70',
    glow: '#ffd23f',
    slime: '#ffb347',
    boss: '#8b5a2b',
    edge: '#8fbf4f',
  },
  {
    // A snake: long left-right turns through the jungle.
    id: 'jungle',
    name: 'Jungla',
    icon: '🦜',
    deco: 'jungle',
    path: makePath([
      [200, 92],
      [200, 120],
      [330, 150],
      [70, 215],
      [330, 285],
      [70, 355],
      [200, 425],
      [200, 512],
    ]),
    speed: 1.46,
    ground: ['#5fb85a', '#55ad50'],
    road: ['#b58a5a', '#8b6a44'],
    hill: '#4f7a4a',
    glow: '#7ee0c3',
    slime: '#ff5a5f',
    boss: '#ff8c1a',
    edge: '#3f8a3c',
  },
  {
    // Soft waves, like the sea moving.
    id: 'sea',
    name: 'Fundul mării',
    icon: '🐠',
    deco: 'sea',
    path: makePath(swing(1.5, 125)),
    speed: 1.5,
    ground: ['#6cc6ef', '#5fbbe6'],
    road: ['#f2dca8', '#e0c48a'],
    hill: '#3e86b8',
    glow: '#ffe066',
    slime: '#ffd23f',
    boss: '#ff7043',
    edge: '#2f78b0',
  },
  {
    // Steps going down from cloud to cloud.
    id: 'clouds',
    name: 'Țara norilor',
    icon: '☁️',
    deco: 'clouds',
    path: makePath([
      [200, 92],
      [200, 118],
      [80, 118],
      [80, 190],
      [160, 190],
      [160, 262],
      [240, 262],
      [240, 334],
      [320, 334],
      [320, 420],
      [200, 445],
      [200, 512],
    ]),
    speed: 1.55,
    ground: ['#d9efff', '#cbe6fb'],
    road: ['#fff6d6', '#ffe08a'],
    hill: '#a9c3dc',
    glow: '#ff7eb6',
    slime: '#9b4dde',
    boss: '#4f86f7',
    edge: '#9fc3e6',
  },
  {
    // Wide swings that get smaller near the castle.
    id: 'space',
    name: 'Luna',
    icon: '🌙',
    deco: 'space',
    path: makePath(swing(2, 140, 0.65)),
    speed: 1.6,
    ground: ['#3b3366', '#342d5c'],
    road: ['#b9b4d6', '#8f88b8'],
    hill: '#2a2450',
    glow: '#7ee0c3',
    slime: '#7ee0c3',
    boss: '#ff7eb6',
    edge: '#221d45',
  },
]

export const mapById = (id: string): TowerMap => MAPS.find((m) => m.id === id) ?? MAPS[0]

/** A map is open when it is the first one or the one before it has been won. */
export function mapOpen(wins: string[], index: number): boolean {
  return index === 0 || wins.includes(MAPS[index - 1].id)
}
