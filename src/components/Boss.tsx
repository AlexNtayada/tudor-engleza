// Mormăilă: the grumpy-but-cute monster guarding the end of every unit.
// Original character, drawn in the app's cartoon style and tinted per unit.

export type BossMood = 'idle' | 'hit' | 'laugh' | 'down'

const L = '#2b2118'
const ink = { stroke: L, strokeWidth: 4.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

export const BOSS_NAME = 'Mormăilă'

export function Boss({
  color,
  dark,
  mood = 'idle',
  size = 150,
}: {
  color: string
  dark: string
  mood?: BossMood
  size?: number
}) {
  const down = mood === 'down'
  const hit = mood === 'hit'
  return (
    <div className={`boss boss-${mood}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <ellipse cx="100" cy="192" rx="62" ry="7" fill="rgba(40,30,10,0.16)" />
        <g className="boss-body">
          {/* horns */}
          <path d="M52 62 Q 30 30 44 8 Q 56 36 76 46 Z" fill="#fff4d6" {...ink} />
          <path d="M148 62 Q 170 30 156 8 Q 144 36 124 46 Z" fill="#fff4d6" {...ink} />
          {/* feet */}
          <ellipse cx="68" cy="184" rx="22" ry="11" fill={dark} {...ink} />
          <ellipse cx="132" cy="184" rx="22" ry="11" fill={dark} {...ink} />
          {/* blob body */}
          <path
            d="M100 30 C 160 30 182 80 178 128 C 174 170 144 184 100 184 C 56 184 26 170 22 128 C 18 80 40 30 100 30 Z"
            fill={color}
            {...ink}
          />
          <path d="M30 120 C 34 160 60 178 100 180 C 66 170 44 150 40 116 Z" fill={dark} opacity="0.45" />
          <ellipse cx="100" cy="140" rx="46" ry="34" fill="#ffffff" opacity="0.35" />
          {/* spots */}
          <circle cx="146" cy="70" r="7" fill={dark} opacity="0.6" />
          <circle cx="160" cy="92" r="4.5" fill={dark} opacity="0.6" />
          <circle cx="44" cy="84" r="5" fill={dark} opacity="0.6" />
          {/* arms */}
          <g className="boss-arm-left">
            <path d="M26 112 Q 4 100 8 82 Q 22 90 34 98 Z" fill={color} {...ink} strokeWidth={4} />
          </g>
          <g className="boss-arm-right">
            <path d="M174 112 Q 196 100 192 82 Q 178 90 166 98 Z" fill={color} {...ink} strokeWidth={4} />
          </g>
          {/* eyes */}
          {down ? (
            <g>
              <path d="M58 70 L 82 92 M 82 70 L 58 92" {...ink} strokeWidth={6} />
              <path d="M118 70 L 142 92 M 142 70 L 118 92" {...ink} strokeWidth={6} />
            </g>
          ) : hit ? (
            <g>
              <path d="M56 82 L 82 74 L 56 66" fill="none" {...ink} strokeWidth={6} />
              <path d="M144 82 L 118 74 L 144 66" fill="none" {...ink} strokeWidth={6} />
            </g>
          ) : (
            <g>
              <ellipse cx="70" cy="80" rx="17" ry="19" fill="#fff" {...ink} strokeWidth={4} />
              <ellipse cx="130" cy="80" rx="17" ry="19" fill="#fff" {...ink} strokeWidth={4} />
              <circle cx={mood === 'laugh' ? 70 : 74} cy="84" r="8" fill={L} />
              <circle cx={mood === 'laugh' ? 130 : 126} cy="84" r="8" fill={L} />
              <circle cx={mood === 'laugh' ? 73 : 77} cy="80" r="3" fill="#fff" />
              <circle cx={mood === 'laugh' ? 133 : 129} cy="80" r="3" fill="#fff" />
              {/* grumpy brows */}
              {mood !== 'laugh' && <path d="M50 58 L 86 66 M 150 58 L 114 66" {...ink} strokeWidth={6} />}
            </g>
          )}
          {/* mouth */}
          {mood === 'laugh' ? (
            <g>
              <path d="M66 112 Q 100 156 134 112 Z" fill="#8a2b2b" {...ink} strokeWidth={4} />
              <path d="M82 132 Q 100 124 118 132 Q 100 146 82 132 Z" fill="#ff6f8e" />
              <path d="M78 113 L 84 124 L 90 114 M 110 114 L 116 124 L 122 113" fill="#fff" stroke={L} strokeWidth="2.5" />
            </g>
          ) : down ? (
            <path d="M74 128 Q 87 116 100 128 Q 113 140 126 128" fill="none" {...ink} strokeWidth={4.5} />
          ) : (
            <g>
              <path d="M70 124 Q 100 108 130 124" fill="none" {...ink} strokeWidth={5} />
              <path d="M80 120 L 86 132 L 92 117 M 108 117 L 114 132 L 120 120" fill="#fff" stroke={L} strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          )}
          {/* cheeks */}
          <ellipse cx="46" cy="110" rx="9" ry="5.5" fill="#ff7a59" opacity="0.4" />
          <ellipse cx="154" cy="110" rx="9" ry="5.5" fill="#ff7a59" opacity="0.4" />
        </g>
        {down && (
          <g className="boss-stars">
            <text x="40" y="30" fontSize="28">⭐</text>
            <text x="130" y="22" fontSize="24">⭐</text>
          </g>
        )}
      </svg>
    </div>
  )
}
