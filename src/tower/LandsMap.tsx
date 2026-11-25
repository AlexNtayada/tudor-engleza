// The castle lands as one long road: the child walks from land to land, top to bottom.
// Each stop shows the land, its castle prize and whether it is won, open or still locked.

import { useEffect, useRef } from 'react'
import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { DRAW } from './Board'
import { CastleSticker } from './castles'
import { MAPS, mapOpen } from './maps'

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

// Scenery on each land's stretch, on the side away from the road.
const SCENERY = MAPS.flatMap((m, i) => {
  const s = STOPS[i]
  const far = s.x < 200 ? [300, 360, 330] : [40, 100, 70]
  return far.map((x, j) => ({ deco: m.deco, x, y: TOP + ROW * i + 35 + j * 50, r: 15 + ((i + j) % 3) * 3, v: i * 7 + j * 3 }))
})

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
          <linearGradient id="td-road-bg" x1="0" y1="0" x2="0" y2="1">
            {MAPS.map((m, i) => (
              <stop key={m.id} offset={(TOP + ROW * i + ROW / 2) / H} stopColor={m.ground[0]} />
            ))}
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#td-road-bg)" />
        {SCENERY.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={0.9}>
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
