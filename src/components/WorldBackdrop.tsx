import type { World } from '../content'

// Where decorations sit, as % of the scene (left, bottom, size in px).
const SPOTS: [number, number, number][] = [
  [4, 6, 54],
  [86, 9, 60],
  [14, 62, 34],
  [78, 70, 30],
  [44, 3, 40],
  [92, 44, 32],
]

/** Illustrated scenery: sky, clouds, two rolling hills and a few themed decorations. */
export function WorldBackdrop({ world, fixed = true }: { world: World; fixed?: boolean }) {
  return (
    <div
      className={`world ${fixed ? 'world-fixed' : ''}`}
      style={{ background: `linear-gradient(${world.sky[0]}, ${world.sky[1]})` }}
      aria-hidden
    >
      <span className="cloud" style={{ top: '8%', left: '6%' }} />
      <span className="cloud cloud-small" style={{ top: '18%', left: '70%' }} />
      <svg className="hills" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path d="M0 120 C 200 40, 380 60, 560 120 S 900 180, 1200 90 L 1200 220 L 0 220 Z" fill={world.ground} opacity="0.55" />
        <path d="M0 170 C 260 110, 520 140, 760 170 S 1060 200, 1200 150 L 1200 220 L 0 220 Z" fill={world.ground} />
      </svg>
      {world.decor.map((d, i) => {
        const [left, bottom, size] = SPOTS[i % SPOTS.length]
        return (
          <span key={i} className="decor" style={{ left: `${left}%`, bottom: `${bottom}%`, fontSize: size, animationDelay: `${i * 0.7}s` }}>
            {d}
          </span>
        )
      })}
    </div>
  )
}
