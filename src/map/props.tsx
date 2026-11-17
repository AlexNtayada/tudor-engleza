// Hand-drawn scenery pieces for the lesson map. Each piece is drawn with its base at (0, 0),
// grows upwards (negative y), and uses flat colours with a darker side and a highlight,
// like a cartoon game map. No filters or blur, so it stays light on phones.

import type { ReactNode } from 'react'

type Draw = (v: number) => ReactNode

const shadow = (rx: number, ry = rx * 0.28) => <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="rgba(30,40,10,0.18)" />

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + amt * (amt > 0 ? 255 - c : c))))
  const r = f((n >> 16) & 255)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const pick = <T,>(list: T[], v: number) => list[Math.floor(v * list.length) % list.length]

const pine =
  (green: string, snow = false): Draw =>
  () => {
    const dark = shade(green, -0.3)
    const light = shade(green, 0.18)
    return (
      <>
        {shadow(24)}
        <rect x="-5" y="-16" width="10" height="18" rx="2" fill="#8a5a2b" />
        {[0, 1, 2].map((k) => {
          const w = 30 - k * 6
          const y = -14 - k * 22
          return (
            <g key={k}>
              <path d={`M${-w} ${y} L 0 ${y - 40} L ${w} ${y} Q 0 ${y + 8} ${-w} ${y} Z`} fill={dark} />
              <path d={`M${-w} ${y} L 0 ${y - 40} L 2 ${y + 4} Q ${-w * 0.5} ${y + 4} ${-w} ${y} Z`} fill={green} />
              <path d={`M${-w * 0.55} ${y - 10} L -4 ${y - 32}`} stroke={light} strokeWidth="3" strokeLinecap="round" />
              {snow && (
                <path
                  d={`M${-w * 0.45} ${y - 20} L 0 ${y - 40} L ${w * 0.45} ${y - 20} Q 0 ${y - 14} ${-w * 0.45} ${y - 20} Z`}
                  fill="#fff"
                />
              )}
            </g>
          )
        })}
      </>
    )
  }

const roundTree =
  (colors: string[]): Draw =>
  (v) => {
    const c = pick(colors, v)
    const dark = shade(c, -0.28)
    return (
      <>
        {shadow(26)}
        <path d="M-6 0 L -4 -30 L 4 -30 L 6 0 Z" fill="#8a5a2b" />
        <path d="M0 -26 L -10 -38 M 0 -30 L 9 -40" stroke="#8a5a2b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="-14" cy="-44" r="20" fill={dark} />
        <circle cx="15" cy="-44" r="20" fill={dark} />
        <circle cx="0" cy="-62" r="24" fill={dark} />
        <circle cx="-12" cy="-48" r="17" fill={c} />
        <circle cx="10" cy="-50" r="16" fill={c} />
        <circle cx="-2" cy="-64" r="19" fill={c} />
        <circle cx="-8" cy="-70" r="7" fill={shade(c, 0.3)} />
      </>
    )
  }

const fruitTree =
  (fruit: string[]): Draw =>
  (v) => (
    <>
      {roundTree(['#46b445'])(0)}
      {[
        [-16, -46],
        [12, -52],
        [-2, -70],
        [16, -66],
        [-18, -64],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill={pick(fruit, v + i * 0.13)} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      ))}
    </>
  )

const bush =
  (colors: string[], dots?: string[]): Draw =>
  (v) => {
    const c = pick(colors, v)
    return (
      <>
        {shadow(24)}
        <circle cx="-13" cy="-12" r="13" fill={shade(c, -0.25)} />
        <circle cx="13" cy="-12" r="13" fill={shade(c, -0.25)} />
        <circle cx="0" cy="-20" r="16" fill={shade(c, -0.25)} />
        <circle cx="-11" cy="-14" r="10" fill={c} />
        <circle cx="10" cy="-15" r="10" fill={c} />
        <circle cx="-1" cy="-22" r="12" fill={c} />
        <circle cx="-5" cy="-27" r="4" fill={shade(c, 0.3)} />
        {dots &&
          [
            [-12, -16],
            [8, -22],
            [12, -10],
            [-2, -12],
            [-6, -28],
          ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill={pick(dots, v + i * 0.2)} />)}
      </>
    )
  }

const rock =
  (c: string): Draw =>
  (v) => {
    const w = 14 + v * 10
    return (
      <>
        {shadow(w + 4)}
        <path
          d={`M${-w} 0 Q ${-w - 2} ${-w * 0.9} ${-w * 0.3} ${-w * 1.2} Q ${w * 0.6} ${-w * 1.3} ${w} ${-w * 0.5} Q ${w + 2} 0 ${w * 0.6} 2 Z`}
          fill={shade(c, -0.25)}
        />
        <path
          d={`M${-w} -2 Q ${-w - 2} ${-w * 0.9} ${-w * 0.3} ${-w * 1.2} Q ${w * 0.3} ${-w * 1.25} ${w * 0.4} ${-w * 0.7} Q ${-w * 0.1} ${-w * 0.2} ${-w} -2 Z`}
          fill={c}
        />
        <path
          d={`M${-w * 0.5} ${-w * 0.95} Q ${-w * 0.1} ${-w * 1.1} ${w * 0.15} ${-w * 1.0}`}
          stroke={shade(c, 0.35)}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </>
    )
  }

const tuft =
  (c: string): Draw =>
  () => (
    <path
      d="M-8 0 Q -10 -10 -12 -14 Q -5 -8 -3 0 M -2 0 Q 0 -14 2 -18 Q 3 -8 3 0 M 3 0 Q 8 -8 12 -12 Q 9 -4 8 0"
      fill="none"
      stroke={c}
      strokeWidth="3"
      strokeLinecap="round"
    />
  )

const flower =
  (colors: string[]): Draw =>
  (v) => {
    const c = pick(colors, v)
    return (
      <>
        <path d="M0 0 L 0 -8" stroke="#3f9a3a" strokeWidth="2" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4} cy={-10 + Math.sin((a * Math.PI) / 180) * 4} r="3.4" fill={c} />
        ))}
        <circle cx="0" cy="-10" r="2.4" fill="#ffd23f" />
      </>
    )
  }

const flowers =
  (colors: string[]): Draw =>
  (v) => (
    <>
      <g transform="translate(-8 2)">{flower(colors)(v)}</g>
      <g transform="translate(6 -2)">{flower(colors)(v + 0.37)}</g>
      <g transform="translate(2 6) scale(0.8)">{flower(colors)(v + 0.71)}</g>
    </>
  )

const tulip =
  (colors: string[]): Draw =>
  (v) => (
    <>
      {[-10, 0, 10].map((x, i) => {
        const c = pick(colors, v + i * 0.31)
        return (
          <g key={x} transform={`translate(${x} ${i === 1 ? -2 : 0})`}>
            <path d="M0 0 L 0 -18" stroke="#3f9a3a" strokeWidth="2.5" />
            <path d="M0 -8 Q -7 -12 -6 -18" stroke="#3f9a3a" strokeWidth="2.5" fill="none" />
            <path d="M-6 -26 L -6 -18 Q 0 -13 6 -18 L 6 -26 L 3 -22 L 0 -27 L -3 -22 Z" fill={c} />
          </g>
        )
      })}
    </>
  )

