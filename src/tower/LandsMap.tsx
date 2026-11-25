// The castle lands as one long road: the child walks from land to land, top to bottom.
// Each stop shows the land, its castle prize and whether it is won, open or still locked.

import { useEffect, useRef } from 'react'
import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { DRAW } from './Board'
import { CastleSticker } from './castles'
import { MAPS, mapOpen, type Deco } from './maps'

const W = 400
const ROW = 170
const TOP = 70
const H = TOP + ROW * MAPS.length

/** Where each land's stop sits on the road: swinging left and right. */
export const STOPS = MAPS.map((_, i) => ({ x: Math.round(200 + 105 * Math.sin(i * 1.35 + 0.6)), y: TOP + ROW * i + ROW / 2 - 20 }))

/** A smooth road through every stop (and in from the top). */
function road(upTo = STOPS.length - 1): string {
  let d = `M ${STOPS[0].x} 0 L ${STOPS[0].x} ${STOPS[0].y}`
  for (let i = 1; i <= upTo; i++) {
    const a = STOPS[i - 1]
    const b = STOPS[i]
    const k = (b.y - a.y) / 2
    d += ` C ${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`
  }
  return d
}

/** Points along the road, to keep scenery off it. */
const ROAD_PTS = (() => {
  const pts: { x: number; y: number }[] = []
  for (let y = 0; y <= STOPS[0].y; y += 10) pts.push({ x: STOPS[0].x, y })
  for (let i = 1; i < STOPS.length; i++) {
    const a = STOPS[i - 1]
    const b = STOPS[i]
    const k = (b.y - a.y) / 2
    for (let t = 0; t <= 1; t += 0.04) {
      const u = 1 - t
      pts.push({
        x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * (a.y + k) + 3 * u * t * t * (b.y - k) + t * t * t * b.y,
      })
    }
  }
  return pts
})()
const roadDist = (x: number, y: number) => Math.min(...ROAD_PTS.map((p) => Math.hypot(p.x - x, p.y - y)))

/** Where land i starts (its top edge) and ends. */
const bandTop = (i: number) => (i === 0 ? -20 : TOP + ROW * i)

// Scenery on each land's stretch: a jittered grid, off the road and away from the stop and its castle.
const SCENERY = MAPS.flatMap((m, i) => {
  let seed = 7 + i * 31
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const out: { deco: typeof m.deco; x: number; y: number; r: number; v: number }[] = []
  const s = STOPS[i]
  for (let y = bandTop(i) + 34; y < TOP + ROW * (i + 1) - 10; y += 40)
    for (let x = 22; x <= 378; x += 40) {
      const px = x + (rnd() - 0.5) * 18 + ((y / 40) % 2 ? 14 : 0)
      const py = y + (rnd() - 0.5) * 14
      if (roadDist(px, py) < 36) continue
      if (Math.abs(px - s.x) < 150 && Math.abs(py - s.y) < 62) continue
      if (rnd() < 0.25) continue
      out.push({ deco: m.deco, x: px, y: py, r: 11 + rnd() * 7, v: Math.floor(rnd() * 100) })
    }
  return out.sort((a, b) => a.y - b.y)
})

// Little bits on the ground (tufts, pebbles, sparkles) for texture.
const SPECKS = MAPS.flatMap((_m, i) => {
  let seed = 101 + i * 13
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: 26 }, () => ({ i, x: 8 + rnd() * 384, y: bandTop(i) + 18 + rnd() * (ROW - 26), k: Math.floor(rnd() * 3) })).filter(
    (p) => roadDist(p.x, p.y) > 24,
  )
})

type Edge = 'hills' | 'bumps' | 'waves' | 'zigzag'
const EDGE: Record<string, Edge> = {
  forest: 'hills',
  desert: 'waves',
  snow: 'bumps',
  beach: 'waves',
  volcano: 'zigzag',
  candy: 'bumps',
  farm: 'hills',
  jungle: 'hills',
  sea: 'waves',
  clouds: 'bumps',
  space: 'zigzag',
}

