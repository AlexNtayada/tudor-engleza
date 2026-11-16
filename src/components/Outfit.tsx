import { createContext, useContext } from 'react'
import type { Progress } from '../progress'

export const OutfitContext = createContext<Progress['outfit']>({})
export const useOutfit = () => useContext(OutfitContext)

/** Accessories drawn in Ninja's 200×200 coordinate space. */
export function Accessory({ id }: { id: string }) {
  switch (id) {
    case 'party-hat':
      return (
        <g transform="rotate(14 116 28)">
          <path d="M94 30 L 116 -22 L 138 30 Z" fill="#5b8cff" stroke="#3a66d6" strokeWidth="3" strokeLinejoin="round" />
          <path d="M101 14 L 131 14 M 107 0 L 125 0" stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" />
          <circle cx="116" cy="-24" r="8" fill="#ff6b8b" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path
            d="M82 30 L 86 2 L 99 18 L 112 -4 L 125 18 L 138 2 L 142 30 Z"
            fill="#ffd23f"
            stroke="#e2a400"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="112" cy="20" r="4.5" fill="#ff5a6e" />
          <circle cx="94" cy="23" r="3.5" fill="#5b8cff" />
          <circle cx="130" cy="23" r="3.5" fill="#3ccf91" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M60 42 Q 112 -14 164 42 Z" fill="#ff5a6e" stroke="#d63c4e" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="168" cy="41" rx="26" ry="7" fill="#d63c4e" />
          <circle cx="112" cy="12" r="5" fill="#fff" />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(150 30)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-12" rx="8" ry="11" fill="#ff8fc7" transform={`rotate(${a})`} />
          ))}
          <circle r="8" fill="#ffd23f" />
        </g>
      )
    case 'sunglasses':
      return (
        <g>
          <rect x="77" y="54" width="34" height="24" rx="10" fill="#23324a" />
          <rect x="115" y="54" width="34" height="24" rx="10" fill="#23324a" />
          <path d="M111 62 L 115 62" stroke="#23324a" strokeWidth="4" />
          <path d="M83 60 L 92 60" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <path d="M121 60 L 130 60" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </g>
      )
    case 'star-glasses': {
      const star = (cx: number, cy: number) => {
        const pts = Array.from({ length: 10 }, (_, i) => {
          const r = i % 2 === 0 ? 20 : 9
          const a = (Math.PI / 5) * i - Math.PI / 2
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
        }).join(' ')
        return <polygon points={pts} fill="#ff6bb5" stroke="#d6408e" strokeWidth="2.5" strokeLinejoin="round" opacity="0.92" />
      }
      return (
        <g>
          {star(94, 67)}
          {star(132, 67)}
          <path d="M108 66 L 118 66" stroke="#d6408e" strokeWidth="4" />
        </g>
      )
    }
    case 'bow-tie':
      return (
        <g>
          <path d="M112 116 L 92 104 L 92 128 Z" fill="#ff5a6e" stroke="#d63c4e" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M112 116 L 132 104 L 132 128 Z" fill="#ff5a6e" stroke="#d63c4e" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="112" cy="116" r="6" fill="#d63c4e" />
        </g>
      )
    case 'scarf':
      return (
        <g>
          <path d="M66 108 Q 112 128 158 106 L 160 120 Q 112 142 64 122 Z" fill="#ffb020" stroke="#de8f00" strokeWidth="2.5" />
          <path d="M136 120 L 146 150 L 130 152 L 124 124 Z" fill="#ffb020" stroke="#de8f00" strokeWidth="2.5" />
          <path d="M80 114 L 80 128 M 96 118 L 96 132 M 112 120 L 112 134" stroke="#fff" strokeWidth="3" opacity="0.6" />
        </g>
      )
    default:
      return null
  }
}
