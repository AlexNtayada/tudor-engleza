import { Accessory, useOutfit } from './Outfit'

export type Mood = 'idle' | 'talk' | 'happy' | 'dance' | 'oops' | 'sleep'

// Original chibi ninja in the app's cartoon style: teal suit and hood,
// yellow headband with a star, big eyes, thick dark outline.
export const NINJA_COLORS = {
  suit: '#1f9e8f',
  suitDark: '#137a6e',
  skin: '#ffd9b8',
  band: '#ffc21a',
  scarf: '#ff8a3d',
  shoe: '#2b3a4a',
  line: '#2b2118',
  mouth: '#8a2b2b',
  tongue: '#ff6f8e',
}
const C = NINJA_COLORS

const ink = {
  stroke: C.line,
  strokeWidth: 4.5,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

function star(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.45
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

function Eye({
  cx,
  cy,
  pupil = 7.5,
  look = [2, 2],
}: {
  cx: number
  cy: number
  pupil?: number
  look?: [number, number]
}) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="13" ry="15" fill="#fff" {...ink} strokeWidth={3.5} />
      <circle cx={cx + look[0]} cy={cy + look[1]} r={pupil} fill={C.line} />
      <circle cx={cx + look[0] + 2.5} cy={cy + look[1] - 3} r={pupil * 0.36} fill="#fff" />
    </>
  )
}

function HappyEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path d={`M${cx - 10} ${cy + 4} Q ${cx} ${cy - 10} ${cx + 10} ${cy + 4}`} fill="none" {...ink} strokeWidth={5} />
  )
}

function SleepyEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="13" ry="15" fill="#fff" {...ink} strokeWidth={3.5} />
      <circle cx={cx + 2} cy={cy + 7} r="5.5" fill={C.line} />
      <path d={`M${cx - 13} ${cy + 1} A 13 15 0 0 1 ${cx + 13} ${cy + 1} Z`} fill={C.skin} />
      <path d={`M${cx - 14} ${cy + 1} L ${cx + 14} ${cy + 1}`} {...ink} strokeWidth={3.5} />
      <path d={`M${cx - 13} ${cy} A 13 15 0 0 1 ${cx + 13} ${cy}`} fill="none" {...ink} strokeWidth={3.5} />
    </>
  )
}

