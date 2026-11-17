import { useState } from 'react'
import { accountsEnabled, deleteAccount } from '../account'
import { Mascot } from '../components/Mascot'
import { mascot, type MascotId } from '../mascots'
import { MAX_CHILDREN, type ProfileStore } from '../profiles'
import { loadProgress, type Progress, type Settings as S } from '../progress'
import { micSupported, recognitionSupported } from '../recorder'
import { hasRomanianVoice, instruction, speak, speechSupported } from '../speech'
import { LEVELS } from './Onboarding'
import { ParentsData, ParentsProgress, ParentsRecordings } from './Other'
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

export type SettingsSection = 'progres' | 'copii' | 'profil' | 'sunet' | 'joaca' | 'inregistrari' | 'date' | 'cont'

/**
 * Settings, behind the parents' gate. A standard settings page: on a wide screen a sidebar lists the sections and the
 * chosen one shows on the right; on a phone the list comes first and a section opens on its own, with a way back.
 */
export function SettingsScreen({
  progress,
  section,
  onSection,
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
  /** The open section; none means the list (on a phone) or the first section (on a wide screen). */
  section?: SettingsSection
  onSection: (s: SettingsSection | undefined) => void
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

  const sections: { id: SettingsSection; icon: string; label: string; hint: string }[] = [
    { id: 'progres', icon: '📊', label: 'Progres', hint: 'Minute pe zi, cuvinte, teste boss' },
    { id: 'copii', icon: '👨‍👩‍👧', label: 'Copii', hint: `${children.length} ${children.length === 1 ? 'profil' : 'profiluri'}` },
    { id: 'profil', icon: '✏️', label: `Profilul lui ${name}`, hint: 'Nume, prieten, de unde începe harta' },
    { id: 'sunet', icon: '🔊', label: 'Sunet și voce', hint: 'Efecte, instrucțiuni, viteza vocii' },
    { id: 'joaca', icon: '🎮', label: 'Joacă', hint: 'Microfon, pauză după 15 minute' },
    { id: 'inregistrari', icon: '🎤', label: 'Înregistrări', hint: 'Ce a spus la „Sunete”' },
    { id: 'date', icon: '💾', label: 'Mută progresul', hint: 'Pe alt telefon sau PC, sau șterge-l' },
    ...(accountsEnabled ? [{ id: 'cont' as const, icon: '☁️', label: 'Cont', hint: email ?? 'Salvează progresul în cont' }] : []),
  ]
  const shown = sections.find((x) => x.id === section) ?? sections[0]

  const body = () => {
    switch (shown.id) {
      case 'progres':
        return <ParentsProgress progress={progress} />
      case 'inregistrari':
        return <ParentsRecordings progress={progress} onChange={onChange} />
      case 'date':
        return <ParentsData progress={progress} onChange={onChange} />
      case 'copii':
        return (
          <>
            <section className="set-group">
              <div className="set-card set-kids">
                {children.map((c) => (
                  <div key={c.id} className={`set-kid ${c.on ? 'on' : ''}`}>
                    <button
                      className="set-kid-pick"
                      onClick={() => !c.on && onSwitchChild(c.id)}
                      aria-label={c.on ? `${c.name} (se joacă acum)` : `Treci la ${c.name}`}
                      aria-pressed={c.on}
                      data-tip={c.on ? undefined : 'Alege personajul'}
                    >
                      <span className="set-kid-face">
                        <Mascot kind={c.mascot} size={58} mood="idle" outfit={{}} />
                      </span>
                      {c.on && <span className="set-kid-badge">Activ</span>}
                      <b>{c.name}</b>
                    </button>
                    {!c.on && (
                      <button
                        className="set-kid-x"
                        aria-label={`Șterge profilul lui ${c.name}`}
                      data-tip="Șterge personajul"
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
          </>
        )
      case 'profil':
        return (
          <>
            <section className="set-group">
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
          </>
        )
      case 'sunet':
        return (
          <>
            <section className="set-group">
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
                    onClick={() => void speak(instruction(s.instructions, `Eu sunt ${mascot().title}!`, `I'm ${mascot().name}!`))}
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
          </>
        )
      case 'joaca':
        return (
          <>
            <section className="set-group">
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
          </>
        )
      case 'cont':
        return (
          <>
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
          </>
        )
    }
  }

  return (
    <div className={`setup-screen settings set-layout ${section ? 'set-open' : ''}`}>
      <header className="set-top set-top-list">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h1>Setări</h1>
      </header>

      <nav className="set-side" aria-label="Secțiuni">
        {sections.map((x) => (
          <button
            key={x.id}
            className={`set-side-link ${x.id === shown.id ? 'on' : ''}`}
            aria-current={x.id === shown.id ? 'page' : undefined}
            onClick={() => onSection(x.id)}
          >
            <span className="set-side-icon" aria-hidden="true">
              {x.icon}
            </span>
            <span className="set-side-text">
              <b>{x.label}</b>
              <small>{x.hint}</small>
            </span>
            <span className="set-side-chev" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </nav>

      <main className="set-pane">
        <header className="set-top set-top-pane">
          <button className="icon-btn" onClick={() => onSection(undefined)} aria-label="Înapoi la setări">
            ←
          </button>
          <h1>{shown.label}</h1>
        </header>
        <h2 className="set-pane-title">{shown.label}</h2>
        {body()}
      </main>
    </div>
  )
}
