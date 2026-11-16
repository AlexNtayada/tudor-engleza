// All learning content lives here. Add words or units without touching the app code.

export type Visual =
  | { kind: 'emoji'; value: string }
  | { kind: 'color'; value: string }
  | { kind: 'number'; value: number }

export interface Word {
  id: string
  /** What the voice says in English: just the word, e.g. "cat" (no article). */
  say: string
  /** The English word shown small under the picture. */
  en: string
  /** Romanian meaning, used in Romanian instructions. */
  ro: string
  visual: Visual
  /** Word the speech check listens for, when `en` is a phrase (e.g. "love" in "I love you, mom!"). */
  check?: string
}

export type Game = 'listen' | 'balloons' | 'house' | 'feed'

export interface World {
  /** Sky gradient, top to bottom. */
  sky: [string, string]
  ground: string
  /** Emoji scattered on the scenery. */
  decor: string[]
  icon: string
}

export interface Lesson {
  id: string
  /** New words introduced in this lesson. Empty = review lesson. */
  newWords: string[]
  /** Sticker earned the first time the lesson is finished. */
  sticker: string
  /** Extra "say it" phrase at the end of the lesson. */
  bonusSpeak?: Word
}

export interface Unit {
  id: string
  title: string
  color: string
  colorDark: string
  words: Word[]
  lessons: Lesson[]
  /** Exercise types used in this unit, in rotation. */
  games: Game[]
  world: World
}

const color = (id: string, ro: string, hex: string): Word => ({
  id,
  say: id,
  en: id,
  ro,
  visual: { kind: 'color', value: hex },
})

// Dino says just the word ("cow", not "a cow") so Tudor learns the word itself.
const animal = (id: string, ro: string, emoji: string): Word => ({
  id,
  say: id,
  en: id,
  ro,
  visual: { kind: 'emoji', value: emoji },
})

const number = (n: number, en: string, ro: string): Word => ({
  id: en,
  say: en,
  en,
  ro,
  visual: { kind: 'number', value: n },
})

const thing = (id: string, ro: string, emoji: string, say = id, en = id): Word => ({
  id,
  say,
  en,
  ro,
  visual: { kind: 'emoji', value: emoji },
})

const BASIC: Game[] = ['listen', 'balloons']