const mushroom: Draw = (v) => {
  const c = v > 0.5 ? '#ef4b3b' : '#f08a3a'
  return (
    <>
      {shadow(12)}
      <path d="M-5 0 Q -6 -10 -4 -12 L 4 -12 Q 6 -10 5 0 Z" fill="#fff4e0" />
      <path d="M-14 -11 Q -14 -28 0 -28 Q 14 -28 14 -11 Z" fill={c} />
      <circle cx="-6" cy="-19" r="2.6" fill="#fff" />
      <circle cx="5" cy="-22" r="2" fill="#fff" />
      <circle cx="7" cy="-14" r="1.8" fill="#fff" />
    </>
  )
}

const reeds: Draw = () => (
  <>
    {[-8, -2, 4, 9].map((x, i) => (
      <g key={x}>
        <path d={`M${x} 0 Q ${x + (i % 2 ? 3 : -3)} -20 ${x + (i % 2 ? 5 : -4)} -34`} stroke="#3f9a3a" strokeWidth="2.5" fill="none" />
        {i % 2 === 0 && <ellipse cx={x - 3} cy={-30} rx="3" ry="7" fill="#8a5a2b" />}
      </g>
    ))}
  </>
)

const fence: Draw = () => (
  <>
    {shadow(36, 5)}
    <path d="M-34 -14 L 34 -16 M -34 -26 L 34 -28" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round" />
    {[-30, -10, 10, 30].map((x) => (
      <g key={x}>
        <rect x={x - 4} y="-34" width="8" height="34" rx="2" fill="#a8693a" />
        <rect x={x - 4} y="-34" width="3" height="34" fill="#c98a4b" />
      </g>
    ))}
  </>
)

const butterfly: Draw = (v) => {
  const c = pick(['#ff7eb6', '#ffd23f', '#7fc8ff', '#b48cff'], v)
  return (
    <g className="bm-flutter" style={{ animationDelay: `${(v * 3).toFixed(2)}s` }}>
      <g transform="translate(0 -30)">
        <ellipse cx="-5" cy="-3" rx="6" ry="5" fill={c} />
        <ellipse cx="5" cy="-3" rx="6" ry="5" fill={c} />
        <ellipse cx="-4" cy="4" rx="4" ry="3.5" fill={shade(c, -0.15)} />
        <ellipse cx="4" cy="4" rx="4" ry="3.5" fill={shade(c, -0.15)} />
        <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#4a3424" />
      </g>
    </g>
  )
}

const rainbow: Draw = () => (
  <>
    {['#ef3b3b', '#ff8c1a', '#ffd23f', '#3cc35a', '#2f7cf6', '#9b4dde'].map((c, i) => (
      <path key={c} d={`M${-46 + i * 6} 0 A ${46 - i * 6} ${46 - i * 6} 0 0 1 ${46 - i * 6} 0`} fill="none" stroke={c} strokeWidth="6" />
    ))}
    <ellipse cx="-44" cy="0" rx="14" ry="8" fill="#fff" />
    <ellipse cx="44" cy="0" rx="14" ry="8" fill="#fff" />
  </>
)

const barn: Draw = () => (
  <>
    {shadow(40)}
    <path d="M-34 0 L -34 -40 L 0 -64 L 34 -40 L 34 0 Z" fill="#d9483b" />
    <path d="M0 -64 L 34 -40 L 34 0 L 12 0 L 12 -48 Z" fill="#b8352b" />
    <path d="M-40 -38 L 0 -68 L 40 -38" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="-12" y="-28" width="24" height="28" fill="#fff6e8" />
    <path d="M-12 -28 L 12 0 M 12 -28 L -12 0" stroke="#d9483b" strokeWidth="3" />
    <rect x="-6" y="-52" width="12" height="10" fill="#fff6e8" />
  </>
)

const haystack: Draw = () => (
  <>
    {shadow(22)}
    <path d="M-20 0 Q -22 -30 0 -32 Q 22 -30 20 0 Z" fill="#e9b949" />
    <path d="M4 -31 Q 22 -28 20 0 L 6 0 Z" fill="#cf9b2e" />
    <path d="M-12 -8 L -10 -20 M -4 -6 L -2 -24 M 8 -10 L 9 -20" stroke="#f7d77a" strokeWidth="2" strokeLinecap="round" />
  </>
)

const sunflower: Draw = () => (
  <>
    <path d="M0 0 L 0 -34" stroke="#3f9a3a" strokeWidth="3" />
    <path d="M0 -14 Q 8 -20 12 -14 Q 6 -10 0 -14" fill="#4cbf4a" />
    {Array.from({ length: 10 }, (_, i) => (
      <ellipse key={i} cx="0" cy="-48" rx="3" ry="7" fill="#ffc21a" transform={`rotate(${i * 36} 0 -40)`} />
    ))}
    <circle cx="0" cy="-40" r="5.5" fill="#7a4a24" />
  </>
)

const crater: Draw = (v) => {
  const w = 16 + v * 12
  return (
    <>
      <ellipse cx="0" cy="-4" rx={w} ry={w * 0.42} fill="rgba(255,255,255,0.18)" />
      <ellipse cx="0" cy="-5" rx={w * 0.78} ry={w * 0.3} fill="rgba(20,10,60,0.28)" />
    </>
  )
}

const planet: Draw = (v) => {
  const c = pick(['#ff9ad1', '#ffd23f', '#7fe0c8', '#ff9b5c'], v)
  return (
    <g className="bm-float" style={{ animationDelay: `${(v * 4).toFixed(2)}s` }}>
      <g transform="translate(0 -40)">
        <circle r="16" fill={c} />
        <path d="M-16 0 A 16 16 0 0 0 16 0 A 16 10 0 0 1 -16 0 Z" fill={shade(c, -0.2)} />
        <ellipse rx="27" ry="7" fill="none" stroke="#fff" strokeWidth="3" opacity="0.85" transform="rotate(-18)" />
        <circle cx="-6" cy="-6" r="4" fill="#fff" opacity="0.5" />
      </g>
    </g>
  )
}

const crystal: Draw = (v) => {
  const c = pick(['#7fe8ff', '#ff9ad1', '#c4a6ff'], v)
  return (
    <>
      {shadow(16)}
      <path d="M-14 0 L -16 -18 L -9 -30 L -4 -16 L -2 0 Z" fill={shade(c, -0.2)} />
      <path d="M-4 0 L -6 -30 L 2 -44 L 9 -30 L 7 0 Z" fill={c} />
      <path d="M2 -44 L 9 -30 L 7 0 L 2 0 Z" fill={shade(c, -0.18)} />
      <path d="M6 0 L 8 -16 L 14 -24 L 17 -12 L 15 0 Z" fill={shade(c, 0.15)} />
      <path d="M-2 -32 L 1 -40" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  )
}

