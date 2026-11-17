import { createContext, useContext } from 'react'
import type { Progress } from '../progress'

export const OutfitContext = createContext<Progress['outfit']>({})
export const useOutfit = () => useContext(OutfitContext)

/** Accessories drawn in Ninja's 200×200 coordinate space (face items in eye coordinates, shifted by the Ninja). */
const L = '#2b2118'

function star(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.45
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

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

    // ---------- face (drawn in eye coordinates: eyes at y 66) ----------
    case 'mustache':
      return (
        <path
          d="M113 86 Q 104 80 94 84 Q 88 88 84 84 Q 86 94 98 93 Q 108 92 113 88 Q 118 92 128 93 Q 140 94 142 84 Q 138 88 132 84 Q 122 80 113 86 Z"
          fill="#4a2e1f"
          stroke={L}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )
    case 'heart-glasses': {
      const heart = (cx: number, cy: number) => (
        <path
          d={`M${cx} ${cy + 14} C ${cx - 22} ${cy} ${cx - 16} ${cy - 16} ${cx} ${cy - 6} C ${cx + 16} ${cy - 16} ${cx + 22} ${cy} ${cx} ${cy + 14} Z`}
          fill="#ff4f8b"
          stroke={L}
          strokeWidth="3"
          strokeLinejoin="round"
          opacity="0.92"
        />
      )
      return (
        <g>
          {heart(94, 66)}
          {heart(132, 66)}
          <path d="M108 64 L 118 64" stroke={L} strokeWidth="4" />
        </g>
      )
    }
    case 'super-mask':
      return (
        <g>
          <path
            d="M72 60 Q 113 48 154 60 Q 158 76 140 80 Q 126 82 113 72 Q 100 82 86 80 Q 68 76 72 60 Z"
            fill="#ff3b5c"
            stroke={L}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <ellipse cx="94" cy="66" rx="9" ry="8" fill="#fff" stroke={L} strokeWidth="2.5" />
          <ellipse cx="132" cy="66" rx="9" ry="8" fill="#fff" stroke={L} strokeWidth="2.5" />
          <circle cx="96" cy="67" r="4" fill={L} />
          <circle cx="134" cy="67" r="4" fill={L} />
          <path d="M72 62 Q 58 58 52 70 M 72 64 Q 60 70 58 80" stroke="#ff3b5c" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )
    // ---------- neck ----------
    case 'medal':
      return (
        <g>
          <path d="M96 116 L 108 140 L 120 116" fill="none" stroke="#2f7cf6" strokeWidth="6" strokeLinejoin="round" />
          <circle cx="108" cy="144" r="11" fill="#ffd23f" stroke={L} strokeWidth="3" />
          <polygon points={star(108, 144, 6)} fill="#ff9f1a" />
        </g>
      )
    // ---------- head ----------
    case 'bunny-ears':
      return (
        <g>
          <g transform="rotate(-12 92 26)">
            <ellipse cx="92" cy="-4" rx="13" ry="32" fill="#fff" stroke={L} strokeWidth="3.5" />
            <ellipse cx="92" cy="-2" rx="6" ry="22" fill="#ffb3cf" />
          </g>
          <g transform="rotate(14 134 26)">
            <ellipse cx="134" cy="-4" rx="13" ry="32" fill="#fff" stroke={L} strokeWidth="3.5" />
            <ellipse cx="134" cy="-2" rx="6" ry="22" fill="#ffb3cf" />
          </g>
        </g>
      )
    case 'cat-ears':
      return (
        <g>
          <path d="M66 40 L 70 0 L 98 26 Z" fill="#ff9f43" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M74 30 L 76 12 L 88 24 Z" fill="#ffd0b0" />
          <path d="M158 40 L 154 0 L 126 26 Z" fill="#ff9f43" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M150 30 L 148 12 L 136 24 Z" fill="#ffd0b0" />
        </g>
      )
    case 'wizard-hat':
      return (
        <g transform="rotate(-6 112 30)">
          <ellipse cx="112" cy="30" rx="54" ry="12" fill="#6b3fd6" stroke={L} strokeWidth="3.5" />
          <path d="M80 28 Q 100 -6 118 -44 Q 126 -4 144 28 Z" fill="#7d52e6" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points={star(108, 4, 7)} fill="#ffd23f" />
          <polygon points={star(126, 16, 5)} fill="#ffd23f" />
        </g>
      )
    case 'pirate-hat':
      return (
        <g>
          <path
            d="M54 38 Q 60 -4 112 -6 Q 164 -4 170 38 Q 112 22 54 38 Z"
            fill="#2b2b38"
            stroke={L}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M60 34 Q 112 20 164 34" fill="none" stroke="#ffd23f" strokeWidth="4" />
          <polygon points={star(112, 12, 10)} fill="#fff" />
        </g>
      )
    case 'chef-hat':
      return (
        <g>
          <circle cx="92" cy="10" r="16" fill="#fff" stroke={L} strokeWidth="3.5" />
          <circle cx="132" cy="10" r="16" fill="#fff" stroke={L} strokeWidth="3.5" />
          <circle cx="112" cy="2" r="19" fill="#fff" stroke={L} strokeWidth="3.5" />
          <path d="M84 14 L 140 14 L 138 36 Q 112 30 86 36 Z" fill="#fff" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M88 16 L 136 16" stroke="#fff" strokeWidth="7" />
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M56 74 Q 56 10 112 10 Q 168 10 168 74" fill="none" stroke={L} strokeWidth="12" strokeLinecap="round" />
          <path d="M56 74 Q 56 10 112 10 Q 168 10 168 74" fill="none" stroke="#ff4f8b" strokeWidth="6" strokeLinecap="round" />
          <rect x="42" y="60" width="22" height="34" rx="10" fill="#ff4f8b" stroke={L} strokeWidth="3.5" />
          <rect x="160" y="60" width="22" height="34" rx="10" fill="#ff4f8b" stroke={L} strokeWidth="3.5" />
        </g>
      )
    // ---------- back (drawn behind the body) ----------
    case 'red-cape':
    case 'rainbow-cape':
      return (
        <g>
          {id === 'rainbow-cape' && (
            <defs>
              <linearGradient id="rainbow-cape-fill" x1="0" x2="1" y1="0" y2="0">
                {['#ef3b3b', '#ff8c1a', '#ffd23f', '#3cc35a', '#2f7cf6', '#9b4dde'].map((c, i) => (
                  <stop key={c} offset={`${(i / 5) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            </defs>
          )}
          <path
            d="M78 112 L 140 112 Q 176 150 168 190 L 52 190 Q 44 150 78 112 Z"
            fill={id === 'rainbow-cape' ? 'url(#rainbow-cape-fill)' : '#ef3b3b'}
            stroke={L}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </g>
      )
    case 'wings':
      return (
        <g>
          <path d="M76 124 Q 30 80 18 112 Q 10 140 40 140 Q 24 160 52 160 Q 70 158 80 140 Z" fill="#e8f4ff" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M140 124 Q 186 80 198 112 Q 206 140 176 140 Q 192 160 164 160 Q 146 158 136 140 Z" fill="#e8f4ff" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M34 118 Q 52 124 70 134 M 182 118 Q 164 124 146 134" stroke="#9fc9f0" strokeWidth="3" fill="none" />
        </g>
      )
    case 'backpack':
      return (
        <g>
          <rect x="46" y="116" width="34" height="50" rx="10" fill="#ff8a3d" stroke={L} strokeWidth="3.5" />
          <rect x="50" y="138" width="22" height="16" rx="5" fill="#ffb067" stroke={L} strokeWidth="3" />
        </g>
      )
    case 'rocket-pack':
      return (
        <g>
          {[46, 148].map((x) => (
            <g key={x}>
              <path d={`M${x + 4} 172 L ${x + 13} 196 L ${x + 22} 172 Z`} fill="#ff8c1a" />
              <path d={`M${x + 8} 172 L ${x + 13} 186 L ${x + 18} 172 Z`} fill="#ffd23f" />
              <rect x={x} y="112" width="26" height="62" rx="12" fill="#c9d3e3" stroke={L} strokeWidth="3.5" />
              <path d={`M${x} 124 Q ${x + 13} 100 ${x + 26} 124`} fill="#ef3b3b" stroke={L} strokeWidth="3.5" />
            </g>
          ))}
        </g>
      )
    // ---------- hand (held in the right hand at 160,145) ----------
    case 'balloon':
    case 'heart-balloon':
      return (
        <g>
          <path d="M160 145 Q 170 118 176 92" fill="none" stroke={L} strokeWidth="2.5" />
          {id === 'balloon' ? (
            <ellipse cx="178" cy="70" rx="18" ry="22" fill="#2f7cf6" stroke={L} strokeWidth="3.5" />
          ) : (
            <path d="M176 94 C 146 74 154 44 176 58 C 198 44 206 74 176 94 Z" fill="#ff3b5c" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          )}
          <ellipse cx="171" cy="62" rx="4" ry="7" fill="#fff" opacity="0.6" />
        </g>
      )
    case 'lollipop':
      return (
        <g>
          <path d="M160 145 L 168 108" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          <path d="M160 145 L 168 108" stroke={L} strokeWidth="1.5" />
          <circle cx="170" cy="98" r="14" fill="#ff7eb6" stroke={L} strokeWidth="3.5" />
          <path d="M170 98 m -8 0 a 8 8 0 1 0 8 -8 a 5 5 0 1 1 -5 5" fill="none" stroke="#fff" strokeWidth="3" />
        </g>
      )
    case 'star-wand':
      return (
        <g>
          <path d="M160 145 L 174 104" stroke="#8b5a2b" strokeWidth="6" strokeLinecap="round" />
          <polygon points={star(176, 96, 16)} fill="#ffd23f" stroke={L} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="196" cy="84" r="3" fill="#ffd23f" />
          <circle cx="190" cy="116" r="2.5" fill="#ffd23f" />
        </g>
      )
    case 'umbrella':
      return (
        <g>
          <path d="M160 145 L 166 34" stroke={L} strokeWidth="4" strokeLinecap="round" />
          <path d="M160 145 Q 160 154 152 152" fill="none" stroke={L} strokeWidth="4" strokeLinecap="round" />
          <path
            d="M122 36 Q 130 -6 166 -8 Q 202 -6 210 36 Q 199 28 188 36 Q 177 28 166 36 Q 155 28 144 36 Q 133 28 122 36 Z"
            fill="#4aa8ff"
            stroke={L}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M166 -8 Q 156 10 155 32 M 166 -8 Q 176 10 177 32" fill="none" stroke="#2a86dd" strokeWidth="2.5" />
        </g>
      )
    case 'house-key':
      return (
        <g>
          <path d="M94 114 Q 108 134 122 114" fill="none" stroke="#ff5a6e" strokeWidth="4" strokeLinecap="round" />
          <g transform="rotate(18 108 140)">
            <circle cx="108" cy="134" r="9" fill="#ffd23f" stroke={L} strokeWidth="3" />
            <circle cx="108" cy="134" r="3.5" fill="#fff6d0" />
            <path d="M108 143 L 108 162 M 108 152 L 115 152 M 108 158 L 114 158" stroke={L} strokeWidth="7" strokeLinecap="round" />
            <path d="M108 143 L 108 162 M 108 152 L 115 152 M 108 158 L 114 158" stroke="#ffd23f" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </g>
      )
    case 'propeller-hat':
      return (
        <g>
          <path d="M66 40 Q 112 -18 158 40 Z" fill="#ffd23f" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M82 22 Q 112 -2 142 22 L 146 30 Q 112 8 78 30 Z" fill="#ff5a6e" />
          <path d="M100 6 Q 112 0 124 6 L 120 14 Q 112 10 104 14 Z" fill="#2f7cf6" />
          <path d="M112 8 L 112 -10" stroke={L} strokeWidth="4" strokeLinecap="round" />
          <g className="prop-spin">
            <ellipse cx="94" cy="-12" rx="18" ry="5" fill="#3ccf91" stroke={L} strokeWidth="3" />
            <ellipse cx="130" cy="-12" rx="18" ry="5" fill="#2f7cf6" stroke={L} strokeWidth="3" />
          </g>
          <circle cx="112" cy="-12" r="5" fill="#ff5a6e" stroke={L} strokeWidth="2.5" />
        </g>
      )
    case 'pilot-goggles':
      return (
        <g>
          <path d="M58 64 Q 113 52 168 64" fill="none" stroke="#8b5a2b" strokeWidth="8" strokeLinecap="round" />
          <circle cx="94" cy="66" r="17" fill="#9fe0ff" stroke="#c9a46a" strokeWidth="6" />
          <circle cx="132" cy="66" r="17" fill="#9fe0ff" stroke="#c9a46a" strokeWidth="6" />
          <circle cx="94" cy="66" r="20" fill="none" stroke={L} strokeWidth="2.5" />
          <circle cx="132" cy="66" r="20" fill="none" stroke={L} strokeWidth="2.5" />
          <path d="M86 58 Q 90 54 96 55 M 124 58 Q 128 54 134 55" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M111 64 L 115 64" stroke={L} strokeWidth="5" />
        </g>
      )
    case 'giant-pencil':
      return (
        <g transform="rotate(14 160 145)">
          <rect x="152" y="40" width="18" height="100" rx="3" fill="#ffd23f" stroke={L} strokeWidth="3.5" />
          <path d="M158 44 L 158 136" stroke="#ffb020" strokeWidth="3" />
          <rect x="152" y="30" width="18" height="12" rx="3" fill="#ff8fb0" stroke={L} strokeWidth="3" />
          <path d="M152 140 L 161 162 L 170 140 Z" fill="#f4d3a2" stroke={L} strokeWidth="3" strokeLinejoin="round" />
          <path d="M158 155 L 161 162 L 164 155 Z" fill={L} />
        </g>
      )
    case 'butterfly-wings':
      return (
        <g>
          <path d="M100 124 Q 50 70 26 100 Q 14 128 54 134 Q 28 152 46 172 Q 70 182 100 140 Z" fill="#ff9ad1" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M120 124 Q 170 70 194 100 Q 206 128 166 134 Q 192 152 174 172 Q 150 182 120 140 Z" fill="#9ad8ff" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="50" cy="108" r="9" fill="#ffd23f" />
          <circle cx="170" cy="108" r="9" fill="#ffd23f" />
          <circle cx="56" cy="158" r="6" fill="#fff" opacity="0.8" />
          <circle cx="164" cy="158" r="6" fill="#fff" opacity="0.8" />
        </g>
      )
    case 'diving-mask':
      return (
        <g>
          <path d="M58 62 Q 113 50 168 62" fill="none" stroke="#1fb5d6" strokeWidth="7" strokeLinecap="round" />
          <rect x="74" y="50" width="78" height="32" rx="14" fill="#bdf1ff" fillOpacity="0.75" stroke="#ff8a1f" strokeWidth="6" />
          <rect x="74" y="50" width="78" height="32" rx="14" fill="none" stroke={L} strokeWidth="2.5" />
          <path d="M84 58 Q 90 54 98 55" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M156 70 L 166 70 L 166 18 Q 166 10 174 10" fill="none" stroke={L} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M156 70 L 166 70 L 166 18 Q 166 10 174 10" fill="none" stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case 'explorer-hat':
      return (
        <g>
          <ellipse cx="112" cy="34" rx="62" ry="12" fill="#d9b276" stroke={L} strokeWidth="3.5" />
          <path d="M74 32 Q 74 -10 112 -10 Q 150 -10 150 32 Z" fill="#e8c88e" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M75 22 Q 112 14 149 22 L 150 30 Q 112 22 74 30 Z" fill="#7a4a24" />
          <path d="M92 -2 Q 100 -8 110 -8" stroke="#fff6dc" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )
    case 'bee-antennae':
      return (
        <g>
          <path d="M66 42 Q 112 8 158 42" fill="none" stroke={L} strokeWidth="8" strokeLinecap="round" />
          <path d="M66 42 Q 112 8 158 42" fill="none" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
          <path d="M94 24 Q 84 0 74 -12" fill="none" stroke={L} strokeWidth="4" strokeLinecap="round" />
          <path d="M130 24 Q 140 0 150 -12" fill="none" stroke={L} strokeWidth="4" strokeLinecap="round" />
          <circle cx="72" cy="-14" r="9" fill="#ffd23f" stroke={L} strokeWidth="3" />
          <circle cx="152" cy="-14" r="9" fill="#ffd23f" stroke={L} strokeWidth="3" />
          <path d="M66 -14 L 78 -14 M 146 -14 L 158 -14" stroke={L} strokeWidth="3" />
        </g>
      )
    case 'watering-can':
      return (
        <g>
          <path d="M150 112 L 186 112 L 182 150 L 154 150 Z" fill="#3ccf91" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M184 120 L 206 98" stroke={L} strokeWidth="8" strokeLinecap="round" />
          <path d="M184 120 L 206 98" stroke="#3ccf91" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="208" cy="96" rx="6" ry="4" fill="#ffd23f" stroke={L} strokeWidth="2.5" transform="rotate(-45 208 96)" />
          <path d="M156 112 Q 168 88 180 112" fill="none" stroke={L} strokeWidth="4" />
          <path d="M158 132 L 180 132" stroke="#22a872" strokeWidth="4" />
          <circle cx="214" cy="110" r="2.5" fill="#5fb6ff" />
          <circle cx="220" cy="100" r="2" fill="#5fb6ff" />
        </g>
      )
    case 'smile-badge':
      return (
        <g>
          <path d="M94 114 Q 108 130 122 114" fill="none" stroke="#ff8fc8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="108" cy="140" r="13" fill="#ffd23f" stroke={L} strokeWidth="3" />
          <circle cx="103" cy="137" r="2" fill={L} />
          <circle cx="113" cy="137" r="2" fill={L} />
          <path d="M102 143 Q 108 149 114 143" fill="none" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )
    case 'gold-cup':
      return (
        <g>
          <path d="M146 98 L 182 98 Q 182 130 164 134 Q 146 130 146 98 Z" fill="#ffd23f" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M146 104 Q 132 106 138 118 Q 142 124 150 122 M 182 104 Q 196 106 190 118 Q 186 124 178 122" fill="none" stroke={L} strokeWidth="3.5" />
          <path d="M160 134 L 160 144 L 168 144 L 168 134" fill="#e2a400" stroke={L} strokeWidth="3" />
          <rect x="152" y="144" width="24" height="8" rx="2" fill="#7a4a24" stroke={L} strokeWidth="3" />
          <polygon points={star(164, 112, 6)} fill="#fff6c2" />
        </g>
      )
    case 'fire-helmet':
      return (
        <g>
          <path d="M58 40 Q 60 -8 112 -10 Q 164 -8 166 40 Q 112 28 58 40 Z" fill="#ef3b3b" stroke={L} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M50 40 Q 112 26 174 40 L 178 46 Q 112 34 46 46 Z" fill="#c42b2b" stroke={L} strokeWidth="3" strokeLinejoin="round" />
          <path d="M112 -10 L 112 30" stroke="#c42b2b" strokeWidth="6" />
          <path d="M100 8 L 124 8 L 124 26 Q 112 32 100 26 Z" fill="#ffd23f" stroke={L} strokeWidth="3" strokeLinejoin="round" />
          <polygon points={star(112, 17, 6)} fill="#ef3b3b" />
        </g>
      )
    default:
      return null
  }
}
