import { useState } from 'react'
import { Mascot } from '../components/Mascot'
import { TudooLogo } from '../components/TudooLogo'
import { mascot } from '../mascots'
import { sfx } from '../sfx'
import type { Settings } from '../progress'
import './setup.css'

function Steps({ at }: { at: 1 | 2 | 3 }) {
  return (
    <div className="ob-steps" aria-label={`Pasul ${at} din 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= at ? 'on' : ''} />
      ))}
    </div>
  )
}

/** Close (×) at the top right, shown only while adding another child: cancels without creating it. */
function Close({ onClose }: { onClose?: () => void }) {
  if (!onClose) return null
  return (
    <button className="ob-close" onClick={onClose} aria-label="Renunță la copilul nou">
      ×
    </button>
  )
}

/** First run, step 1: the parent types the child's name. Step 2 is the friend picker. */
export function OnboardName({
  initial,
  canLogIn,
  onNext,
  onLogIn,
  onClose,
}: {
  initial: string
  canLogIn: boolean
  onNext: (name: string) => void
  onLogIn: () => void
  /** Set when adding another child from Settings. */
  onClose?: () => void
}) {
  const [name, setName] = useState(initial)
  const clean = name.trim()
  return (
    <div className="setup-screen ob ob-sky">
      <Close onClose={onClose} />
      <Steps at={1} />
      <h1 className="ob-logo">
        <TudooLogo />
      </h1>
      <div className="ob-friend">
        <Mascot size={150} mood="happy" outfit={{}} />
      </div>
      <p className="ob-bubble">Salut! Eu sunt {mascot().name}. Cum te cheamă?</p>
      <label className="ob-field">
        <span>Numele copilului (îl scrie părintele)</span>
        <input
          value={name}
          maxLength={20}
          autoFocus
          placeholder="Prenumele"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && clean) onNext(clean)
          }}
        />
      </label>
      <div className="ob-grow" />
      <button
        className="big-btn ob-go"
        disabled={!clean}
        onClick={() => {
          sfx.unlock()
          sfx.tap()
          onNext(clean)
        }}
      >
        Mai departe
      </button>
      {canLogIn && (
        <p className="ob-login">
          Ai deja cont Tudoo?{' '}
          <button className="text-link" onClick={onLogIn}>
            Intră
          </button>
        </p>
      )}
    </div>
  )
}

export const LEVELS = [
  { skip: 0, short: 'De la zero', title: 'Începem de la zero', sub: 'Prima temă: Culori' },
  { skip: 1, short: 'Câteva cuvinte', title: 'Știe câteva cuvinte', sub: 'Sare peste Culori, începe la Animale' },
  { skip: 3, short: 'Știe bine', title: 'Știe destul de bine', sub: 'Începe la Familia (temele de dinainte rămân deschise)' },
]

/** First run, step 3: how much English the child knows (where the map starts) and the instructions language. */
export function OnboardLevel({
  name,
  settings,
  onDone,
  onClose,
}: {
  name: string
  settings: Settings
  onDone: (patch: Partial<Settings>) => void
  /** Set when adding another child from Settings. */
  onClose?: () => void
}) {
  const [skip, setSkip] = useState(settings.skipUnits)
  const [lang, setLang] = useState(settings.instructions)
  return (
    <div className="setup-screen ob">
      <Close onClose={onClose} />
      <Steps at={3} />
      <div className="ob-q">
        <span className="ob-q-friend">
          <Mascot size={72} mood="idle" outfit={{}} />
        </span>
        <h1>Cât de multă engleză știe {name}?</h1>
      </div>
      <p className="ob-note">Pentru părinte. Alegem de unde începe harta; se poate schimba oricând din Setări.</p>
      <div className="ob-options" role="radiogroup" aria-label="Nivel">
        {LEVELS.map((l, i) => (
          <button
            key={l.skip}
            role="radio"
            aria-checked={skip === l.skip}
            className={`ob-option ${skip === l.skip ? 'on' : ''}`}
            onClick={() => {
              sfx.tap()
              setSkip(l.skip)
            }}
          >
            <span className={`ob-option-n n${i}`}>{i}</span>
            <span className="ob-option-text">
              <b>{l.title}</b>
              <span>{l.sub}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="ob-lang">
        <b>Instrucțiunile lui {mascot().name}</b>
        <div className="seg">
          <button className={lang === 'ro' ? 'on' : ''} onClick={() => setLang('ro')}>
            Română
          </button>
          <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
            Engleză
          </button>
        </div>
      </div>
      <div className="ob-grow" />
      <button
        className="big-btn ob-go"
        onClick={() => {
          sfx.fanfare()
          onDone({ skipUnits: skip, instructions: lang })
        }}
      >
        Hai la joacă!
      </button>
    </div>
  )
}