const sparkle: Draw = (v) => (
  <g className="bm-twinkle" style={{ animationDelay: `${(v * 2).toFixed(2)}s` }}>
    <path d="M0 -26 Q 1.5 -19 7 -18 Q 1.5 -17 0 -10 Q -1.5 -17 -7 -18 Q -1.5 -19 0 -26 Z" fill="#fff6b0" />
  </g>
)

const house =
  (roofs: string[]): Draw =>
  (v) => {
    const roof = pick(roofs, v)
    const wall = pick(['#fff4e0', '#ffe7c7', '#f3f7ff'], v + 0.3)
    return (
      <>
        {shadow(34)}
        <rect x="-28" y="-36" width="56" height="36" fill={wall} />
        <rect x="10" y="-36" width="18" height="36" fill={shade(wall, -0.08)} />
        <rect x="14" y="-66" width="9" height="20" fill="#a8693a" />
        <path d="M-36 -34 L 0 -64 L 36 -34 Z" fill={roof} />
        <path d="M0 -64 L 36 -34 L 14 -34 Z" fill={shade(roof, -0.2)} />
        <rect x="-8" y="-22" width="14" height="22" rx="2" fill="#a8693a" />
        <circle cx="3" cy="-11" r="1.6" fill="#ffd23f" />
        <rect x="-22" y="-28" width="11" height="11" rx="2" fill="#9fdcff" />
        <rect x="13" y="-28" width="11" height="11" rx="2" fill="#9fdcff" />
        <path d="M-22 -22.5 L -11 -22.5 M -16.5 -28 L -16.5 -17" stroke="#fff" strokeWidth="1.6" />
      </>
    )
  }

const well: Draw = () => (
  <>
    {shadow(26)}
    <rect x="-22" y="-60" width="5" height="44" fill="#8a5a2b" />
    <rect x="17" y="-60" width="5" height="44" fill="#8a5a2b" />
    <path d="M-30 -56 L 0 -74 L 30 -56 Z" fill="#c9733b" />
    <ellipse cx="0" cy="-18" rx="24" ry="8" fill="#5fc9f0" />
    <path d="M-24 -18 L -24 -2 Q 0 8 24 -2 L 24 -18 Q 0 -10 -24 -18 Z" fill="#d8cbb4" />
    <path d="M-24 -10 Q 0 -2 24 -10 M -12 -14 L -12 0 M 10 -13 L 10 0" stroke="#b5a68c" strokeWidth="2" fill="none" />
    <path d="M0 -56 L 0 -40" stroke="#6b4a2a" strokeWidth="1.5" />
    <rect x="-5" y="-42" width="10" height="9" rx="2" fill="#a8693a" />
  </>
)

const mailbox: Draw = () => (
  <>
    {shadow(10)}
    <rect x="-2" y="-26" width="4" height="26" fill="#8a5a2b" />
    <path d="M-10 -26 L -10 -36 Q 0 -44 10 -36 L 10 -26 Z" fill="#2f7cf6" />
    <rect x="9" y="-44" width="3" height="10" fill="#ef3b3b" />
  </>
)

const carrots: Draw = () => (
  <>
    <ellipse cx="0" cy="-2" rx="30" ry="10" fill="#9a6a3a" />
    <path d="M-26 -4 Q 0 -10 26 -4" stroke="#7a4a24" strokeWidth="2" fill="none" />
    {[-18, -6, 6, 18].map((x) => (
      <g key={x}>
        <path
          d={`M${x} -6 L ${x - 6} -18 M ${x} -6 L ${x} -20 M ${x} -6 L ${x + 6} -18`}
          stroke="#3cbf4a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d={`M${x - 3} -6 L ${x} 2 L ${x + 3} -6 Z`} fill="#ff8c1a" />
      </g>
    ))}
  </>
)

const beehive: Draw = () => (
  <>
    {shadow(16)}
    <rect x="-2" y="-30" width="4" height="30" fill="#8a5a2b" />
    {[0, 1, 2].map((k) => (
      <ellipse key={k} cx="0" cy={-36 - k * 9} rx={14 - k * 3} ry="6" fill={k % 2 ? '#e9b949' : '#f5c84a'} />
    ))}
    <circle cx="0" cy="-36" r="3" fill="#6b4a2a" />
    <g className="bm-flutter">
      <ellipse cx="16" cy="-56" rx="3.5" ry="2.5" fill="#ffd23f" />
      <path d="M14 -56 L 18 -56" stroke="#2b2118" strokeWidth="1.5" />
    </g>
  </>
)

const picnic: Draw = () => (
  <>
    <path d="M-34 -4 L -18 -22 L 34 -18 L 22 2 Z" fill="#ff6b6b" />
    <path d="M-26 -13 L 28 -8 M -10 -21 L 2 0 M 10 -20 L 16 1" stroke="#fff" strokeWidth="3" opacity="0.8" />
    <path d="M-8 -16 L -8 -24 Q 2 -34 12 -24 L 12 -16 Z" fill="none" stroke="#a8693a" strokeWidth="2.5" />
    <rect x="-11" y="-18" width="26" height="12" rx="3" fill="#c98a4b" />
    <circle cx="20" cy="-10" r="4" fill="#ef3b3b" />
  </>
)

const lavender: Draw = () => (
  <>
    {shadow(20, 4)}
    {[-14, -7, 0, 7, 14].map((x, i) => (
      <g key={x}>
        <path d={`M${x} 0 Q ${x + (i - 2) * 2} -16 ${x + (i - 2) * 3} -26`} stroke="#5f9a4a" strokeWidth="2" fill="none" />
        {[0, 1, 2, 3].map((k) => (
          <ellipse key={k} cx={x + (i - 2) * 3} cy={-26 - k * 4} rx="2.8" ry="3" fill={k % 2 ? '#9b6bff' : '#b48cff'} />
        ))}
      </g>
    ))}
  </>
)

const clothesline: Draw = (v) => (
  <>
    {shadow(40, 5)}
    <rect x="-38" y="-48" width="4" height="48" fill="#8a5a2b" />
    <rect x="34" y="-48" width="4" height="48" fill="#8a5a2b" />
    <path d="M-36 -44 Q 0 -36 36 -44" stroke="#fff" strokeWidth="1.6" fill="none" />
    <path d="M-26 -42 L -12 -42 L -10 -34 L -14 -34 L -14 -22 L -24 -22 L -24 -34 L -28 -34 Z" fill={pick(['#ff7eb6', '#5b8cff'], v)} />
    <path d="M-4 -40 L 8 -40 L 7 -24 L 3 -24 L 2 -32 L 1 -24 L -3 -24 Z" fill="#3ccf91" />
    <path d="M16 -40 L 22 -40 L 22 -30 L 28 -26 L 26 -22 L 16 -26 Z" fill="#ffd23f" />
  </>
)

