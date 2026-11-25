// Desktop view of the castle lands, built from painted pieces (made with Figma AI): the sea fills the
// screen, the island sits on it, and clouds drift at the screen edges. A dotted trail joins the lands
// in play order; the stretch already walked is gold.

import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { CastleSticker } from './castles'
import { Crown } from './Sprites'
import { MAPS, mapOpen } from './maps'
import islandUrl from './painted-island.webp'
import seaUrl from './painted-sea.webp'
import cloud0 from './cloud-0.webp'
import cloud1 from './cloud-1.webp'
import cloud2 from './cloud-2.webp'
import cloud3 from './cloud-3.webp'

/** Size of the picture; everything below is placed in these pixels. */
const W = 1506
const H = 856

type Pt = { x: number; y: number }

/** Where each land's stop sits on the picture, in play order. */
export const PAINTED_SITES: Pt[] = [
  { x: 224, y: 596 }, // forest
  { x: 174, y: 326 }, // desert
  { x: 284, y: 186 }, // snow
  { x: 684, y: 146 }, // beach
  { x: 1064, y: 196 }, // volcano
  { x: 1234, y: 376 }, // candy
  { x: 1244, y: 556 }, // farm
  { x: 824, y: 596 }, // jungle
  { x: 584, y: 596 }, // sea (lagoon)
  { x: 544, y: 376 }, // clouds
  { x: 904, y: 326 }, // space
]

const DOCK: Pt = { x: 244, y: 786 }

/** A gently bent trail from the dock through every stop. */
const TRAIL: Pt[] = (() => {
  const pts = [DOCK, ...PAINTED_SITES]
  const out: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    const bend = (i % 2 ? 1 : -1) * Math.min(40, len * 0.18)
    const c = { x: (a.x + b.x) / 2 + (-dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend }
    for (let t = 0; t < 1; t += 0.02) {
      const u = 1 - t
      out.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y })
    }
  }
  out.push(pts[pts.length - 1])
  return out
})()
const STOP_AT = PAINTED_SITES.map((s) => TRAIL.findIndex((p) => p.x === s.x && p.y === s.y))
const trailD = (upTo: number) => TRAIL.slice(0, upTo + 1).map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

export function PaintedMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))
  const reached = current === -1 ? MAPS.length - 1 : current

  return (
    <div className="td-island td-painted" style={{ aspectRatio: `${W} / ${H}` }}>
      <img className="td-painted-img" src={islandUrl} alt="" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="td-road-svg" aria-hidden>
        {/* the whole trail as dots, then the walked part in gold */}
        <path d={trailD(TRAIL.length - 1)} fill="none" stroke="#2b2118" strokeWidth="11" strokeDasharray="0.1 18" strokeLinecap="round" opacity=".55" />
        <path d={trailD(TRAIL.length - 1)} fill="none" stroke="#fffaf0" strokeWidth="7" strokeDasharray="0.1 18" strokeLinecap="round" />
        <path d={trailD(STOP_AT[reached])} fill="none" stroke="#2b2118" strokeWidth="15" strokeDasharray="0.1 18" strokeLinecap="round" />
        <path d={trailD(STOP_AT[reached])} fill="none" stroke="#ffc83d" strokeWidth="10" strokeDasharray="0.1 18" strokeLinecap="round" />
      </svg>

      {MAPS.map((m, i) => {
        const s = PAINTED_SITES[i]
        const open = mapOpen(wins, i)
        const won = wins.includes(m.id)
        const isHere = i === current
        const right = s.x < W / 2
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
              {won && (
                <span className="td-stop-crown">
                  <Crown />
                </span>
              )}
              {won && <span className="td-stop-check">✓</span>}
            </button>
            <span className="td-stop-name">{m.name}</span>
            {isHere && (
              <>
                <span className={`td-stop-prize td-isl-prize ${right ? 'td-prize-right' : 'td-prize-left'}`}>
                  <CastleSticker id={m.id} size={70} />
                  <small>Câștigă-l!</small>
                </span>
                <span className={`td-stop-friend td-isl-friend ${right ? 'td-friend-left' : 'td-friend-right'}`}>
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

const CLOUDS = [cloud0, cloud1, cloud2, cloud3]

/** The sea under the whole page and clouds drifting at the screen edges. */
export function PaintedSky() {
  return (
    <div className="td-sky" style={{ backgroundImage: `url(${seaUrl})` }} aria-hidden>
      {CLOUDS.map((src, i) => (
        <img key={i} className={`td-cloud td-cloud-${i}`} src={src} alt="" draggable={false} />
      ))}
    </div>
  )
}
