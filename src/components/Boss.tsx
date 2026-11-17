// Unit bosses: one original, grumpy-but-cute character guarding the end of each unit.
// Every boss has its own body tied to the unit's theme; all of them share the same face
// moods (idle, hit, laugh, down) so the boss stage animations work the same way.

import type { ReactNode } from 'react'

export type BossMood = 'idle' | 'hit' | 'laugh' | 'down'

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 4.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

type Draw = (mood: BossMood) => ReactNode

export type BossInfo = {
  id: string
  name: string
  /** Short Romanian description shown under the name. */
  title: string
  /** What the boss says when the test starts (Romanian, spoken only when instructions are in Romanian). */
  taunt: string
  draw: Draw
}

/** The shared face, drawn around (100, 100) and moved/scaled onto each body. */
function Face({ mood, x = 100, y = 100, s = 1, brows = true }: { mood: BossMood; x?: number; y?: number; s?: number; brows?: boolean }) {
  const down = mood === 'down'
  const hit = mood === 'hit'
  const laugh = mood === 'laugh'
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-100 -100)`}>
      {down ? (
        <g>
          <path d="M58 70 L 82 92 M 82 70 L 58 92" {...ink} strokeWidth={6} />
          <path d="M118 70 L 142 92 M 142 70 L 118 92" {...ink} strokeWidth={6} />
        </g>
      ) : hit ? (
        <g>
          <path d="M56 82 L 82 74 L 56 66" fill="none" {...ink} strokeWidth={6} />
          <path d="M144 82 L 118 74 L 144 66" fill="none" {...ink} strokeWidth={6} />
        </g>
      ) : (
        <g>
          <ellipse cx="70" cy="80" rx="17" ry="19" fill="#fff" {...ink} strokeWidth={4} />
          <ellipse cx="130" cy="80" rx="17" ry="19" fill="#fff" {...ink} strokeWidth={4} />
          <circle cx={laugh ? 70 : 74} cy="84" r="8" fill={L} />
          <circle cx={laugh ? 130 : 126} cy="84" r="8" fill={L} />
          <circle cx={laugh ? 73 : 77} cy="80" r="3" fill="#fff" />
          <circle cx={laugh ? 133 : 129} cy="80" r="3" fill="#fff" />
          {brows && !laugh && <path d="M50 58 L 86 66 M 150 58 L 114 66" {...ink} strokeWidth={6} />}
        </g>
      )}
      {laugh ? (
        <g>
          <path d="M66 112 Q 100 156 134 112 Z" fill="#8a2b2b" {...ink} strokeWidth={4} />
          <path d="M82 132 Q 100 124 118 132 Q 100 146 82 132 Z" fill="#ff6f8e" />
          <path d="M78 113 L 84 124 L 90 114 M 110 114 L 116 124 L 122 113" fill="#fff" stroke={L} strokeWidth="2.5" />
        </g>
      ) : down ? (
        <path d="M74 128 Q 87 116 100 128 Q 113 140 126 128" fill="none" {...ink} strokeWidth={4.5} />
      ) : (
        <g>
          <path d="M70 124 Q 100 108 130 124" fill="none" {...ink} strokeWidth={5} />
          <path d="M80 120 L 86 132 L 92 117 M 108 117 L 114 132 L 120 120" fill="#fff" stroke={L} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
      <ellipse cx="46" cy="110" rx="9" ry="5.5" fill="#ff7a59" opacity="0.4" />
      <ellipse cx="154" cy="110" rx="9" ry="5.5" fill="#ff7a59" opacity="0.4" />
    </g>
  )
}

/** Little stubby arms that wave (CSS animates .boss-arm-left / .boss-arm-right). */
function Arms({ color, y = 112, x = 26, children }: { color: string; y?: number; x?: number; children?: ReactNode }) {
  return (
    <>
      <g className="boss-arm-left">
        <path
          d={`M${x} ${y} Q ${x - 22} ${y - 12} ${x - 18} ${y - 30} Q ${x - 4} ${y - 22} ${x + 8} ${y - 14} Z`}
          fill={color}
          {...ink}
          strokeWidth={4}
        />
      </g>
      <g className="boss-arm-right">
        <path
          d={`M${200 - x} ${y} Q ${222 - x} ${y - 12} ${218 - x} ${y - 30} Q ${204 - x} ${y - 22} ${192 - x} ${y - 14} Z`}
          fill={color}
          {...ink}
          strokeWidth={4}
        />
        {children}
      </g>
    </>
  )
}

// ---------- 1. Culori: Pătărilă, a runaway paint blob ----------
const drawPaint: Draw = (mood) => (
  <>
    <ellipse cx="68" cy="186" rx="20" ry="9" fill="#c2389a" {...ink} />
    <ellipse cx="132" cy="186" rx="20" ry="9" fill="#c2389a" {...ink} />
    <Arms color="#ff5cc0" y={118} x={30}>
      {/* paintbrush */}
      <path d="M176 92 L 196 40" {...ink} strokeWidth={7} />
      <path d="M176 92 L 196 40" stroke="#c98a4b" strokeWidth={3} strokeLinecap="round" />
      <path d="M190 44 L 204 50 L 210 30 Q 204 20 196 26 Z" fill="#2fb6ff" {...ink} strokeWidth={3.5} />
    </Arms>
    {/* splat body with drips */}
    <path
      d="M100 34 C 128 26 150 40 160 58 C 182 62 186 86 176 100 C 188 124 180 150 166 162 L 166 176 Q 158 186 150 176 L 150 170 C 130 182 110 184 92 180 L 92 188 Q 82 196 74 186 L 74 176 C 52 172 32 158 26 136 C 16 118 20 96 34 86 C 30 64 46 44 70 44 C 78 38 88 34 100 34 Z"
      fill="#ff5cc0"
      {...ink}
    />
    <path d="M34 130 C 42 158 64 170 92 174 C 64 160 48 146 42 124 Z" fill="#c2389a" opacity="0.4" />
    {/* rainbow paint spots */}
    <circle cx="150" cy="72" r="9" fill="#ffd23f" stroke={L} strokeWidth="3" />
    <circle cx="164" cy="98" r="6" fill="#2fb6ff" stroke={L} strokeWidth="3" />
    <circle cx="42" cy="100" r="7" fill="#3ccf91" stroke={L} strokeWidth="3" />
    <circle cx="60" cy="58" r="5" fill="#ff8a3d" stroke={L} strokeWidth="3" />
    <path d="M130 162 Q 136 172 130 178 Q 124 172 130 162 Z" fill="#ffd23f" stroke={L} strokeWidth="2.5" />
    {/* paint pot hat, tipped over */}
    <g transform="rotate(-14 100 30)">
      <path d="M76 20 L 124 20 L 120 44 L 80 44 Z" fill="#ffd23f" {...ink} strokeWidth={4} />
      <path d="M74 18 L 126 18" {...ink} strokeWidth={6} />
      <path d="M118 22 Q 132 34 128 52" fill="none" stroke="#2fb6ff" strokeWidth="7" strokeLinecap="round" />
    </g>
    <Face mood={mood} y={104} s={0.92} />
  </>
)

// ---------- 2. Animale: Mormăilă, the original horned jungle beast ----------
const drawBeast: Draw = (mood) => {
  const color = '#3ccf91'
  const dark = '#22a872'
  return (
    <>
      <path d="M52 62 Q 30 30 44 8 Q 56 36 76 46 Z" fill="#fff4d6" {...ink} />
      <path d="M148 62 Q 170 30 156 8 Q 144 36 124 46 Z" fill="#fff4d6" {...ink} />
      <ellipse cx="68" cy="184" rx="22" ry="11" fill={dark} {...ink} />
      <ellipse cx="132" cy="184" rx="22" ry="11" fill={dark} {...ink} />
      <path
        d="M100 30 C 160 30 182 80 178 128 C 174 170 144 184 100 184 C 56 184 26 170 22 128 C 18 80 40 30 100 30 Z"
        fill={color}
        {...ink}
      />
      <path d="M30 120 C 34 160 60 178 100 180 C 66 170 44 150 40 116 Z" fill={dark} opacity="0.45" />
      <ellipse cx="100" cy="140" rx="46" ry="34" fill="#ffffff" opacity="0.35" />
      {/* tiger stripes on top */}
      <path d="M84 32 L 90 46 M 100 30 L 100 46 M 116 32 L 110 46" {...ink} strokeWidth={4} />
      <circle cx="146" cy="70" r="7" fill={dark} opacity="0.6" />
      <circle cx="160" cy="92" r="4.5" fill={dark} opacity="0.6" />
      <circle cx="44" cy="84" r="5" fill={dark} opacity="0.6" />
      <Arms color={color} />
      <Face mood={mood} />
    </>
  )
}

// ---------- 3. Numere: Cifroid, a counting robot ----------
const drawRobot: Draw = (mood) => (
  <>
    <rect x="52" y="172" width="34" height="18" rx="6" fill="#3a66d6" {...ink} />
    <rect x="114" y="172" width="34" height="18" rx="6" fill="#3a66d6" {...ink} />
    {/* antenna */}
    <path d="M100 30 L 100 8" {...ink} />
    <circle cx="100" cy="8" r="8" fill="#ff3b5c" {...ink} strokeWidth={4} className="boss-blink" />
    {/* bolt ears */}
    <rect x="14" y="70" width="18" height="34" rx="6" fill="#ffd23f" {...ink} />
    <rect x="168" y="70" width="18" height="34" rx="6" fill="#ffd23f" {...ink} />
    <Arms color="#8fb2ff" y={140} x={32} />
    <rect x="28" y="30" width="144" height="146" rx="30" fill="#8fb2ff" {...ink} />
    <rect x="34" y="138" width="132" height="32" rx="14" fill="#5b8cff" opacity="0.5" />
    {/* screen face */}
    <rect x="44" y="44" width="112" height="86" rx="20" fill="#e9fbff" stroke={L} strokeWidth="4" />
    <Face mood={mood} y={92} s={0.68} />
    {/* number buttons */}
    {['1', '2', '3'].map((n, i) => (
      <g key={n}>
        <rect x={58 + i * 30} y="140" width="24" height="24" rx="7" fill={['#ffd23f', '#3ccf91', '#ff8a5c'][i]} stroke={L} strokeWidth="3" />
        <text x={70 + i * 30} y="158" textAnchor="middle" fontSize="16" fontWeight="900" fill={L} fontFamily="inherit">
          {n}
        </text>
      </g>
    ))}
    <circle cx="44" cy="40" r="3.5" fill={L} />
    <circle cx="156" cy="40" r="3.5" fill={L} />
  </>
)

// ---------- 4. Familia: Bau-Bau, a sleepy ghost from the attic ----------
const drawGhost: Draw = (mood) => (
  <>
    <Arms color="#f3efff" y={118} x={30}>
      {/* candle */}
      <rect x="180" y="72" width="12" height="22" rx="3" fill="#fff4d6" {...ink} strokeWidth={3.5} />
      <path d="M186 70 Q 180 60 186 50 Q 192 60 186 70 Z" fill="#ffb020" stroke={L} strokeWidth="2.5" />
    </Arms>
    <path
      d="M100 26 C 152 26 172 70 170 116 L 172 176 Q 160 166 150 180 Q 140 166 126 180 Q 114 166 100 180 Q 86 166 74 180 Q 60 166 50 180 Q 40 166 28 176 L 30 116 C 28 70 48 26 100 26 Z"
      fill="#f3efff"
      {...ink}
    />
    <path d="M36 126 L 36 166 Q 44 160 50 170 C 46 150 44 136 44 120 Z" fill="#c9b8ff" opacity="0.6" />
    {/* nightcap */}
    <path d="M58 46 Q 92 0 150 22 Q 172 34 176 56 Q 150 36 132 40 Z" fill="#ff7eb6" {...ink} strokeWidth={4} />
    <path d="M52 50 Q 100 26 146 42" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
    <circle cx="178" cy="60" r="10" fill="#fff" {...ink} strokeWidth={3.5} />
    {mood === 'idle' && (
      <text x="20" y="40" fontSize="22" fontWeight="900" fill="#9b8fd6" fontFamily="inherit">
        z
      </text>
    )}
    <Face mood={mood} y={104} s={0.95} />
  </>
)

// ---------- 5. Mâncare: Brioșel, a cupcake who won't share ----------
const drawCupcake: Draw = (mood) => (
  <>
    <Arms color="#ffc0d8" y={112} x={28}>
      {/* fork */}
      <path d="M176 92 L 194 44" {...ink} strokeWidth={6} />
      <path d="M176 92 L 194 44" stroke="#d9dee8" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M188 46 L 186 28 M 194 48 L 194 30 M 200 50 L 202 32" {...ink} strokeWidth={4} />
    </Arms>
    {/* wrapper */}
    <path d="M40 120 L 160 120 L 146 186 L 54 186 Z" fill="#ffb020" {...ink} />
    <path d="M64 122 L 70 184 M 88 122 L 90 184 M 112 122 L 110 184 M 136 122 L 130 184" stroke="#de8f00" strokeWidth="5" />
    {/* frosting */}
    <path
      d="M100 30 C 128 30 140 46 140 56 C 162 60 172 80 168 96 C 180 106 176 126 160 128 C 120 134 80 134 40 128 C 24 126 20 106 32 96 C 28 80 38 60 60 56 C 60 46 72 30 100 30 Z"
      fill="#ffc0d8"
      {...ink}
    />
    <path d="M34 112 Q 70 124 100 120 Q 70 132 40 126 Z" fill="#ff8fb6" opacity="0.6" />
    {/* sprinkles */}
    <path d="M58 70 l 8 -4 M 148 84 l 8 4 M 120 50 l 6 6 M 46 104 l 6 4 M 156 108 l -6 4" stroke="#3ccf91" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M78 46 l 6 -4 M 140 66 l 2 8 M 36 88 l 8 0" stroke="#5b8cff" strokeWidth="4.5" strokeLinecap="round" />
    {/* cherry */}
    <path d="M104 18 Q 112 4 124 0" fill="none" {...ink} strokeWidth={3.5} />
    <circle cx="102" cy="24" r="12" fill="#ff3b5c" {...ink} strokeWidth={4} />
    <circle cx="98" cy="20" r="3" fill="#fff" />
    <Face mood={mood} y={96} s={0.82} />
  </>
)

// ---------- 6. Haine: Ciorăpel, a lost sock looking for his pair ----------
const drawSock: Draw = (mood) => (
  <>
    <Arms color="#b99bff" y={110} x={58} />
    <path
      d="M56 30 L 144 30 L 144 128 C 144 140 150 146 162 148 C 186 152 190 186 166 188 L 76 188 C 56 188 48 176 52 156 Z"
      fill="#b99bff"
      {...ink}
    />
    {/* stripes */}
    <path d="M55 132 L 144 132" stroke="#7a49e0" strokeWidth="10" />
    <path d="M54 152 L 145 150" stroke="#ffd23f" strokeWidth="10" />
    {/* heel and toe patches */}
    <path d="M150 154 C 178 156 186 180 168 186 L 150 186 C 160 176 160 162 150 154 Z" fill="#ffd23f" stroke={L} strokeWidth="3" />
    <path d="M52 166 C 50 182 62 188 78 188 C 66 180 62 172 64 162 Z" fill="#7a49e0" opacity="0.5" />
    {/* cuff */}
    <rect x="48" y="16" width="104" height="26" rx="10" fill="#fff" {...ink} />
    <path d="M64 18 L 64 40 M 80 18 L 80 40 M 96 18 L 96 40 M 112 18 L 112 40 M 128 18 L 128 40" stroke="#e4ddd0" strokeWidth="3" />
    {/* patch */}
    <rect x="98" y="160" width="18" height="18" rx="3" fill="#3ccf91" stroke={L} strokeWidth="3" transform="rotate(10 107 169)" />
    <path d="M102 164 l 10 10 M 112 164 l -10 10" stroke={L} strokeWidth="2" transform="rotate(10 107 169)" />
    <Face mood={mood} y={88} s={0.74} />
  </>
)

// ---------- 7. Corpul: Microbilă, a germ who hates soap ----------
const drawGerm: Draw = (mood) => {
  const spikes = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)
  return (
    <>
      <ellipse cx="74" cy="184" rx="16" ry="9" fill="#5f9e1b" {...ink} />
      <ellipse cx="126" cy="184" rx="16" ry="9" fill="#5f9e1b" {...ink} />
      {spikes.map((a, i) => {
        const x1 = 100 + Math.cos(a) * 62
        const y1 = 108 + Math.sin(a) * 62
        const x2 = 100 + Math.cos(a) * 84
        const y2 = 108 + Math.sin(a) * 84
        return i === 3 || i === 9 ? null : (
          <g key={i}>
            <path d={`M${x1} ${y1} L ${x2} ${y2}`} {...ink} strokeWidth={5} />
            <circle cx={x2} cy={y2} r="8" fill="#ffd23f" {...ink} strokeWidth={3.5} />
          </g>
        )
      })}
      <circle cx="100" cy="108" r="70" fill="#9be33c" {...ink} />
      <path d="M38 126 C 46 158 72 176 104 178 C 74 166 54 148 48 120 Z" fill="#5f9e1b" opacity="0.45" />
      <circle cx="62" cy="62" r="8" fill="#5f9e1b" opacity="0.5" />
      <circle cx="146" cy="74" r="6" fill="#5f9e1b" opacity="0.5" />
      <circle cx="150" cy="140" r="9" fill="#5f9e1b" opacity="0.5" />
      <circle cx="56" cy="148" r="5" fill="#5f9e1b" opacity="0.5" />
      {/* soap bubble he's dodging */}
      {mood === 'hit' && <circle cx="160" cy="40" r="14" fill="rgba(180,230,255,0.6)" stroke="#5b8cff" strokeWidth="3" />}
      <Face mood={mood} y={102} s={0.84} />
    </>
  )
}

// ---------- 8. Vremea: Norilă, a grumpy storm cloud ----------
const drawCloud: Draw = (mood) => (
  <>
    {/* rain and lightning */}
    {mood !== 'down' && (
      <g className="boss-rain">
        <path d="M60 156 q -4 10 0 14 q 4 -4 0 -14 Z M 140 160 q -4 10 0 14 q 4 -4 0 -14 Z M 80 172 q -4 10 0 14 q 4 -4 0 -14 Z" fill="#5b8cff" stroke={L} strokeWidth="2.5" />
      </g>
    )}
    <path d="M108 140 L 94 168 L 108 166 L 98 194 L 128 156 L 112 158 L 122 140 Z" fill="#ffd23f" {...ink} strokeWidth={4} />
    <Arms color="#b8c4d8" y={112} x={22} />
    <path
      d="M58 152 C 30 152 16 132 22 112 C 10 96 20 72 42 72 C 44 46 70 32 92 42 C 104 22 140 24 148 50 C 172 48 188 70 180 92 C 194 104 190 136 168 146 C 160 156 146 156 136 150 C 120 160 92 160 80 150 C 74 154 66 154 58 152 Z"
      fill="#b8c4d8"
      {...ink}
    />
    <path d="M28 120 C 32 140 50 148 70 146 C 52 138 40 128 36 112 Z" fill="#7f8ca6" opacity="0.5" />
    <path d="M70 52 Q 86 44 100 52" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
    <Face mood={mood} y={98} s={0.86} />
  </>
)

export const BOSSES: Record<string, BossInfo> = {
  colors: {
    id: 'colors',
    name: 'Pătărilă',
    title: 'pata de vopsea care fuge',
    taunt: 'Vrea să-ți amestece toate culorile!',
    draw: drawPaint,
  },
  animals: {
    id: 'animals',
    name: 'Mormăilă',
    title: 'fiara din junglă',
    taunt: 'Mârâie și crede că nu știi animalele!',
    draw: drawBeast,
  },
  numbers: {
    id: 'numbers',
    name: 'Cifroid',
    title: 'robotul care numără',
    taunt: 'Bip bip! Crede că nu știi să numeri!',
    draw: drawRobot,
  },
  family: {
    id: 'family',
    name: 'Bau-Bau',
    title: 'fantoma din pod',
    taunt: 'Bau! Vrea să te sperie, dar tu ești curajos!',
    draw: drawGhost,
  },
  food: {
    id: 'food',
    name: 'Brioșel',
    title: 'brioșa care nu dă la nimeni',
    taunt: 'Vrea să mănânce singur tot!',
    draw: drawCupcake,
  },
  clothes: {
    id: 'clothes',
    name: 'Ciorăpel',
    title: 'șoseta rătăcită',
    taunt: 'Și-a pierdut perechea și e tare supărat!',
    draw: drawSock,
  },
  body: {
    id: 'body',
    name: 'Microbilă',
    title: 'microbul care urăște săpunul',
    taunt: 'Nu vrea să ne spălăm pe mâini!',
    draw: drawGerm,
  },
  weather: {
    id: 'weather',
    name: 'Norilă',
    title: 'norul morocănos',
    taunt: 'Vrea să plouă peste toată ziua!',
    draw: drawCloud,
  },
}

/** The boss guarding a unit (falls back to Mormăilă for anything unknown). */
export function bossFor(unitId: string | undefined): BossInfo {
  return (unitId && BOSSES[unitId]) || BOSSES.animals
}

export function Boss({
  unitId,
  mood = 'idle',
  size = 150,
  locked = false,
}: {
  unitId: string | undefined
  mood?: BossMood
  size?: number
  /** Greyed out silhouette on the map until the unit is reached. */
  locked?: boolean
}) {
  const boss = bossFor(unitId)
  return (
    <div className={`boss boss-${mood} boss-${boss.id} ${locked ? 'boss-locked' : ''}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <ellipse cx="100" cy="194" rx="62" ry="7" fill="rgba(40,30,10,0.16)" />
        <g className="boss-body">{boss.draw(locked ? 'idle' : mood)}</g>
        {mood === 'down' && (
          <g className="boss-stars">
            <text x="40" y="30" fontSize="28">
              ⭐
            </text>
            <text x="130" y="22" fontSize="24">
              ⭐
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
