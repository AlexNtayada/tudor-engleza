import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import type { Unit } from '../content'
import { Ninja, type Mood } from '../components/Ninja'
import { Boss, bossFor } from '../components/Boss'
import { BiomeScene } from './BiomeScene'
import { layoutUnit } from './geometry'

export type NodeState = 'done' | 'current' | 'locked'

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(360)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setW(Math.max(280, Math.round(el.clientWidth / 8) * 8))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function starPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.48
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

/** Three stars in an arc above a finished stone: gold if earned, dark if not. */
function Stars({ count }: { count: number }) {
  const spots = [
    [-30, 12, 13],
    [0, 4, 15],
    [30, 12, 13],
  ]
  return (
    <svg className="bm-stars" viewBox="-50 -14 100 42" aria-label={`${count} din 3 stele`}>
      {spots.map(([x, y, r], i) => {
        const on = i < count
        return (
          <g key={i}>
            <polygon points={starPoints(x, y + 2, r)} fill={on ? '#e2a400' : 'rgba(60,40,20,0.25)'} />
            <polygon points={starPoints(x, y, r)} fill={on ? '#ffcf33' : '#7a5f45'} opacity={on ? 1 : 0.6} />
            {on && <circle cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.18} fill="#fff6c8" />}
          </g>
        )
      })}
    </svg>
  )
}

/** A flat stepping stone with the lesson number, like a marker on a board game. */
function Stone({ label, state, big }: { label: string; state: NodeState; big?: boolean }) {
  const top = state === 'locked' ? '#d8d0c3' : '#f6f2ea'
  const side = state === 'locked' ? '#aea392' : '#c9bfae'
  return (
    <svg className="bm-stone-svg" viewBox="-50 -36 100 70" aria-hidden>
      <ellipse cx="0" cy="22" rx="44" ry="10" fill="rgba(30,30,10,0.22)" />
      <path d="M-42 4 Q -44 -16 -18 -22 Q 4 -28 26 -20 Q 44 -14 42 4 L 42 12 Q 38 24 12 25 Q -12 28 -30 21 Q -42 17 -42 10 Z" fill={side} />
      <path d="M-42 2 Q -44 -18 -18 -24 Q 4 -30 26 -22 Q 44 -16 42 2 Q 40 14 14 16 Q -10 19 -30 13 Q -42 9 -42 2 Z" fill={top} />
      <path d="M-30 -10 Q -20 -18 -4 -19" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M-30 6 Q -24 2 -17 5" stroke={side} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {!big && (
        <text
          x="0"
          y="8"
          textAnchor="middle"
          fontSize="28"
          fontWeight="900"
          fill={state === 'locked' ? '#9a8f80' : '#5b4634'}
          fontFamily="inherit"
        >
          {label}
        </text>
      )}
    </svg>
  )
}

export function UnitMap({
  unit,
  unitIndex,
  firstGlobal,
  current,
  stars,
  mood,
  onOpen,
}: {
  unit: Unit
  unitIndex: number
  firstGlobal: number
  current: number
  stars: Record<string, number>
  mood: Mood
  onOpen: (globalIndex: number, state: NodeState) => void
}) {
  const [ref, width] = useWidth()
  const lastIsBoss = !!unit.lessons[unit.lessons.length - 1]?.boss
  const layout = useMemo(
    () => layoutUnit(width, unit.lessons.length, unitIndex, lastIsBoss),
    [width, unit.lessons.length, unitIndex, lastIsBoss],
  )

  return (
    <div className="bm" ref={ref} style={{ height: layout.height }}>
      <BiomeScene unitId={unit.id} layout={layout} />
      {unit.lessons.map((lesson, i) => {
        const g = firstGlobal + i
        const state: NodeState = g < current ? 'done' : g === current ? 'current' : 'locked'
        const p = layout.nodes[i]
        const isBoss = !!lesson.boss
        const side = p.x < width / 2 ? 1 : -1
        return (
          <div key={lesson.id} className={`bm-node bm-${state} ${isBoss ? 'bm-boss' : ''}`} style={{ left: p.x, top: p.y }}>
            {state === 'done' && <Stars count={stars[lesson.id] ?? 0} />}
            <button
              className="bm-stone"
              style={{ '--ring': unit.color } as React.CSSProperties}
              onClick={() => onOpen(g, state)}
              aria-label={isBoss ? `${unit.title}: ${bossFor(unit.id).name}, testul temei` : `${unit.title} lecția ${i + 1}`}
            >
              {state === 'current' && <span className="bm-ring" />}
              <Stone label={String(i + 1)} state={state} big={isBoss} />
              {isBoss && (
                <span className="bm-boss-figure">
                  <Boss unitId={unit.id} locked={state === 'locked'} mood={state === 'done' ? 'down' : 'idle'} size={96} />
                </span>
              )}
              {state === 'locked' && !isBoss && <span className="bm-lock">🔒</span>}
            </button>
            {isBoss && <span className="bm-boss-label">{state === 'done' ? '🏆 Învins!' : `⚔️ ${bossFor(unit.id).name}`}</span>}
            {state === 'current' && (
              <div className={`bm-avatar ${side > 0 ? 'bm-avatar-right' : 'bm-avatar-left'}`} style={{ borderColor: unit.colorDark }}>
                <div className="bm-avatar-clip">
                  <Ninja mood={mood} size={104} />
                </div>
                <i style={{ borderTopColor: unit.colorDark }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
