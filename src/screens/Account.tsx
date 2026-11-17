import { useState } from 'react'
import { googleEnabled, googleUrl, sendCode, verifyCode } from '../account'
import './setup.css'

/** Parent account: new account or sign in, both with a 6-digit code sent by email (no password). */
export function AccountScreen({
  childName,
  onBack,
  onSignedIn,
}: {
  childName: string
  onBack: () => void
  onSignedIn: (email: string) => Promise<void>
}) {
  const [mode, setMode] = useState<'new' | 'login'>('new')
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSend = validEmail && (mode === 'login' || agree) && !busy
  const who = childName || 'copilului'

  const send = async () => {
    setBusy(true)
    setError('')
    try {
      await sendCode(email.trim())
      setSent(true)
    } catch (e) {
      setError(`Nu am putut trimite codul: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async () => {
    setBusy(true)
    setError('')
    try {
      const who = await verifyCode(email.trim(), code.trim())
      await onSignedIn(who)
    } catch (e) {
      setError(`Codul nu a mers: ${(e as Error).message}. Verifică cifrele sau cere un cod nou.`)
      setBusy(false)
    }
  }

  return (
    <div className="setup-screen acc">
      <header className="set-top">
        <button className="icon-btn" onClick={sent ? () => setSent(false) : onBack} aria-label="Înapoi">
          ←
        </button>
      </header>
      {!sent ? (
        <>
          <div className="seg acc-tabs">
            <button className={mode === 'new' ? 'on' : ''} onClick={() => setMode('new')}>
              Cont nou
            </button>
            <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>
              Am deja cont
            </button>
          </div>
          <h1 className="acc-title">{mode === 'new' ? 'Contul părintelui' : 'Intră în cont'}</h1>
          <p className="acc-sub">
            Fără parolă: îți trimitem un cod pe email de fiecare dată când intri pe un dispozitiv nou.
          </p>
          {googleEnabled && (
            <>
              <a
                className={`acc-google ${mode === 'new' && !agree ? 'disabled' : ''}`}
                href={mode === 'new' && !agree ? undefined : googleUrl()}
                aria-disabled={mode === 'new' && !agree}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="M12 12h7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                Continuă cu Google
              </a>
              <div className="acc-or">
                <span />
                sau
                <span />
              </div>
            </>
          )}
          <label className="acc-field">
            <span>Emailul tău</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="parinte@exemplu.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSend) void send()
              }}
            />
          </label>
          {mode === 'new' && (
            <label className="acc-consent">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                Sunt părintele sau tutorele lui {who} și am peste 18 ani. Am citit{' '}
                <a href="../confidentialitate.html" target="_blank" rel="noreferrer">
                  Politica de confidențialitate
                </a>
                .
              </span>
            </label>
          )}
          {error && <p className="note warn">{error}</p>}
          <div className="ob-grow" />
          <button className="big-btn ob-go" disabled={!canSend} onClick={() => void send()}>
            {busy ? 'Trimit…' : 'Trimite-mi codul'}
          </button>
          <p className="acc-small">
            Păstrăm doar emailul tău, prenumele copiilor și progresul lor, pe servere din UE. Înregistrările vocii rămân pe
            dispozitiv.
          </p>
        </>
      ) : (
        <>
          <div className="acc-mail" aria-hidden="true">
            <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M4 7l8 6 8-6" />
            </svg>
          </div>
          <h1 className="acc-title center">Verifică emailul</h1>
          <p className="acc-sub center">
            Am trimis un cod din 6 cifre la
            <br />
            <b>{email.trim()}</b>
          </p>
          <label className="acc-field">
            <span>Codul din email</span>
            <input
              className="acc-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              autoFocus
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code.length === 6) void confirm()
              }}
            />
          </label>
          <p className="acc-sub center">
            Nu a venit?{' '}
            <button className="text-link" disabled={busy} onClick={() => void send()}>
              Trimite din nou
            </button>
          </p>
          {error && <p className="note warn">{error}</p>}
          <div className="acc-info">
            După cod, progresul de pe acest dispozitiv se salvează în cont. Pe alt dispozitiv îl găsești intrând cu același
            email.
          </div>
          <div className="ob-grow" />
          <button className="big-btn ob-go" disabled={code.length !== 6 || busy} onClick={() => void confirm()}>
            {busy ? 'Verific…' : 'Confirmă'}
          </button>
        </>
      )}
    </div>
  )
}

/** Shown once after signing in when both the account and this device already have progress. */
export function SyncChoice({ onUseAccount, onUseDevice }: { onUseAccount: () => void; onUseDevice: () => void }) {
  return (
    <div className="setup-screen acc">
      <div className="ob-grow" />
      <h1 className="acc-title center">Contul are deja progres</h1>
      <p className="acc-sub center">
        Și pe acest dispozitiv există progres. Pe care îl păstrăm? Celălalt se înlocuiește.
      </p>
      <button className="big-btn ob-go" onClick={onUseAccount}>
        Folosește progresul din cont
      </button>
      <button className="big-btn big-btn-soft ob-go" onClick={onUseDevice}>
        Păstrează progresul de aici
      </button>
      <div className="ob-grow" />
    </div>
  )
}
