// Desktop view of the castle lands, built from separate painted pieces (made with Figma AI): the sea
// fills the screen, the island sits on it and clouds drift at the screen edges. Each land's castle is
// its own picture (map-castle/<id>.webp) so one can be redrawn without repainting the island. A road
// runs from the dock through every castle in play order; the stretch already walked is golden.

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
  { x: 463, y: 827, w: 191 }, // forest
  { x: 343, y: 480, w: 209 }, // desert
  { x: 593, y: 220, w: 184 }, // snow
  { x: 1016, y: 207, w: 142 }, // beach
  { x: 1510, y: 287, w: 192 }, // volcano
  { x: 1713, y: 507, w: 184 }, // candy
  { x: 1643, y: 793, w: 209 }, // farm
  { x: 1236, y: 947, w: 191 }, // jungle
  { x: 880, y: 967, w: 218 }, // sea
  { x: 770, y: 580, w: 192 }, // clouds
  { x: 1090, y: 527, w: 192 }, // space
]

/** The name label sits on the road just in front of each castle gate. */
export const PAINTED_SITES: Pt[] = CASTLE_AT.map((c) => ({ x: c.x, y: c.y + 38 }))

/** The road in play order: from the dock to castle 1, then from each castle to the next. */
const ROAD: [number, number][][] = [
  [[360, 975], [390, 925], [430, 885], [463, 848]],
  [[463, 848], [468, 760], [475, 690], [478, 620], [476, 570], [460, 535], [420, 512], [380, 503], [343, 498]],
  [[343, 498], [400, 510], [455, 530], [480, 540], [535, 480], [580, 430], [570, 390], [530, 360], [495, 330], [505, 300], [530, 270], [560, 250], [593, 238]],
  [[593, 238], [660, 245], [740, 252], [820, 245], [890, 235], [960, 228], [1017, 225]],
  [[1017, 225], [1060, 232], [1110, 238], [1170, 245], [1230, 255], [1280, 262], [1340, 285], [1390, 305], [1430, 312], [1470, 305], [1510, 302]],
  [[1510, 302], [1545, 340], [1565, 390], [1568, 440], [1580, 485], [1620, 510], [1670, 520], [1713, 522]],
  [[1713, 522], [1700, 560], [1680, 600], [1665, 640], [1650, 700], [1643, 810]],
  [[1643, 810], [1638, 860], [1625, 895], [1590, 920], [1510, 942], [1420, 958], [1330, 960], [1237, 962]],
  [[1237, 962], [1150, 955], [1080, 960], [1020, 975], [960, 985], [900, 982], [880, 975]],
  [[880, 975], [900, 880], [935, 800], [950, 740], [930, 690], [880, 665], [820, 640], [785, 610], [770, 598]],
  [[770, 598], [800, 630], [860, 655], [910, 668], [960, 640], [1000, 610], [1040, 570], [1075, 545], [1090, 540]],
]

/** A smooth line through the points (Catmull-Rom turned into curves). */
function smooth(pts: [number, number][]): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[Math.max(0, i - 1)]
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const [x3, y3] = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6]
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6]
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${x2} ${y2}`
  }
  return d
}
const ROAD_D = ROAD.map(smooth)

/** Painted castles for the map, one picture per land. */
const MAP_CASTLES = import.meta.glob<string>('./map-castle/*.webp', { eager: true, import: 'default' })

export function PaintedMap({ wins, onPlay }: { wins: string[]; onPlay: (id: string) => void }) {
  const current = MAPS.findIndex((m, i) => mapOpen(wins, i) && !wins.includes(m.id))
  const reached = current === -1 ? MAPS.length - 1 : current

  return (
    <div className="td-island td-painted" style={{ aspectRatio: `${W} / ${H}` }}>
      <img className="td-painted-img" src={islandUrl} alt="" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="td-road-svg" aria-hidden>
        {/* the road: a thin dark edge with sand inside, golden up to the land being played */}
        {ROAD_D.map((d, i) => (
          <path key={`e${i}`} d={d} fill="none" stroke="#7a5a3a" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {ROAD_D.map((d, i) => (
          <path
            key={`s${i}`}
            d={d}
            fill="none"
            stroke={i <= reached ? '#f6c445' : '#efdfbf'}
            strokeWidth="23"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
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
