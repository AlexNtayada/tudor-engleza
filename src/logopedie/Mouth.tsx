import type { MouthAnim } from './data'

const INK = '#2b2118'
const TONGUE = '#ff7f98'

/** Big cartoon mouth that shows each tongue exercise as a looping animation. */
export function Mouth({ anim, size = 300 }: { anim: MouthAnim; size?: number }) {
  return (
    <svg
      className={`mouth anim-${anim}`}
      viewBox="0 0 300 240"
      width={size}
      height={(size * 240) / 300}
      role="img"
      aria-label="Gura lui Ninja"
    >
      <defs>
        <clipPath id="mouth-cavity">
          <ellipse cx="150" cy="125" rx="84" ry="46" />
        </clipPath>
      </defs>
      <rect x="6" y="6" width="288" height="228" rx="60" fill="#ffd9b8" stroke={INK} strokeWidth="5" />
      <ellipse cx="44" cy="150" rx="18" ry="11" fill="#ff7a59" opacity="0.4" />
      <ellipse cx="256" cy="150" rx="18" ry="11" fill="#ff7a59" opacity="0.4" />
      <g className="m-mouth">
        <ellipse cx="150" cy="125" rx="100" ry="62" fill="#ef5f78" stroke={INK} strokeWidth="5" />
        <ellipse cx="150" cy="125" rx="84" ry="46" fill="#5b1d2a" />
        <g clipPath="url(#mouth-cavity)">
          <ellipse cx="150" cy="96" rx="70" ry="16" fill="#7a2a3a" />
          <g className="m-tin">
            <path d="M88 178 Q 90 130 150 126 Q 210 130 212 178 Z" fill={TONGUE} stroke={INK} strokeWidth="3" />
            <path d="M150 140 L 150 172" stroke="#e05578" strokeWidth="3" strokeLinecap="round" />
          </g>
          <rect x="92" y="78" width="116" height="19" rx="7" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <path d="M121 79 V96 M150 79 V96 M179 79 V96" stroke="#d9cfc3" strokeWidth="2" />
          <rect x="102" y="156" width="96" height="15" rx="6" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <path d="M126 157 V170 M150 157 V170 M174 157 V170" stroke="#d9cfc3" strokeWidth="2" />
        </g>
        <ellipse cx="150" cy="125" rx="84" ry="46" fill="none" stroke={INK} strokeWidth="3" />
      </g>
      <g className="m-tout">
        <path d="M120 136 Q 118 202 150 206 Q 182 202 180 136 Z" fill={TONGUE} stroke={INK} strokeWidth="4" />
        <path d="M150 150 L 150 190" stroke="#e05578" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="m-tip">
        <ellipse cx="150" cy="125" rx="20" ry="16" fill={TONGUE} stroke={INK} strokeWidth="4" />
      </g>
    </svg>
  )
}
