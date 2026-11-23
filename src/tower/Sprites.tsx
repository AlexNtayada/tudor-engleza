// Original little characters for "Apără castelul". Each sprite is drawn standing on (0, 0),
// about 40 board units tall, so the board can place it anywhere on the path.

import type { ReactNode } from 'react'
import type { AllyKind, EnemyKind } from './engine'

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function Eyes({ y = -20, dx = 6, angry = false }: { y?: number; dx?: number; angry?: boolean }) {
  return (
    <g>
      <ellipse cx={-dx} cy={y} rx="3.6" ry="4.4" fill="#fff" {...ink} strokeWidth={1.6} />
      <ellipse cx={dx} cy={y} rx="3.6" ry="4.4" fill="#fff" {...ink} strokeWidth={1.6} />
      <circle cx={-dx + 0.8} cy={y + 0.8} r="1.9" fill={L} />
      <circle cx={dx + 0.8} cy={y + 0.8} r="1.9" fill={L} />
      {angry && (
        <path d={`M${-dx - 4} ${y - 7} L ${-dx + 3} ${y - 4.5} M ${dx + 4} ${y - 7} L ${dx - 3} ${y - 4.5}`} fill="none" {...ink} strokeWidth={2} />
      )}
    </g>
  )
}

export function EnemySprite({ kind }: { kind: EnemyKind }) {
  switch (kind) {
    case 'slime':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="15" ry="3.5" fill="rgba(0,0,0,.18)" />
          <path d="M-10 -26 l-4 -7 l7 3 Z M10 -26 l4 -7 l-7 3 Z" fill="#b46bff" {...ink} strokeWidth={1.8} />
          <path d="M-16 0 Q -18 -30 0 -31 Q 18 -30 16 0 Q 8 -3 0 0 Q -8 -3 -16 0 Z" fill="#7fd858" {...ink} />
          <ellipse cx="-7" cy="-24" rx="4" ry="2.4" fill="#fff" opacity=".5" />
          <Eyes y={-16} dx={5.5} angry />
          <path d="M-4 -7 Q 0 -4 4 -7" fill="none" {...ink} strokeWidth={1.8} />
        </g>
      )
    case 'bat':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="11" ry="3" fill="rgba(0,0,0,.15)" />
          <g className="td-flap">
            <path d="M-11 -24 Q -26 -34 -30 -20 Q -24 -22 -22 -16 Q -17 -21 -11 -16 Z" fill="#7b4fc9" {...ink} />
            <path d="M11 -24 Q 26 -34 30 -20 Q 24 -22 22 -16 Q 17 -21 11 -16 Z" fill="#7b4fc9" {...ink} />
          </g>
          <path d="M-8 -32 l2 -8 l5 6 Z M8 -32 l-2 -8 l-5 6 Z" fill="#9a6ae0" {...ink} strokeWidth={1.8} />
          <circle cx="0" cy="-21" r="13" fill="#9a6ae0" {...ink} />
          <Eyes y={-23} dx={5} angry />
          <path d="M-4 -14 l2 3 l2 -3 l2 3 l2 -3" fill="#fff" {...ink} strokeWidth={1.4} />
        </g>
      )
    case 'rock':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="20" ry="4" fill="rgba(0,0,0,.2)" />
          <path d="M-19 -2 Q -24 -26 -10 -36 Q 4 -44 16 -32 Q 25 -20 19 -2 Z" fill="#b8a48c" {...ink} />
          <path d="M-12 -34 Q -4 -40 6 -38 Q 0 -33 -12 -34 Z" fill="#6cbf4a" {...ink} strokeWidth={1.6} />
          <path d="M8 -12 l5 3 M -14 -10 l4 -2" fill="none" {...ink} strokeWidth={1.6} />
          <Eyes y={-22} dx={6.5} angry />
          <path d="M-5 -10 Q 0 -13 5 -10" fill="none" {...ink} strokeWidth={2} />
        </g>
      )
    case 'boss':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="28" ry="5" fill="rgba(0,0,0,.2)" />
          <path d="M-28 0 Q -32 -50 0 -52 Q 32 -50 28 0 Q 14 -5 0 0 Q -14 -5 -28 0 Z" fill="#c05be0" {...ink} />
          <ellipse cx="-12" cy="-40" rx="7" ry="4" fill="#fff" opacity=".45" />
          <path d="M-15 -50 L -17 -66 L -8 -58 L 0 -70 L 8 -58 L 17 -66 L 15 -50 Z" fill="#ffc21a" {...ink} />
          <circle cx="0" cy="-60" r="2.6" fill="#ff5a5f" />
          <Eyes y={-28} dx={9} angry />
          <path d="M-9 -12 Q 0 -6 9 -12" fill="#7a2f9a" {...ink} strokeWidth={2} />
          <path d="M-5 -11 l2 3 l2 -3 M1 -11 l2 3 l2 -3" fill="#fff" stroke={L} strokeWidth={1.2} />
        </g>
      )
  }
}

