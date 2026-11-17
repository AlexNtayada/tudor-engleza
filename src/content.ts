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

export type Game = 'listen' | 'balloons' | 'house' | 'feed' | 'dress'

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
  /** Boss stage: a test over the whole unit that must be won to move on. */
  boss?: boolean
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
  /** Wardrobe item given when every sticker of this unit is collected. */
  setReward: string
}

const color = (id: string, ro: string, hex: string): Word => ({
  id,
  say: id,
  en: id,
  ro,
  visual: { kind: 'color', value: hex },
})

// Ninja says just the word ("cow", not "a cow") so Tudor learns the word itself.
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
    setReward: 'rainbow-cape',
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
      { id: 'colors-5', newWords: [], sticker: '🏆', boss: true },
    ],
  },
  {
    id: 'animals',
    title: 'Animale',
    color: '#3ccf91',
    colorDark: '#22a872',
    games: BASIC,
    world: { sky: ['#d6f1ff', '#effbe8'], ground: '#b8e986', decor: ['🌳', '🏡', '🌻', '🐝', '🌾', '🍄'], icon: '🐮' },
    setReward: 'cat-ears',
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
      { id: 'animals-5', newWords: [], sticker: '🦖', boss: true },
    ],
  },
  {
    id: 'numbers',
    title: 'Numere',
    color: '#5b8cff',
    colorDark: '#3a66d6',
    games: BASIC,
    world: { sky: ['#dcd6ff', '#eef2ff'], ground: '#c3d0ff', decor: ['🚀', '⭐', '🪐', '🌙', '✨', '☄️'], icon: '🔢' },
    setReward: 'rocket-pack',
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
      { id: 'numbers-5', newWords: [], sticker: '👑', boss: true },
    ],
  },
  {
    id: 'family',
    title: 'Familia',
    color: '#ff7eb6',
    colorDark: '#e0558f',
    games: ['listen', 'house', 'balloons'],
    world: { sky: ['#ffe9d6', '#fff7ef'], ground: '#ffd0a6', decor: ['🏠', '🌳', '🎈', '🐕', '🌼', '☀️'], icon: '🏠' },
    setReward: 'heart-balloon',
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
      {
        id: 'family-4',
        newWords: ['family', 'friend', 'home'],
        sticker: '🏰',
        bonusSpeak: {
          id: 'i-love-you',
          say: 'I love you, mom!',
          en: 'I love you, mom!',
          ro: 'Te iubesc, mami!',
          check: 'love',
          visual: { kind: 'emoji', value: '❤️' },
        },
      },
      { id: 'family-5', newWords: [], sticker: '💖', boss: true },
    ],
  },
  {
    id: 'food',
    title: 'Mâncare',
    color: '#ffb020',
    colorDark: '#de8f00',
    games: ['listen', 'feed', 'balloons'],
    world: { sky: ['#fff1c9', '#fffaf0'], ground: '#ffe0a3', decor: ['🧺', '🍓', '🌼', '🍯', '🥕', '🍉'], icon: '🍎' },
    setReward: 'chef-hat',
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
      {
        id: 'food-4',
        newWords: ['pizza', 'ice-cream'],
        sticker: '🍭',
        bonusSpeak: {
          id: 'i-like-pizza',
          say: 'I like pizza!',
          en: 'I like pizza!',
          ro: 'Îmi place pizza!',
          check: 'like',
          visual: { kind: 'emoji', value: '😋' },
        },
      },
      { id: 'food-5', newWords: [], sticker: '🍔', boss: true },
    ],
  },
  {
    id: 'clothes',
    title: 'Haine',
    color: '#9b6bff',
    colorDark: '#7a49e0',
    games: ['listen', 'dress', 'balloons'],
    world: { sky: ['#ece6ff', '#fbf9ff'], ground: '#d9ccff', decor: ['🛍️', '🧵', '🎀', '👜', '🪞', '🌼'], icon: '👕' },
    setReward: 'super-mask',
    words: [
      thing('hat', 'pălărie', '👒'),
      thing('shoes', 'pantofi', '👟'),
      thing('socks', 'șosete', '🧦'),
      thing('shirt', 'tricou', '👕'),
      thing('pants', 'pantaloni', '👖'),
      thing('dress', 'rochie', '👗'),
      thing('coat', 'haină', '🧥'),
      thing('gloves', 'mănuși', '🧤'),
      thing('scarf', 'fular', '🧣'),
      thing('boots', 'cizme', '🥾'),
    ],
    lessons: [
      { id: 'clothes-1', newWords: ['hat', 'shoes', 'socks'], sticker: '🎩' },
      { id: 'clothes-2', newWords: ['shirt', 'pants', 'dress'], sticker: '🧢' },
      { id: 'clothes-3', newWords: ['coat', 'gloves'], sticker: '🧶' },
      { id: 'clothes-4', newWords: ['scarf', 'boots'], sticker: '🕶️' },
      { id: 'clothes-5', newWords: [], sticker: '🥇', boss: true },
    ],
  },
  {
    id: 'body',
    title: 'Corpul',
    color: '#22c3b4',
    colorDark: '#119a8d',
    games: ['listen', 'balloons'],
    world: { sky: ['#dcfff4', '#f7fffc'], ground: '#b6eedb', decor: ['⚽', '🤸', '🎾', '🛝', '🏃', '🌳'], icon: '✋' },
    setReward: 'headphones',
    words: [
      thing('hand', 'mână', '✋'),
      thing('eye', 'ochi', '👁️'),
      thing('nose', 'nas', '👃'),
      thing('ear', 'ureche', '👂'),
      thing('mouth', 'gură', '👄'),
      thing('tooth', 'dinte', '🦷'),
      thing('face', 'față', '🙂'),
      thing('arm', 'braț', '💪'),
      thing('leg', 'picior', '🦵'),
      thing('foot', 'talpă', '🦶'),
    ],
    lessons: [
      { id: 'body-1', newWords: ['hand', 'eye', 'nose'], sticker: '🤚' },
      { id: 'body-2', newWords: ['ear', 'mouth', 'tooth'], sticker: '🪥' },
      { id: 'body-3', newWords: ['face', 'arm'], sticker: '🤸' },
      { id: 'body-4', newWords: ['leg', 'foot'], sticker: '⚽' },
      { id: 'body-5', newWords: [], sticker: '🏅', boss: true },
    ],
  },
  {
    id: 'weather',
    title: 'Vremea',
    color: '#4aa8ff',
    colorDark: '#2a86dd',
    games: ['listen', 'balloons'],
    world: { sky: ['#d2ecff', '#f4fbff'], ground: '#c4e4ff', decor: ['☁️', '🪁', '🌈', '❄️', '☀️', '🌧️'], icon: '🌦️' },
    setReward: 'umbrella',
    words: [
      thing('sun', 'soare', '☀️'),
      thing('rain', 'ploaie', '🌧️'),
      thing('snow', 'zăpadă', '❄️'),
      thing('cloud', 'nor', '☁️'),
      thing('wind', 'vânt', '🌬️'),
      thing('rainbow', 'curcubeu', '🌈'),
      thing('storm', 'furtună', '⛈️'),
      thing('umbrella', 'umbrelă', '☂️'),
      thing('hot', 'cald', '🥵'),
      thing('cold', 'frig', '🥶'),
    ],
    lessons: [
      { id: 'weather-1', newWords: ['sun', 'rain', 'snow'], sticker: '🌞' },
      { id: 'weather-2', newWords: ['cloud', 'wind', 'rainbow'], sticker: '🪁' },
      { id: 'weather-3', newWords: ['storm', 'umbrella'], sticker: '⛄' },
      { id: 'weather-4', newWords: ['hot', 'cold'], sticker: '🌻' },
      { id: 'weather-5', newWords: [], sticker: '🌟', boss: true },
    ],
  },
  {
    id: 'house',
    title: 'Casa',
    color: '#f2734f',
    colorDark: '#cf5232',
    games: BASIC,
    world: { sky: ['#ffe8dc', '#fff8f2'], ground: '#ffd2bd', decor: ['🏡', '🪴', '🌳', '🌷', '🐈', '☀️'], icon: '🛋️' },
    setReward: 'house-key',
    words: [
      thing('bed', 'pat', '🛏️'),
      thing('chair', 'scaun', '🪑'),
      thing('door', 'ușă', '🚪'),
      thing('window', 'fereastră', '🪟'),
      thing('sofa', 'canapea', '🛋️'),
      thing('bath', 'cadă', '🛁'),
      thing('clock', 'ceas', '⏰'),
      thing('key', 'cheie', '🔑'),
      thing('mirror', 'oglindă', '🪞'),
      thing('house', 'casă', '🏠'),
    ],
    lessons: [
      { id: 'house-1', newWords: ['bed', 'chair', 'door'], sticker: '🪴' },
      { id: 'house-2', newWords: ['window', 'sofa', 'bath'], sticker: '🖼️' },
      { id: 'house-3', newWords: ['clock', 'key'], sticker: '🕰️' },
      { id: 'house-4', newWords: ['mirror', 'house'], sticker: '🧹' },
      { id: 'house-5', newWords: [], sticker: '🗝️', boss: true },
    ],
  },
  {
    id: 'toys',
    title: 'Jucării',
    color: '#ff5fa2',
    colorDark: '#de3d82',
    games: BASIC,
    world: { sky: ['#ffe2f1', '#fff7fb'], ground: '#ffd0e6', decor: ['🧸', '🎈', '🪁', '🧩', '🎁', '⭐'], icon: '🧸' },
    setReward: 'propeller-hat',
    words: [
      thing('ball', 'minge', '⚽'),
      thing('teddy', 'ursuleț', '🧸'),
      thing('doll', 'păpușă', '🪆'),
      thing('kite', 'zmeu', '🪁'),
      thing('blocks', 'cuburi', '🧱'),
      thing('robot', 'robot', '🤖'),
      thing('drum', 'tobă', '🥁'),
      thing('puzzle', 'puzzle', '🧩'),
      thing('yo-yo', 'yo-yo', '🪀'),
      thing('balloon', 'balon', '🎈'),
    ],
    lessons: [
      { id: 'toys-1', newWords: ['ball', 'teddy', 'doll'], sticker: '🎠' },
      { id: 'toys-2', newWords: ['kite', 'blocks', 'robot'], sticker: '🎡' },
      { id: 'toys-3', newWords: ['drum', 'puzzle'], sticker: '🃏' },
      {
        id: 'toys-4',
        newWords: ['yo-yo', 'balloon'],
        sticker: '🎯',
        bonusSpeak: {
          id: 'lets-play',
          say: "Let's play!",
          en: "Let's play!",
          ro: 'Hai să ne jucăm!',
          check: 'play',
          visual: { kind: 'emoji', value: '🥳' },
        },
      },
      { id: 'toys-5', newWords: [], sticker: '🎁', boss: true },
    ],
  },
  {
    id: 'transport',
    title: 'Transport',
    color: '#ff9b2e',
    colorDark: '#dc7a0c',
    games: BASIC,
    world: { sky: ['#dff1ff', '#fffaf0'], ground: '#cfe8b8', decor: ['🚦', '🛣️', '🌳', '🚏', '☁️', '🏙️'], icon: '🚗' },
    setReward: 'pilot-goggles',
    words: [
      thing('car', 'mașină', '🚗'),
      thing('bus', 'autobuz', '🚌'),
      thing('train', 'tren', '🚂'),
      thing('plane', 'avion', '✈️'),
      thing('boat', 'barcă', '⛵'),
      thing('bike', 'bicicletă', '🚲'),
      thing('truck', 'camion', '🚚'),
      thing('taxi', 'taxi', '🚕'),
      thing('tractor', 'tractor', '🚜'),
      thing('helicopter', 'elicopter', '🚁'),
    ],
    lessons: [
      { id: 'transport-1', newWords: ['car', 'bus', 'train'], sticker: '🚦' },
      { id: 'transport-2', newWords: ['plane', 'boat', 'bike'], sticker: '🛴' },
      { id: 'transport-3', newWords: ['truck', 'taxi'], sticker: '🚤' },
      { id: 'transport-4', newWords: ['tractor', 'helicopter'], sticker: '🛞' },
      { id: 'transport-5', newWords: [], sticker: '🏁', boss: true },
    ],
  },
  {
    id: 'school',
    title: 'Școala',
    color: '#4f7bff',
    colorDark: '#2f58d8',
    games: BASIC,
    world: { sky: ['#e2e9ff', '#f8faff'], ground: '#cbd8ff', decor: ['🏫', '📚', '✏️', '🌳', '🔔', '🌼'], icon: '🎒' },
    setReward: 'giant-pencil',
    words: [
      thing('book', 'carte', '📕'),
      thing('pencil', 'creion', '✏️'),
      thing('bag', 'ghiozdan', '🎒'),
      thing('crayon', 'creion colorat', '🖍️'),
      thing('scissors', 'foarfecă', '✂️'),
      thing('ruler', 'riglă', '📏'),
      thing('paper', 'hârtie', '📄'),
      thing('pen', 'pix', '🖊️'),
      thing('teacher', 'învățătoare', '🧑‍🏫'),
      thing('school', 'școală', '🏫'),
    ],
    lessons: [
      { id: 'school-1', newWords: ['book', 'pencil', 'bag'], sticker: '📐' },
      { id: 'school-2', newWords: ['crayon', 'scissors', 'ruler'], sticker: '📎' },
      { id: 'school-3', newWords: ['paper', 'pen'], sticker: '🖌️' },
      { id: 'school-4', newWords: ['teacher', 'school'], sticker: '📚' },
      { id: 'school-5', newWords: [], sticker: '🎓', boss: true },
    ],
  },
  {
    id: 'nature',
    title: 'Natura',
    color: '#4cbf4a',
    colorDark: '#2f9a2e',
    games: BASIC,
    world: { sky: ['#dcf6ff', '#f2fff0'], ground: '#b4e69a', decor: ['🌲', '🍄', '🦔', '🌿', '🐞', '⛰️'], icon: '🌲' },
    setReward: 'butterfly-wings',
    words: [
      thing('tree', 'copac', '🌳'),
      thing('flower', 'floare', '🌸'),
      thing('leaf', 'frunză', '🍃'),
      thing('grass', 'iarbă', '🌱'),
      thing('mountain', 'munte', '⛰️'),
      thing('river', 'râu', '🏞️'),
      thing('sea', 'mare', '🌊'),
      thing('moon', 'lună', '🌙'),
      thing('star', 'stea', '⭐'),
      thing('rock', 'piatră', '🪨'),
    ],
    lessons: [
      { id: 'nature-1', newWords: ['tree', 'flower', 'leaf'], sticker: '🍀' },
      { id: 'nature-2', newWords: ['grass', 'mountain', 'river'], sticker: '🌲' },
      { id: 'nature-3', newWords: ['sea', 'moon'], sticker: '🐞' },
      { id: 'nature-4', newWords: ['star', 'rock'], sticker: '🍄' },
      { id: 'nature-5', newWords: [], sticker: '🏔️', boss: true },
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
