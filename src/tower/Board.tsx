// The game board: a grassy meadow with a cave at the top, a stone path through a wood,
// and the castle at the bottom. Drawn once; enemies and friends are drawn on top by Tower.tsx.

import { memo } from 'react'
import { BOARD, PATH, PATH_LEN, pointAt } from './engine'

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

const TREE_COLORS = [
  ['#5cb85c', '#46a047'],
  ['#7ccf4e', '#62b33a'],
  ['#ffa94d', '#f08c2e'],
  ['#b07de0', '#9461c9'],
  ['#3fae7a', '#2f9566'],
]

/** Distance from a point to the path. */
function pathDist(x: number, y: number): number {
  let best = Infinity
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, ay] = PATH[i]
    const [bx, by] = PATH[i + 1]
    const dx = bx - ax
    const dy = by - ay
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    best = Math.min(best, Math.hypot(x - (ax + dx * t), y - (ay + dy * t)))
  }
  return best
}

// Trees on a jittered grid, well away from the path, the cave and the castle.
// They also fill the space beside the board on wide screens (x below 0 or above 400).
const TREES = (() => {
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const out: { x: number; y: number; r: number; c: number }[] = []
  for (let y = 150; y <= 470; y += 40)
    for (let x = -420; x <= 820; x += 42) {
      const px = x + (rnd() - 0.5) * 26 + (y % 80 ? 21 : 0)
      const py = y + (rnd() - 0.5) * 16
      if (pathDist(px, py) < 46) continue
      if (py > 430 && px > 90 && px < 310) continue
      if (rnd() < 0.3) continue
      out.push({ x: px, y: py, r: 17 + rnd() * 7, c: Math.floor(rnd() * TREE_COLORS.length) })
    }
  return out.sort((a, b) => a.y - b.y)
})()

const STONES = (() => {
  const out: { x: number; y: number; w: number }[] = []
  let i = 0
  for (let s = 10; s < PATH_LEN - 6; s += 17, i++) {
    const p = pointAt(s)
    out.push({ x: p.x + (i % 2 ? 7 : -7), y: p.y, w: 13 + (i % 3) * 2 })
  }
  return out
})()

function Tree({ x, y, r, c }: { x: number; y: number; r: number; c: number }) {
  const [main, dark] = TREE_COLORS[c]
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy={r * 0.95} rx={r * 0.9} ry={r * 0.25} fill="rgba(30,60,20,.22)" />
      <rect x="-4" y={r * 0.2} width="8" height={r * 0.7} rx="3" fill="#8b5a2b" {...ink} strokeWidth={2} />
      <circle cx={-r * 0.45} cy={r * 0.05} r={r * 0.62} fill={dark} {...ink} strokeWidth={2} />
      <circle cx={r * 0.45} cy={r * 0.05} r={r * 0.62} fill={dark} {...ink} strokeWidth={2} />
      <circle cx="0" cy={-r * 0.35} r={r * 0.72} fill={main} {...ink} strokeWidth={2} />
      <circle cx={-r * 0.25} cy={-r * 0.6} r={r * 0.2} fill="#fff" opacity=".28" />
    </g>
  )
}

