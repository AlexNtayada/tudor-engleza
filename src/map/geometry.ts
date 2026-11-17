// Layout math for the illustrated lesson map: where the stones sit, the winding path
// through them, and helpers to keep scenery off the path.

export type Pt = { x: number; y: number }

/** Small deterministic RNG so every unit always gets the same scenery. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export const STEP = 150
export const TOP = 112
export const BOSS_GAP = 26

// Lateral position of each stone, as a fraction of the swing. Two mirrored shapes alternate per unit.
const SHAPES = [
  [-0.55, 0.5, -0.25, 0.62, 0],
  [0.5, -0.6, 0.3, -0.55, 0],
  [-0.2, 0.62, -0.6, 0.35, 0],
]

export type MapLayout = {
  width: number
  height: number
  nodes: Pt[]
  /** Smooth path through the nodes, as an SVG `d`. */
  d: string
  samples: Pt[]
  /** Where the river crosses (between which stones) and where the cliff sits. */
  riverY: number
  ledgeY: number
}

export function layoutUnit(width: number, count: number, unitIndex: number, lastIsBoss: boolean): MapLayout {
  const cx = width / 2
  const swing = Math.max(70, Math.min(width * 0.27, 200))
  const shape = SHAPES[unitIndex % SHAPES.length]
  const nodes: Pt[] = Array.from({ length: count }, (_, i) => ({
    x: cx + swing * shape[i % shape.length],
    y: TOP + i * STEP + (lastIsBoss && i === count - 1 ? BOSS_GAP : 0),
  }))
  const height = nodes[count - 1].y + 120
  const pts: Pt[] = [{ x: cx + swing * 0.1, y: -30 }, ...nodes, { x: cx - swing * 0.1, y: height + 30 }]
  // Catmull-Rom through the points, converted to cubic Béziers.
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  const samples: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    for (let k = 0; k < 20; k++) {
      const t = k / 20
      const u = 1 - t
      samples.push({
        x: u * u * u * p1.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p2.x,
        y: u * u * u * p1.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p2.y,
      })
    }
  }
  samples.push(pts[pts.length - 1])
  const flip = unitIndex % 2 === 0
  const gapMid = (a: number) => (nodes[a].y + nodes[a + 1].y) / 2
  return {
    width,
    height,
    nodes,
    d,
    samples,
    riverY: gapMid(flip ? 0 : 2) + 4,
    ledgeY: gapMid(flip ? 2 : 0) + 2,
  }
}

/** Point and direction (radians) of the path where it crosses height `y`. */
export function crossing(samples: Pt[], y: number): { x: number; angle: number } {
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]
    const b = samples[i]
    if ((a.y - y) * (b.y - y) <= 0 && a.y !== b.y) {
      const t = (y - a.y) / (b.y - a.y)
      return {
        x: a.x + (b.x - a.x) * t,
        angle: Math.atan2(b.y - a.y, b.x - a.x),
      }
    }
  }
  return { x: samples[0].x, angle: Math.PI / 2 }
}

export function distToPath(samples: Pt[], x: number, y: number) {
  let best = Infinity
  for (const p of samples) {
    const dx = p.x - x
    const dy = p.y - y
    const d = dx * dx + dy * dy
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

/** A gentle wave used for river and cliff edges. */
export const wave = (base: number, amp: number, phase: number) => (x: number) =>
  base + Math.sin(x / 90 + phase) * amp + Math.sin(x / 37 + phase * 2) * amp * 0.25

export function edgePath(f: (x: number) => number, width: number, step = 24) {
  const pts: string[] = []
  for (let x = -20; x <= width + 20; x += step) pts.push(`${x} ${f(x).toFixed(1)}`)
  return pts
}
