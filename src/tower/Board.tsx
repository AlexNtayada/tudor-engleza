// The game board for one land: the ground, a cave at the top, the stone path and its scenery,
// and the chosen castle at the bottom. Drawn once per map; monsters and friends go on top (Tower.tsx).

import { memo, useMemo, type ReactNode } from 'react'
import { castleById, CastleArt } from './castles'
import { BOARD, pointAt, type Path } from './engine'
import type { Deco, TowerMap } from './maps'

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/** Distance from a point to the path. */
function pathDist(path: Path, x: number, y: number): number {
  let best = Infinity
  const P = path.points
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, ay] = P[i]
    const [bx, by] = P[i + 1]
    const dx = bx - ax
    const dy = by - ay
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    best = Math.min(best, Math.hypot(x - (ax + dx * t), y - (ay + dy * t)))
  }
  return best
}

interface Spot {
  x: number
  y: number
  r: number
  v: number
}

/** Scenery spots on a jittered grid, away from the path, the cave and the castle (also beside the board). */
function spots(path: Path, seed: number): Spot[] {
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const out: Spot[] = []
  for (let y = 150; y <= 470; y += 40)
    for (let x = -420; x <= 820; x += 42) {
      const px = x + (rnd() - 0.5) * 26 + (y % 80 ? 21 : 0)
      const py = y + (rnd() - 0.5) * 16
      if (pathDist(path, px, py) < 46) continue
      if (py > 430 && px > 90 && px < 310) continue
      if (rnd() < 0.3) continue
      out.push({ x: px, y: py, r: 17 + rnd() * 7, v: Math.floor(rnd() * 100) })
    }
  return out.sort((a, b) => a.y - b.y)
}

const shadow = (r: number) => <ellipse cx="0" cy={r * 0.95} rx={r * 0.9} ry={r * 0.25} fill="rgba(30,40,20,.2)" />

const TREE_COLORS = [
  ['#5cb85c', '#46a047'],
  ['#7ccf4e', '#62b33a'],
  ['#ffa94d', '#f08c2e'],
  ['#b07de0', '#9461c9'],
  ['#3fae7a', '#2f9566'],
]

