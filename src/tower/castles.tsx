// The castles Tudor can collect: one sticker for every land won. The chosen one stands on every map.

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

export interface CastleLook {
  /** Same id as the map that gives it. */
  id: string
  name: string
  wall: string
  tower: string
  roof: string
  flag: string
  door: string
  /** Round domes instead of pointy roofs. */
  dome?: boolean
  /** Little extra on the top: snow caps, a lollipop, a shell. */
  top?: 'snow' | 'lolly' | 'shell' | 'flame' | 'leaf' | 'sun'
}

export const CASTLES: CastleLook[] = [
  { id: 'forest', name: 'Castelul albastru', wall: '#e6e9f0', tower: '#d9dde6', roof: '#4f86f7', flag: '#ff5a5f', door: '#8b5a2b', top: 'leaf' },
  { id: 'desert', name: 'Palatul de nisip', wall: '#f6dfa8', tower: '#efd18a', roof: '#ff9f43', flag: '#22b573', door: '#a8683a', dome: true, top: 'sun' },
  { id: 'snow', name: 'Castelul de gheață', wall: '#e3f4ff', tower: '#cbe8fb', roof: '#7fc8f8', flag: '#4f86f7', door: '#5a8fc0', top: 'snow' },
  { id: 'beach', name: 'Castelul de pe plajă', wall: '#f4d49a', tower: '#e9c47f', roof: '#3ec6c6', flag: '#ff8fb1', door: '#b98a52', dome: true, top: 'shell' },
  { id: 'volcano', name: 'Fortăreața de foc', wall: '#8b7d76', tower: '#7a6c66', roof: '#e0352b', flag: '#ffc21a', door: '#3a2a24', top: 'flame' },
  { id: 'candy', name: 'Castelul de bomboane', wall: '#ffd9ec', tower: '#ffc4e1', roof: '#7ee0c3', flag: '#b07de0', door: '#c05b8c', dome: true, top: 'lolly' },
]

export const castleById = (id: string | undefined): CastleLook => CASTLES.find((c) => c.id === id) ?? CASTLES[0]

/** Castles earned so far: the first one always, then one for every land won. */
export function ownedCastles(wins: string[]): string[] {
  return CASTLES.filter((c, i) => i === 0 || wins.includes(c.id)).map((c) => c.id)
}

/** The castle that stands on the maps: the chosen one if it has been earned, else the first. */
export function currentCastle(wins: string[] = [], chosen?: string): string {
  return chosen && ownedCastles(wins).includes(chosen) ? chosen : 'forest'
}

function Top({ kind, y }: { kind: CastleLook['top']; y: number }) {
  switch (kind) {
    case 'snow':
      return <path d={`M-14 ${y + 14} Q -8 ${y + 4} 0 ${y + 2} Q 8 ${y + 4} 14 ${y + 14} Q 7 ${y + 10} 0 ${y + 14} Q -7 ${y + 10} -14 ${y + 14} Z`} fill="#fff" {...ink} strokeWidth={1.6} />
    default:
      return null
  }
}

function Roof({ c, h, w }: { c: CastleLook; h: number; w: number }) {
  return c.dome ? (
    <path d={`M${-w} ${-h + 2} Q ${-w} ${-h - 30} 0 ${-h - 34} Q ${w} ${-h - 30} ${w} ${-h + 2} Z`} fill={c.roof} {...ink} />
  ) : (
    <path d={`M${-w} ${-h + 2} L 0 ${-h - 34} L ${w} ${-h + 2} Z`} fill={c.roof} {...ink} />
  )
}

