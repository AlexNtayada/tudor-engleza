import { memo, useMemo } from 'react'
import { biomeFor, type Biome } from './biomes'
import { PROPS, shade, type PropId } from './props'
import { crossing, distToPath, edgePath, hash, seeded, wave, type MapLayout } from './geometry'

const PATH_W = 44

/** Painted grounds (made with Figma AI), one per unit; units without one keep the drawn scenery. */
const PAINTED = import.meta.glob<string>('./bg/*.webp', { eager: true, import: 'default' })
const PAINT_RATIO = 1536 / 864

/** The painted ground stacked down the unit, every other copy mirrored so the joins match. */
function PaintedGround({ src, W, H }: { src: string; W: number; H: number }) {
  const th = W * PAINT_RATIO
  return (
    <>
      {Array.from({ length: Math.ceil(H / th) }, (_, k) => (
        <image
          key={k}
          href={src}
          x={0}
          y={0}
          width={W}
          height={th}
          preserveAspectRatio="none"
          transform={k % 2 ? `translate(0 ${(k + 1) * th}) scale(1 -1)` : `translate(0 ${k * th})`}
        />
      ))}
    </>
  )
}
/** Width of the trail and the strip of grass kept clear beside it. */
const trailOf = (_b: Biome) => ({ w: 60, clear: 26 })

/** Paw prints walking down the trail, alternating left and right, skipping the lesson stones. */
function pawPrints(samples: { x: number; y: number }[], nodes: { x: number; y: number }[], skip: { x: number; y: number }[]) {
  const out: { x: number; y: number; a: number }[] = []
  let acc = 0
  let side = 1
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]
    const b = samples[i]
    acc += Math.hypot(b.x - a.x, b.y - a.y)
    if (acc < 26) continue
    acc = 0
    const ang = Math.atan2(b.y - a.y, b.x - a.x)
    const x = b.x + Math.cos(ang + Math.PI / 2) * 9 * side
    const y = b.y + Math.sin(ang + Math.PI / 2) * 9 * side
    side = -side
    if (nodes.some((n) => Math.hypot(n.x - x, n.y - y) < 40)) continue
    if (skip.some((n) => Math.hypot(n.x - x, n.y - y) < 44)) continue
    out.push({ x, y, a: (ang * 180) / Math.PI + 90 })
  }
  return out
}

type Placed = { id: PropId; x: number; y: number; s: number; v: number }

function weighted(list: [PropId, number][], r: number): PropId {
  const total = list.reduce((a, [, w]) => a + w, 0)
  let t = r * total
  for (const [id, w] of list) {
    t -= w
    if (t <= 0) return id
  }
  return list[list.length - 1][0]
}

