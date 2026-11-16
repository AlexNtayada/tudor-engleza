import { Accessory, useOutfit } from './Outfit'

export type Mood = 'idle' | 'talk' | 'happy' | 'dance' | 'oops' | 'sleep'

// Cartoon style: sunny yellow, white belly, teal spikes, thick dark outline.
export const DINO_COLORS = {
  body: '#ffc21a',
  shade: '#f5a000',
  belly: '#ffffff',
  spike: '#1f7a72',
  feet: '#ff9419',
  line: '#2b2118',
  mouth: '#8a2b2b',
  tongue: '#ff6f8e',
}
const C = DINO_COLORS

const ink = {
  stroke: C.line,
  strokeWidth: 4.5,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

/** Spike: a rounded triangle on Dino's back, tip pointing to (tx, ty). */
function Spike({ x, y, tx, ty, w = 10 }: { x: number; y: number; tx: number; ty: number; w?: number }) {
  // base centred on (x, y), perpendicular to the tip direction
  const dx = tx - x
  const dy = ty - y
  const len = Math.hypot(dx, dy) || 1
  const px = (-dy / len) * w
  const py = (dx / len) * w
  return (
    <path
      d={`M${x + px} ${y + py} Q ${tx + px * 0.15} ${ty + py * 0.15} ${tx} ${ty} Q ${tx - px * 0.15} ${ty - py * 0.15} ${x - px} ${y - py} Z`}
      fill={C.spike}
      {...ink}
      strokeWidth={4}
    />
  )
}

function Eye({ cx, cy, look = [3, 3], pupil = 7 }: { cx: number; cy: number; look?: [number, number]; pupil?: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="15" ry="17" fill="#fff" {...ink} strokeWidth={4} />
      <circle cx={cx + look[0]} cy={cy + look[1]} r={pupil} fill={C.line} />
      <circle cx={cx + look[0] + 2.5} cy={cy + look[1] - 3} r={pupil * 0.36} fill="#fff" />
    </>
  )
}

/** Sleepy eye: lid drawn down over the top half. */
function SleepyEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="15" ry="17" fill="#fff" {...ink} strokeWidth={4} />
      <circle cx={cx + 2} cy={cy + 8} r="6" fill={C.line} />
      <path d={`M${cx - 15} ${cy + 1} A 15 17 0 0 1 ${cx + 15} ${cy + 1} Z`} fill={C.body} />
      <path d={`M${cx - 16} ${cy + 1} L ${cx + 16} ${cy + 1}`} {...ink} strokeWidth={4} />
      <path d={`M${cx - 15} ${cy} A 15 17 0 0 1 ${cx + 15} ${cy}`} fill="none" {...ink} strokeWidth={4} />
    </>
  )
}

function HappyEye({ cx, cy }: { cx: number; cy: number }) {
  return <path d={`M${cx - 11} ${cy + 4} Q ${cx} ${cy - 12} ${cx + 11} ${cy + 4}`} fill="none" {...ink} strokeWidth={5} />
}

