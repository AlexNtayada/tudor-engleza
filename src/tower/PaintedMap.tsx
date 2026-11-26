// Desktop view of the castle lands, built from separate painted pieces (made with Figma AI): the sea
// fills the screen, the island sits on it and clouds drift at the screen edges. Each land's castle is
// its own picture (map-castle/<id>.webp) so one can be redrawn without repainting the island. The road
// through every land in play order, with a bridge between lands, is painted into the island.

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
/** The picture has 90 px of sea painted above the island and 30 below, so nothing touches its edge. */
const H = 1272

type Pt = { x: number; y: number }

/** Where each land's castle stands: x is its middle, y the ground under its gate, w its width. */
const CASTLE_AT: { x: number; y: number; w: number }[] = [
  { x: 453, y: 849, w: 170 }, // forest
  { x: 353, y: 578, w: 170 }, // farm
  { x: 500, y: 355, w: 170 }, // desert
  { x: 763, y: 242, w: 170 }, // snow
  { x: 1136, y: 333, w: 170 }, // beach
  { x: 1557, y: 353, w: 170 }, // volcano
  { x: 1728, y: 622, w: 170 }, // candy
  { x: 1213, y: 771, w: 170 }, // jungle
  { x: 1260, y: 1005, w: 170 }, // sea
  { x: 1483, y: 1018, w: 170 }, // clouds
  { x: 1820, y: 1039, w: 170 }, // space
]

/** The name label sits on the road just in front of each castle gate. */
export const PAINTED_SITES: Pt[] = CASTLE_AT.map((c) => ({ x: c.x, y: c.y + 46 }))

/** Painted castles for the map, one picture per land. */
const MAP_CASTLES = import.meta.glob<string>('./map-castle/*.webp', { eager: true, import: 'default' })

export function PaintedMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))
  /** The castle and its parchment both start the land, or buzz when it is still locked. */
  const play = (i: number) => {
    if (!mapOpen(wins, i)) return sfx.wrong()
    sfx.tap()
    onPlay(MAPS[i].id)
  }

  return (
    <div className="td-island td-painted" style={{ aspectRatio: `${W} / ${H}` }}>
      <img className="td-painted-img" src={islandUrl} alt="" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="td-road-svg" aria-hidden>
        {MAPS.map((m, i) => {
          const c = CASTLE_AT[i]
          const img = MAP_CASTLES[`./map-castle/${m.id}.webp`]
          if (!img) return null
          return (
            <g key={m.id} className={`td-castle-tap ${mapOpen(wins, i) ? '' : 'td-castle-locked'}`} onClick={() => play(i)}>
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
              onClick={() => play(i)}
              aria-label={open ? `${i + 1}. ${m.name}${won ? ', câștigată' : ''}` : `${m.name}, încuiată`}
            >
              <span className="td-gate-num">{i + 1}</span>
              <span className="td-gate-name">{m.name}</span>
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
