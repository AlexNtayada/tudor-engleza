// Desktop view of the castle lands, built from painted pieces (made with Figma AI): the sea fills the
// screen, the island sits on it, and clouds drift at the screen edges. Each land's castle and the road
// between them are painted into the island; the stops sit at the castle gates.

import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { MAPS, mapOpen } from './maps'
import islandUrl from './painted-island-castles.webp'
import seaUrl from './painted-sea.webp'
import cloud0 from './cloud-0.webp'
import cloud1 from './cloud-1.webp'
import cloud2 from './cloud-2.webp'
import cloud3 from './cloud-3.webp'

/** Size of the picture; everything below is placed in these pixels. */
const W = 2048
const H = 1152

type Pt = { x: number; y: number }

/** Where each land's stop sits on the picture, in play order. */
export const PAINTED_SITES: Pt[] = [
  { x: 464, y: 894 }, // forest
  { x: 349, y: 534 }, // desert
  { x: 596, y: 287 }, // snow
  { x: 1027, y: 267 }, // beach
  { x: 1507, y: 347 }, // volcano
  { x: 1707, y: 561 }, // candy
  { x: 1633, y: 861 }, // farm
  { x: 1233, y: 1007 }, // jungle
  { x: 873, y: 1027 }, // sea
  { x: 771, y: 654 }, // clouds
  { x: 1087, y: 594 }, // space
]

export function PaintedMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))

  return (
    <div className="td-island td-painted" style={{ aspectRatio: `${W} / ${H}` }}>
      <img className="td-painted-img" src={islandUrl} alt="" draggable={false} />

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
              className="td-gate-label"
              onClick={() => {
                if (!open) return sfx.wrong()
                sfx.tap()
                onPlay(m.id)
              }}
              aria-label={open ? `${i + 1}. ${m.name}${won ? ', câștigată' : ''}` : `${m.name}, încuiată`}
            >
              {m.name}
              {won && <span className="td-gate-mark td-gate-won">✓</span>}
              {!open && <span className="td-gate-mark">🔒</span>}
            </button>
            {isHere && (
              <span className={`td-stop-friend td-isl-friend ${right ? 'td-friend-left' : 'td-friend-right'}`}>
                <Mascot size={64} mood="happy" />
              </span>
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