export function Dino({
  mood = 'idle',
  size = 160,
  outfit,
}: {
  mood?: Mood
  size?: number
  /** Override what Dino wears (defaults to the saved outfit). */
  outfit?: Partial<Record<'head' | 'face' | 'neck', string>>
}) {
  const saved = useOutfit()
  const wear = outfit ?? saved
  const joyful = mood === 'happy' || mood === 'dance'
  return (
    <div className={`dino dino-${mood}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* shadow */}
        <ellipse cx="104" cy="192" rx="62" ry="6" fill="rgba(80,50,0,0.14)" />
        <g className="dino-body">
          {/* tail with little spikes */}
          <Spike x={36} y={142} tx={26} ty={124} w={6} />
          <Spike x={22} y={136} tx={8} ty={124} w={5} />
          <path d="M66 146 C 44 160, 20 156, 4 134 C 24 146, 44 140, 62 126 Z" fill={C.body} {...ink} />
          {/* back spikes */}
          <Spike x={74} y={30} tx={60} ty={14} />
          <Spike x={60} y={48} tx={40} ty={38} />
          <Spike x={54} y={72} tx={32} ty={68} />
          <Spike x={56} y={98} tx={34} ty={100} />
          <Spike x={56} y={124} tx={36} ty={132} />
          {/* feet */}
          <g>
            <path d="M60 190 Q 60 168 82 168 Q 104 168 104 190 Z" fill={C.feet} {...ink} />
            <path d="M75 190 L 75 182 M 89 190 L 89 182" {...ink} strokeWidth={3} />
            <path d="M106 190 Q 106 168 128 168 Q 150 168 150 190 Z" fill={C.feet} {...ink} />
            <path d="M121 190 L 121 182 M 135 190 L 135 182" {...ink} strokeWidth={3} />
          </g>
          {/* body */}
          <ellipse cx="104" cy="136" rx="52" ry="44" fill={C.body} {...ink} />
          <path d="M60 150 Q 70 176 104 179 Q 80 168 70 140 Z" fill={C.shade} opacity="0.55" />
          <ellipse cx="114" cy="146" rx="30" ry="29" fill={C.belly} {...ink} strokeWidth={3.5} />
          {/* arms */}
          <g className="dino-arm-left">
            <ellipse cx="74" cy="134" rx="9" ry="15" fill={C.body} {...ink} strokeWidth={4} transform="rotate(30 74 134)" />
          </g>
          <g className="dino-arm-right">
            <ellipse cx="150" cy="128" rx="9" ry="15" fill={C.body} {...ink} strokeWidth={4} transform="rotate(-35 150 128)" />
          </g>
          {/* head */}
          <g className="dino-head">
            <ellipse cx="112" cy="70" rx="58" ry="48" fill={C.body} {...ink} />
            <path d="M58 82 Q 70 112 112 118 Q 80 104 70 70 Z" fill={C.shade} opacity="0.5" />
            <ellipse cx="140" cy="36" rx="14" ry="7" fill="#fff" opacity="0.45" transform="rotate(20 140 36)" />
            {/* cheeks */}
            <ellipse cx="76" cy="92" rx="9" ry="5.5" fill="#ff7a59" opacity="0.45" />
            <ellipse cx="152" cy="90" rx="9" ry="5.5" fill="#ff7a59" opacity="0.45" />
            {/* eyes */}
            {joyful ? (
              <>
                <HappyEye cx={94} cy={66} />
                <HappyEye cx={132} cy={66} />
              </>
            ) : mood === 'sleep' ? (
              <>
                <SleepyEye cx={94} cy={66} />
                <SleepyEye cx={132} cy={66} />
              </>
            ) : (
              <g className="dino-eyes">
                <Eye cx={94} cy={66} look={mood === 'oops' ? [0, 0] : [3, 3]} pupil={mood === 'oops' ? 5 : 7} />
                <Eye cx={132} cy={66} look={mood === 'oops' ? [0, 0] : [3, 3]} pupil={mood === 'oops' ? 5 : 7} />
              </g>
            )}
            {mood === 'oops' && (
              <path d="M82 42 Q 92 36 102 42 M 122 42 Q 132 36 142 42" fill="none" {...ink} strokeWidth={4} />
            )}
            {/* nostrils */}
            <circle cx="108" cy="86" r="2" fill={C.line} />
            <circle cx="122" cy="86" r="2" fill={C.line} />
            {/* mouth */}
            {mood === 'idle' && (
              <path d="M100 96 Q 114 108 128 96" fill="none" {...ink} strokeWidth={4} />
            )}
            {mood === 'talk' && (
              <g className="dino-mouth-talk">
                <ellipse cx="114" cy="100" rx="10" ry="8" fill={C.mouth} {...ink} strokeWidth={3.5} />
                <ellipse cx="114" cy="104" rx="6" ry="3.5" fill={C.tongue} />
              </g>
            )}
            {mood === 'happy' && (
              <>
                <path d="M96 93 Q 114 120 132 93 Z" fill={C.mouth} {...ink} strokeWidth={4} />
                <path d="M104 106 Q 114 100 124 106 Q 114 114 104 106 Z" fill={C.tongue} />
              </>
            )}
            {mood === 'dance' && (
              <>
                <path d="M98 96 Q 114 110 130 96" fill="none" {...ink} strokeWidth={4} />
                <path d="M110 102 Q 110 116 117 116 Q 124 116 123 101 Z" fill={C.tongue} {...ink} strokeWidth={3.5} />
              </>
            )}
            {mood === 'oops' && <ellipse cx="114" cy="101" rx="7" ry="9" fill={C.mouth} {...ink} strokeWidth={3.5} />}
            {mood === 'sleep' && (
              <ellipse cx="114" cy="100" rx="9" ry="11" fill={C.mouth} {...ink} strokeWidth={3.5} />
            )}
          </g>
          {wear.neck && <Accessory id={wear.neck} />}
          {wear.face && <Accessory id={wear.face} />}
          {wear.head && <Accessory id={wear.head} />}
        </g>
        {mood === 'sleep' && (
          <text className="dino-zzz" x="160" y="30" fontSize="26" fontWeight="800" fill={C.spike}>
            z
          </text>
        )}
      </svg>
    </div>
  )
}