/** A chibi kid: shared head and body, with the hat and tool that make each friend. */
function Kid({ suit, children, hat }: { suit: string; children?: ReactNode; hat: ReactNode }) {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="12" ry="3" fill="rgba(0,0,0,.18)" />
      <path d="M-6 0 v-6 M6 0 v-6" stroke={L} strokeWidth="4" strokeLinecap="round" />
      <path d="M-10 -6 Q -11 -20 0 -20 Q 11 -20 10 -6 Z" fill={suit} {...ink} />
      <circle cx="0" cy="-28" r="11" fill="#ffd9b0" {...ink} />
      <circle cx="-4" cy="-28" r="1.7" fill={L} />
      <circle cx="4" cy="-28" r="1.7" fill={L} />
      <path d="M-3 -23.5 Q 0 -21 3 -23.5" fill="none" {...ink} strokeWidth={1.4} />
      <circle cx="-7" cy="-24.5" r="2" fill="#ff9aa2" opacity=".7" />
      <circle cx="7" cy="-24.5" r="2" fill="#ff9aa2" opacity=".7" />
      {hat}
      {children}
    </g>
  )
}

export function AllySprite({ kind }: { kind: AllyKind }) {
  switch (kind) {
    case 'archer':
      return (
        <Kid
          suit="#3fb36b"
          hat={<path d="M-12 -30 Q -12 -44 0 -44 Q 12 -44 12 -30 Q 6 -37 0 -36 Q -6 -37 -12 -30 Z M10 -40 l8 -6" fill="#2e9457" {...ink} />}
        >
          <path d="M13 -26 Q 22 -14 13 -2" fill="none" stroke="#8b5a2b" strokeWidth="3" strokeLinecap="round" />
          <path d="M13 -26 L 13 -2" stroke="#fff" strokeWidth="1" />
        </Kid>
      )
    case 'knight':
      return (
        <Kid
          suit="#5b8def"
          hat={
            <g>
              <path d="M-12 -28 Q -12 -42 0 -42 Q 12 -42 12 -28 Z" fill="#cfd8e3" {...ink} />
              <path d="M0 -42 Q 4 -52 12 -50 Q 6 -46 4 -41 Z" fill="#ff5a5f" {...ink} strokeWidth={1.6} />
            </g>
          }
        >
          <path d="M-20 -20 Q -20 -8 -13 -4 Q -6 -8 -6 -20 Z" fill="#ffc21a" {...ink} />
          <path d="M14 -6 L 20 -26" stroke="#cfd8e3" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M11 -12 L 18 -10" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
        </Kid>
      )
    case 'dragon':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="14" ry="3" fill="rgba(0,0,0,.18)" />
          <g className="td-flap">
            <path d="M-8 -22 Q -26 -36 -28 -18 Q -20 -20 -10 -14 Z" fill="#ffb347" {...ink} />
            <path d="M8 -22 Q 26 -36 28 -18 Q 20 -20 10 -14 Z" fill="#ffb347" {...ink} />
          </g>
          <path d="M-11 -2 Q -14 -22 0 -24 Q 14 -22 11 -2 Z" fill="#ff7043" {...ink} />
          <path d="M-5 -4 Q -6 -14 0 -15 Q 6 -14 5 -4 Z" fill="#ffe0a3" />
          <path d="M-7 -40 l-2 -7 l6 4 Z M7 -40 l2 -7 l-6 4 Z" fill="#ffc21a" {...ink} strokeWidth={1.6} />
          <ellipse cx="0" cy="-31" rx="12" ry="10.5" fill="#ff7043" {...ink} />
          <circle cx="-4.5" cy="-33" r="2" fill={L} />
          <circle cx="4.5" cy="-33" r="2" fill={L} />
          <path d="M-4 -26 Q 0 -23 4 -26" fill="none" {...ink} strokeWidth={1.4} />
        </g>
      )
  }
}

/** One sprite in its own little picture, for the cards. */
export function SpriteIcon({ ally, size = 56 }: { ally: AllyKind; size?: number }) {
  return (
    <svg viewBox="-30 -54 60 60" width={size} height={size} aria-hidden>
      <AllySprite kind={ally} />
    </svg>
  )
}
