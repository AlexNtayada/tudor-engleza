/** The app's name, "Tudoo!", where the two o's are a pair of googly eyes. */
export function TudooLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`tudoo ${className}`} role="img" aria-label="Tudoo!">
      <span aria-hidden>Tud</span>
      <svg className="tudoo-eyes" viewBox="0 0 100 52" aria-hidden>
        <g className="tudoo-eye">
          <circle cx="25" cy="27" r="22" fill="#fff" stroke="currentColor" strokeWidth="7" />
          <circle className="tudoo-pupil" cx="30" cy="30" r="10" fill="currentColor" />
          <circle cx="33" cy="25" r="3.5" fill="#fff" />
        </g>
        <g className="tudoo-eye">
          <circle cx="75" cy="27" r="22" fill="#fff" stroke="currentColor" strokeWidth="7" />
          <circle className="tudoo-pupil" cx="80" cy="30" r="10" fill="currentColor" />
          <circle cx="83" cy="25" r="3.5" fill="#fff" />
        </g>
      </svg>
      <b aria-hidden>!</b>
    </span>
  )
}