/** A castle standing on (0, 0), about 200 wide and 150 tall. */
export function CastleArt({ c }: { c: CastleLook }) {
  const tower = (tx: number, ty: number, h: number) => (
    <g transform={`translate(${tx} ${ty})`}>
      <rect x="-17" y={-h} width="34" height={h} rx="4" fill={c.tower} {...ink} />
      <Roof c={c} h={h} w={22} />
      {c.top === 'snow' && <Top kind="snow" y={-h - 24} />}
      <path d={`M0 ${-h - 34} V ${-h - 48}`} {...ink} strokeWidth={2} />
      <path d={`M0 ${-h - 48} l 13 4 l -13 4 Z`} fill={c.flag} {...ink} strokeWidth={1.6} />
      <rect x="-5" y={-h + 12} width="10" height="13" rx="5" fill="#5a6273" />
    </g>
  )
  return (
    <g>
      <ellipse cx="0" cy="8" rx="98" ry="14" fill="rgba(30,40,20,.25)" />
      {tower(-56, -26, 58)}
      {tower(56, -26, 58)}
      <rect x="-64" y="-58" width="128" height="64" rx="6" fill={c.wall} {...ink} />
      {[-52, -30, -8, 14, 36].map((cx) => (
        <rect key={cx} x={cx} y="-68" width="14" height="12" rx="2" fill={c.wall} {...ink} strokeWidth={2} />
      ))}
      {c.dome ? (
        <path d="M-34 -58 Q -34 -96 0 -100 Q 34 -96 34 -58 Z" fill={c.roof} {...ink} />
      ) : (
        <path d="M-34 -58 L 0 -96 L 34 -58 Z" fill={c.roof} {...ink} />
      )}
      {c.top === 'snow' && <path d="M-22 -72 Q 0 -100 22 -72 Q 11 -78 0 -74 Q -11 -78 -22 -72 Z" fill="#fff" {...ink} strokeWidth={1.6} />}
      {c.top === 'lolly' && (
        <g>
          <path d="M0 -98 V -118" stroke="#fff" strokeWidth="4" />
          <circle cx="0" cy="-124" r="10" fill="#ff7eb6" {...ink} strokeWidth={2} />
          <path d="M0 -124 m -6 0 a 6 6 0 1 0 12 0 a 3 3 0 1 0 -6 0" fill="none" stroke="#fff" strokeWidth="2" />
        </g>
      )}
      {c.top === 'shell' && <path d="M-10 -100 Q 0 -122 10 -100 Z M-5 -100 L 0 -116 L 5 -100" fill="#ffb3c7" {...ink} strokeWidth={1.8} />}
      {c.top === 'flame' && <path d="M0 -94 Q -10 -106 -4 -118 Q -2 -110 2 -112 Q 0 -122 8 -128 Q 6 -116 10 -108 Q 12 -100 0 -94 Z" fill="#ffa63d" {...ink} strokeWidth={1.8} />}
      {c.top === 'sun' && <circle cx="0" cy="-108" r="8" fill="#ffd23f" {...ink} strokeWidth={1.8} />}
      {c.top === 'leaf' && <path d="M0 -96 V -110 l 12 4 l -12 4" fill="#ffc21a" {...ink} strokeWidth={1.8} />}
      <rect x="-9" y="-80" width="18" height="22" rx="2" fill="#ffc21a" {...ink} strokeWidth={2} />
      <path d="M-22 6 V -20 Q -22 -40 0 -40 Q 22 -40 22 -20 V 6 Z" fill={c.door} {...ink} />
      <path d="M0 -40 V 6 M-22 -14 H 22" stroke="rgba(0,0,0,.25)" strokeWidth="2" />
      {tower(-86, 8, 50)}
      {tower(86, 8, 50)}
    </g>
  )
}

/** The castle as a sticker (album, cards). */
export function CastleSticker({ id, size = 80, locked = false }: { id: string; size?: number; locked?: boolean }) {
  return (
    <svg viewBox="-110 -140 220 160" width={size} height={(size * 160) / 220} aria-hidden style={locked ? { filter: 'grayscale(1) brightness(1.4)', opacity: 0.4 } : undefined}>
      <CastleArt c={castleById(id)} />
    </svg>
  )
}
