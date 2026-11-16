// All learning content lives here. Add words or units without touching the app code.

export type Visual =
  | { kind: 'emoji'; value: string }
  | { kind: 'color'; value: string }
  | { kind: 'number'; value: number }

export interface Word {
  id: string
  /** What the voice says in English, e.g. "a cat". */
  say: string
  /** The English word shown small under the picture. */
  en: string
  /** Romanian meaning, used in Romanian instructions. */
  ro: string
  visual: Visual
}

export interface Lesson {
  id: string
  /** New words introduced in this lesson. Empty = review lesson. */
  newWords: string[]
  /** Sticker earned the first time the lesson is finished. */
  sticker: string
}

export interface Unit {
  id: string
  title: string
  color: string
  colorDark: string
  words: Word[]
  lessons: Lesson[]
}

const color = (id: string, ro: string, hex: string): Word => ({
  id,
  say: id,
  en: id,
  ro,
  visual: { kind: 'color', value: hex },
})

const animal = (id: string, ro: string, emoji: string, article = 'a'): Word => ({
  id,
  say: `${article} ${id}`,
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

export const UNITS: Unit[] = [
  {
    id: 'colors',
    title: 'Culori',
    color: '#ff8a5c',
    colorDark: '#e0653a',
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
]

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ unit: u, lesson: l })))

export function findWord(id: string): { unit: Unit; word: Word } {
  for (const unit of UNITS) {
    const word = unit.words.find((w) => w.id === id)
    if (word) return { unit, word }
  }
  throw new Error(`Unknown word ${id}`)
}
