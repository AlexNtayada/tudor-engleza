import type { ReactNode } from 'react'
import { Accessory, useOutfit } from './Outfit'
import type { Slot } from '../gamify'
import { mascot, type MascotId } from '../mascots'

export type Mood = 'idle' | 'talk' | 'happy' | 'dance' | 'oops' | 'sleep'

// Original chibi friends in the app's cartoon style. They all share one skeleton (head centred near
// 112,70, eyes at 95/131,76, hands at 60,150 and 160,145) so every wardrobe item fits every friend.

const LINE = '#2b2118'
const MOUTH = '#8a2b2b'
const TONGUE = '#ff6f8e'

const ink = {
  stroke: LINE,
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

interface Look {
  /** Body and head colour. */
  main: string
  /** Shade of main for small details. */
  dark: string
  /** Colour around the eyes (sleepy eyelids use it). */
  lid: string
  hand: string
  foot: string
  /** Drawn first, behind everything (tails, wings, spines). */
  behind?: ReactNode
  /** Drawn just behind the head (ears, horns, antenna). */
  ears?: ReactNode
  /** Head shape plus face patch. */
  head: ReactNode
  /** Drawn on the head after the face patch, before the eyes (headbands). */
  brow?: ReactNode
  /** Drawn after the eyes (noses). */
  nose?: ReactNode
  /** Belly, belt, buttons. */
  front?: ReactNode
  /** Arm sleeve colour. */
  arm: string
}

const roundHead = (fill: string) => <ellipse cx="112" cy="70" rx="58" ry="50" fill={fill} {...ink} />

const LOOKS: Record<MascotId, Look> = {
  ninja: {
    main: '#1f9e8f',
    dark: '#137a6e',
    lid: '#ffd9b8',
    hand: '#ffd9b8',
    foot: '#2b3a4a',
    arm: '#1f9e8f',
    behind: (
      <>
        <path d="M60 46 Q 36 36 22 50 Q 38 50 46 60 Z" fill="#ffc21a" {...ink} strokeWidth={4} />
        <path d="M60 52 Q 40 64 30 80 Q 46 72 58 66 Z" fill="#ffc21a" {...ink} strokeWidth={4} />
      </>
    ),
    head: (
      <>
        {roundHead('#1f9e8f')}
        <path d="M60 86 Q 76 116 112 120 Q 84 106 70 72 Z" fill="#137a6e" opacity="0.55" />
        <ellipse cx="113" cy="78" rx="44" ry="34" fill="#ffd9b8" {...ink} strokeWidth={4} />
      </>
    ),
    brow: (
      <>
        <path d="M56 50 Q 112 30 168 50 L 166 62 Q 112 44 58 62 Z" fill="#ffc21a" {...ink} strokeWidth={4} />
        <rect x="98" y="37" width="30" height="20" rx="6" fill="#fff" {...ink} strokeWidth={3.5} />
        <polygon points={star(113, 47.5, 8)} fill="#ffc21a" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
    front: (
      <>
        <path d="M96 118 L 108 140 L 120 118" fill="none" {...ink} strokeWidth={3.5} />
        <rect x="68" y="148" width="80" height="12" rx="5" fill="#ffc21a" {...ink} strokeWidth={3.5} />
        <path
          d="M106 160 Q 102 172 96 176 M 110 160 Q 114 172 120 176"
          fill="none"
          stroke="#ffc21a"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </>
    ),
  },

  // Vulpița Pip: orange fox, white face and belly, dark-tipped ears, big bushy tail.
  pip: {
    main: '#ff8a3d',
    dark: '#d8641c',
    lid: '#fff6ea',
    hand: '#4a2e1f',
    foot: '#4a2e1f',
    arm: '#ff8a3d',
    behind: (
      <>
        <path d="M138 172 Q 200 176 190 112 Q 186 92 170 100 Q 182 146 138 152 Z" fill="#ff8a3d" {...ink} />
        <path d="M190 112 Q 186 92 170 100 Q 172 112 176 122 Q 186 120 190 112 Z" fill="#fff6ea" {...ink} strokeWidth={3.5} />
      </>
    ),
    ears: (
      <>
        <path d="M64 50 L 57 7 L 102 28 Z" fill="#ff8a3d" {...ink} />
        <path d="M68 41 L 64 18 L 88 30 Z" fill="#4a2e1f" />
        <path d="M162 50 L 169 7 L 124 28 Z" fill="#ff8a3d" {...ink} />
        <path d="M158 41 L 162 18 L 138 30 Z" fill="#4a2e1f" />
      </>
    ),
    head: (
      <>
        {roundHead('#ff8a3d')}
        <path
          d="M66 78 Q 70 116 113 118 Q 156 116 160 78 Q 148 58 128 58 Q 113 74 98 58 Q 78 58 66 78 Z"
          fill="#fff6ea"
          {...ink}
          strokeWidth={4}
        />
      </>
    ),
    nose: <ellipse cx="113" cy="91" rx="5.5" ry="4" fill={LINE} />,
    front: <ellipse cx="108" cy="154" rx="24" ry="22" fill="#fff6ea" {...ink} strokeWidth={3.5} />,
  },

  // Ursulețul Bobo: soft brown bear with round ears and a light muzzle.
  bobo: {
    main: '#b9824f',
    dark: '#8f5f33',
    lid: '#b9824f',
    hand: '#8f5f33',
    foot: '#8f5f33',
    arm: '#b9824f',
    ears: (
      <>
        <circle cx="66" cy="32" r="19" fill="#b9824f" {...ink} />
        <circle cx="66" cy="32" r="9" fill="#f4a3a3" />
        <circle cx="158" cy="32" r="19" fill="#b9824f" {...ink} />
        <circle cx="158" cy="32" r="9" fill="#f4a3a3" />
      </>
    ),
    head: (
      <>
        {roundHead('#b9824f')}
        <ellipse cx="113" cy="98" rx="22" ry="15" fill="#f6dcb8" {...ink} strokeWidth={3.5} />
      </>
    ),
    nose: <ellipse cx="113" cy="90" rx="7" ry="5" fill={LINE} />,
    front: <ellipse cx="108" cy="152" rx="26" ry="23" fill="#f6dcb8" {...ink} strokeWidth={3.5} />,
  },

  // Ariciul Rici: hedgehog with a crown of spines and a cream face.
  rici: {
    main: '#9a6a45',
    dark: '#6e4a2e',
    lid: '#ffe2bf',
    hand: '#ffe2bf',
    foot: '#6e4a2e',
    arm: '#9a6a45',
    behind: (
      <polygon
        points={Array.from({ length: 27 }, (_, i) => {
          const a = Math.PI * (0.92 + (1.16 * i) / 26)
          const r = i % 2 === 0 ? 62 : 80
          return `${(112 + r * Math.cos(a)).toFixed(1)},${(78 + r * 0.92 * Math.sin(a)).toFixed(1)}`
        }).join(' ')}
        fill="#6e4a2e"
        {...ink}
      />
    ),
    ears: (
      <>
        <circle cx="70" cy="40" r="11" fill="#ffe2bf" {...ink} strokeWidth={4} />
        <circle cx="154" cy="40" r="11" fill="#ffe2bf" {...ink} strokeWidth={4} />
      </>
    ),
    head: (
      <>
        {roundHead('#9a6a45')}
        <path d="M84 30 L 92 20 L 98 30 M 110 26 L 116 14 L 122 26 M 132 30 L 140 20 L 144 32" fill="none" stroke="#6e4a2e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="113" cy="82" rx="46" ry="34" fill="#ffe2bf" {...ink} strokeWidth={4} />
      </>
    ),
    nose: <ellipse cx="113" cy="91" rx="6" ry="4.5" fill={LINE} />,
    front: <ellipse cx="108" cy="152" rx="25" ry="22" fill="#ffe2bf" {...ink} strokeWidth={3.5} />,
  },

  // Robo Bip: friendly robot with a screen face, antenna and a button panel.
  bip: {
    main: '#8fd0e8',
    dark: '#4a9ab8',
    lid: '#eaf8fd',
    hand: '#c7d3dc',
    foot: '#4b5b6b',
    arm: '#8fd0e8',
    ears: (
      <>
        <path d="M113 26 L 113 8" {...ink} />
        <circle className="bip-light" cx="113" cy="6" r="7" fill="#ff5a6e" {...ink} strokeWidth={3.5} />
        <rect x="46" y="56" width="16" height="30" rx="5" fill="#c7d3dc" {...ink} strokeWidth={4} />
        <rect x="164" y="56" width="16" height="30" rx="5" fill="#c7d3dc" {...ink} strokeWidth={4} />
      </>
    ),
    head: (
      <>
        <rect x="56" y="24" width="114" height="94" rx="28" fill="#8fd0e8" {...ink} />
        <rect x="68" y="46" width="90" height="64" rx="18" fill="#eaf8fd" {...ink} strokeWidth={4} />
        <path d="M76 36 L 90 36" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </>
    ),
    front: (
      <>
        <rect x="88" y="132" width="42" height="26" rx="7" fill="#eaf8fd" {...ink} strokeWidth={3.5} />
        <circle cx="99" cy="145" r="4.5" fill="#ff5a6e" />
        <circle cx="109" cy="145" r="4.5" fill="#ffc21a" />
        <circle cx="119" cy="145" r="4.5" fill="#22b573" />
      </>
    ),
  },

  // Dragonița Zuzu: little green dragon with horns, orange wings, a tail and a striped belly.
  zuzu: {
    main: '#5cc46a',
    dark: '#3a9a4a',
    lid: '#c9f0b8',
    hand: '#5cc46a',
    foot: '#3a9a4a',
    arm: '#5cc46a',
    behind: (
      <>
        <path d="M72 128 Q 28 92 18 120 Q 32 124 30 140 Q 46 134 50 152 Q 60 140 72 146 Z" fill="#ff9f43" {...ink} />
        <path d="M144 128 Q 188 92 198 120 Q 184 124 186 140 Q 170 134 166 152 Q 156 140 144 146 Z" fill="#ff9f43" {...ink} />
        <path d="M80 170 Q 30 184 20 154 Q 40 166 78 156 Z" fill="#5cc46a" {...ink} />
        <path d="M24 158 L 12 146 L 30 150 Z" fill="#ff9f43" {...ink} strokeWidth={3.5} />
      </>
    ),
    ears: (
      <>
        <path d="M78 36 Q 70 12 82 5 Q 86 20 96 28 Z" fill="#fff1c9" {...ink} />
        <path d="M148 36 Q 156 12 144 5 Q 140 20 130 28 Z" fill="#fff1c9" {...ink} />
      </>
    ),
    head: (
      <>
        {roundHead('#5cc46a')}
        <ellipse cx="113" cy="80" rx="44" ry="33" fill="#c9f0b8" {...ink} strokeWidth={4} />
      </>
    ),
    nose: (
      <>
        <circle cx="108" cy="91" r="2.4" fill={LINE} />
        <circle cx="118" cy="91" r="2.4" fill={LINE} />
      </>
    ),
    front: (
      <>
        <ellipse cx="108" cy="152" rx="24" ry="24" fill="#ffe08a" {...ink} strokeWidth={3.5} />
        <path d="M88 144 Q 108 150 128 144 M 86 156 Q 108 162 130 156" fill="none" stroke="#e2b23a" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
}

function Eye({ cx, cy, pupil = 7.5, look = [2, 2] }: { cx: number; cy: number; pupil?: number; look?: [number, number] }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="13" ry="15" fill="#fff" {...ink} strokeWidth={3.5} />
      <circle cx={cx + look[0]} cy={cy + look[1]} r={pupil} fill={LINE} />
      <circle cx={cx + look[0] + 2.5} cy={cy + look[1] - 3} r={pupil * 0.36} fill="#fff" />
    </>
  )
}

function HappyEye({ cx, cy }: { cx: number; cy: number }) {
  return <path d={`M${cx - 10} ${cy + 4} Q ${cx} ${cy - 10} ${cx + 10} ${cy + 4}`} fill="none" {...ink} strokeWidth={5} />
}

function SleepyEye({ cx, cy, lid }: { cx: number; cy: number; lid: string }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="13" ry="15" fill="#fff" {...ink} strokeWidth={3.5} />
      <circle cx={cx + 2} cy={cy + 7} r="5.5" fill={LINE} />
      <path d={`M${cx - 13} ${cy + 1} A 13 15 0 0 1 ${cx + 13} ${cy + 1} Z`} fill={lid} />
      <path d={`M${cx - 14} ${cy + 1} L ${cx + 14} ${cy + 1}`} {...ink} strokeWidth={3.5} />
      <path d={`M${cx - 13} ${cy} A 13 15 0 0 1 ${cx + 13} ${cy}`} fill="none" {...ink} strokeWidth={3.5} />
    </>
  )
}

/** The child's friend. Draws the mascot they picked unless `kind` asks for a specific one. */
export function Mascot({
  mood = 'idle',
  size = 160,
  outfit,
  kind,
}: {
  mood?: Mood
  size?: number
  outfit?: Partial<Record<Slot, string>>
  kind?: MascotId
}) {
  const saved = useOutfit()
  const wear = outfit ?? saved
  const id = kind ?? mascot().id
  const L = LOOKS[id]
  const joyful = mood === 'happy' || mood === 'dance'
  return (
    <div className={`dino mascot mascot-${id} dino-${mood}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <ellipse cx="108" cy="192" rx="54" ry="6" fill="rgba(40,30,10,0.14)" />
        <g className="dino-body">
          {L.behind}
          {wear.back && <Accessory id={wear.back} />}
          {/* feet */}
          <path d="M74 190 Q 72 172 90 172 Q 104 172 104 190 Z" fill={L.foot} {...ink} />
          <path d="M112 190 Q 112 172 128 172 Q 146 172 144 190 Z" fill={L.foot} {...ink} />
          {/* body */}
          <path d="M70 118 Q 66 180 86 180 L 132 180 Q 152 180 146 118 Z" fill={L.main} {...ink} />
          {L.front}
          {/* arms */}
          <g className="dino-arm-left">
            <ellipse cx="66" cy="136" rx="10" ry="17" fill={L.arm} {...ink} strokeWidth={4} transform="rotate(25 66 136)" />
            <circle cx="60" cy="150" r="7" fill={L.hand} {...ink} strokeWidth={3.5} />
          </g>
          <g className="dino-arm-right">
            <ellipse cx="152" cy="132" rx="10" ry="17" fill={L.arm} {...ink} strokeWidth={4} transform="rotate(-30 152 132)" />
            <circle cx="160" cy="145" r="7" fill={L.hand} {...ink} strokeWidth={3.5} />
          </g>
          <g className="dino-head">
            {L.ears}
            {L.head}
            {L.brow}
            {/* cheeks */}
            <ellipse cx="82" cy="96" rx="8" ry="5" fill="#ff7a59" opacity="0.45" />
            <ellipse cx="146" cy="96" rx="8" ry="5" fill="#ff7a59" opacity="0.45" />
            {joyful ? (
              <>
                <HappyEye cx={95} cy={76} />
                <HappyEye cx={131} cy={76} />
              </>
            ) : mood === 'sleep' ? (
              <>
                <SleepyEye cx={95} cy={76} lid={L.lid} />
                <SleepyEye cx={131} cy={76} lid={L.lid} />
              </>
            ) : (
              <g className="dino-eyes">
                <Eye cx={95} cy={76} pupil={mood === 'oops' ? 5 : 7.5} look={mood === 'oops' ? [0, 0] : [2, 2]} />
                <Eye cx={131} cy={76} pupil={mood === 'oops' ? 5 : 7.5} look={mood === 'oops' ? [0, 0] : [2, 2]} />
              </g>
            )}
            {L.nose}
            {mood === 'idle' && <path d="M104 99 Q 113 107 122 99" fill="none" {...ink} strokeWidth={3.5} />}
            {mood === 'talk' && (
              <g className="dino-mouth-talk">
                <ellipse cx="113" cy="102" rx="8" ry="6.5" fill={MOUTH} {...ink} strokeWidth={3} />
                <ellipse cx="113" cy="105" rx="4.5" ry="2.5" fill={TONGUE} />
              </g>
            )}
            {mood === 'happy' && (
              <>
                <path d="M100 97 Q 113 117 126 97 Z" fill={MOUTH} {...ink} strokeWidth={3.5} />
                <path d="M106 106 Q 113 102 120 106 Q 113 112 106 106 Z" fill={TONGUE} />
              </>
            )}
            {mood === 'dance' && (
              <>
                <path d="M102 99 Q 113 108 124 99" fill="none" {...ink} strokeWidth={3.5} />
                <path d="M110 103 Q 110 114 115 114 Q 121 114 120 102 Z" fill={TONGUE} {...ink} strokeWidth={3} />
              </>
            )}
            {mood === 'oops' && <ellipse cx="113" cy="103" rx="6" ry="7.5" fill={MOUTH} {...ink} strokeWidth={3} />}
            {mood === 'sleep' && <ellipse cx="113" cy="103" rx="7" ry="8.5" fill={MOUTH} {...ink} strokeWidth={3} />}
          </g>
          {wear.neck && <Accessory id={wear.neck} />}
          {wear.face && (
            <g transform="translate(1 10)">
              <Accessory id={wear.face} />
            </g>
          )}
          {wear.head && <Accessory id={wear.head} />}
          {wear.hand && (
            <g className="ninja-hand-item">
              <Accessory id={wear.hand} />
              <circle cx="160" cy="145" r="7" fill={L.hand} {...ink} strokeWidth={3.5} />
            </g>
          )}
        </g>
        {mood === 'sleep' && (
          <text className="dino-zzz" x="160" y="30" fontSize="26" fontWeight="800" fill={L.dark}>
            z
          </text>
        )}
      </svg>
    </div>
  )
}