const slide: Draw = () => (
  <>
    {shadow(34)}
    <path d="M-28 0 L -28 -50 M -14 0 L -14 -50" stroke="#5b8cff" strokeWidth="4" />
    {[-12, -24, -36].map((y) => (
      <path key={y} d={`M-28 ${y} L -14 ${y}`} stroke="#5b8cff" strokeWidth="3" />
    ))}
    <rect x="-32" y="-54" width="22" height="6" rx="2" fill="#ef3b3b" />
    <path d="M-12 -52 Q 10 -40 18 -10 Q 22 0 32 0 L 32 -6 Q 26 -6 24 -14 Q 14 -46 -12 -60 Z" fill="#ffd23f" />
  </>
)

const swing: Draw = () => (
  <>
    {shadow(30, 5)}
    <path d="M-30 0 L -20 -56 L -10 0 M 30 0 L 20 -56 L 10 0" stroke="#ef3b3b" strokeWidth="4" fill="none" strokeLinejoin="round" />
    <path d="M-22 -56 L 22 -56" stroke="#ef3b3b" strokeWidth="5" strokeLinecap="round" />
    <g className="bm-swing">
      <path d="M-6 -56 L -6 -16 M 6 -56 L 6 -16" stroke="#6b4a2a" strokeWidth="1.5" />
      <rect x="-10" y="-17" width="20" height="5" rx="2" fill="#a8693a" />
    </g>
  </>
)

const ball: Draw = (v) => {
  const c = pick(['#ef3b3b', '#2f7cf6', '#ffd23f'], v)
  return (
    <>
      {shadow(10)}
      <circle cx="0" cy="-10" r="10" fill={c} />
      <path d="M-10 -10 Q 0 -4 10 -10" stroke="#fff" strokeWidth="2.5" fill="none" />
      <circle cx="-3" cy="-14" r="2.5" fill="#fff" opacity="0.6" />
    </>
  )
}

const bench: Draw = () => (
  <>
    {shadow(26, 5)}
    <path d="M-20 0 L -20 -12 M 20 0 L 20 -12" stroke="#5a5a68" strokeWidth="3" />
    <rect x="-26" y="-15" width="52" height="5" rx="2" fill="#c98a4b" />
    <rect x="-26" y="-28" width="52" height="5" rx="2" fill="#a8693a" />
    <path d="M-22 -24 L -22 -14 M 22 -24 L 22 -14" stroke="#5a5a68" strokeWidth="3" />
  </>
)

const snowman: Draw = () => (
  <>
    {shadow(18)}
    <circle cx="0" cy="-14" r="15" fill="#fff" />
    <circle cx="0" cy="-38" r="11" fill="#fff" />
    <path d="M6 -14 A 15 15 0 0 1 -10 -2 A 15 15 0 0 0 14 -10 Z" fill="#d8e8f6" />
    <circle cx="-4" cy="-40" r="1.6" fill="#2b2118" />
    <circle cx="4" cy="-40" r="1.6" fill="#2b2118" />
    <path d="M0 -37 L 9 -35 L 0 -34 Z" fill="#ff8c1a" />
    <path d="M-10 -30 Q 0 -26 10 -30 L 9 -26 Q 0 -22 -9 -26 Z" fill="#ef3b3b" />
    <rect x="-8" y="-56" width="16" height="10" rx="2" fill="#2b2b38" />
    <rect x="-11" y="-48" width="22" height="3" rx="1" fill="#2b2b38" />
  </>
)

const snowPile: Draw = () => (
  <>
    <path d="M-22 0 Q -18 -14 -6 -12 Q 2 -22 12 -12 Q 22 -12 22 0 Z" fill="#fff" />
    <path d="M4 -14 Q 14 -14 22 0 L 6 0 Z" fill="#dbeaf7" />
  </>
)

const blocks: Draw = (v) => {
  const cs = ['#ef3b3b', '#2f7cf6', '#ffd23f', '#3cc35a']
  const box = (x: number, y: number, c: string, letter: string) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-11" y="-22" width="22" height="22" rx="3" fill={c} />
      <rect x="-11" y="-22" width="22" height="5" rx="2" fill={shade(c, 0.25)} />
      <text x="0" y="-5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="sans-serif">
        {letter}
      </text>
    </g>
  )
  return (
    <>
      {shadow(26)}
      {box(-12, 0, pick(cs, v), 'A')}
      {box(12, 0, pick(cs, v + 0.25), 'B')}
      {box(0, -22, pick(cs, v + 0.5), 'C')}
    </>
  )
}

const spinTop: Draw = (v) => {
  const c = pick(['#ff5fa2', '#5b8cff', '#ff9b2e'], v)
  return (
    <>
      {shadow(12)}
      <path d="M0 0 L -16 -18 Q 0 -30 16 -18 Z" fill={c} />
      <path d="M-16 -18 Q 0 -10 16 -18" stroke="#fff" strokeWidth="3" fill="none" />
      <rect x="-2" y="-34" width="4" height="10" rx="2" fill="#6b4a2a" />
    </>
  )
}

const lollipopTree: Draw = (v) => {
  const c = pick(['#ff7eb6', '#7fd6ff', '#ffd23f', '#b48cff'], v)
  return (
    <>
      {shadow(16)}
      <rect x="-2.5" y="-46" width="5" height="46" fill="#fff" />
      <circle cx="0" cy="-60" r="18" fill={c} />
      <path d="M0 -60 m -11 0 a 11 11 0 1 0 11 -11 a 7 7 0 1 1 -7 7" fill="none" stroke="#fff" strokeWidth="3.5" />
    </>
  )
}

const gift: Draw = (v) => {
  const c = pick(['#ef3b3b', '#3cc35a', '#5b8cff'], v)
  return (
    <>
      {shadow(16)}
      <rect x="-14" y="-24" width="28" height="24" rx="3" fill={c} />
      <rect x="-16" y="-30" width="32" height="8" rx="2" fill={shade(c, 0.15)} />
      <rect x="-3" y="-30" width="6" height="30" fill="#ffd23f" />
      <path d="M0 -30 Q -12 -42 -8 -32 Z M 0 -30 Q 12 -42 8 -32 Z" fill="#ffd23f" />
    </>
  )
}

const building: Draw = (v) => {
  const c = pick(['#ffb37a', '#8fc6ff', '#ffe08a', '#c4a6ff', '#ff9aa8'], v)
  const floors = 2 + Math.floor(v * 3)
  const h = 18 + floors * 16
  return (
    <>
      {shadow(26)}
      <rect x="-22" y={-h} width="44" height={h} rx="3" fill={c} />
      <rect x="8" y={-h} width="14" height={h} fill={shade(c, -0.15)} />
      <rect x="-24" y={-h - 4} width="48" height="6" rx="2" fill={shade(c, -0.3)} />
      {Array.from({ length: floors }, (_, f) =>
        [-14, -2].map((x) => <rect key={`${f}${x}`} x={x} y={-h + 8 + f * 16} width="8" height="9" rx="1.5" fill="#fff8d6" />),
      )}
      <rect x="10" y="-14" width="9" height="14" fill="#6b4a2a" />
    </>
  )
}

