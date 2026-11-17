import { mascot } from '../mascots'
// Simple English sentences, grouped in small packs that reuse words from the units.
// Every sentence has a picture (a "scene") and one key word that changes between sentences.

import type { World } from '../content'

/** One thing drawn in a scene: an emoji, a colour blob or a digit. `n` repeats it, `s` scales it. */
export interface Thing {
  e?: string
  c?: string
  digit?: number
  n?: number
  s?: number
}

export interface Sentence {
  id: string
  /** What Ninja says, e.g. "I like apples". */
  text: string
  /** Romanian meaning, said before the English in the first step. */
  ro: string
  /** The word that changes inside the pack (asked in "what is missing?"). Must be one of the words of `text`. */
  key: string
  /** Picture for the whole sentence. */
  scene: Thing[]
  /** Picture for the key word alone (defaults to the scene). */
  keyPic: Thing[]
}

export interface Pack {
  id: string
  title: string
  /** Pattern shown on the pack card, e.g. "I like ...". */
  pattern: string
  emoji: string
  color: string
  colorDark: string
  world: World
  sentences: Sentence[]
}

const s = (pack: string, text: string, ro: string, key: string, scene: Thing[], keyPic?: Thing[]): Sentence => ({
  id: `${pack}:${text.toLowerCase().replace(/\s+/g, '-')}`,
  text,
  ro,
  key,
  scene,
  keyPic: keyPic ?? scene,
})

const big = (e: string): Thing[] => [{ e, s: 1.9 }]
const small = (e: string): Thing[] => [{ e, s: 0.7 }]

