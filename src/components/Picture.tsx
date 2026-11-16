import type { Word } from '../content'

export function Picture({ word, size = 120 }: { word: Word; size?: number }) {
  const v = word.visual
  if (v.kind === 'emoji') {
    return (
      <span className="pic pic-emoji" style={{ fontSize: size * 0.8, width: size, height: size }} role="img" aria-label={word.en}>
        {v.value}
      </span>
    )
  }
  if (v.kind === 'color') {
    return (
      <span className="pic pic-color" style={{ width: size, height: size }} role="img" aria-label={word.en}>
        <svg viewBox="0 0 100 100" width={size * 0.9} height={size * 0.9}>
          <path
            d="M50 6 C 78 6, 96 26, 94 52 C 92 80, 72 95, 48 94 C 22 93, 5 76, 6 50 C 7 24, 24 6, 50 6 Z"
            fill={v.value}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="3"
          />
          <ellipse cx="34" cy="30" rx="12" ry="7" fill="#fff" opacity="0.45" transform="rotate(-25 34 30)" />
        </svg>
      </span>
    )
  }
  // number: the digit plus that many dots, so it can be counted
  const n = v.value
  const dotSize = Math.max(8, size * 0.09)
  return (
    <span className="pic pic-number" style={{ width: size, height: size }} role="img" aria-label={word.en}>
      <span className="pic-digit" style={{ fontSize: size * 0.5 }}>
        {n}
      </span>
      <span className="pic-dots" style={{ maxWidth: dotSize * 6.5 }}>
        {Array.from({ length: n }, (_, i) => (
          <i key={i} style={{ width: dotSize, height: dotSize }} />
        ))}
      </span>
    </span>
  )
}