/** The top edge of a land: a shaped line across the map at height y. */
function edgeLine(y: number, kind: Edge): string {
  let d = `M -10 ${y}`
  if (kind === 'bumps') for (let x = -10; x < W + 10; x += 28) d += ` a 14 12 0 0 1 28 0`
  else if (kind === 'zigzag') for (let x = -10; x < W + 10; x += 24) d += ` l 12 -10 l 12 10`
  else if (kind === 'waves') for (let x = -10; x < W + 10; x += 50) d += ` q 12.5 -10 25 0 q 12.5 10 25 0`
  else for (let x = -10; x < W + 10; x += 80) d += ` q 20 -14 40 -6 q 20 8 40 6`
  return d
}

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/** Where the road crosses into land i: the gate stands there. */
const GATES = MAPS.map((m, i) => {
  if (i === 0) return null
  const y = bandTop(i)
  const p = ROAD_PTS.reduce((best, q) => (Math.abs(q.y - y) < Math.abs(best.y - y) ? q : best))
  return { deco: m.deco, x: p.x, y: p.y }
})

function Pillars({ fill, h = 44 }: { fill: string; h?: number }) {
  return (
    <>
      <rect x="-34" y={-h} width="14" height={h + 8} rx="4" fill={fill} {...ink} />
      <rect x="20" y={-h} width="14" height={h + 8} rx="4" fill={fill} {...ink} />
    </>
  )
}

