export type Mood = 'idle' | 'talk' | 'happy' | 'dance' | 'oops' | 'sleep'

const GREEN = '#3ccf91'
const GREEN_DARK = '#25a872'
const BELLY = '#d4f7e2'
const SPIKE = '#ff9f43'

export function Dino({ mood = 'idle', size = 160 }: { mood?: Mood; size?: number }) {
  const eyesClosed = mood === 'happy' || mood === 'dance' || mood === 'sleep'
  return (
    <div className={`dino dino-${mood}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* shadow */}
        <ellipse cx="102" cy="192" rx="58" ry="6" fill="rgba(0,0,0,0.08)" />
        <g className="dino-body">
          {/* tail */}
          <path d="M60 150 C 25 160, 12 140, 8 120 C 25 135, 40 135, 62 128 Z" fill={GREEN} />
          {/* back spikes */}
          {[
            [58, 40],
            [47, 66],
            [42, 94],
            [44, 122],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x + 8} ${y - 2} Q ${x - 10} ${y + 2} ${x - 4} ${y + 18} Q ${x + 6} ${y + 14} ${x + 12} ${y + 10} Z`}
              fill={SPIKE}
              stroke={SPIKE}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          ))}
          {/* feet */}
          <ellipse cx="80" cy="182" rx="20" ry="11" fill={GREEN_DARK} />
          <ellipse cx="128" cy="182" rx="20" ry="11" fill={GREEN_DARK} />
          {/* body */}
          <ellipse cx="103" cy="138" rx="54" ry="46" fill={GREEN} />
          <ellipse cx="110" cy="146" rx="32" ry="31" fill={BELLY} />
          {/* arms */}
          <g className="dino-arm-left">
            <ellipse cx="72" cy="136" rx="9" ry="15" fill={GREEN_DARK} transform="rotate(30 72 136)" />
          </g>
          <g className="dino-arm-right">
            <ellipse cx="146" cy="130" rx="9" ry="15" fill={GREEN_DARK} transform="rotate(-35 146 130)" />
          </g>
          {/* head */}
          <g className="dino-head">
            <ellipse cx="112" cy="70" rx="58" ry="48" fill={GREEN} />
            {/* cheeks */}
            <ellipse cx="80" cy="92" rx="10" ry="6" fill="#ff8fab" opacity="0.55" />
            <ellipse cx="148" cy="92" rx="10" ry="6" fill="#ff8fab" opacity="0.55" />
            {/* eyes */}
            {eyesClosed ? (
              <>
                <path d="M84 70 Q 94 58 104 70" stroke="#23324a" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M122 70 Q 132 58 142 70" stroke="#23324a" strokeWidth="5" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <g className="dino-eyes">
                <ellipse cx="94" cy="66" rx="13" ry="15" fill="#fff" />
                <ellipse cx="132" cy="66" rx="13" ry="15" fill="#fff" />
                <circle cx="97" cy="69" r="8.5" fill="#23324a" />
                <circle cx="135" cy="69" r="8.5" fill="#23324a" />
                <circle cx="100" cy="65" r="3" fill="#fff" />
                <circle cx="138" cy="65" r="3" fill="#fff" />
              </g>
            )}
            {/* nostrils */}
            <circle cx="106" cy="84" r="1.8" fill={GREEN_DARK} />
            <circle cx="120" cy="84" r="1.8" fill={GREEN_DARK} />
            {/* mouth */}
            {mood === 'talk' && <ellipse className="dino-mouth-talk" cx="113" cy="98" rx="10" ry="7" fill="#7a2e3b" />}
            {(mood === 'happy' || mood === 'dance') && (
              <path d="M96 92 Q 113 116 130 92 Z" fill="#7a2e3b" stroke="#7a2e3b" strokeWidth="3" strokeLinejoin="round" />
            )}
            {mood === 'idle' && (
              <path d="M100 94 Q 113 104 126 94" stroke="#23324a" strokeWidth="4" fill="none" strokeLinecap="round" />
            )}
            {mood === 'oops' && <ellipse cx="113" cy="99" rx="6" ry="6" fill="#7a2e3b" />}
            {mood === 'sleep' && (
              <path d="M104 97 Q 113 101 122 97" stroke="#23324a" strokeWidth="4" fill="none" strokeLinecap="round" />
            )}
          </g>
        </g>
        {mood === 'sleep' && (
          <text className="dino-zzz" x="160" y="30" fontSize="26" fontWeight="800" fill="#5b8cff">
            z
          </text>
        )}
      </svg>
    </div>
  )
}