/** One piece of scenery, drawn around (0, 0) with size r; `v` picks a variant. */
export const DRAW: Record<Deco, (r: number, v: number) => ReactNode> = {
  forest: (r, v) => {
    const [main, dark] = TREE_COLORS[v % TREE_COLORS.length]
    return (
      <>
        {shadow(r)}
        <rect x="-4" y={r * 0.2} width="8" height={r * 0.7} rx="3" fill="#8b5a2b" {...ink} strokeWidth={2} />
        <circle cx={-r * 0.45} cy={r * 0.05} r={r * 0.62} fill={dark} {...ink} strokeWidth={2} />
        <circle cx={r * 0.45} cy={r * 0.05} r={r * 0.62} fill={dark} {...ink} strokeWidth={2} />
        <circle cx="0" cy={-r * 0.35} r={r * 0.72} fill={main} {...ink} strokeWidth={2} />
        <circle cx={-r * 0.25} cy={-r * 0.6} r={r * 0.2} fill="#fff" opacity=".28" />
      </>
    )
  },
  desert: (r, v) =>
    v % 3 === 0 ? (
      <>
        {shadow(r * 0.8)}
        <path d={`M${-r * 0.7} ${r * 0.8} Q ${-r * 0.5} ${-r * 0.1} 0 ${-r * 0.15} Q ${r * 0.6} ${-r * 0.1} ${r * 0.8} ${r * 0.8} Z`} fill="#d9a066" {...ink} strokeWidth={2} />
        <path d={`M${-r * 0.3} ${r * 0.2} q ${r * 0.2} -6 ${r * 0.4} 0`} fill="none" stroke="#b97d48" strokeWidth="2" />
      </>
    ) : (
      <>
        {shadow(r)}
        <rect x={-r * 0.22} y={-r * 0.9} width={r * 0.44} height={r * 1.8} rx={r * 0.22} fill="#4fb35a" {...ink} strokeWidth={2} />
        <path d={`M${-r * 0.2} ${r * 0.1} H ${-r * 0.55} V ${-r * 0.45}`} fill="none" stroke={L} strokeWidth={r * 0.34 + 4} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${-r * 0.2} ${r * 0.1} H ${-r * 0.55} V ${-r * 0.45}`} fill="none" stroke="#4fb35a" strokeWidth={r * 0.34} strokeLinecap="round" strokeLinejoin="round" />
        {v % 2 === 0 && (
          <>
            <path d={`M${r * 0.2} ${-r * 0.1} H ${r * 0.55} V ${-r * 0.7}`} fill="none" stroke={L} strokeWidth={r * 0.34 + 4} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${r * 0.2} ${-r * 0.1} H ${r * 0.55} V ${-r * 0.7}`} fill="none" stroke="#4fb35a" strokeWidth={r * 0.34} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        <rect x={-r * 0.22 + 2} y={-r * 0.88} width={r * 0.44 - 4} height={r * 1.76} rx={r * 0.2} fill="#4fb35a" />
        {v % 5 === 1 && <circle cx="0" cy={-r * 0.95} r="4" fill="#ff7eb6" {...ink} strokeWidth={1.5} />}
      </>
    ),
  snow: (r, v) =>
    v % 7 === 0 ? (
      <>
        {shadow(r * 0.7)}
        <circle cx="0" cy={r * 0.35} r={r * 0.5} fill="#fff" {...ink} strokeWidth={2} />
        <circle cx="0" cy={-r * 0.3} r={r * 0.36} fill="#fff" {...ink} strokeWidth={2} />
        <circle cx={-r * 0.12} cy={-r * 0.36} r="1.8" fill={L} />
        <circle cx={r * 0.12} cy={-r * 0.36} r="1.8" fill={L} />
        <path d={`M0 ${-r * 0.26} l ${r * 0.3} 2 l ${-r * 0.3} 3 Z`} fill="#ff8c1a" />
        <path d={`M${-r * 0.36} ${-r * 0.06} H ${r * 0.36}`} stroke="#ff5a5f" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : (
      <>
        {shadow(r)}
        <rect x="-3.5" y={r * 0.5} width="7" height={r * 0.45} fill="#8b5a2b" {...ink} strokeWidth={1.8} />
        <path d={`M0 ${-r * 1.1} L ${r * 0.55} ${-r * 0.3} H ${r * 0.3} L ${r * 0.8} ${r * 0.55} H ${-r * 0.8} L ${-r * 0.3} ${-r * 0.3} H ${-r * 0.55} Z`} fill={v % 2 ? '#2f9566' : '#3fae7a'} {...ink} strokeWidth={2} />
        <path d={`M0 ${-r * 1.1} L ${r * 0.3} ${-r * 0.65} Q 0 ${-r * 0.55} ${-r * 0.3} ${-r * 0.65} Z`} fill="#fff" />
        <path d={`M${-r * 0.55} ${r * 0.1} Q 0 ${-r * 0.1} ${r * 0.55} ${r * 0.1}`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  beach: (r, v) =>
    v % 4 === 0 ? (
      <>
        <ellipse cx="0" cy={r * 0.3} rx={r * 1.2} ry={r * 0.55} fill="#5cc8f0" {...ink} strokeWidth={2} />
        <path d={`M${-r * 0.6} ${r * 0.25} q ${r * 0.2} -5 ${r * 0.4} 0 M${r * 0.1} ${r * 0.45} q ${r * 0.2} -5 ${r * 0.4} 0`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : (
      <>
        {shadow(r)}
        <path d={`M0 ${r * 0.9} Q ${r * 0.25} 0 ${r * 0.05} ${-r * 0.7}`} fill="none" stroke={L} strokeWidth="9" strokeLinecap="round" />
        <path d={`M0 ${r * 0.9} Q ${r * 0.25} 0 ${r * 0.05} ${-r * 0.7}`} fill="none" stroke="#b98a52" strokeWidth="5" strokeLinecap="round" />
        {[-150, -100, -40, 10, 60].map((a) => (
          <path
            key={a}
            d={`M0 0 Q ${r * 0.5} ${-r * 0.35} ${r} ${r * 0.1} Q ${r * 0.5} ${-r * 0.05} 0 0 Z`}
            transform={`translate(${r * 0.05} ${-r * 0.7}) rotate(${a})`}
            fill={v % 2 ? '#3fb36b' : '#4fc26f'}
            {...ink}
            strokeWidth={1.8}
          />
        ))}
        {v % 3 === 1 && <circle cx={r * 0.15} cy={-r * 0.5} r="4" fill="#8b5a2b" {...ink} strokeWidth={1.5} />}
      </>
    ),
  volcano: (r, v) =>
    v % 4 === 0 ? (
      <>
        <ellipse cx="0" cy={r * 0.3} rx={r * 1.1} ry={r * 0.5} fill="#ff7a1a" {...ink} strokeWidth={2} />
        <ellipse cx={-r * 0.2} cy={r * 0.2} rx={r * 0.4} ry={r * 0.15} fill="#ffd23f" />
      </>
    ) : v % 4 === 1 ? (
      <>
        {shadow(r)}
        <path d={`M0 ${r * 0.9} V ${-r * 0.2} M0 ${r * 0.1} L ${-r * 0.5} ${-r * 0.5} M 0 ${-r * 0.1} L ${r * 0.45} ${-r * 0.7}`} fill="none" stroke={L} strokeWidth="8" strokeLinecap="round" />
        <path d={`M0 ${r * 0.9} V ${-r * 0.2} M0 ${r * 0.1} L ${-r * 0.5} ${-r * 0.5} M 0 ${-r * 0.1} L ${r * 0.45} ${-r * 0.7}`} fill="none" stroke="#6b4a3a" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : (
      <>
        {shadow(r * 0.9)}
        <path d={`M${-r * 0.9} ${r * 0.8} Q ${-r} ${-r * 0.2} ${-r * 0.2} ${-r * 0.6} Q ${r * 0.7} ${-r * 0.7} ${r * 0.9} ${r * 0.8} Z`} fill="#5b4a43" {...ink} strokeWidth={2} />
        <path d={`M${-r * 0.2} ${-r * 0.2} l ${r * 0.2} ${r * 0.3} l ${-r * 0.1} ${r * 0.3}`} fill="none" stroke="#ff7a1a" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  candy: (r, v) => {
    const c = ['#ff7eb6', '#7ee0c3', '#ffd23f', '#b07de0'][v % 4]
    return v % 3 === 0 ? (
      <>
        {shadow(r * 0.8)}
        <path d={`M${-r * 0.15} ${r * 0.9} V ${-r * 0.4} Q ${-r * 0.15} ${-r * 0.9} ${r * 0.3} ${-r * 0.9} Q ${r * 0.6} ${-r * 0.9} ${r * 0.6} ${-r * 0.55}`} fill="none" stroke={L} strokeWidth="9" strokeLinecap="round" />
        <path d={`M${-r * 0.15} ${r * 0.9} V ${-r * 0.4} Q ${-r * 0.15} ${-r * 0.9} ${r * 0.3} ${-r * 0.9} Q ${r * 0.6} ${-r * 0.9} ${r * 0.6} ${-r * 0.55}`} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d={`M${-r * 0.15} ${r * 0.9} V ${-r * 0.4} Q ${-r * 0.15} ${-r * 0.9} ${r * 0.3} ${-r * 0.9} Q ${r * 0.6} ${-r * 0.9} ${r * 0.6} ${-r * 0.55}`} fill="none" stroke="#ff5a5f" strokeWidth="5" strokeDasharray="5 5" />
      </>
    ) : (
      <>
        {shadow(r)}
        <rect x="-2.5" y={-r * 0.1} width="5" height={r} fill="#fff" {...ink} strokeWidth={1.6} />
        <circle cx="0" cy={-r * 0.45} r={r * 0.6} fill={c} {...ink} strokeWidth={2} />
        <path d={`M0 ${-r * 0.45} m ${-r * 0.4} 0 a ${r * 0.4} ${r * 0.4} 0 1 0 ${r * 0.8} 0 a ${r * 0.25} ${r * 0.25} 0 1 0 ${-r * 0.5} 0`} fill="none" stroke="#fff" strokeWidth="2.5" />
      </>
    )
  },
  farm: (r, v) =>
    v % 3 === 0 ? (
      <>
        {shadow(r * 0.8)}
        <ellipse cx="0" cy={r * 0.2} rx={r * 0.8} ry={r * 0.6} fill="#f2c84b" {...ink} strokeWidth={2} />
        <path d={`M${-r * 0.5} ${r * 0.05} q ${r * 0.5} -6 ${r} 0 M${-r * 0.5} ${r * 0.35} q ${r * 0.5} -6 ${r} 0`} fill="none" stroke="#c99a2e" strokeWidth="2" />
      </>
    ) : v % 3 === 1 ? (
      <>
        {shadow(r * 0.6)}
        <path d={`M0 ${r * 0.9} V ${-r * 0.3}`} stroke="#3fae7a" strokeWidth="4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="0" cy={-r * 0.75} rx={r * 0.14} ry={r * 0.3} transform={`rotate(${a} 0 ${-r * 0.45})`} fill="#ffd23f" stroke={L} strokeWidth={1.2} />
        ))}
        <circle cx="0" cy={-r * 0.45} r={r * 0.22} fill="#8b5a2b" {...ink} strokeWidth={1.6} />
      </>
    ) : (
      <>
        {shadow(r * 0.8)}
        <ellipse cx="0" cy={r * 0.1} rx={r * 0.7} ry={r * 0.5} fill="#fff" {...ink} strokeWidth={2} />
        <circle cx={r * 0.6} cy={-r * 0.1} r={r * 0.3} fill="#3a2a14" {...ink} strokeWidth={1.6} />
        <path d={`M${-r * 0.4} ${r * 0.5} v ${r * 0.35} M${r * 0.3} ${r * 0.5} v ${r * 0.35}`} stroke={L} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  jungle: (r, v) =>
    v % 5 === 0 ? (
      <>
        {shadow(r * 0.6)}
        <path d={`M0 ${r * 0.9} V ${-r * 0.1}`} stroke="#2f9566" strokeWidth="3" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy={-r * 0.5} rx={r * 0.18} ry={r * 0.32} transform={`rotate(${a} 0 ${-r * 0.25})`} fill="#ff5a5f" stroke={L} strokeWidth={1.2} />
        ))}
        <circle cx="0" cy={-r * 0.25} r={r * 0.14} fill="#ffd23f" />
      </>
    ) : (
      <>
        {shadow(r)}
        {[-60, -25, 15, 55].map((a, i) => (
          <path
            key={a}
            d={`M0 ${r * 0.8} Q ${-r * 0.5} ${-r * 0.2} 0 ${-r * 1.05} Q ${r * 0.5} ${-r * 0.2} 0 ${r * 0.8} Z`}
            transform={`rotate(${a} 0 ${r * 0.8})`}
            fill={i % 2 ? '#2f9566' : '#46a047'}
            {...ink}
            strokeWidth={1.8}
          />
        ))}
        <path d={`M0 ${r * 0.8} V ${-r * 0.2}`} stroke="rgba(0,0,0,.2)" strokeWidth="2" />
      </>
    ),
  sea: (r, v) =>
    v % 3 === 0 ? (
      <>
        {shadow(r * 0.6)}
        <path d={`M0 ${r * 0.9} V 0 L ${-r * 0.5} ${-r * 0.6} M0 ${r * 0.2} L ${r * 0.5} ${-r * 0.4} M ${-r * 0.25} ${-r * 0.25} L ${-r * 0.1} ${-r * 0.8}`} fill="none" stroke={L} strokeWidth="9" strokeLinecap="round" />
        <path d={`M0 ${r * 0.9} V 0 L ${-r * 0.5} ${-r * 0.6} M0 ${r * 0.2} L ${r * 0.5} ${-r * 0.4} M ${-r * 0.25} ${-r * 0.25} L ${-r * 0.1} ${-r * 0.8}`} fill="none" stroke={v % 2 ? '#ff7eb6' : '#ff8c5c'} strokeWidth="5" strokeLinecap="round" />
      </>
    ) : v % 3 === 1 ? (
      <>
        {[-0.35, 0, 0.35].map((dx) => (
          <path key={dx} d={`M${r * dx} ${r * 0.9} q ${-r * 0.25} ${-r * 0.35} 0 ${-r * 0.7} q ${r * 0.25} ${-r * 0.35} 0 ${-r * 0.8}`} fill="none" stroke="#2f9566" strokeWidth="5" strokeLinecap="round" />
        ))}
      </>
    ) : (
      <>
        <circle cx="0" cy="0" r={r * 0.28} fill="rgba(255,255,255,.5)" stroke="#fff" strokeWidth="2" />
        <circle cx={r * 0.35} cy={-r * 0.5} r={r * 0.16} fill="rgba(255,255,255,.5)" stroke="#fff" strokeWidth="1.5" />
        <path d={`M${-r * 0.4} ${r * 0.8} q ${r * 0.2} ${-r * 0.5} ${r * 0.4} 0 Z`} fill="#ffb3c7" {...ink} strokeWidth={1.6} />
      </>
    ),
  clouds: (r, v) =>
    v % 4 === 0 ? (
      <>
        {['#ff5a5f', '#ffc21a', '#3cc35a', '#4f86f7'].map((c, i) => (
          <path key={c} d={`M${-r + i * 4} ${r * 0.6} A ${r - i * 4} ${r - i * 4} 0 0 1 ${r - i * 4} ${r * 0.6}`} fill="none" stroke={c} strokeWidth="4" />
        ))}
      </>
    ) : (
      <>
        <ellipse cx="0" cy={r * 0.5} rx={r} ry={r * 0.18} fill="rgba(80,120,170,.15)" />
        <circle cx={-r * 0.45} cy={r * 0.1} r={r * 0.42} fill="#fff" {...ink} strokeWidth={1.8} />
        <circle cx={r * 0.45} cy={r * 0.1} r={r * 0.42} fill="#fff" {...ink} strokeWidth={1.8} />
        <circle cx="0" cy={-r * 0.15} r={r * 0.55} fill="#fff" {...ink} strokeWidth={1.8} />
        <rect x={-r * 0.8} y={r * 0.1} width={r * 1.6} height={r * 0.38} fill="#fff" />
        {v % 3 === 1 && (
          <>
            <circle cx={-r * 0.15} cy={-r * 0.1} r="1.8" fill={L} />
            <circle cx={r * 0.15} cy={-r * 0.1} r="1.8" fill={L} />
          </>
        )}
      </>
    ),
  space: (r, v) =>
    v % 4 === 0 ? (
      <>
        <circle cx="0" cy="0" r={r * 0.5} fill={['#ff8c5c', '#7ee0c3', '#ffd23f'][v % 3]} {...ink} strokeWidth={2} />
        <ellipse cx="0" cy="0" rx={r * 0.85} ry={r * 0.2} fill="none" stroke="#fff" strokeWidth="2.5" />
      </>
    ) : v % 4 === 1 ? (
      <path d={`M0 ${-r * 0.4} L ${r * 0.1} ${-r * 0.1} L ${r * 0.4} 0 L ${r * 0.1} ${r * 0.1} L 0 ${r * 0.4} L ${-r * 0.1} ${r * 0.1} L ${-r * 0.4} 0 L ${-r * 0.1} ${-r * 0.1} Z`} fill="#ffe066" />
    ) : (
      <>
        <ellipse cx="0" cy={r * 0.3} rx={r * 0.85} ry={r * 0.42} fill="#5a5290" {...ink} strokeWidth={2} />
        <ellipse cx="0" cy={r * 0.36} rx={r * 0.58} ry={r * 0.24} fill="#2a2450" />
      </>
    ),
}

function Fence({ x, y, n, color }: { x: number; y: number; n: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="6" width={n * 16} height="5" rx="2" fill={color} {...ink} strokeWidth={1.8} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${i * 16 + 3} 22 V 2 l 5 -5 l 5 5 V 22 Z`} fill={color} {...ink} strokeWidth={1.8} />
      ))}
    </g>
  )
}

function Hut({ x, y, roof }: { x: number; y: number; roof: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="20" rx="26" ry="5" fill="rgba(30,40,20,.2)" />
      <rect x="-20" y="-6" width="40" height="26" rx="3" fill="#f3d9a4" {...ink} />
      <path d="M-26 -4 L 0 -26 L 26 -4 Z" fill={roof} {...ink} />
      <rect x="-6" y="6" width="12" height="14" rx="5" fill="#8b5a2b" {...ink} strokeWidth={2} />
    </g>
  )
}

function Cave({ map }: { map: TowerMap }) {
  const volcano = map.deco === 'volcano'
  const snow = map.deco === 'snow'
  return (
    <g>
      <path
        d="M-500 120 Q -300 40 -120 70 Q 20 -10 200 10 Q 380 -10 520 70 Q 700 40 900 120 L 900 -300 L -500 -300 Z"
        fill={map.hill}
        {...ink}
      />
      {snow && <path d="M-500 60 Q -300 0 -120 30 Q 20 -40 200 -20 Q 380 -40 520 30 Q 700 0 900 60 L 900 -300 L -500 -300 Z" fill="#fff" />}
      {volcano && (
        <g>
          <path d="M40 60 Q 70 0 90 -20 L 120 -20 Q 140 0 170 40" fill="none" stroke="#ff7a1a" strokeWidth="6" strokeLinecap="round" />
          <path d="M300 50 Q 320 10 340 -10" fill="none" stroke="#ff7a1a" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      <path d="M60 56 Q 120 30 150 52 M250 52 Q 300 28 350 56 M-60 80 Q 0 50 40 66" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="4" strokeLinecap="round" />
      <path d="M150 112 V 64 Q 150 22 200 22 Q 250 22 250 64 V 112 Z" fill="rgba(0,0,0,.25)" {...ink} />
      <path d="M164 112 V 68 Q 164 36 200 36 Q 236 36 236 68 V 112 Z" fill="#3a2458" {...ink} />
      <g className="td-swirl">
        <path d="M200 80 m -18 0 a 18 18 0 1 0 36 0 a 12 12 0 1 0 -24 0 a 6 6 0 1 0 12 0" fill="none" stroke={map.glow} strokeWidth="4" strokeLinecap="round" />
      </g>
      {[156, 176, 200, 224, 244].map((sx, i) => (
        <rect key={sx} x={sx - 7} y={i % 2 ? 26 : 32} width="14" height="12" rx="4" fill="rgba(255,255,255,.35)" {...ink} strokeWidth={1.8} />
      ))}
    </g>
  )
}

export const Board = memo(function Board({ map, castle }: { map: TowerMap; castle: string }) {
  const scenery = useMemo(() => spots(map.path, 11 + map.id.length * 7), [map])
  const stones = useMemo(() => {
    const out: { x: number; y: number; w: number }[] = []
    let i = 0
    for (let s = 10; s < map.path.len - 6; s += 17, i++) {
      const p = pointAt(s, map.path)
      out.push({ x: p.x + (i % 2 ? 7 : -7), y: p.y, w: 13 + (i % 3) * 2 })
    }
    return out
  }, [map])
  const pid = `td-check-${map.id}`
  const fence = { forest: '#c98a4b', desert: '#d9a066', snow: '#cbe8fb', beach: '#e0c08a', volcano: '#7a6c66', candy: '#fff', farm: '#c98a4b', jungle: '#8b6a44', sea: '#f2dca8', clouds: '#fff', space: '#8f88b8' }[map.deco]
  return (
    <g>
      <defs>
        <pattern id={pid} width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill={map.ground[1]} />
          <rect width="40" height="40" fill={map.ground[0]} />
          <rect x="40" y="40" width="40" height="40" fill={map.ground[0]} />
        </pattern>
      </defs>
      <rect x="-900" y="-300" width={BOARD.w + 1800} height={BOARD.h + 600} fill={`url(#${pid})`} />
      <Cave map={map} />
      <polyline
        points={map.path.points.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={map.road[0]}
        strokeWidth="40"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {stones.map((s, i) => (
        <rect key={i} x={s.x - s.w / 2} y={s.y - 5} width={s.w} height="10" rx="4" fill={map.road[1]} stroke="rgba(0,0,0,.15)" strokeWidth="1.5" />
      ))}
      {scenery.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y})`}>
          {DRAW[map.deco](t.r, t.v)}
        </g>
      ))}
      <Fence x={92} y={488} n={4} color={fence} />
      <Fence x={246} y={488} n={4} color={fence} />
      <Hut x={48} y={560} roof="#4f86f7" />
      <Hut x={352} y={560} roof="#ff8a5c" />
      <g transform="translate(46 612)">
        <ellipse cx="0" cy="6" rx="24" ry="5" fill="rgba(30,40,20,.2)" />
        <path d="M-22 6 Q -16 -14 0 -16 Q 16 -14 22 6 Z" fill="#ffc21a" {...ink} />
        <circle cx="-6" cy="-6" r="3" fill="#fff6c2" />
      </g>
      <g transform="translate(200 600)">
        <CastleArt c={castleById(castle)} />
      </g>
    </g>
  )
})
