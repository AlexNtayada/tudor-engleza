import { useEffect, useMemo, useState } from 'react'
import { UNITS } from '../content'
import { CHEST_STARS } from '../gamify'
import { Ninja } from '../components/Ninja'
import { instruction, speak, hasRomanianVoice, speechSupported } from '../speech'
import { micSupported, recognitionSupported } from '../recorder'
import { sfx } from '../sfx'
import { SpeechPanel } from '../logopedie/Recordings'
import {
  ALL_LESSONS_COUNT,
  DEFAULT_PROGRESS,
  learnedWordIds,
  today,
  totalStars,
  TOTAL_WORDS,
  type Progress,
  type Settings,
} from '../progress'

export function StartScreen({ name, onGo }: { name: string; onGo: () => void }) {
  return (
    <div className="center-screen start">
      <h1 className="title">Ninja English</h1>
      <Ninja mood="happy" size={220} />
      <button
        className="big-btn"
        onClick={() => {
          sfx.unlock()
          sfx.tap()
          onGo()
        }}
      >
        ▶ Hai, {name}!
      </button>
    </div>
  )
}

export function FinishScreen({
  stars,
  sticker,
  gained,
  combos,
  levelUp,
  chest,
  name,
  mode,
  suggestBreak,
  onOpenChest,
  onContinue,
  onBreak,
}: {
  stars: number
  sticker?: string
  gained: number
  combos: number
  levelUp?: number
  chest: boolean
  name: string
  mode: Settings['instructions']
  suggestBreak: boolean
  onOpenChest: () => void
  onContinue: () => void
  onBreak: () => void
}) {
  const [chestOpen, setChestOpen] = useState(false)
  useEffect(() => {
    sfx.fanfare()
    const t = setTimeout(() => {
      void speak([
        { text: `Great job, ${name}!`, lang: 'en' },
        ...(levelUp ? instruction(mode, `Ura! Ninja a crescut! Nivelul ${levelUp}!`, `Hooray! Ninja is now level ${levelUp}!`) : []),
        ...(sticker ? instruction(mode, 'Bravo! Ai câștigat un abțibild nou!', 'You got a new sticker!') : []),
        ...(chest ? instruction(mode, 'Uite, un cufăr! Deschide-l!', 'Look, a treasure chest! Open it!') : []),
        ...(suggestBreak
          ? instruction(mode, 'Ai lucrat frumos. Vrei o mică pauză?', 'You worked hard. Do you want a little break?')
          : []),
      ])
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="center-screen finish">
      <div className="confetti" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 8) * 0.15}s` }} />
        ))}
      </div>
      <div className="finish-stars">
        {[1, 2, 3].map((s) => (
          <span key={s} className={s <= stars ? 'on' : ''} style={{ animationDelay: `${0.3 + s * 0.25}s` }}>
            ★
          </span>
        ))}
      </div>
      <Ninja mood="dance" size={200} />
      <div className="finish-gains">
        <span className="gain">+{gained} ⭐</span>
        {combos > 0 && <span className="gain gain-combo">🔥 × {combos}</span>}
        {levelUp && <span className="gain gain-level">🥷 Nivelul {levelUp}!</span>}
      </div>
      {chest && (
        <button
          className={`chest ${chestOpen ? 'chest-open' : ''}`}
          onClick={() => {
            if (chestOpen) return
            setChestOpen(true)
            sfx.fanfare()
            onOpenChest()
          }}
          aria-label="Cufărul zilei"
        >
          <span className="chest-icon">{chestOpen ? '✨' : '🎁'}</span>
          <span>{chestOpen ? `+${CHEST_STARS} ⭐` : 'Cufărul zilei'}</span>
        </button>
      )}
      {sticker && (
        <div className="sticker-won">
          <span className="sticker">{sticker}</span>
          <span>Abțibild nou!</span>
        </div>
      )}
      <div className="finish-actions">
        {suggestBreak && (
          <button className="big-btn big-btn-soft" onClick={onBreak}>
            😴 Pauză
          </button>
        )}
        <button className="big-btn" onClick={onContinue}>
          ➜
        </button>
      </div>
    </div>
  )
}

export function BreakScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="center-screen break">
      <Ninja mood="sleep" size={220} />
      <p className="break-text">Ninja se odihnește puțin. Bea apă, sari de 5 ori și revino!</p>
      <button className="big-btn" onClick={onBack}>
        ▶ Gata, înapoi!
      </button>
    </div>
  )
}

export function Album({ progress, onBack }: { progress: Progress; onBack: () => void }) {
  const owned = new Set(progress.stickers)
  return (
    <div className="page">
      <header className="page-top">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h2>Albumul meu</h2>
      </header>
      {UNITS.map((u) => (
        <section key={u.id} className="album-unit">
          <h3 style={{ color: u.colorDark }}>{u.title}</h3>
          <div className="album-grid">
            {u.lessons.map((l) => (
              <button
                key={l.id}
                className={`album-slot ${owned.has(l.sticker) ? 'owned' : ''}`}
                style={owned.has(l.sticker) ? { borderColor: u.color } : undefined}
                onClick={() => owned.has(l.sticker) && sfx.tap()}
              >
                {owned.has(l.sticker) ? l.sticker : '?'}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const RO_DIGITS = ['ZERO', 'UNU', 'DOI', 'TREI', 'PATRU', 'CINCI', 'ȘASE', 'ȘAPTE', 'OPT', 'NOUĂ']

export function ParentGate({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const code = useMemo(() => Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)), [])
  const [typed, setTyped] = useState<number[]>([])
  const press = (d: number) => {
    const next = [...typed, d]
    if (next.length < 3) return setTyped(next)
    if (next.every((x, i) => x === code[i])) onPass()
    else {
      sfx.wrong()
      setTyped([])
    }
  }
  return (
    <div className="page gate">
      <header className="page-top">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h2>Pentru părinți</h2>
      </header>
      <p className="gate-hint">
        Scrie numerele: <b>{code.map((d) => RO_DIGITS[d]).join(', ')}</b>
      </p>
      <div className="gate-typed">
        {[0, 1, 2].map((i) => (
          <span key={i}>{typed[i] ?? '_'}</span>
        ))}
      </div>
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
          <button key={d} onClick={() => press(d)}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Parents({
  progress,
  onChange,
  onBack,
}: {
  progress: Progress
  onChange: (p: Progress) => void
  onBack: () => void
}) {
  const s = progress.settings
  const set = (patch: Partial<Settings>) => onChange({ ...progress, settings: { ...s, ...patch } })
  const roVoice = hasRomanianVoice()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { key, label: d.toLocaleDateString('ro-RO', { weekday: 'short' }), min: Math.round((progress.playSeconds[key] ?? 0) / 60) }
  })
  const maxMin = Math.max(10, ...days.map((d) => d.min))
  const lessonsDone = Object.keys(progress.stars).length

  return (
    <div className="page parents">
      <header className="page-top">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h2>Zona părinților</h2>
      </header>

      <section className="panel">
        <h3>Progres</h3>
        <div className="stats">
          <div>
            <b>
              {lessonsDone}/{ALL_LESSONS_COUNT}
            </b>
            <span>lecții</span>
          </div>
          <div>
            <b>
              {learnedWordIds(progress).size}/{TOTAL_WORDS}
            </b>
            <span>cuvinte</span>
          </div>
          <div>
            <b>{totalStars(progress)}</b>
            <span>stele</span>
          </div>
          <div>
            <b>{Math.round((progress.playSeconds[today()] ?? 0) / 60)} min</b>
            <span>azi</span>
          </div>
        </div>
        <div className="week" aria-label="Minute pe zi, ultimele 7 zile">
          {days.map((d) => (
            <div key={d.key} className="week-day">
              <span className="week-min">{d.min || ''}</span>
              <div className="week-bar" style={{ height: `${(d.min / maxMin) * 100}%` }} />
              <span className="week-label">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Setări</h3>
        <label className="field">
          <span>Numele copilului</span>
          <input value={s.childName} onChange={(e) => set({ childName: e.target.value })} maxLength={20} />
        </label>
        <div className="field">
          <span>Instrucțiunile lui Ninja</span>
          <div className="seg">
            <button className={s.instructions === 'ro' ? 'on' : ''} onClick={() => set({ instructions: 'ro' })}>
              Română
            </button>
            <button className={s.instructions === 'en' ? 'on' : ''} onClick={() => set({ instructions: 'en' })}>
              Engleză
            </button>
          </div>
        </div>
        <div className="field">
          <span>Vocea în engleză</span>
          <div className="seg">
            <button className={!s.slowVoice ? 'on' : ''} onClick={() => set({ slowVoice: false })}>
              Normal
            </button>
            <button className={s.slowVoice ? 'on' : ''} onClick={() => set({ slowVoice: true })}>
              Rar
            </button>
          </div>
        </div>
        <button className="link-btn" onClick={() => void speak(instruction(s.instructions, 'Salut! Eu sunt Ninja.', 'Hi! I am Ninja.'))}>
          🔊 Testează vocea
        </button>
        {!speechSupported() && <p className="note warn">Browserul acesta nu poate vorbi. Folosește Chrome sau Edge.</p>}
        {speechSupported() && !roVoice && s.instructions === 'ro' && (
          <p className="note warn">
            Pe acest dispozitiv nu am găsit o voce în română, așa că Ninja spune instrucțiunile în engleză (textul în
            română apare în bulă). Cea mai simplă soluție pe PC: deschide aplicația în <b>Microsoft Edge</b>, care are
            voci românești incluse. Pe Windows mai poți adăuga vocea din Setări → Oră și limbă → Vorbire → Adaugă voci →
            Română.
          </p>
        )}
      </section>

      <section className="panel">
        <h3>Microfon</h3>
        <div className="field">
          <span>Exerciții „Spune tu!” 🎤</span>
          <div className="seg">
            <button className={s.mic ? 'on' : ''} onClick={() => set({ mic: true })}>
              Pornit
            </button>
            <button className={!s.mic ? 'on' : ''} onClick={() => set({ mic: false })}>
              Oprit
            </button>
          </div>
        </div>
        <div className="field">
          <span>Verifică dacă a spus cuvântul</span>
          <div className="seg">
            <button className={s.micCheck ? 'on' : ''} onClick={() => set({ micCheck: true })}>
              Da
            </button>
            <button className={!s.micCheck ? 'on' : ''} onClick={() => set({ micCheck: false })}>
              Nu
            </button>
          </div>
        </div>
        <p className="note">
          Tudor apasă 🎤, spune cuvântul și își aude imediat vocea. Înregistrarea din lecțiile de engleză rămâne doar pe
          acest dispozitiv și nu se salvează. Ninja nu spune niciodată „greșit”: dacă nu e sigur, îl roagă să mai spună o dată.
        </p>
        {s.micCheck && recognitionSupported() && (
          <p className="note">
            Verificarea folosește recunoașterea vocală a browserului; în Chrome și Edge sunetul e trimis serviciului de
            recunoaștere vocală al browserului (Google, respectiv Microsoft). Dacă nu vrei asta, alege „Nu”: înregistrarea
            și redarea merg în continuare.
          </p>
        )}
        {s.micCheck && !recognitionSupported() && (
          <p className="note warn">
            Browserul acesta nu poate verifica ce a spus; Ninja îl laudă oricum după ce se aude. Verificarea merge în Chrome și
            Edge.
          </p>
        )}
        {!micSupported() && <p className="note warn">Browserul acesta nu are acces la microfon.</p>}
      </section>

      <SpeechPanel save={s.speechSave} onSave={(v) => set({ speechSave: v })} speechLog={progress.speechLog} />

      <section className="panel">
        <h3>Despre timp</h3>
        <p className="note">
          Nu există limită de timp. Ninja propune o pauză după aproximativ 15 minute de joacă, dar nu blochează nimic.
        </p>
        <button
          className="link-btn danger"
          onClick={() => {
            if (window.confirm('Ștergi tot progresul (stele, abțibilduri, timp)?')) {
              onChange({ ...structuredClone(DEFAULT_PROGRESS), settings: s })
            }
          }}
        >
          Șterge progresul
        </button>
      </section>
    </div>
  )
}