function placeProps(layout: MapLayout, biome: Biome, seed: number, river: (x: number) => number, ledge: (x: number) => number): Placed[] {
  const { width: W, height: H, nodes, samples } = layout
  const rng = seeded(seed)
  const placed: Placed[] = []
  const big: Placed[] = []
  const phone = W < 520
  const base = phone ? 0.82 : 1
  const trail = trailOf(biome)

  const free = (x: number, y: number, r: number, isBig: boolean) => {
    if (y < 8 || y > H - 2) return false
    if (distToPath(samples, x, y) < trail.w / 2 + 4 + trail.clear * (isBig ? 1.4 : 1) + r * (isBig ? 0.75 : 0.4)) return false
    const topY = y - (isBig ? r * 1.6 : 0)
    for (const n of nodes) {
      if (Math.hypot(n.x - x, n.y - 14 - y) < 64 + r * 0.6) return false
      if (isBig && Math.abs(n.x - x) < 50 + r * 0.7 && topY < n.y + 30 && y > n.y - 60) return false
      const side = n.x < W / 2 ? 1 : -1
      if (Math.hypot(n.x + side * 92 - x, n.y - y) < 52 + r * 0.5) return false
    }
    if (Math.abs(y - river(x)) < 26 + (isBig ? r * 0.15 : 2)) return false
    const l = ledge(x)
    if (y > l - 6 && y < l + 36 + r * 0.2) return false
    if (isBig) for (const b of big) if (Math.hypot(b.x - x, b.y - y) < (PROPS[b.id].r * b.s + r) * 0.8) return false
    return true
  }

  // Big pieces, crowded towards the edges like a forest border.
  const dens = biome.density ?? 1
  const nBig = Math.min(150, Math.round(((W * H) / (phone ? 7000 : 9500)) * dens))
  for (let i = 0; i < nBig * 3 && big.length < nBig; i++) {
    const edge = rng() < 0.62
    const u = edge ? (rng() < 0.5 ? rng() * 0.2 : 1 - rng() * 0.2) : rng()
    const x = -12 + u * (W + 24)
    const y = rng() * H
    const id = weighted(biome.big, rng())
    const s = base * (0.85 + rng() * 0.35)
    if (!free(x, y, PROPS[id].r * s, true)) continue
    const p = { id, x, y, s, v: rng() }
    big.push(p)
    placed.push(p)
  }
  // Small pieces scattered everywhere.
  const nSmall = Math.min(260, Math.round(((W * H) / (phone ? 3800 : 5200)) * dens))
  for (let i = 0; i < nSmall * 2; i++) {
    const x = rng() * W
    const y = rng() * H
    const id = weighted(biome.small, rng())
    const s = base * (0.85 + rng() * 0.4)
    if (!free(x, y, PROPS[id].r * s, false)) continue
    placed.push({ id, x, y, s, v: rng() })
    if (placed.length - big.length >= nSmall) break
  }
  // Reeds and stones along the river banks.
  for (let x = 10; x < W; x += 34 + rng() * 40) {
    const below = rng() < 0.55
    const y = river(x) + (below ? 24 : -18)
    if (distToPath(samples, x, y) < trail.w / 2 + 18 + trail.clear) continue
    placed.push({
      id: biome.shore[Math.floor(rng() * biome.shore.length)],
      x,
      y,
      s: base * (0.8 + rng() * 0.3),
      v: rng(),
    })
  }
  return placed.sort((a, b) => a.y - b.y)
}