export const UNITS: Unit[] = [
  {
    id: 'colors',
    title: 'Culori',
    color: '#ff8a5c',
    colorDark: '#e0653a',
    games: BASIC,
    world: { sky: ['#ffe3f1', '#fff4e0'], ground: '#ffd6a8', decor: ['🌈', '🌸', '🦋', '🌷', '🎨', '🌼'], icon: '🎨' },
    words: [
      color('red', 'roșu', '#ef3b3b'),
      color('blue', 'albastru', '#2f7cf6'),
      color('yellow', 'galben', '#ffd23f'),
      color('green', 'verde', '#3cc35a'),
      color('orange', 'portocaliu', '#ff8c1a'),
      color('purple', 'mov', '#9b4dde'),
      color('pink', 'roz', '#ff7eb6'),
      color('brown', 'maro', '#8b5a2b'),
      color('black', 'negru', '#222222'),
      color('white', 'alb', '#ffffff'),
    ],
    lessons: [
      { id: 'colors-1', newWords: ['red', 'blue', 'yellow'], sticker: '🌈' },
      { id: 'colors-2', newWords: ['green', 'orange', 'purple'], sticker: '🖍️' },
      { id: 'colors-3', newWords: ['pink', 'brown'], sticker: '🦋' },
      { id: 'colors-4', newWords: ['black', 'white'], sticker: '🎨' },
      { id: 'colors-5', newWords: [], sticker: '🏆' },
    ],
  },
  {
    id: 'animals',
    title: 'Animale',
    color: '#3ccf91',
    colorDark: '#22a872',
    games: BASIC,
    world: { sky: ['#d6f1ff', '#effbe8'], ground: '#b8e986', decor: ['🌳', '🏡', '🌻', '🐝', '🌾', '🍄'], icon: '🐮' },
    words: [
      animal('cat', 'pisică', '🐱'),
      animal('dog', 'câine', '🐶'),
      animal('cow', 'vacă', '🐮'),
      animal('duck', 'rață', '🦆'),
      animal('pig', 'porc', '🐷'),
      animal('fish', 'pește', '🐟'),
      animal('bird', 'pasăre', '🐦'),
      animal('horse', 'cal', '🐴'),
      animal('lion', 'leu', '🦁'),
      animal('frog', 'broască', '🐸'),
    ],
    lessons: [
      { id: 'animals-1', newWords: ['cat', 'dog', 'cow'], sticker: '🐾' },
      { id: 'animals-2', newWords: ['duck', 'pig', 'fish'], sticker: '🐠' },
      { id: 'animals-3', newWords: ['bird', 'horse'], sticker: '🐥' },
      { id: 'animals-4', newWords: ['lion', 'frog'], sticker: '🦒' },
      { id: 'animals-5', newWords: [], sticker: '🦖' },
    ],
  },
  {
    id: 'numbers',
    title: 'Numere',
    color: '#5b8cff',
    colorDark: '#3a66d6',
    games: BASIC,
    world: { sky: ['#dcd6ff', '#eef2ff'], ground: '#c3d0ff', decor: ['🚀', '⭐', '🪐', '🌙', '✨', '☄️'], icon: '🔢' },
    words: [
      number(1, 'one', 'unu'),
      number(2, 'two', 'doi'),
      number(3, 'three', 'trei'),
      number(4, 'four', 'patru'),
      number(5, 'five', 'cinci'),
      number(6, 'six', 'șase'),
      number(7, 'seven', 'șapte'),
      number(8, 'eight', 'opt'),
      number(9, 'nine', 'nouă'),
      number(10, 'ten', 'zece'),
    ],
    lessons: [
      { id: 'numbers-1', newWords: ['one', 'two', 'three'], sticker: '🎲' },
      { id: 'numbers-2', newWords: ['four', 'five', 'six'], sticker: '🎈' },
      { id: 'numbers-3', newWords: ['seven', 'eight'], sticker: '🚀' },
      { id: 'numbers-4', newWords: ['nine', 'ten'], sticker: '⭐' },
      { id: 'numbers-5', newWords: [], sticker: '👑' },
    ],
  },
  {
    id: 'family',
    title: 'Familia',
    color: '#ff7eb6',
    colorDark: '#e0558f',
    games: ['listen', 'house', 'balloons'],
    world: { sky: ['#ffe9d6', '#fff7ef'], ground: '#ffd0a6', decor: ['🏠', '🌳', '🎈', '🐕', '🌼', '☀️'], icon: '🏠' },
    words: [
      thing('mom', 'mama', '👩'),
      thing('dad', 'tata', '👨'),
      thing('baby', 'bebeluș', '👶'),
      thing('brother', 'frate', '👦'),
      thing('sister', 'soră', '👧'),
      thing('grandma', 'bunica', '👵'),
      thing('grandpa', 'bunicul', '👴'),
      thing('family', 'familie', '👨‍👩‍👧‍👦'),
      thing('friend', 'prieten', '🧑‍🤝‍🧑'),
      thing('home', 'acasă', '🏡'),
    ],
    lessons: [
      { id: 'family-1', newWords: ['mom', 'dad', 'baby'], sticker: '💐' },
      { id: 'family-2', newWords: ['brother', 'sister'], sticker: '🧸' },
      { id: 'family-3', newWords: ['grandma', 'grandpa'], sticker: '🍪' },
      { id: 'family-4', newWords: ['family', 'friend', 'home'], sticker: '🏰' },
      {
        id: 'family-5',
        newWords: [],
        sticker: '💖',
        bonusSpeak: {
          id: 'i-love-you',
          say: 'I love you, mom!',
          en: 'I love you, mom!',
          ro: 'Te iubesc, mami!',
          check: 'love',
          visual: { kind: 'emoji', value: '❤️' },
        },
      },
    ],
  },
  {
    id: 'food',
    title: 'Mâncare',
    color: '#ffb020',
    colorDark: '#de8f00',
    games: ['listen', 'feed', 'balloons'],
    world: { sky: ['#fff1c9', '#fffaf0'], ground: '#ffe0a3', decor: ['🧺', '🍓', '🌼', '🍯', '🥕', '🍉'], icon: '🍎' },
    words: [
      thing('apple', 'măr', '🍎'),
      thing('banana', 'banană', '🍌'),
      thing('milk', 'lapte', '🥛'),
      thing('bread', 'pâine', '🍞'),
      thing('cheese', 'brânză', '🧀'),
      thing('egg', 'ou', '🥚'),
      thing('water', 'apă', '💧'),
      thing('cake', 'tort', '🍰'),
      thing('pizza', 'pizza', '🍕'),
      thing('ice-cream', 'înghețată', '🍦', 'ice cream', 'ice cream'),
    ],
    lessons: [
      { id: 'food-1', newWords: ['apple', 'banana', 'milk'], sticker: '🍒' },
      { id: 'food-2', newWords: ['bread', 'cheese', 'egg'], sticker: '🥐' },
      { id: 'food-3', newWords: ['water', 'cake'], sticker: '🧁' },
      { id: 'food-4', newWords: ['pizza', 'ice-cream'], sticker: '🍭' },
      {
        id: 'food-5',
        newWords: [],
        sticker: '🍔',
        bonusSpeak: {
          id: 'i-like-pizza',
          say: 'I like pizza!',
          en: 'I like pizza!',
          ro: 'Îmi place pizza!',
          check: 'like',
          visual: { kind: 'emoji', value: '😋' },
        },
      },
    ],
  },
]

/** Scenery for free play and other screens not tied to a unit. */
export const PLAYGROUND: World = {
  sky: ['#d8f3ff', '#f4fff0'],
  ground: '#bdeba0',
  decor: ['🎈', '🌳', '🪁', '🌼', '⛱️', '🦋'],
  icon: '🎈',
}

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ unit: u, lesson: l })))

export function findWord(id: string): { unit: Unit; word: Word } {
  for (const unit of UNITS) {
    const word = unit.words.find((w) => w.id === id)
    if (word) return { unit, word }
  }
  throw new Error(`Unknown word ${id}`)
}