function Fence({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="6" width={n * 16} height="5" rx="2" fill="#a86c3c" {...ink} strokeWidth={1.8} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${i * 16 + 3} 22 V 2 l 5 -5 l 5 5 V 22 Z`} fill="#c98a4b" {...ink} strokeWidth={1.8} />
      ))}
    </g>
  )
}

function Hut({ x, y, roof }: { x: number; y: number; roof: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="20" rx="26" ry="5" fill="rgba(30,60,20,.2)" />
      <rect x="-20" y="-6" width="40" height="26" rx="3" fill="#f3d9a4" {...ink} />
      <path d="M-26 -4 L 0 -26 L 26 -4 Z" fill={roof} {...ink} />
      <rect x="-6" y="6" width="12" height="14" rx="5" fill="#8b5a2b" {...ink} strokeWidth={2} />
    </g>
  )
}

function Castle({ x, y }: { x: number; y: number }) {
  const tower = (tx: number, ty: number, h: number) => (
    <g transform={`translate(${tx} ${ty})`}>
      <rect x="-17" y={-h} width="34" height={h} rx="4" fill="#d9dde6" {...ink} />
      <path d={`M-22 ${-h + 2} L 0 ${-h - 34} L 22 ${-h + 2} Z`} fill="#4f86f7" {...ink} />
      <path d={`M0 ${-h - 34} V ${-h - 48}`} {...ink} strokeWidth={2} />
      <path d={`M0 ${-h - 48} l 13 4 l -13 4 Z`} fill="#ff5a5f" {...ink} strokeWidth={1.6} />
      <rect x="-5" y={-h + 12} width="10" height="13" rx="5" fill="#5a6273" />
    </g>
  )
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="8" rx="98" ry="14" fill="rgba(30,60,20,.25)" />
      {tower(-56, -26, 58)}
      {tower(56, -26, 58)}
      <rect x="-64" y="-58" width="128" height="64" rx="6" fill="#e6e9f0" {...ink} />
      {[-52, -30, -8, 14, 36].map((cx) => (
        <rect key={cx} x={cx} y="-68" width="14" height="12" rx="2" fill="#e6e9f0" {...ink} strokeWidth={2} />
      ))}
      <path d="M-34 -58 L 0 -96 L 34 -58 Z" fill="#4f86f7" {...ink} />
      <rect x="-9" y="-80" width="18" height="22" rx="2" fill="#ffc21a" {...ink} strokeWidth={2} />
      <path d="M-22 6 V -20 Q -22 -40 0 -40 Q 22 -40 22 -20 V 6 Z" fill="#8b5a2b" {...ink} />
      <path d="M0 -40 V 6 M-22 -14 H 22" stroke="#6b4220" strokeWidth="2" />
      {tower(-86, 8, 50)}
      {tower(86, 8, 50)}
    </g>
  )
}

function Cave() {
  return (
    <g>
      {/* rocky hill */}
      <path
        d="M-500 120 Q -300 40 -120 70 Q 20 -10 200 10 Q 380 -10 520 70 Q 700 40 900 120 L 900 -300 L -500 -300 Z"
        fill="#8c93a8"
        {...ink}
      />
      <path d="M60 56 Q 120 30 150 52 M250 52 Q 300 28 350 56 M-60 80 Q 0 50 40 66" fill="none" stroke="#6d7389" strokeWidth="4" strokeLinecap="round" />
      {/* cave arch with a purple swirl */}
      <path d="M150 112 V 64 Q 150 22 200 22 Q 250 22 250 64 V 112 Z" fill="#6d7389" {...ink} />
      <path d="M164 112 V 68 Q 164 36 200 36 Q 236 36 236 68 V 112 Z" fill="#3a2458" {...ink} />
      <g className="td-swirl">
        <path d="M200 80 m -18 0 a 18 18 0 1 0 36 0 a 12 12 0 1 0 -24 0 a 6 6 0 1 0 12 0" fill="none" stroke="#c77dff" strokeWidth="4" strokeLinecap="round" />
      </g>
      {[156, 176, 200, 224, 244].map((sx, i) => (
        <rect key={sx} x={sx - 7} y={i % 2 ? 26 : 32} width="14" height="12" rx="4" fill="#a3a9bb" {...ink} strokeWidth={1.8} />
      ))}
    </g>
  )
}

export const Board = memo(function Board() {
  return (
    <g>
      <defs>
        <pattern id="td-check" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#82cc5c" />
          <rect width="40" height="40" fill="#8ad464" />
          <rect x="40" y="40" width="40" height="40" fill="#8ad464" />
        </pattern>
      </defs>
      <rect x="-900" y="-300" width={BOARD.w + 1800} height={BOARD.h + 600} fill="url(#td-check)" />
      <Cave />
      {/* path: sand under stones */}
      <polyline
        points={PATH.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="#e8d3a0"
        strokeWidth="40"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {STONES.map((s, i) => (
        <rect key={i} x={s.x - s.w / 2} y={s.y - 5} width={s.w} height="10" rx="4" fill="#cfc8b8" stroke="#a89f8c" strokeWidth="1.5" />
      ))}
      {TREES.filter((t) => t.y < 300).map((t, i) => (
        <Tree key={i} {...t} />
      ))}
      {TREES.filter((t) => t.y >= 300).map((t, i) => (
        <Tree key={`b${i}`} {...t} />
      ))}
      <Fence x={92} y={488} n={4} />
      <Fence x={246} y={488} n={4} />
      <Hut x={48} y={560} roof="#4f86f7" />
      <Hut x={352} y={560} roof="#ff8a5c" />
      <g transform="translate(46 612)">
        <ellipse cx="0" cy="6" rx="24" ry="5" fill="rgba(30,60,20,.2)" />
        <path d="M-22 6 Q -16 -14 0 -16 Q 16 -14 22 6 Z" fill="#ffc21a" {...ink} />
        <circle cx="-6" cy="-6" r="3" fill="#fff6c2" />
      </g>
      <Castle x={200} y={600} />
    </g>
  )
})