export function Ninja({
  mood = 'idle',
  size = 160,
  outfit,
}: {
  mood?: Mood
  size?: number
  outfit?: Partial<Record<'head' | 'face' | 'neck', string>>
}) {
  const saved = useOutfit()
  const wear = outfit ?? saved
  const joyful = mood === 'happy' || mood === 'dance'
  return (
    <div className={`dino ninja dino-${mood}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <ellipse cx="108" cy="192" rx="54" ry="6" fill="rgba(40,30,10,0.14)" />
        <g className="dino-body">
          {/* headband tails flying behind */}
          <path d="M60 46 Q 36 36 22 50 Q 38 50 46 60 Z" fill={C.band} {...ink} strokeWidth={4} />
          <path d="M60 52 Q 40 64 30 80 Q 46 72 58 66 Z" fill={C.band} {...ink} strokeWidth={4} />
          {/* feet */}
          <path d="M74 190 Q 72 172 90 172 Q 104 172 104 190 Z" fill={C.shoe} {...ink} />
          <path d="M112 190 Q 112 172 128 172 Q 146 172 144 190 Z" fill={C.shoe} {...ink} />
          {/* body */}
          <path d="M70 118 Q 66 180 86 180 L 132 180 Q 152 180 146 118 Z" fill={C.suit} {...ink} />
          <path d="M96 118 L 108 140 L 120 118" fill="none" {...ink} strokeWidth={3.5} />
          {/* belt */}
          <rect x="68" y="148" width="80" height="12" rx="5" fill={C.band} {...ink} strokeWidth={3.5} />
          <path
            d="M106 160 Q 102 172 96 176 M 110 160 Q 114 172 120 176"
            fill="none"
            stroke={C.band}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* arms */}
          <g className="dino-arm-left">
            <ellipse
              cx="66"
              cy="136"
              rx="10"
              ry="17"
              fill={C.suit}
              {...ink}
              strokeWidth={4}
              transform="rotate(25 66 136)"
            />
            <circle cx="60" cy="150" r="7" fill={C.skin} {...ink} strokeWidth={3.5} />
          </g>
          <g className="dino-arm-right">
            <ellipse
              cx="152"
              cy="132"
              rx="10"
              ry="17"
              fill={C.suit}
              {...ink}
              strokeWidth={4}
              transform="rotate(-30 152 132)"
            />
            <circle cx="160" cy="145" r="7" fill={C.skin} {...ink} strokeWidth={3.5} />
          </g>
          {/* head: hood with the face peeking out */}
          <g className="dino-head">
            <ellipse cx="112" cy="70" rx="58" ry="50" fill={C.suit} {...ink} />
            <path d="M60 86 Q 76 116 112 120 Q 84 106 70 72 Z" fill={C.suitDark} opacity="0.55" />
            <ellipse cx="113" cy="78" rx="44" ry="34" fill={C.skin} {...ink} strokeWidth={4} />
            {/* headband with a star plate */}
            <path d="M56 50 Q 112 30 168 50 L 166 62 Q 112 44 58 62 Z" fill={C.band} {...ink} strokeWidth={4} />
            <rect x="98" y="37" width="30" height="20" rx="6" fill="#fff" {...ink} strokeWidth={3.5} />
            <polygon points={star(113, 47.5, 8)} fill={C.band} stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
            {/* cheeks */}
            <ellipse cx="82" cy="94" rx="8" ry="5" fill="#ff7a59" opacity="0.45" />
            <ellipse cx="146" cy="94" rx="8" ry="5" fill="#ff7a59" opacity="0.45" />
            {/* eyes */}
            {joyful ? (
              <>
                <HappyEye cx={95} cy={76} />
                <HappyEye cx={131} cy={76} />
              </>
            ) : mood === 'sleep' ? (
              <>
                <SleepyEye cx={95} cy={76} />
                <SleepyEye cx={131} cy={76} />
              </>
            ) : (
              <g className="dino-eyes">
                <Eye cx={95} cy={76} pupil={mood === 'oops' ? 5 : 7.5} look={mood === 'oops' ? [0, 0] : [2, 2]} />
                <Eye cx={131} cy={76} pupil={mood === 'oops' ? 5 : 7.5} look={mood === 'oops' ? [0, 0] : [2, 2]} />
              </g>
            )}
            {/* mouth */}
            {mood === 'idle' && <path d="M104 98 Q 113 106 122 98" fill="none" {...ink} strokeWidth={3.5} />}
            {mood === 'talk' && (
              <g className="dino-mouth-talk">
                <ellipse cx="113" cy="101" rx="8" ry="6.5" fill={C.mouth} {...ink} strokeWidth={3} />
                <ellipse cx="113" cy="104" rx="4.5" ry="2.5" fill={C.tongue} />
              </g>
            )}
            {mood === 'happy' && (
              <>
                <path d="M100 96 Q 113 116 126 96 Z" fill={C.mouth} {...ink} strokeWidth={3.5} />
                <path d="M106 105 Q 113 101 120 105 Q 113 111 106 105 Z" fill={C.tongue} />
              </>
            )}
            {mood === 'dance' && (
              <>
                <path d="M102 98 Q 113 107 124 98" fill="none" {...ink} strokeWidth={3.5} />
                <path d="M110 102 Q 110 113 115 113 Q 121 113 120 101 Z" fill={C.tongue} {...ink} strokeWidth={3} />
              </>
            )}
            {mood === 'oops' && <ellipse cx="113" cy="102" rx="6" ry="7.5" fill={C.mouth} {...ink} strokeWidth={3} />}
            {mood === 'sleep' && <ellipse cx="113" cy="102" rx="7" ry="8.5" fill={C.mouth} {...ink} strokeWidth={3} />}
          </g>
          {wear.neck && <Accessory id={wear.neck} />}
          {wear.face && (
            <g transform="translate(1 10)">
              <Accessory id={wear.face} />
            </g>
          )}
          {wear.head && <Accessory id={wear.head} />}
        </g>
        {mood === 'sleep' && (
          <text className="dino-zzz" x="160" y="30" fontSize="26" fontWeight="800" fill={C.suitDark}>
            z
          </text>
        )}
      </svg>
    </div>
  )
}
