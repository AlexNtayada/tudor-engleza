// Desktop view of the castle lands: one island that fits the screen, each land a region of it,
// with a road winding from land to land (not in a straight line) and a gate into each region.

import { useMemo } from 'react'
import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { DRAW } from './Board'
import { CastleSticker } from './castles'
import { Gate } from './LandsMap'
import { MAPS, mapOpen } from './maps'

const W = 1200
const H = 720
const L = '#2b2118'

type Pt = { x: number; y: number }

/** Where each land sits on the island, in play order: up the west, across the north, down the east, into the middle. */
export const SITES: Pt[] = [
  { x: 230, y: 520 }, // forest
  { x: 270, y: 290 }, // desert
  { x: 440, y: 165 }, // snow
  { x: 640, y: 135 }, // beach
  { x: 840, y: 170 }, // volcano
  { x: 1005, y: 270 }, // candy
  { x: 985, y: 485 }, // farm
  { x: 800, y: 575 }, // jungle
  { x: 585, y: 590 }, // sea
  { x: 480, y: 405 }, // clouds
  { x: 715, y: 360 }, // space
]

// ---------- island outline ----------

const ISLAND: Pt[] = Array.from({ length: 90 }, (_, k) => {
  const a = (k / 90) * Math.PI * 2
  const wob = 1 + 0.05 * Math.sin(a * 5 + 1) + 0.035 * Math.sin(a * 9 + 2) + 0.02 * Math.sin(a * 17)
  return { x: 600 + 545 * wob * Math.cos(a), y: 368 + 318 * wob * Math.sin(a) }
})

