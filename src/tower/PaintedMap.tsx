// Desktop view of the castle lands, built from painted pieces (made with Figma AI): the sea fills the
// screen, the island sits on it, and clouds drift at the screen edges. Each land's castle and the road
// between them are painted into the island; the stops sit at the castle gates.

import { Mascot } from '../components/Mascot'
import { sfx } from '../sfx'
import { CastleSticker } from './castles'
import { Crown } from './Sprites'
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
  { x: 304, y: 867 }, // forest
  { x: 296, y: 541 }, // desert
  { x: 517, y: 267 }, // snow
  { x: 1020, y: 247 }, // beach
  { x: 1573, y: 307 }, // volcano
  { x: 1733, y: 581 }, // candy
  { x: 1773, y: 867 }, // farm
  { x: 1211, y: 921 }, // jungle
  { x: 763, y: 987 }, // sea
  { x: 789, y: 581 }, // clouds
  { x: 1160, y: 561 }, // space
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
