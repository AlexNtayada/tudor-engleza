import './characters.css'

const INK = '#3a2a14'
const LETTERS: [string, string][] = [
  ['T', '#ff5a6e'],
  ['u', '#ffb020'],
  ['d', '#ffd23f'],
]

/** The app's name, "Tudoo!": playful candy-coloured letters, and the two o's are a pair of thick-rimmed googly eyes. */
export function TudooLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`tudoo ${className}`} role="img" aria-label="Tudoo!">
      {LETTERS.map(([t, c]) => (
        <span key={t} className="tudoo-letter" style={{ color: c }} aria-hidden>
          {t}
        </span>
      ))}
      <svg className="tudoo-eyes" viewBox="0 0 104 56" aria-hidden>
        <g className="tudoo-eye">
          <circle cx="26" cy="29" r="22" fill="#fff" stroke={INK} strokeWidth="9" />
          <circle className="tudoo-pupil" cx="31" cy="32" r="10.5" fill={INK} />
          <circle cx="34.5" cy="26.5" r="3.6" fill="#fff" />
        </g>
        <g className="tudoo-eye">
          <circle cx="78" cy="27" r="22" fill="#fff" stroke={INK} strokeWidth="9" />
          <circle className="tudoo-pupil" cx="83" cy="30" r="10.5" fill={INK} />
          <circle cx="86.5" cy="24.5" r="3.6" fill="#fff" />
        </g>
      </svg>
      <span className="tudoo-letter tudoo-bang" style={{ color: '#a77bdc' }} aria-hidden>
        !
      </span>
    </span>
  )
}