function smoothClosed(pts: Pt[]): string {
  const n = pts.length
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`
  }
  return d + ' Z'
}
const ISLAND_D = smoothClosed(ISLAND)

function inPoly(p: Pt, poly: Pt[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

// ---------- regions: each land owns the part of the island closest to its stop ----------

function clipHalf(poly: Pt[], s: Pt, o: Pt): Pt[] {
  const mx = (s.x + o.x) / 2
  const my = (s.y + o.y) / 2
  const nx = o.x - s.x
  const ny = o.y - s.y
  const side = (p: Pt) => (p.x - mx) * nx + (p.y - my) * ny
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const sa = side(a)
    const sb = side(b)
    if (sa <= 0) out.push(a)
    if (sa <= 0 !== sb <= 0) {
      const t = sa / (sa - sb)
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return out
}

const CELLS: Pt[][] = SITES.map((s, i) =>
  SITES.reduce(
    (poly, o, j) => (j === i ? poly : clipHalf(poly, s, o)),
    [
      { x: -50, y: -50 },
      { x: W + 50, y: -50 },
      { x: W + 50, y: H + 50 },
      { x: -50, y: H + 50 },
    ],
  ),
)
const owner = (p: Pt) => SITES.reduce((best, s, i) => (Math.hypot(s.x - p.x, s.y - p.y) < Math.hypot(SITES[best].x - p.x, SITES[best].y - p.y) ? i : best), 0)

// ---------- the road ----------

/** The road bends between stops so it never runs straight. */
const ROAD: Pt[] = (() => {
  const pts: Pt[] = [{ x: 120, y: 640 }, ...SITES]
  const out: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    // a sideways bend, alternating left and right
    const bend = (i % 2 ? 1 : -1) * Math.min(55, len * 0.22)
    const c = { x: (a.x + b.x) / 2 + (-dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend }
    for (let t = 0; t < 1; t += 0.025) {
      const u = 1 - t
      out.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y })
    }
  }
  out.push(pts[pts.length - 1])
  return out
})()
/** Index in ROAD of each stop. */
const STOP_AT = SITES.map((s) => ROAD.findIndex((p) => p.x === s.x && p.y === s.y))
const roadD = (upTo: number) => ROAD.slice(0, upTo + 1).map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
const roadDist = (p: Pt) => Math.min(...ROAD.map((q) => Math.hypot(q.x - p.x, q.y - p.y)))

/** A gate where the road first enters each land on its way to that land's stop. */
const GATES = SITES.map((_, i) => {
  if (i === 0) return null
  for (let k = STOP_AT[i - 1]; k <= STOP_AT[i]; k++) if (owner(ROAD[k]) === i) return { ...ROAD[k], i }
  return null
})

// ---------- scenery ----------

const SCENERY = (() => {
  let seed = 17
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const out: { x: number; y: number; r: number; v: number; i: number }[] = []
  for (let y = 40; y < H; y += 40)
    for (let x = 30; x < W; x += 44) {
      const p = { x: x + (rnd() - 0.5) * 24 + ((y / 40) % 2 ? 22 : 0), y: y + (rnd() - 0.5) * 16 }
      if (!inPoly({ x: p.x, y: p.y + 12 }, ISLAND) || !inPoly({ x: p.x, y: p.y - 20 }, ISLAND)) continue
      if (roadDist(p) < 32) continue
      const i = owner(p)
      const s = SITES[i]
      if (Math.abs(p.x - s.x) < 135 && Math.abs(p.y - s.y) < 62) continue
      if (rnd() < 0.22) continue
      out.push({ x: p.x, y: p.y, r: 11 + rnd() * 6, v: Math.floor(rnd() * 100), i })
    }
  return out.sort((a, b) => a.y - b.y)
})()

const WAVES = (() => {
  let seed = 5
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: 70 }, () => ({ x: rnd() * W, y: rnd() * H })).filter((p) => !inPoly(p, ISLAND.map((q) => ({ x: 600 + (q.x - 600) * 1.06, y: 368 + (q.y - 368) * 1.08 }))))
})()

export function IslandMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))
  const reached = current === -1 ? MAPS.length - 1 : current
  const cells = useMemo(() => CELLS.map((c) => 'M ' + c.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ') + ' Z'), [])

  return (
    <div className="td-island" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="td-road-svg" aria-hidden>
        <defs>
          {MAPS.map((m) => (
            <pattern key={m.id} id={`td-isl-${m.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill={m.ground[1]} />
              <rect width="20" height="20" fill={m.ground[0]} />
              <rect x="20" y="20" width="20" height="20" fill={m.ground[0]} />
            </pattern>
          ))}
          <clipPath id="td-isl-clip">
            <path d={ISLAND_D} />
          </clipPath>
        </defs>

        {/* sea */}
        <rect width={W} height={H} fill="#4fb4e8" />
        {WAVES.map((p, k) => (
          <path key={k} d={`M ${p.x - 10} ${p.y} q 5 -5 10 0 q 5 5 10 0`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
        ))}
        {/* small islets and a boat */}
        {[
          { x: 1150, y: 640, r: 22 },
          { x: 70, y: 110, r: 18 },
          { x: 1130, y: 80, r: 14 },
        ].map((t) => (
          <g key={t.x} transform={`translate(${t.x} ${t.y})`}>
            <ellipse cx="0" cy="4" rx={t.r * 1.3} ry={t.r * 0.7} fill="#3a9fd6" />
            <ellipse cx="0" cy="0" rx={t.r} ry={t.r * 0.55} fill="#f2dca8" stroke={L} strokeWidth="2.5" />
            <ellipse cx="-2" cy="-3" rx={t.r * 0.6} ry={t.r * 0.3} fill="#8ad464" />
            {DRAW.beach(t.r * 0.7, 1)}
          </g>
        ))}
        <g transform="translate(40 610)">
          <path d="M-26 0 L 26 0 L 18 14 L -18 14 Z" fill="#a8683a" stroke={L} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M0 0 V -44" stroke={L} strokeWidth="3" />
          <path d="M2 -42 L 24 -8 L 2 -8 Z" fill="#fff" stroke={L} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-2 -36 L -20 -8 L -2 -8 Z" fill="#fff6c2" stroke={L} strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 -44 l 12 4 l -12 4 Z" fill="#ff5a5f" />
          <path d="M-34 18 q 8 -5 16 0 q 8 5 16 0 q 8 -5 16 0 q 8 5 16 0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <path d={ISLAND_D} fill="#3a9fd6" transform="translate(600 368) scale(1.045 1.07) translate(-600 -368)" />
        <path d={ISLAND_D} fill="#f2dca8" stroke={L} strokeWidth="3" transform="translate(600 368) scale(1.02 1.03) translate(-600 -368)" />

        {/* the lands */}
        <g clipPath="url(#td-isl-clip)">
          {MAPS.map((m, i) => (
            <path key={m.id} d={cells[i]} fill={`url(#td-isl-${m.id})`} />
          ))}
          {MAPS.map((m, i) => (
            <path key={m.id} d={cells[i]} fill="none" stroke={L} strokeWidth="2.5" strokeLinejoin="round" opacity=".55" />
          ))}
        </g>
        <path d={ISLAND_D} fill="none" stroke={L} strokeWidth="3" />

        {SCENERY.map((s, k) => (
          <g key={k} transform={`translate(${s.x} ${s.y})`}>
            {DRAW[MAPS[s.i].deco](s.r, s.v)}
          </g>
        ))}

        {/* a little dock where the road starts */}
        <g transform="translate(108 650)">
          <rect x="-30" y="-6" width="44" height="14" rx="3" fill="#b98a52" stroke={L} strokeWidth="2" />
          <path d="M-24 8 v 10 M-6 8 v 10 M10 8 v 10" stroke={L} strokeWidth="3" />
        </g>

        {/* the road, and the part already walked in gold */}
        <path d={roadD(ROAD.length - 1)} fill="none" stroke={L} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" opacity=".18" transform="translate(0 3)" />
        <path d={roadD(ROAD.length - 1)} fill="none" stroke="#9c7a4a" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadD(ROAD.length - 1)} fill="none" stroke="#efe3c8" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadD(STOP_AT[reached])} fill="none" stroke="#ffc83d" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadD(ROAD.length - 1)} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 11" strokeLinecap="round" opacity=".8" />

        {GATES.map(
          (g) =>
            g && (
              <g key={g.i} transform={`translate(${g.x} ${g.y + 6}) scale(0.72)`}>
                <ellipse cx="0" cy="10" rx="44" ry="7" fill="rgba(30,30,20,.2)" />
                <Gate deco={MAPS[g.i].deco} />
              </g>
            ),
        )}
      </svg>

      {MAPS.map((m, i) => {
        const s = SITES[i]
        const open = mapOpen(wins, i)
        const won = wins.includes(m.id)
        const isHere = i === current
        const right = s.x < 600
        return (
          <div
            key={m.id}
            className={`td-stop td-isl-stop ${open ? '' : 'td-stop-locked'} ${won ? 'td-stop-won' : ''} ${isHere ? 'td-stop-here' : ''}`}
            style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}
          >
            <button
              className="td-stop-btn"
              style={{ borderColor: m.edge, background: open ? m.ground[0] : '#e9e4da' }}
              onClick={() => {
                if (!open) return sfx.wrong()
                sfx.tap()
                onPlay(m.id)
              }}
              aria-label={open ? `${i + 1}. ${m.name}${won ? ', câștigată' : ''}` : `${m.name}, încuiată`}
            >
              <span className="td-stop-icon">{open ? m.icon : '🔒'}</span>
              <span className="td-stop-num">{i + 1}</span>
              {won && <span className="td-stop-crown">👑</span>}
              {won && <span className="td-stop-check">✓</span>}
            </button>
            <span className="td-stop-name">{m.name}</span>
            {/* only the next land shows what it gives, to keep the island tidy */}
            {isHere && (
              <>
                <span className={`td-stop-prize td-isl-prize ${right ? 'td-prize-right' : 'td-prize-left'}`}>
                  <CastleSticker id={m.id} size={70} />
                  <small>Câștigă-l!</small>
                </span>
                <span className="td-stop-friend td-isl-friend">
                  <Mascot size={64} mood="happy" />
                </span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
