import { useState } from 'react'
import { accountsEnabled, deleteAccount } from '../account'
import { Mascot } from '../components/Mascot'
import { mascot, type MascotId } from '../mascots'
import { MAX_CHILDREN, type ProfileStore } from '../profiles'
import { loadProgress, type Progress, type Settings as S } from '../progress'
import { micSupported, recognitionSupported } from '../recorder'
import { hasRomanianVoice, instruction, speak, speechSupported } from '../speech'
import { LEVELS } from './Onboarding'
import './setup.css'

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`set-toggle ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    />
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="set-row">
      <span className="set-label">{label}</span>
      {children}
    </div>
  )
}

/** Settings, behind the parents' gate: account, children, sound and voice, play options. */
export function SettingsScreen({
  progress,
  store,
  email,
  syncState,
  onChange,
  onBack,
  onPickFriend,
  onAccount,
  onSignOut,
  onSwitchChild,
  onAddChild,
  onRemoveChild,
}: {
  progress: Progress
  store: ProfileStore
  email?: string
  syncState: 'idle' | 'saving' | 'saved' | 'error'
  onChange: (p: Progress) => void
  onBack: () => void
  onPickFriend: () => void
  onAccount: () => void
  onSignOut: () => void
  onSwitchChild: (id: string) => void
  onAddChild: () => void
  onRemoveChild: (id: string) => void
}) {
  const s = progress.settings
  const set = (patch: Partial<S>) => onChange({ ...progress, settings: { ...s, ...patch } })
  const name = s.childName || 'copilul'
  const [accMsg, setAccMsg] = useState('')
  const roVoice = hasRomanianVoice()

  const children = store.list.map((c) => {
    const p = c.id === store.active ? progress : loadProgress(c.id)
    return { id: c.id, name: p.settings.childName || c.name || 'Copil', mascot: p.mascot as MascotId | undefined, on: c.id === store.active }
  })

  return (
    <div className="setup-screen settings">
      <header className="set-top">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h1>Setări</h1>
      </header>

      {accountsEnabled && !email && (
        <section className="set-account">
          <div className="set-account-head">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5z" />
              <path d="M12 11v6M9.5 13.5L12 11l2.5 2.5" />
            </svg>
            <div>
              <b>Salvează progresul lui {name}</b>
              <span>Stelele și hainele rămân și pe alt telefon sau PC.</span>
            </div>
          </div>
          <div className="set-account-btns">
            <button className="set-btn green" onClick={onAccount}>
              Creează cont
            </button>
            <button className="set-btn white" onClick={onAccount}>
              Am cont, intru
            </button>
          </div>
        </section>
      )}

      {accountsEnabled && email && (
        <section className="set-group">
          <h2>Cont</h2>
          <div className="set-card">
            <Row label={email}>
              <span className={`set-sync ${syncState}`}>
                {syncState === 'saving' ? 'Se salvează…' : syncState === 'error' ? 'Nesalvat' : 'Salvat'}
              </span>
            </Row>
            <div className="set-row set-row-btns">
              <button className="text-link" onClick={onSignOut}>
                Ieși din cont
              </button>
              <button
                className="text-link danger"
                onClick={async () => {
                  if (!window.confirm('Ștergi contul și tot progresul salvat în el? Progresul de pe acest dispozitiv rămâne.')) return
                  try {
                    await deleteAccount()
                    onSignOut()
                  } catch (e) {
                    setAccMsg(`Nu am putut șterge contul: ${(e as Error).message}`)
                  }
                }}
              >
                Șterge contul
              </button>
            </div>
          </div>
          {syncState === 'error' && <p className="note warn">Nu am putut salva în cont. Încerc din nou la următoarea schimbare.</p>}
          {accMsg && <p className="note warn">{accMsg}</p>}
        </section>
      )}

      <section className="set-group">
        <h2>Copii</h2>
        <div className="set-card set-kids">
          {children.map((c) => (
            <div key={c.id} className={`set-kid ${c.on ? 'on' : ''}`}>
              <button
                className="set-kid-pick"
                onClick={() => !c.on && onSwitchChild(c.id)}
                aria-label={c.on ? `${c.name} (se joacă acum)` : `Treci la ${c.name}`}
                aria-pressed={c.on}
              >
                <span className="set-kid-face">
                  <Mascot kind={c.mascot} size={58} mood="idle" outfit={{}} />
                </span>
                <b>{c.name}</b>
              </button>
              {!c.on && (
                <button
                  className="set-kid-x"
                  aria-label={`Șterge profilul lui ${c.name}`}
                  onClick={() => {
                    if (window.confirm(`Ștergi profilul lui ${c.name} și progresul lui?`)) onRemoveChild(c.id)
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {children.length < MAX_CHILDREN && (
            <button className="set-kid set-kid-add" onClick={onAddChild}>
              <span className="set-kid-face">+</span>
              <b>Adaugă</b>
            </button>
          )}
        </div>
      </section>

      <section className="set-group">
        <h2>{name}</h2>
        <div className="set-card">
          <Row label="Numele">
            <input className="set-input" value={s.childName} maxLength={20} onChange={(e) => set({ childName: e.target.value })} />
          </Row>
          <Row label="Prietenul">
            <button className="set-friend" onClick={onPickFriend}>
              <Mascot size={40} outfit={{}} />
              <span>{mascot().name} ›</span>
            </button>
          </Row>
          <div className="set-row set-row-col">
            <span className="set-label">De unde începe harta</span>
            <div className="seg seg-small seg-wrap">
              {LEVELS.map((l) => (
                <button key={l.skip} className={s.skipUnits === l.skip ? 'on' : ''} onClick={() => set({ skipUnits: l.skip })}>
                  {l.short}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="set-group">
        <h2>Sunet și voce</h2>
        <div className="set-card">
          <Row label="Efecte (bravo, baloane)">
            <Toggle on={s.sfx} label="Efecte sonore" onChange={(v) => set({ sfx: v })} />
          </Row>
          <Row label={`Instrucțiunile lui ${mascot().name}`}>
            <div className="seg seg-small">
              <button className={s.instructions === 'ro' ? 'on' : ''} onClick={() => set({ instructions: 'ro' })}>
                Română
              </button>
              <button className={s.instructions === 'en' ? 'on' : ''} onClick={() => set({ instructions: 'en' })}>
                Engleză
              </button>
            </div>
          </Row>
          <Row label="Vocea în engleză">
            <div className="seg seg-small">
              <button className={!s.slowVoice ? 'on' : ''} onClick={() => set({ slowVoice: false })}>
                Normal
              </button>
              <button className={s.slowVoice ? 'on' : ''} onClick={() => set({ slowVoice: true })}>
                Rar
              </button>
            </div>
          </Row>
          <div className="set-row">
            <button
              className="text-link"
              onClick={() => void speak(instruction(s.instructions, `Salut! Eu sunt ${mascot().title}.`, `Hi! I am ${mascot().name}.`))}
            >
              🔊 Testează vocea
            </button>
          </div>
        </div>
        {!speechSupported() && <p className="note warn">Browserul acesta nu poate vorbi. Folosește Chrome sau Edge.</p>}
        {speechSupported() && !roVoice && s.instructions === 'ro' && (
          <p className="note">
            Unele fraze noi încă nu au voce înregistrată; pentru ele {mascot().name} folosește vocea browserului. Pe acest
            dispozitiv nu există o voce românească, așa că le spune în engleză. Microsoft Edge are voci românești incluse.
          </p>
        )}
      </section>

      <section className="set-group">
        <h2>Joacă</h2>
        <div className="set-card">
          <Row label="Microfon „Spune tu!”">
            <Toggle on={s.mic} label="Microfon" onChange={(v) => set({ mic: v })} />
          </Row>
          <Row label="Verifică dacă a spus cuvântul">
            <Toggle on={s.micCheck} label="Verificare cuvânt" onChange={(v) => set({ micCheck: v })} />
          </Row>
          <Row label="Pauză după 15 minute">
            <Toggle on={s.breaks} label="Pauză propusă" onChange={(v) => set({ breaks: v })} />
          </Row>
        </div>
        <p className="note">
          {name} apasă 🎤, spune cuvântul și își aude imediat vocea. Înregistrarea din lecțiile de engleză rămâne doar pe
          acest dispozitiv. {mascot().name} nu spune niciodată „greșit”.
          {s.micCheck && recognitionSupported() &&
            ' Verificarea folosește recunoașterea vocală a browserului (în Chrome și Edge sunetul ajunge la Google, respectiv Microsoft); alege „oprit” dacă nu vrei asta.'}
        </p>
        {!micSupported() && <p className="note warn">Browserul acesta nu are acces la microfon.</p>}
      </section>
    </div>
  )
}