/** The way into a land, drawn standing on (0, 8) across the road; each land has its own. */
function Gate({ deco }: { deco: Deco }) {
  switch (deco) {
    case 'desert':
      return (
        <g>
          <Pillars fill="#e8c27a" />
          <path d="M-36 -40 Q 0 -78 36 -40 L 36 -30 Q 0 -62 -36 -30 Z" fill="#e8c27a" {...ink} />
          <circle cx="0" cy="-58" r="5" fill="#ffd23f" {...ink} strokeWidth={1.6} />
        </g>
      )
    case 'snow':
      return (
        <g>
          <Pillars fill="#cbe8fb" />
          <path d="M-36 -40 Q 0 -78 36 -40 L 36 -30 Q 0 -62 -36 -30 Z" fill="#e3f4ff" {...ink} />
          <path d="M-38 -38 Q -20 -70 0 -66 Q 20 -70 38 -38 Q 28 -44 20 -40 Q 10 -54 0 -50 Q -10 -54 -20 -40 Q -28 -44 -38 -38 Z" fill="#fff" {...ink} strokeWidth={1.6} />
          <path d="M-27 -30 v 8 M27 -30 v 10" stroke="#9fd8ff" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'beach':
      return (
        <g>
          <path d="M-28 8 Q -30 -20 -24 -48 M28 8 Q 30 -20 24 -48" fill="none" stroke={L} strokeWidth="9" strokeLinecap="round" />
          <path d="M-28 8 Q -30 -20 -24 -48 M28 8 Q 30 -20 24 -48" fill="none" stroke="#b98a52" strokeWidth="5" strokeLinecap="round" />
          <path d="M-24 -44 Q 0 -34 24 -44" fill="none" stroke="#8b5a2b" strokeWidth="2" />
          {[-14, -4, 6, 16].map((x, k) => (
            <path key={x} d={`M${x - 4} -41 l 4 9 l 4 -9 Z`} fill={['#ff5a5f', '#ffd23f', '#3ec6c6', '#ff8fb1'][k]} stroke={L} strokeWidth="1" />
          ))}
          <path d="M-24 -48 q -14 -6 -20 4 M-24 -48 q 2 -14 14 -12 M24 -48 q 14 -6 20 4 M24 -48 q -2 -14 -14 -12" fill="none" stroke="#3fb36b" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case 'volcano':
      return (
        <g>
          <path d="M-46 8 Q -50 -40 -10 -56 Q 30 -64 46 -30 Q 52 -6 46 8 Z" fill="#5b4a43" {...ink} />
          <path d="M-20 8 V -18 Q -20 -36 0 -36 Q 20 -36 20 -18 V 8 Z" fill="#2a1d18" {...ink} />
          <path d="M-30 -36 l 6 8 l -4 8 M30 -40 l -5 9" fill="none" stroke="#ff7a1a" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'candy':
      return (
        <g>
          {[-1, 1].map((sgn) => (
            <g key={sgn} transform={`scale(${sgn} 1)`}>
              <path d="M-27 8 V -36 Q -27 -58 -6 -58 Q 4 -58 4 -48" fill="none" stroke={L} strokeWidth="11" strokeLinecap="round" />
              <path d="M-27 8 V -36 Q -27 -58 -6 -58 Q 4 -58 4 -48" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <path d="M-27 8 V -36 Q -27 -58 -6 -58 Q 4 -58 4 -48" fill="none" stroke="#ff5a5f" strokeWidth="7" strokeDasharray="6 6" />
            </g>
          ))}
        </g>
      )
    case 'farm':
      return (
        <g>
          <Pillars fill="#c98a4b" h={40} />
          <rect x="-38" y="-52" width="76" height="16" rx="3" fill="#e0533b" {...ink} />
          <path d="M-30 -44 h 60" stroke="#fff" strokeWidth="2" strokeDasharray="5 4" />
          <path d="M-20 -6 L -34 -26 M20 -6 L 34 -26" stroke="#a86c3c" strokeWidth="4" strokeLinecap="round" />
        </g>
      )
    case 'jungle':
      return (
        <g>
          <Pillars fill="#8b6a44" h={40} />
          <path d="M-34 -36 Q 0 -66 34 -36" fill="none" stroke="#2f9566" strokeWidth="7" strokeLinecap="round" />
          {[-28, -14, 0, 14, 28].map((x, k) => (
            <ellipse key={x} cx={x} cy={-44 - (k === 2 ? 8 : k % 2 ? 4 : 0)} rx="7" ry="4" transform={`rotate(${x} ${x} -44)`} fill={k % 2 ? '#46a047' : '#62b33a'} {...ink} strokeWidth={1.4} />
          ))}
          <path d="M-26 -36 v 18 M26 -36 v 12" stroke="#3fae7a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="-26" cy="-16" r="3.5" fill="#ff5a5f" />
        </g>
      )
    case 'sea':
      return (
        <g>
          <path d="M-30 8 V -30 Q -30 -60 0 -60 Q 30 -60 30 -30 V 8" fill="none" stroke={L} strokeWidth="14" strokeLinecap="round" />
          <path d="M-30 8 V -30 Q -30 -60 0 -60 Q 30 -60 30 -30 V 8" fill="none" stroke="#ff8fb1" strokeWidth="9" strokeLinecap="round" />
          <path d="M-30 -30 l -10 -8 M30 -24 l 10 -10 M-10 -58 l -4 -10" stroke="#ff7eb6" strokeWidth="5" strokeLinecap="round" />
          <circle cx="12" cy="-72" r="4" fill="rgba(255,255,255,.6)" stroke="#fff" strokeWidth="1.5" />
          <circle cx="20" cy="-82" r="2.6" fill="rgba(255,255,255,.6)" stroke="#fff" strokeWidth="1.2" />
        </g>
      )
    case 'clouds':
      return (
        <g>
          {['#ff5a5f', '#ff9f43', '#ffd23f', '#3cc35a', '#4f86f7', '#9b4dde'].map((c, k) => (
            <path key={c} d={`M${-36 + k * 3} 4 A ${36 - k * 3} ${48 - k * 3} 0 0 1 ${36 - k * 3} 4`} fill="none" stroke={c} strokeWidth="3.4" />
          ))}
          {[-36, 36].map((x) => (
            <g key={x} transform={`translate(${x} 6)`}>
              <circle cx="-7" cy="0" r="8" fill="#fff" {...ink} strokeWidth={1.6} />
              <circle cx="7" cy="0" r="8" fill="#fff" {...ink} strokeWidth={1.6} />
              <circle cx="0" cy="-6" r="9" fill="#fff" {...ink} strokeWidth={1.6} />
              <rect x="-13" y="-1" width="26" height="8" fill="#fff" />
            </g>
          ))}
        </g>
      )
    case 'space':
      return (
        <g>
          <ellipse cx="0" cy="-26" rx="32" ry="36" fill="#1b1538" {...ink} strokeWidth={3} />
          <g className="td-swirl">
            <path d="M0 -26 m -22 0 a 22 22 0 1 0 44 0 a 15 15 0 1 0 -30 0 a 8 8 0 1 0 16 0" fill="none" stroke="#7ee0c3" strokeWidth="4" strokeLinecap="round" />
          </g>
          <ellipse cx="0" cy="-26" rx="32" ry="36" fill="none" stroke="#b07de0" strokeWidth="5" />
          <path d="M-40 -60 l 3 6 l 6 1 l -5 4 l 1 6 l -5 -3 l -5 3 l 1 -6 l -5 -4 l 6 -1 Z" fill="#ffe066" />
        </g>
      )
    default:
      return (
        <g>
          <Pillars fill="#a3a9bb" />
          <path d="M-36 -40 Q 0 -78 36 -40 L 36 -30 Q 0 -62 -36 -30 Z" fill="#a3a9bb" {...ink} />
          <path d="M-20 -56 l 4 -6 M18 -58 l 5 -4" stroke="#3fae7a" strokeWidth="4" strokeLinecap="round" />
        </g>
      )
  }
}

export function LandsMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  // The next land to play: the first open one not yet won.
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))
  const reached = current === -1 ? MAPS.length - 1 : current
  const here = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    here.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [])

  return (
    <div className="td-road" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="td-road-svg" aria-hidden>
        <defs>
          {MAPS.map((m) => (
            <pattern key={m.id} id={`td-band-${m.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill={m.ground[1]} />
              <rect width="20" height="20" fill={m.ground[0]} />
              <rect x="20" y="20" width="20" height="20" fill={m.ground[0]} />
            </pattern>
          ))}
        </defs>
        {/* each land is its own patch, with a drawn edge where the next one starts */}
        {MAPS.map((m, i) => {
          const y = bandTop(i)
          const line = edgeLine(y, EDGE[m.deco] ?? 'hills')
          return (
            <g key={m.id}>
              <path d={`${line} L ${W + 10} ${H + 10} L -10 ${H + 10} Z`} fill={`url(#td-band-${m.id})`} />
              {i > 0 && (
                <>
                  <path d={line} fill="none" stroke={m.edge} strokeWidth="6" transform="translate(0 4)" opacity=".55" />
                  <path d={line} fill="none" stroke="#2b2118" strokeWidth="3" strokeLinejoin="round" />
                </>
              )}
            </g>
          )
        })}
        {SPECKS.map((p, j) => {
          const m = MAPS[p.i]
          return p.k === 0 ? (
            <path key={j} d={`M${p.x - 4} ${p.y} q 2 -6 4 0 q 2 -7 4 0`} fill="none" stroke={m.edge} strokeWidth="2" strokeLinecap="round" opacity=".7" />
          ) : p.k === 1 ? (
            <ellipse key={j} cx={p.x} cy={p.y} rx="3" ry="2" fill={m.edge} opacity=".45" />
          ) : (
            <circle key={j} cx={p.x} cy={p.y} r="1.6" fill="#fff" opacity=".6" />
          )
        })}
        {SCENERY.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            {DRAW[s.deco](s.r, s.v)}
          </g>
        ))}
        {/* the whole road, then the stretch already walked in gold */}
        <path d={road()} fill="none" stroke="#2b2118" strokeWidth="34" strokeLinecap="round" opacity=".18" transform="translate(0 4)" />
        <path d={road()} fill="none" stroke="#efe3c8" strokeWidth="30" strokeLinecap="round" />
        <path d={road()} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" />
        {reached > 0 && (
          <>
            <path d={road(reached)} fill="none" stroke="#ffc83d" strokeWidth="30" strokeLinecap="round" />
            <path d={road(reached)} fill="none" stroke="#fff6c2" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" />
          </>
        )}
        {GATES.map(
          (gt, i) =>
            gt && (
              <g key={i} transform={`translate(${gt.x} ${gt.y + 6}) scale(0.95)`}>
                <ellipse cx="0" cy="10" rx="44" ry="7" fill="rgba(30,30,20,.2)" />
                <Gate deco={gt.deco} />
              </g>
            ),
        )}
      </svg>

      {MAPS.map((m, i) => {
        const s = STOPS[i]
        const open = mapOpen(wins, i)
        const won = wins.includes(m.id)
        const isHere = i === current
        const left = s.x < 200
        return (
          <div
            key={m.id}
            className={`td-stop ${open ? '' : 'td-stop-locked'} ${won ? 'td-stop-won' : ''} ${isHere ? 'td-stop-here' : ''}`}
            style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}
          >
            <button
              ref={isHere ? here : undefined}
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
            </button>
            <span className="td-stop-name">{m.name}</span>
            <span className={`td-stop-prize ${left ? 'td-prize-right' : 'td-prize-left'}`}>
              <CastleSticker id={m.id} size={74} locked={!won} />
            </span>
            {isHere && (
              <span className={`td-stop-friend ${left ? 'td-prize-left' : 'td-prize-right'}`}>
                <Mascot size={74} mood="happy" />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