const trafficLight: Draw = () => (
  <>
    {shadow(8)}
    <rect x="-2" y="-40" width="4" height="40" fill="#5a5a68" />
    <rect x="-7" y="-62" width="14" height="28" rx="4" fill="#2b2b38" />
    <circle cx="0" cy="-56" r="3.2" fill="#ef3b3b" />
    <circle cx="0" cy="-48" r="3.2" fill="#ffd23f" />
    <circle cx="0" cy="-40" r="3.2" fill="#3cc35a" />
  </>
)

const lampPost: Draw = () => (
  <>
    {shadow(8)}
    <rect x="-2" y="-52" width="4" height="52" fill="#3a4a66" />
    <path d="M0 -52 Q 0 -60 10 -60" stroke="#3a4a66" strokeWidth="3" fill="none" />
    <path d="M6 -60 L 16 -60 L 14 -54 L 8 -54 Z" fill="#3a4a66" />
    <ellipse cx="11" cy="-53" rx="3" ry="1.5" fill="#fff6b0" />
  </>
)

const roadSign: Draw = (v) => (
  <>
    {shadow(8)}
    <rect x="-1.5" y="-36" width="3" height="36" fill="#8a9bb0" />
    {v > 0.5 ? (
      <circle cx="0" cy="-44" r="10" fill="#2f7cf6" stroke="#fff" strokeWidth="2" />
    ) : (
      <path d="M0 -56 L 12 -36 L -12 -36 Z" fill="#fff" stroke="#ef3b3b" strokeWidth="3" strokeLinejoin="round" />
    )}
  </>
)

const toyCar: Draw = (v) => {
  const c = pick(['#ef3b3b', '#2f7cf6', '#ffd23f', '#3cc35a'], v)
  return (
    <>
      {shadow(16)}
      <path d="M-16 -6 L -16 -14 L -8 -16 L -4 -24 L 8 -24 L 12 -16 L 16 -14 L 16 -6 Z" fill={c} />
      <path d="M-3 -22 L 7 -22 L 9 -16 L -6 -16 Z" fill="#bfe8ff" />
      <circle cx="-9" cy="-5" r="4.5" fill="#2b2b38" />
      <circle cx="9" cy="-5" r="4.5" fill="#2b2b38" />
    </>
  )
}

const school: Draw = () => (
  <>
    {shadow(46)}
    <rect x="-42" y="-40" width="84" height="40" fill="#f6d0a0" />
    <rect x="-14" y="-62" width="28" height="62" fill="#ffe2bd" />
    <path d="M-20 -60 L 0 -78 L 20 -60 Z" fill="#d9483b" />
    <path d="M-46 -38 L -14 -50 L -14 -40 Z M 46 -38 L 14 -50 L 14 -40 Z" fill="#b8352b" />
    <circle cx="0" cy="-64" r="5" fill="#ffd23f" />
    <rect x="-7" y="-20" width="14" height="20" rx="2" fill="#a8693a" />
    {[-34, -24, 18, 28].map((x) => (
      <rect key={x} x={x} y="-28" width="7" height="10" rx="1" fill="#9fdcff" />
    ))}
    <path d="M0 -78 L 0 -96" stroke="#5a5a68" strokeWidth="2" />
    <path d="M0 -96 L 14 -91 L 0 -86 Z" fill="#ef3b3b" />
  </>
)

const chalkboard: Draw = () => (
  <>
    {shadow(22, 5)}
    <path d="M-16 0 L -12 -16 M 16 0 L 12 -16" stroke="#8a5a2b" strokeWidth="3" />
    <rect x="-20" y="-42" width="40" height="28" rx="2" fill="#2f6b4a" stroke="#a8693a" strokeWidth="3" />
    <text x="0" y="-23" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="sans-serif">
      ABC
    </text>
  </>
)

const books: Draw = () => (
  <>
    {shadow(18)}
    <rect x="-16" y="-8" width="32" height="8" rx="2" fill="#ef3b3b" />
    <rect x="-13" y="-16" width="28" height="8" rx="2" fill="#2f7cf6" />
    <rect x="-15" y="-24" width="26" height="8" rx="2" fill="#3cc35a" />
    <path d="M-12 -4 L 12 -4 M -9 -12 L 11 -12" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
    <path d="M6 -24 L 18 -40 L 22 -38 L 10 -22 Z" fill="#ffd23f" />
    <path d="M18 -40 L 22 -38 L 23 -44 Z" fill="#ff8fb0" />
  </>
)

const pencilFence: Draw = () => (
  <>
    {shadow(36, 5)}
    <path d="M-34 -18 L 34 -18" stroke="#c98a4b" strokeWidth="4" />
    {[-28, -14, 0, 14, 28].map((x, i) => {
      const c = ['#ef3b3b', '#ffd23f', '#2f7cf6', '#3cc35a', '#ff8c1a'][i]
      return (
        <g key={x}>
          <rect x={x - 4} y="-32" width="8" height="32" fill={c} />
          <path d={`M${x - 4} -32 L ${x} -42 L ${x + 4} -32 Z`} fill="#f4d3a2" />
          <path d={`M${x - 1.4} -38 L ${x} -42 L ${x + 1.4} -38 Z`} fill="#2b2118" />
        </g>
      )
    })}
  </>
)

const globe: Draw = () => (
  <>
    {shadow(12)}
    <path d="M-8 0 L 8 0 L 4 -6 L -4 -6 Z" fill="#a8693a" />
    <path d="M0 -6 L 0 -10" stroke="#a8693a" strokeWidth="3" />
    <circle cx="0" cy="-22" r="12" fill="#5fb6ff" />
    <path d="M-8 -28 Q -2 -26 -4 -20 Q 2 -18 4 -24 Q 8 -22 8 -16" fill="#4cbf4a" />
    <path d="M-14 -22 A 14 14 0 0 0 14 -22" stroke="#a8693a" strokeWidth="2" fill="none" />
  </>
)

const log: Draw = () => (
  <>
    {shadow(22, 5)}
    <rect x="-20" y="-12" width="40" height="12" rx="6" fill="#a8693a" />
    <rect x="-20" y="-12" width="40" height="4" rx="2" fill="#c98a4b" />
    <ellipse cx="20" cy="-6" rx="4" ry="6" fill="#e6c08a" />
    <ellipse cx="20" cy="-6" rx="1.5" ry="2.5" fill="#a8693a" />
  </>
)

const fern: Draw = () => (
  <>
    {[-30, -10, 10, 30].map((a) => (
      <path
        key={a}
        d="M0 0 Q 2 -12 0 -24"
        stroke="#2f9a2e"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        transform={`rotate(${a})`}
      />
    ))}
  </>
)

