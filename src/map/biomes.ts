import type { PropId } from './props'

export type Biome = {
  name: string
  ground: string
  /** Ground colour above the cliff (the higher level). */
  plateau: string
  /** Soft blotches that give the grass some texture. */
  patch: string
  path: string
  pathEdge: string
  /** 'stones' = flat stepping stones on the path, 'road' = dashed white line, 'glow' = dotted lights. */
  pathDetail: 'stones' | 'road' | 'glow' | 'none'
  cliff: string
  water: string
  waterLight: string
  bank: string
  bridge: string
  /** Big scenery (trees, buildings) and small scenery (flowers, tufts), with weights. */
  big: [PropId, number][]
  small: [PropId, number][]
  /** Pieces placed along the river banks. */
  shore: PropId[]
  /** Less (or more) scenery than usual, 1 = normal. */
  density?: number
}

const meadow = {
  ground: '#8fd86b',
  plateau: '#b4e88a',
  patch: '#7ccb5c',
  path: '#f3d9a2',
  pathEdge: '#d9b77a',
  pathDetail: 'stones' as const,
  cliff: '#e3a253',
  water: '#58c3f0',
  waterLight: '#9fe0ff',
  bank: '#f0d9a0',
  bridge: '#b9763d',
}

export const BIOMES: Record<string, Biome> = {
  colors: {
    ...meadow,
    name: 'Pajiștea curcubeu',
    ground: '#a3e27c',
    plateau: '#c0ec8e',
    patch: '#8fd36b',
    path: '#ffe3bd',
    pathEdge: '#f2b98a',
    big: [
      ['blossomTree', 4],
      ['rainbow', 0.4],
      ['pinkBush', 3],
      ['flowerBush', 3],
    ],
    small: [
      ['tulips', 4],
      ['flowers', 4],
      ['butterfly', 2],
      ['mushroom', 1],
      ['paleTuft', 3],
    ],
    shore: ['reeds', 'tulips'],
  },
  animals: {
    ...meadow,
    name: 'Ferma',
    big: [
      ['barn', 1],
      ['haystack', 3],
      ['fence', 3],
      ['parkTree', 4],
      ['bush', 2],
    ],
    small: [
      ['sunflower', 3],
      ['flowers', 3],
      ['tuft', 4],
      ['rock', 1],
    ],
    shore: ['reeds', 'reeds', 'rock'],
  },
  numbers: {
    name: 'Luna',
    ground: '#7a68d8',
    plateau: '#8f7fe6',
    patch: '#6a58c8',
    path: '#d8d1ff',
    pathEdge: '#a99cf0',
    pathDetail: 'glow',
    cliff: '#4e3fa6',
    water: '#2c2170',
    waterLight: '#5a4bc0',
    bank: '#b7adf5',
    bridge: '#9aa6c4',
    big: [
      ['crater', 4],
      ['planet', 2],
      ['crystal', 3],
      ['moonRock', 3],
    ],
    small: [
      ['sparkle', 6],
      ['crater', 2],
    ],
    shore: ['crystal', 'sparkle'],
  },
  family: {
    ...meadow,
    name: 'Satul',
    big: [
      ['house', 4],
      ['well', 1],
      ['parkTree', 4],
      ['fence', 2],
      ['flowerBush', 2],
    ],
    small: [
      ['mailbox', 1],
      ['flowers', 4],
      ['tuft', 4],
      ['flowerPot', 1],
    ],
    shore: ['reeds', 'rock'],
  },
  food: {
    ...meadow,
    name: 'Livada',
    ground: '#9fdc66',
    plateau: '#b6e67a',
    path: '#f6d58e',
    big: [
      ['orchardTree', 5],
      ['carrots', 2],
      ['picnic', 1],
      ['bush', 2],
    ],
    small: [
      ['beehive', 1],
      ['wildFlowers', 3],
      ['tuft', 4],
      ['mushroom', 1],
    ],
    shore: ['reeds'],
  },
  clothes: {
    ...meadow,
    name: 'Grădina cu lavandă',
    ground: '#a9d98a',
    plateau: '#c7b8f0',
    patch: '#96cc78',
    path: '#f3e2cc',
    pathEdge: '#d8bfa0',
    big: [
      ['clothesline', 2],
      ['lavender', 5],
      ['hedge', 2],
      ['parkTree', 2],
    ],
    small: [
      ['lavender', 2],
      ['wildFlowers', 3],
      ['butterfly', 2],
      ['tuft', 3],
    ],
    shore: ['reeds', 'lavender'],
  },
  body: {
    ...meadow,
    name: 'Parcul de joacă',
    ground: '#86d77c',
    plateau: '#9fe08e',
    path: '#efd6a8',
    big: [
      ['slide', 2],
      ['swing', 2],
      ['bench', 2],
      ['parkTree', 4],
      ['bush', 2],
    ],
    small: [
      ['ball', 2],
      ['flowers', 3],
      ['tuft', 4],
    ],
    shore: ['reeds', 'rock'],
  },
  weather: {
    name: 'Muntele înzăpezit',
    ground: '#eaf4ff',
    plateau: '#ffffff',
    patch: '#d9e9f8',
    path: '#c6daef',
    pathEdge: '#8fb0d4',
    pathDetail: 'none',
    cliff: '#8eaed3',
    water: '#bfe6ff',
    waterLight: '#ffffff',
    bank: '#ffffff',
    bridge: '#9b6a3e',
    big: [
      ['snowPine', 6],
      ['snowman', 2],
      ['iceRock', 2],
      ['cloudPuff', 1],
    ],
    small: [
      ['snowPile', 4],
      ['sparkle', 2],
    ],
    shore: ['iceRock', 'snowPile'],
  },
  house: {
    ...meadow,
    name: 'Grădina casei',
    big: [
      ['house', 2],
      ['doghouse', 1],
      ['parkTree', 3],
      ['fence', 3],
      ['flowerBush', 3],
    ],
    small: [
      ['flowerPot', 3],
      ['mailbox', 1],
      ['tulips', 2],
      ['tuft', 3],
    ],
    shore: ['reeds', 'rock'],
  },
  toys: {
    ...meadow,
    name: 'Țara jucăriilor',
    ground: '#ffd6ea',
    plateau: '#d6efff',
    patch: '#ffc4df',
    path: '#fff1c2',
    pathEdge: '#f5cf7a',
    cliff: '#ff9ac6',
    bank: '#fff1c2',
    bridge: '#5b8cff',
    big: [
      ['blocks', 3],
      ['lollipopTree', 4],
      ['gift', 2],
      ['toyCar', 2],
    ],
    small: [
      ['ball', 3],
      ['spinTop', 2],
      ['sparkle', 2],
    ],
    shore: ['ball', 'spinTop'],
    density: 0.6,
  },
  transport: {
    ...meadow,
    name: 'Orașul',
    ground: '#a3d977',
    plateau: '#b4e08a',
    path: '#7b8494',
    pathEdge: '#5d6676',
    pathDetail: 'road',
    cliff: '#c99a63',
    bridge: '#8a9bb0',
    big: [
      ['building', 5],
      ['parkTree', 3],
      ['toyCar', 2],
    ],
    small: [
      ['trafficLight', 2],
      ['lampPost', 2],
      ['roadSign', 2],
      ['tuft', 3],
    ],
    shore: ['reeds', 'rock'],
    density: 0.75,
  },
  school: {
    ...meadow,
    name: 'Curtea școlii',
    big: [
      ['school', 1],
      ['pencilFence', 3],
      ['parkTree', 4],
      ['chalkboard', 2],
      ['bench', 1],
    ],
    small: [
      ['books', 2],
      ['globe', 1],
      ['flowers', 3],
      ['tuft', 3],
    ],
    shore: ['reeds', 'rock'],
  },
  nature: {
    ...meadow,
    name: 'Pădurea',
    ground: '#7ccf5a',
    plateau: '#4fae45',
    patch: '#6cc04c',
    big: [
      ['pine', 6],
      ['forestTree', 3],
      ['rock', 2],
      ['log', 1],
      ['bush', 2],
    ],
    small: [
      ['mushroom', 3],
      ['fern', 3],
      ['flowers', 2],
      ['tuft', 3],
    ],
    shore: ['reeds', 'reeds', 'rock'],
  },
}

export const biomeFor = (unitId: string): Biome => BIOMES[unitId] ?? BIOMES.nature