function Scene({ unitId, layout }: { unitId: string; layout: MapLayout }) {
  const biome = biomeFor(unitId)
  const { width: W, height: H, samples, d } = layout
  const seed = hash(unitId)

  const scene = useMemo(() => {
    const rng = seeded(seed ^ 0x9e3779b9)
    const river = wave(layout.riverY, 9, rng() * 6)
    const ledge = wave(layout.ledgeY, 7, rng() * 6)
    const props = placeProps(layout, biome, seed, river, ledge)
    const patches = Array.from({ length: Math.round((W * H) / 40000) + 4 }, () => ({
      x: rng() * W,
      y: rng() * H,
      rx: 40 + rng() * 90,
      ry: 18 + rng() * 34,
    }))
    const riverTop = edgePath((x) => river(x) - 18, W)
    const riverBot = edgePath((x) => river(x) + 18, W).reverse()
    const bankTop = edgePath((x) => river(x) - 25, W)
    const bankBot = edgePath((x) => river(x) + 25, W).reverse()
    const ledgeTop = edgePath(ledge, W)
    const ledgeBot = edgePath((x) => ledge(x) + 32, W).reverse()
    const ledgeMid = edgePath((x) => ledge(x) + 22, W)
    const ripples = Array.from({ length: Math.max(4, Math.round(W / 70)) }, (_, i) => {
      const x = (i + rng()) * (W / Math.max(4, Math.round(W / 70)))
      return { x, y: river(x) + (rng() - 0.5) * 16, w: 10 + rng() * 14 }
    })
    const cliffLines = Array.from({ length: Math.round(W / 22) }, (_, i) => i * 22 + rng() * 10)
    return {
      river,
      ledge,
      props,
      patches,
      riverPoly: `M${riverTop.join(' L ')} L ${riverBot.join(' L ')} Z`,
      bankPoly: `M${bankTop.join(' L ')} L ${bankBot.join(' L ')} Z`,
      plateauPoly: `M-20 -20 L ${W + 20} -20 L ${[...ledgeTop].reverse().join(' L ')} Z`,
      cliffPoly: `M${ledgeTop.join(' L ')} L ${ledgeBot.join(' L ')} Z`,
      lipLine: `M${ledgeTop.join(' L ')}`,
      cliffDark: `M${ledgeMid.join(' L ')} L ${ledgeBot.join(' L ')} Z`,
      ripples,
      cliffLines,
      bridge: crossing(samples, layout.riverY),
      stairs: crossing(samples, layout.ledgeY),
    }
  }, [W, H, seed, layout, biome, samples])

  const deg = (a: number) => (a * 180) / Math.PI - 90
  const bridgeAt = { x: scene.bridge.x, y: scene.river(scene.bridge.x) }
  const stairsAt = { x: scene.stairs.x, y: scene.ledge(scene.stairs.x) + 14 }
  const trail = trailOf(biome)
  const bw = trail.w / PATH_W
  const marks = biome.pathDetail === 'road' || biome.pathDetail === 'glow' ? [] : pawPrints(samples, layout.nodes, [bridgeAt, stairsAt])
  const stoneMarks = biome.pathDetail === 'glow' ? samples.filter((_, i) => i % 3 === 0) : []
  const painted = PAINTED[`./bg/${unitId}.webp`]

  if (painted)
    return (
      <svg className="bm-scene" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <rect x="0" y="0" width={W} height={H} fill={biome.ground} />
        <PaintedGround src={painted} W={W} H={H} />
        <path d={d} stroke="rgba(0,0,0,0.16)" strokeWidth={trail.w + 14} fill="none" strokeLinecap="round" transform="translate(0 6)" />
        <path d={d} stroke={shade(biome.pathEdge, -0.45)} strokeWidth={trail.w + 12} fill="none" strokeLinecap="round" />
        <path d={d} stroke={biome.pathEdge} strokeWidth={trail.w + 4} fill="none" strokeLinecap="round" />
        <path d={d} stroke={biome.path} strokeWidth={trail.w - 6} fill="none" strokeLinecap="round" />
        <path d={d} stroke="#fff" strokeWidth={trail.w * 0.22} fill="none" strokeLinecap="round" opacity="0.3" transform="translate(-6 -3)" />
        {biome.pathDetail === 'road' && <path d={d} stroke="#fff" strokeWidth="4" strokeDasharray="16 14" fill="none" />}
        {biome.pathDetail === 'glow' && stoneMarks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" opacity="0.9" />)}
      </svg>
    )

  return (
    <svg className="bm-scene" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <rect x="0" y="0" width={W} height={H} fill={biome.ground} />
      {scene.patches.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={biome.patch} opacity="0.55" />
      ))}

      {/* higher ground and its cliff */}
      <path d={scene.plateauPoly} fill={biome.plateau} />
      <path d={`M${edgePath((x) => scene.ledge(x) + 34, W).join(' L ')}`} stroke="rgba(0,0,0,0.13)" strokeWidth="10" fill="none" />
      <path d={scene.cliffPoly} fill={biome.cliff} />
      <path d={scene.cliffDark} fill={shade(biome.cliff, -0.18)} />
      {scene.cliffLines.map((x, i) => (
        <path
          key={i}
          d={`M${x} ${scene.ledge(x) + 7} L ${x + 2} ${scene.ledge(x) + 27}`}
          stroke={shade(biome.cliff, -0.28)}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
      <path d={scene.lipLine} stroke={shade(biome.plateau, 0.25)} strokeWidth="4" fill="none" />
      <path d={`M${edgePath((x) => scene.ledge(x) + 4, W).join(' L ')}`} stroke={shade(biome.cliff, 0.25)} strokeWidth="3" fill="none" />

      {/* river */}
      <path d={scene.bankPoly} fill={biome.bank} />
      <path d={scene.riverPoly} fill={biome.water} />
      {scene.ripples.map((r, i) => (
        <path
          key={i}
          d={`M${r.x} ${r.y} q ${r.w / 2} -4 ${r.w} 0`}
          stroke={biome.waterLight}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      ))}

      {/* the path */}
      <path d={d} stroke={shade(biome.ground, 0.22)} strokeWidth={trail.w + 22 + trail.clear * 1.2} fill="none" strokeLinecap="round" opacity="0.8" />
      <path d={d} stroke="rgba(0,0,0,0.14)" strokeWidth={trail.w + 14} fill="none" strokeLinecap="round" transform="translate(0 6)" />
      <path d={d} stroke={shade(biome.pathEdge, -0.45)} strokeWidth={trail.w + 12} fill="none" strokeLinecap="round" />
      <path d={d} stroke={biome.pathEdge} strokeWidth={trail.w + 4} fill="none" strokeLinecap="round" />
      <path d={d} stroke={biome.path} strokeWidth={trail.w - 6} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#fff" strokeWidth={trail.w * 0.22} fill="none" strokeLinecap="round" opacity="0.3" transform="translate(-6 -3)" />
      {biome.pathDetail === 'road' && <path d={d} stroke="#fff" strokeWidth="4" strokeDasharray="16 14" fill="none" />}
      {biome.pathDetail === 'glow' && stoneMarks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" opacity="0.9" />)}
      {marks.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})`} fill={shade(biome.pathEdge, -0.3)} opacity="0.7">
          {biome.prints === 'paws' ? (
            <>
              <ellipse cx="0" cy="2" rx="4.6" ry="3.8" />
              <circle cx="-4.6" cy="-3.2" r="1.8" />
              <circle cx="-1.6" cy="-5.6" r="1.8" />
              <circle cx="1.6" cy="-5.6" r="1.8" />
              <circle cx="4.6" cy="-3.2" r="1.8" />
            </>
          ) : (
            <>
              <ellipse cx="0" cy="-2" rx="3.6" ry="5.2" />
              <ellipse cx="0" cy="6" rx="3" ry="2.6" />
            </>
          )}
        </g>
      ))}

      {/* bridge over the river */}
      <g transform={`translate(${bridgeAt.x} ${bridgeAt.y}) rotate(${deg(scene.bridge.angle)}) scale(${bw} 1)`}>
        <rect x="-27" y="-36" width="54" height="72" rx="4" fill={shade(biome.bridge, -0.25)} />
        <rect x="-24" y="-34" width="48" height="68" rx="3" fill={biome.bridge} />
        {[-24, -12, 0, 12, 24].map((y) => (
          <path key={y} d={`M-24 ${y} L 24 ${y}`} stroke={shade(biome.bridge, -0.22)} strokeWidth="2" />
        ))}
        <rect x="-30" y="-36" width="7" height="72" rx="3" fill={shade(biome.bridge, -0.35)} />
        <rect x="23" y="-36" width="7" height="72" rx="3" fill={shade(biome.bridge, -0.35)} />
        {[-36, 30].map((y) => (
          <g key={y}>
            <rect x="-32" y={y} width="11" height="10" rx="2" fill={shade(biome.bridge, -0.15)} />
            <rect x="21" y={y} width="11" height="10" rx="2" fill={shade(biome.bridge, -0.15)} />
          </g>
        ))}
      </g>

      {/* steps up the cliff */}
      {biome.pathDetail !== 'road' && (
        <g transform={`translate(${stairsAt.x} ${stairsAt.y}) rotate(${deg(scene.stairs.angle)}) scale(${bw} 1)`}>
          {[-18, -6, 6, 18].map((y, i) => (
            <g key={y}>
              <rect x={-26 + i * 1} y={y} width={52 - i * 2} height="13" rx="5" fill={shade(biome.path, -0.22)} />
              <rect x={-26 + i * 1} y={y} width={52 - i * 2} height="8" rx="4" fill={shade(biome.path, 0.12)} />
            </g>
          ))}
        </g>
      )}

      {scene.props.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.s.toFixed(2)})`}>
          {PROPS[p.id].draw(p.v)}
        </g>
      ))}
    </svg>
  )
}

export const BiomeScene = memo(Scene)
