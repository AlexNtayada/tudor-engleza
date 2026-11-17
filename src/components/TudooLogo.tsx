import './characters.css'

const LETTERS: [string, string][] = [
  ['T', '#ff5a6e'],
  ['u', '#ffb020'],
  ['d', '#ffd23f'],
  ['o', '#22b573'],
  ['o', '#5b8cff'],
  ['!', '#a77bdc'],
]

/** The app's name, "Tudoo!", in playful candy-coloured letters, each one tilted a little. */
export function TudooLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`tudoo ${className}`} role="img" aria-label="Tudoo!">
      {LETTERS.map(([t, c], i) => (
        <span key={i} className="tudoo-letter" style={{ color: c }} aria-hidden>
          {t}
        </span>
      ))}
    </span>
  )
}