const doghouse: Draw = () => (
  <>
    {shadow(20)}
    <rect x="-16" y="-22" width="32" height="22" fill="#c98a4b" />
    <path d="M-20 -20 L 0 -38 L 20 -20 Z" fill="#d9483b" />
    <path d="M-6 0 L -6 -10 Q 0 -18 6 -10 L 6 0 Z" fill="#4a3424" />
  </>
)

const flowerPot: Draw = (v) => (
  <>
    {shadow(10)}
    <path d="M-8 0 L -10 -14 L 10 -14 L 8 0 Z" fill="#d9733b" />
    <rect x="-11" y="-16" width="22" height="4" rx="1" fill="#e98a4b" />
    <g transform="translate(0 -14)">{flowers(['#ff7eb6', '#ffd23f', '#ff5a6e'])(v)}</g>
  </>
)

const cloudPuff: Draw = () => (
  <>
    <ellipse cx="0" cy="-60" rx="22" ry="10" fill="#fff" opacity="0.9" />
    <circle cx="-8" cy="-66" r="9" fill="#fff" opacity="0.9" />
    <circle cx="7" cy="-68" r="11" fill="#fff" opacity="0.9" />
  </>
)

const palm: Draw = (v) => {
  const lean = (v - 0.5) * 16
  return (
    <>
      {shadow(22)}
      <path d={`M-4 0 Q ${lean * 0.4} -30 ${lean} -62 L ${lean + 6} -62 Q ${lean * 0.4 + 6} -30 5 0 Z`} fill="#b07a45" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M-4 ${-8 - i * 11} L 5 ${-10 - i * 11}`} stroke="#8a5a2b" strokeWidth="2" />
      ))}
      <g transform={`translate(${lean + 3} -62)`}>
        {[-150, -110, -60, -20, 20].map((a, i) => (
          <path key={a} d="M0 0 Q 14 -12 32 -4 Q 16 -4 0 4 Z" fill={i % 2 ? '#3fae4a' : '#2f9a3e'} transform={`rotate(${a + 90})`} />
        ))}
        <circle cx="-3" cy="4" r="4" fill="#7a4a24" />
        <circle cx="4" cy="5" r="4" fill="#8a5a2b" />
      </g>
    </>
  )
}

const beachUmbrella: Draw = (v) => {
  const c = pick(['#ef3b3b', '#2f7cf6', '#ff8a1f'], v)
  return (
    <>
      {shadow(22)}
      <rect x="10" y="-6" width="22" height="6" rx="2" fill={pick(['#ffd23f', '#5fd0ff', '#ff7eb6'], v)} />
      <path d="M0 0 L 2 -46" stroke="#8a6a4a" strokeWidth="3" />
      <path d="M-26 -38 Q 2 -66 30 -42 Z" fill="#fff" />
      <path d="M-26 -38 Q -14 -56 2 -54 L 2 -44 Z M 12 -52 Q 24 -50 30 -42 L 16 -42 Z" fill={c} />
    </>
  )
}

const sandcastle: Draw = () => (
  <>
    {shadow(20)}
    <rect x="-18" y="-18" width="36" height="18" fill="#e9c27a" />
    <rect x="-22" y="-30" width="12" height="30" fill="#f2d08e" />
    <rect x="10" y="-30" width="12" height="30" fill="#dfb46a" />
    <rect x="-6" y="-36" width="12" height="20" fill="#f2d08e" />
    <path d="M-22 -30 l 0 -4 l 3 0 l 0 3 l 3 0 l 0 -3 l 3 0 l 0 3 l 3 0 l 0 -3 l 0 4 Z" fill="#f2d08e" />
    <path d="M0 -36 L 0 -48" stroke="#8a6a4a" strokeWidth="1.5" />
    <path d="M0 -48 L 9 -45 L 0 -42 Z" fill="#ef3b3b" />
    <path d="M-4 0 L -4 -8 Q 0 -12 4 -8 L 4 0 Z" fill="#b98a4a" />
  </>
)

const shell: Draw = (v) => {
  const c = pick(['#ffb3c9', '#ffe0b0', '#fff'], v)
  return (
    <>
      <path d="M-8 0 Q -10 -12 0 -14 Q 10 -12 8 0 Z" fill={c} />
      <path d="M-4 -1 L -2 -11 M 0 -1 L 0 -13 M 4 -1 L 2 -11" stroke={shade(c, -0.25)} strokeWidth="1.3" />
    </>
  )
}

const starfish: Draw = (v) => (
  <path
    d="M0 -16 L 3 -8 L 11 -8 L 5 -3 L 7 5 L 0 0 L -7 5 L -5 -3 L -11 -8 L -3 -8 Z"
    fill={pick(['#ff8a5c', '#ffb020', '#ff7eb6'], v)}
    transform="translate(0 -2)"
  />
)

const bigLeaf: Draw = (v) => {
  const c = pick(['#2f9a3e', '#3fae4a', '#1e7e40'], v)
  return (
    <>
      {shadow(16)}
      {[-40, -10, 22].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 0 Q -14 -20 0 -40 Q 14 -20 0 0 Z" fill={c} />
          <path d="M0 -2 L 0 -36" stroke={shade(c, 0.25)} strokeWidth="1.5" />
        </g>
      ))}
    </>
  )
}

const jungleFlower: Draw = (v) => {
  const c = pick(['#ff5a6e', '#ff8a1f', '#ff7eb6'], v)
  return (
    <>
      <path d="M0 0 L 0 -14" stroke="#2f9a3e" strokeWidth="2.5" />
      <g transform="translate(0 -18)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-6" rx="4" ry="7" fill={c} transform={`rotate(${a})`} />
        ))}
        <circle r="3" fill="#ffd23f" />
      </g>
    </>
  )
}

const anthill: Draw = () => (
  <>
    {shadow(20)}
    <path d="M-20 0 Q -8 -26 0 -26 Q 8 -26 20 0 Z" fill="#c98a4b" />
    <path d="M4 -25 Q 12 -20 20 0 L 8 0 Z" fill="#a8693a" />
    <ellipse cx="0" cy="-22" rx="4" ry="2.5" fill="#5a3418" />
    <circle cx="-12" cy="-6" r="1.6" fill="#2b2118" />
    <circle cx="-8" cy="-4" r="1.6" fill="#2b2118" />
    <circle cx="13" cy="-3" r="1.6" fill="#2b2118" />
  </>
)

const daisy: Draw = (v) => (
  <>
    <path d="M0 0 Q 3 -20 0 -40" stroke="#3f9a3a" strokeWidth="3" fill="none" />
    <path d="M0 -16 Q 10 -22 14 -16 Q 6 -12 0 -16" fill="#4cbf4a" />
    <g transform="translate(0 -44)">
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-9" rx="3.5" ry="8" fill={v > 0.5 ? '#fff' : '#ffd6ea'} transform={`rotate(${i * 36})`} />
      ))}
      <circle r="5" fill="#ffc21a" />
    </g>
  </>
)

const ladybug: Draw = () => (
  <g transform="translate(0 -6)">
    <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ef3b3b" />
    <path d="M0 -6 L 0 6" stroke="#2b2118" strokeWidth="1.2" />
    <circle cx="0" cy="-6" r="3" fill="#2b2118" />
    <circle cx="-3" cy="0" r="1.4" fill="#2b2118" />
    <circle cx="3" cy="2" r="1.4" fill="#2b2118" />
  </g>
)

const veggieRow: Draw = (v) => {
  const leaf = pick(['#4cbf4a', '#3fae4a'], v)
  const fruit = pick(['#ef3b3b', '#ff8a1f', '#9b4dde'], v)
  return (
    <>
      <path d="M-34 0 Q 0 -10 34 0 Q 0 6 -34 0 Z" fill="#8a5a2b" />
      {[-24, -8, 8, 24].map((x) => (
        <g key={x} transform={`translate(${x} -3)`}>
          <path d="M0 0 Q -6 -10 -2 -14 M 0 0 Q 6 -10 2 -14 M 0 0 L 0 -12" stroke={leaf} strokeWidth="3" strokeLinecap="round" fill="none" />
          {v > 0.4 && <circle cx="0" cy="-3" r="3" fill={fruit} />}
        </g>
      ))}
    </>
  )
}

const pumpkin: Draw = () => (
  <>
    {shadow(14)}
    <ellipse cx="-6" cy="-10" rx="8" ry="10" fill="#e0701a" />
    <ellipse cx="6" cy="-10" rx="8" ry="10" fill="#e0701a" />
    <ellipse cx="0" cy="-10" rx="8" ry="11" fill="#ff8a1f" />
    <path d="M0 -20 Q 2 -26 6 -27" stroke="#3f9a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
  </>
)

const scarecrow: Draw = () => (
  <>
    {shadow(14)}
    <path d="M0 0 L 0 -44 M -22 -34 L 22 -34" stroke="#8a5a2b" strokeWidth="4" strokeLinecap="round" />
    <path d="M-12 -38 L 12 -38 L 10 -16 L -10 -16 Z" fill="#2f7cf6" />
    <path d="M-12 -38 L -6 -38 L -6 -16 L -10 -16 Z" fill="#ef3b3b" opacity="0.8" />
    <circle cx="0" cy="-48" r="8" fill="#f6d58e" />
    <path d="M-14 -52 L 14 -52 L 8 -58 Q 0 -66 -8 -58 Z" fill="#a8693a" />
    <circle cx="-3" cy="-48" r="1.3" fill="#2b2118" />
    <circle cx="3" cy="-48" r="1.3" fill="#2b2118" />
    <path d="M-24 -34 l -4 4 M -24 -34 l -4 -2 M 24 -34 l 4 4 M 24 -34 l 4 -2" stroke="#e9b949" strokeWidth="2" />
  </>
)

const cabbage: Draw = (v) => (
  <>
    {shadow(10)}
    <circle cx="0" cy="-8" r="9" fill={v > 0.5 ? '#9fd86b' : '#b07ad6'} />
    <path d="M-8 -4 Q -12 -14 -4 -16 M 8 -4 Q 12 -14 4 -16" stroke={v > 0.5 ? '#6fb33f' : '#8a52b0'} strokeWidth="2.5" fill="none" />
  </>
)

const cloudTree: Draw = (v) => {
  const c = pick(['#ffc4df', '#d6c4ff', '#c4ecff', '#fff1b8'], v)
  return (
    <>
      {shadow(22)}
      <path d="M-3 0 L -2 -26 L 2 -26 L 3 0 Z" fill="#d9b58a" />
      <circle cx="-12" cy="-34" r="13" fill={c} />
      <circle cx="12" cy="-34" r="13" fill={shade(c, -0.08)} />
      <circle cx="0" cy="-46" r="15" fill={c} />
      <circle cx="-5" cy="-50" r="5" fill="#fff" opacity="0.6" />
    </>
  )
}

const balloons: Draw = (v) => (
  <>
    {[-8, 0, 8].map((x, i) => (
      <g key={x}>
        <path d={`M0 0 Q ${x * 0.6} -20 ${x} ${-38 - i * 4}`} stroke="#8a8a9a" strokeWidth="1" fill="none" />
        <ellipse cx={x} cy={-46 - i * 4} rx="7" ry="9" fill={pick(['#ff5a6e', '#ffd23f', '#5b8cff', '#3ccf91', '#ff7eb6'], (v + i * 0.27) % 1)} />
      </g>
    ))}
  </>
)

const heartBush: Draw = () => (
  <>
    {shadow(14)}
    <path d="M0 -4 C -22 -18 -16 -36 -6 -34 Q 0 -32 0 -26 Q 0 -32 6 -34 C 16 -36 22 -18 0 -4 Z" fill="#ff7eb6" />
    <path d="M-8 -28 Q -4 -30 -2 -26" stroke="#fff" strokeWidth="2" fill="none" opacity="0.7" />
  </>
)

const goal: Draw = () => (
  <>
    {shadow(30, 6)}
    <path d="M-28 0 L -28 -30 L 28 -30 L 28 0" fill="none" stroke="#fff" strokeWidth="4" />
    <path d="M-24 -26 L 24 -26 L 24 -2 L -24 -2 Z" fill="rgba(255,255,255,0.25)" />
    {[-16, -6, 4, 14].map((x) => (
      <path key={x} d={`M${x} -28 L ${x} 0`} stroke="#fff" strokeWidth="1" opacity="0.7" />
    ))}
    <path d="M-26 -18 L 26 -18 M -26 -8 L 26 -8" stroke="#fff" strokeWidth="1" opacity="0.7" />
  </>
)

const flag: Draw = (v) => (
  <>
    {shadow(6)}
    <path d="M0 0 L 0 -42" stroke="#8a9bb0" strokeWidth="2.5" />
    <path d="M0 -42 L 18 -37 L 0 -30 Z" fill={pick(['#ef3b3b', '#ffd23f', '#2f7cf6', '#3cc35a'], v)} />
  </>
)

const cone: Draw = () => (
  <>
    <rect x="-8" y="-3" width="16" height="3" rx="1" fill="#e0651a" />
    <path d="M-6 -3 L 0 -18 L 6 -3 Z" fill="#ff8a1f" />
    <path d="M-3.5 -9 L 3.5 -9" stroke="#fff" strokeWidth="2.5" />
  </>
)

const trampoline: Draw = () => (
  <>
    {shadow(24, 6)}
    <path d="M-18 0 L -14 -10 M 18 0 L 14 -10 M 0 0 L 0 -8" stroke="#3a4a66" strokeWidth="3" />
    <ellipse cx="0" cy="-11" rx="24" ry="6" fill="#2f7cf6" />
    <ellipse cx="0" cy="-11" rx="18" ry="4" fill="#2b2b38" />
  </>
)

const fireStation: Draw = () => (
  <>
    {shadow(36)}
    <rect x="-32" y="-40" width="64" height="40" fill="#e04848" />
    <rect x="12" y="-40" width="20" height="40" fill="#bb2c2c" />
    <rect x="-34" y="-46" width="68" height="8" rx="2" fill="#8a2020" />
    <rect x="-26" y="-26" width="22" height="26" fill="#fff6e8" />
    <path d="M-26 -18 L -4 -18 M -26 -10 L -4 -10" stroke="#e0c8a8" strokeWidth="2" />
    <rect x="2" y="-26" width="22" height="26" fill="#fff6e8" />
    <path d="M2 -18 L 24 -18 M 2 -10 L 24 -10" stroke="#e0c8a8" strokeWidth="2" />
    <circle cx="0" cy="-34" r="4" fill="#ffd23f" />
    <rect x="-8" y="-62" width="16" height="18" fill="#c42b2b" />
    <path d="M-10 -62 L 0 -70 L 10 -62 Z" fill="#8a2020" />
  </>
)

const hospital: Draw = () => (
  <>
    {shadow(32)}
    <rect x="-28" y="-56" width="56" height="56" rx="3" fill="#f4f7fb" />
    <rect x="10" y="-56" width="18" height="56" fill="#dfe6f0" />
    <rect x="-8" y="-50" width="16" height="16" rx="2" fill="#fff" />
    <path d="M0 -48 L 0 -36 M -6 -42 L 6 -42" stroke="#ef3b3b" strokeWidth="4" />
    {[-20, 12].map((x) => [-28, -16].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="8" height="8" rx="1.5" fill="#9fd4ff" />))}
    <rect x="-6" y="-14" width="12" height="14" fill="#5fb6ff" />
  </>
)

const hydrant: Draw = () => (
  <>
    {shadow(7)}
    <rect x="-5" y="-16" width="10" height="16" rx="2" fill="#ef3b3b" />
    <path d="M-6 -16 Q 0 -24 6 -16 Z" fill="#c42b2b" />
    <rect x="-9" y="-12" width="18" height="4" rx="2" fill="#c42b2b" />
  </>
)

export type PropDef = { draw: Draw; r: number }

const P = (draw: Draw, r: number): PropDef => ({ draw, r })

export const PROPS = {
  pine: P(pine('#2f9a3e'), 30),
  snowPine: P(pine('#2f8a5a', true), 30),
  forestTree: P(roundTree(['#3fae4a', '#55c057', '#2f9a3e']), 34),
  blossomTree: P(roundTree(['#ff9ad1', '#ffb3d9', '#f48fc0']), 34),
  orchardTree: P(fruitTree(['#ef3b3b', '#ff9b2e', '#ffd23f']), 34),
  parkTree: P(roundTree(['#4cbf4a', '#6fcf4f']), 34),
  autumnTree: P(roundTree(['#ffb020', '#ff8a3d', '#4cbf4a']), 34),
  bush: P(bush(['#46b445', '#5cc356']), 22),
  flowerBush: P(bush(['#4cb84a'], ['#ff7eb6', '#fff', '#ffd23f']), 22),
  pinkBush: P(bush(['#ff9ad1', '#c4a6ff']), 22),
  hedge: P(bush(['#3f9a3a']), 22),
  rock: P(rock('#c9c0b2'), 18),
  sandRock: P(rock('#d9a86a'), 18),
  moonRock: P(rock('#9b8cf0'), 18),
  iceRock: P(rock('#cfe6fb'), 18),
  tuft: P(tuft('#3f9a3a'), 8),
  paleTuft: P(tuft('#6fbf5a'), 8),
  flowers: P(flowers(['#ffffff', '#ff7eb6', '#ffd23f']), 10),
  wildFlowers: P(flowers(['#ff5a6e', '#9b6bff', '#ffffff', '#ffd23f']), 10),
  tulips: P(tulip(['#ef3b3b', '#ff7eb6', '#ffd23f', '#9b4dde', '#ff8c1a']), 14),
  mushroom: P(mushroom, 12),
  reeds: P(reeds, 10),
  fence: P(fence, 36),
  butterfly: P(butterfly, 8),
  rainbow: P(rainbow, 48),
  barn: P(barn, 40),
  haystack: P(haystack, 22),
  sunflower: P(sunflower, 12),
  crater: P(crater, 24),
  planet: P(planet, 26),
  crystal: P(crystal, 18),
  sparkle: P(sparkle, 6),
  house: P(house(['#ef5a4a', '#5b8cff', '#ffb020', '#3cbf8a']), 36),
  well: P(well, 28),
  mailbox: P(mailbox, 10),
  carrots: P(carrots, 30),
  beehive: P(beehive, 16),
  picnic: P(picnic, 34),
  lavender: P(lavender, 20),
  clothesline: P(clothesline, 40),
  slide: P(slide, 34),
  swing: P(swing, 32),
  ball: P(ball, 10),
  bench: P(bench, 26),
  snowman: P(snowman, 18),
  snowPile: P(snowPile, 20),
  blocks: P(blocks, 26),
  spinTop: P(spinTop, 14),
  lollipopTree: P(lollipopTree, 20),
  gift: P(gift, 16),
  building: P(building, 26),
  trafficLight: P(trafficLight, 10),
  lampPost: P(lampPost, 10),
  roadSign: P(roadSign, 10),
  toyCar: P(toyCar, 16),
  school: P(school, 46),
  chalkboard: P(chalkboard, 22),
  books: P(books, 18),
  pencilFence: P(pencilFence, 36),
  globe: P(globe, 12),
  log: P(log, 22),
  fern: P(fern, 14),
  doghouse: P(doghouse, 20),
  flowerPot: P(flowerPot, 10),
  cloudPuff: P(cloudPuff, 22),
  palm: P(palm, 28),
  beachUmbrella: P(beachUmbrella, 30),
  sandcastle: P(sandcastle, 22),
  shell: P(shell, 8),
  starfish: P(starfish, 9),
  jungleTree: P(roundTree(['#1e7e40', '#2f9a3e', '#3a8f35']), 34),
  bigLeaf: P(bigLeaf, 20),
  jungleFlower: P(jungleFlower, 9),
  anthill: P(anthill, 20),
  daisy: P(daisy, 14),
  ladybug: P(ladybug, 7),
  veggieRow: P(veggieRow, 34),
  pumpkin: P(pumpkin, 14),
  scarecrow: P(scarecrow, 24),
  cabbage: P(cabbage, 10),
  cloudTree: P(cloudTree, 28),
  cloudBush: P(bush(['#ffffff', '#f3f0ff']), 22),
  balloons: P(balloons, 12),
  heartBush: P(heartBush, 16),
  goal: P(goal, 30),
  flag: P(flag, 8),
  cone: P(cone, 8),
  trampoline: P(trampoline, 24),
  fireStation: P(fireStation, 38),
  hospital: P(hospital, 34),
  hydrant: P(hydrant, 7),
} satisfies Record<string, PropDef>

export type PropId = keyof typeof PROPS
export { shade }
