// Desktop view of the castle lands, built from separate painted pieces (made with Figma AI): the sea
// fills the screen, the island sits on it and clouds drift at the screen edges. Each land's castle is
// its own picture (map-castle/<id>.webp) so one can be redrawn without repainting the island. The road
// through every castle in play order is painted into the island (scripts/art/bake_island_road.py).

import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { MAPS, mapOpen } from './maps'
import islandUrl from './painted-island.webp'
import seaUrl from './painted-sea.webp'
import cloud0 from './cloud-0.webp'
import cloud1 from './cloud-1.webp'
import cloud2 from './cloud-2.webp'
import cloud3 from './cloud-3.webp'

/** Size of the picture; everything below is placed in these pixels. */
const W = 2048
const H = 1152

type Pt = { x: number; y: number }

/** Where each land's castle stands: x is its middle, y the ground under its gate, w its width. */
const CASTLE_AT: { x: number; y: number; w: number }[] = [
  { x: 463, y: 827, w: 222 }, // forest
  { x: 343, y: 480, w: 209 }, // desert
  { x: 593, y: 220, w: 184 }, // snow
  { x: 1016, y: 207, w: 142 }, // beach
  { x: 1510, y: 287, w: 192 }, // volcano
  { x: 1713, y: 507, w: 184 }, // candy
  { x: 1643, y: 793, w: 228 }, // farm
  { x: 1236, y: 947, w: 191 }, // jungle
  { x: 880, y: 967, w: 218 }, // sea
  { x: 770, y: 580, w: 192 }, // clouds
  { x: 1090, y: 527, w: 192 }, // space
]

/** The name label sits on the road just in front of each castle gate. */
export const PAINTED_SITES: Pt[] = CASTLE_AT.map((c) => ({ x: c.x, y: c.y + 38 }))

/** Painted castles for the map, one picture per land. */
const MAP_CASTLES = import.meta.glob<string>('./map-castle/*.webp', { eager: true, import: 'default' })

export function PaintedMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))

  return (
    <div className="td-island td-painted" style={{ aspectRatio: `${W} / ${H}` }}>
      <img className="td-painted-img" src={islandUrl} alt="" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="td-road-svg" aria-hidden>
        {MAPS.map((m, i) => {
          const c = CASTLE_AT[i]
          const img = MAP_CASTLES[`./map-castle/${m.id}.webp`]
          if (!img) return null
          return (
            <g key={m.id}>
              <ellipse cx={c.x} cy={c.y - 4} rx={c.w * 0.46} ry={c.w * 0.09} fill="rgba(40,40,30,.22)" />
              <image href={img} x={c.x - c.w / 2} y={c.y - c.w * 1.3} width={c.w} height={c.w * 1.3} preserveAspectRatio="xMidYMax meet" />
            </g>
          )
        })}
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
              className="td-gate-label"
              style={{ ['--land' as string]: m.edge }}
              onClick={() => {
                if (!open) return sfx.wrong()
                sfx.tap()
                onPlay(m.id)
              }}
              aria-label={open ? `${i + 1}. ${m.name}${won ? ', câștigată' : ''}` : `${m.name}, încuiată`}
            >
              <span className="td-gate-num">{i + 1}</span>
              <span className="td-gate-name">{m.name}</span>
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