export const PACKS: Pack[] = [
  {
    id: 'like',
    title: 'Îmi place',
    pattern: 'I like …',
    emoji: '😋',
    color: '#ff8a5c',
    colorDark: '#e0653a',
    world: { sky: ['#fff1d6', '#fff8ec'], ground: '#ffe0b0', decor: ['🍎', '🍌', '🥛', '🍰'], icon: '😋' },
    sentences: [
      s('like', 'I like apples', 'Îmi plac merele.', 'apples', [{ e: '🍎', n: 3 }]),
      s('like', 'I like bananas', 'Îmi plac bananele.', 'bananas', [{ e: '🍌', n: 3 }]),
      s('like', 'I like milk', 'Îmi place laptele.', 'milk', [{ e: '🥛' }]),
      s('like', 'I like cake', 'Îmi place tortul.', 'cake', [{ e: '🍰' }]),
    ],
  },
  {
    id: 'size',
    title: 'Mare și mic',
    pattern: 'The cat is …',
    emoji: '🐘',
    color: '#4fb6e8',
    colorDark: '#2a91c4',
    world: { sky: ['#dff3ff', '#f4fbff'], ground: '#cdeccf', decor: ['🌳', '🌼', '🦋', '🌿'], icon: '🐘' },
    sentences: [
      s('size', 'The cat is big', 'Pisica este mare.', 'big', big('🐱'), [{ e: '🟠', s: 1.9 }]),
      s('size', 'The cat is small', 'Pisica este mică.', 'small', small('🐱'), [{ e: '🟠', s: 0.7 }]),
      s('size', 'The dog is big', 'Câinele este mare.', 'big', big('🐶'), [{ e: '🟠', s: 1.9 }]),
      s('size', 'The dog is small', 'Câinele este mic.', 'small', small('🐶'), [{ e: '🟠', s: 0.7 }]),
    ],
  },
  {
    id: 'colors',
    title: 'Ce culoare are?',
    pattern: 'The frog is …',
    emoji: '🎨',
    color: '#9b6bdf',
    colorDark: '#7748c0',
    world: { sky: ['#f1e6ff', '#fff4fb'], ground: '#ffd6e8', decor: ['🌈', '🖍️', '🌸', '🎨'], icon: '🎨' },
    sentences: [
      s('colors', 'The apple is red', 'Mărul este roșu.', 'red', [{ e: '🍎', s: 1.5 }], [{ c: '#ef3b3b' }]),
      s('colors', 'The frog is green', 'Broasca este verde.', 'green', [{ e: '🐸', s: 1.5 }], [{ c: '#3cc35a' }]),
      s('colors', 'The sun is yellow', 'Soarele este galben.', 'yellow', [{ e: '☀️', s: 1.5 }], [{ c: '#ffd23f' }]),
      s('colors', 'The pig is pink', 'Porcușorul este roz.', 'pink', [{ e: '🐷', s: 1.5 }], [{ c: '#ff7eb6' }]),
    ],
  },
  {
    id: 'count',
    title: 'Câte vezi?',
    pattern: 'I see two …',
    emoji: '🔢',
    color: '#22b573',
    colorDark: '#17925a',
    world: { sky: ['#e3f8ec', '#f6fff9'], ground: '#c8efd6', decor: ['🌳', '🌷', '☁️', '🌼'], icon: '🔢' },
    sentences: [
      s('count', 'I see two dogs', 'Văd doi câini.', 'two', [{ e: '🐶', n: 2 }], [{ digit: 2 }]),
      s('count', 'I see three birds', 'Văd trei păsări.', 'three', [{ e: '🐦', n: 3 }], [{ digit: 3 }]),
      s('count', 'I see four fish', 'Văd patru pești.', 'four', [{ e: '🐟', n: 4 }], [{ digit: 4 }]),
      s('count', 'I see five ducks', 'Văd cinci rățuște.', 'five', [{ e: '🦆', n: 5 }], [{ digit: 5 }]),
    ],
  },
  {
    id: 'family',
    title: 'Familia mea',
    pattern: 'This is my …',
    emoji: '🏠',
    color: '#ff7eb6',
    colorDark: '#e0558f',
    world: { sky: ['#ffe6f1', '#fff6fa'], ground: '#ffd9e8', decor: ['💐', '🏠', '❤️', '🧸'], icon: '🏠' },
    sentences: [
      s('family', 'This is my mom', 'Ea este mama mea.', 'mom', [{ e: '👩', s: 1.5 }]),
      s('family', 'This is my dad', 'El este tata meu.', 'dad', [{ e: '👨', s: 1.5 }]),
      s('family', 'This is my sister', 'Ea este sora mea.', 'sister', [{ e: '👧', s: 1.5 }]),
      s('family', 'This is my grandma', 'Ea este bunica mea.', 'grandma', [{ e: '👵', s: 1.5 }]),
    ],
  },
  {
    id: 'clothes',
    title: 'Am ceva nou',
    pattern: 'I have a …',
    emoji: '🧢',
    color: '#ffb52e',
    colorDark: '#e09300',
    world: { sky: ['#fff4d6', '#fffaf0'], ground: '#ffe6a8', decor: ['🧢', '🧦', '🧥', '👢'], icon: '🧢' },
    sentences: [
      s('clothes', 'I have a hat', 'Am o pălărie.', 'hat', [{ e: '🧢', s: 1.5 }]),
      s('clothes', 'I have a coat', 'Am o haină.', 'coat', [{ e: '🧥', s: 1.5 }]),
      s('clothes', 'I have socks', 'Am șosete.', 'socks', [{ e: '🧦', n: 2 }]),
      s('clothes', 'I have boots', 'Am cizme.', 'boots', [{ e: '👢', n: 2 }]),
    ],
  },
  {
    id: 'body',
    get title() {
      return `${mascot().name} spune`
    },
    pattern: 'Touch your …',
    emoji: '👃',
    color: '#ff6f61',
    colorDark: '#d94c3f',
    world: { sky: ['#ffe8e3', '#fff7f4'], ground: '#ffd4c8', decor: ['⭐', '🎵', '👏', '✨'], icon: '👃' },
    sentences: [
      s('body', 'Touch your nose', 'Atinge-ți nasul.', 'nose', [{ e: '👃', s: 1.5 }]),
      s('body', 'Clap your hands', 'Bate din palme.', 'hands', [{ e: '👏', s: 1.5 }]),
      s('body', 'Open your mouth', 'Deschide gura.', 'mouth', [{ e: '👄', s: 1.5 }]),
      s('body', 'Close your eyes', 'Închide ochii.', 'eyes', [{ e: '😌', s: 1.5 }]),
    ],
  },
  {
    id: 'weather',
    title: 'Cum e afară?',
    pattern: 'It is …',
    emoji: '⛅',
    color: '#5b8def',
    colorDark: '#3a6bcc',
    world: { sky: ['#dcebff', '#f3f8ff'], ground: '#cfe3f5', decor: ['☁️', '☀️', '❄️', '🌈'], icon: '⛅' },
    sentences: [
      s('weather', 'It is sunny', 'Este soare.', 'sunny', [{ e: '☀️', s: 1.6 }]),
      s('weather', 'It is rainy', 'Plouă.', 'rainy', [{ e: '🌧️', s: 1.6 }]),
      s('weather', 'It is snowy', 'Ninge.', 'snowy', [{ e: '❄️', s: 1.6 }]),
      s('weather', 'It is windy', 'Bate vântul.', 'windy', [{ e: '🌬️', s: 1.6 }]),
    ],
  },
]
