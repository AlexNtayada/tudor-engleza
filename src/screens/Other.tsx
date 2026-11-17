import { useEffect, useMemo, useState } from 'react'
import { ALL_LESSONS, UNITS } from '../content'
import { BOSS_BONUS, CHEST_STARS, setProgress, itemById, type Item } from '../gamify'
import { BOSS_NAME, Boss } from '../components/Boss'
import type { BossResult } from './Lesson'
import { BOSS_HP, BOSS_QUESTIONS } from '../lessons'
import { Ninja } from '../components/Ninja'
import { instruction, speak, hasRomanianVoice, speechSupported } from '../speech'
import { micSupported, recognitionSupported } from '../recorder'
import { sfx } from '../sfx'
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
  boss,
  gifts = [],
  onRetry,
  lessonIndex = null,
}: {
  lessonIndex?: number | null
  boss?: BossResult
  gifts?: Item[]
  onRetry?: () => void
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
  const lost = !!boss && !boss.defeated
  useEffect(() => {
    sfx.fanfare()
    const t = setTimeout(() => {
      if (boss && !boss.defeated) {
        void speak([
          { text: `Good try, ${name}!`, lang: 'en' },
          ...instruction(
            mode,
            `${BOSS_NAME} a scăpat de data asta. Mai exersăm puțin și îl prindem!`,
            `${BOSS_NAME} got away this time. Let's practice and try again!`,
          ),
        ])
        return
      }
      void speak([
        { text: `Great job, ${name}!`, lang: 'en' },
        ...(boss ? instruction(mode, `Ai trecut testul! ${BOSS_NAME} a fost învins!`, 'You passed the test!') : []),
        ...(gifts.length ? instruction(mode, 'Album complet! Ai primit un cadou pentru Ninja!', 'Album complete! A present for Ninja!') : []),
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
  if (lost && boss) {
    const unitColor = lessonIndex !== null ? ALL_LESSONS[lessonIndex]?.unit : undefined
    return (
      <div className="center-screen finish finish-boss-lost">
        <div className="boss-duel">
          <Ninja mood="oops" size={150} />
          <Boss color={unitColor?.color ?? '#9b6bff'} dark={unitColor?.colorDark ?? '#7a49e0'} mood="laugh" size={150} />
        </div>
        <h2 className="finish-title">{BOSS_NAME} a scăpat de data asta!</h2>
        <p className="finish-sub">
          Din prima: {boss.correct} din {boss.total}. Mai exersăm și îl prindem!
        </p>
        <div className="finish-gains">
          <span className="gain">+{gained} ⭐</span>
        </div>
        <div className="finish-actions">
          <button className="big-btn big-btn-soft" onClick={onContinue}>
            🗺️ Hartă
          </button>
          {onRetry && (
            <button className="big-btn" onClick={onRetry}>
              ⚔️ Din nou
            </button>
          )}
        </div>
      </div>
    )
  }

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
      {boss && <h2 className="finish-title">🏆 Test trecut! {BOSS_NAME} a fost învins!</h2>}
      <div className="finish-gains">
        <span className="gain">+{gained} ⭐</span>
        {boss && <span className="gain gain-level">⚔️ +{BOSS_BONUS} ⭐ boss</span>}
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
      {gifts.map((g) => (
        <div key={g.id} className="gift-won">
          <Ninja size={90} outfit={{ [g.slot]: g.id }} />
          <span>
            Album complet! Cadou: <b>{g.name}</b>
          </span>
        </div>
      ))}
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
  const [pop, setPop] = useState<string | null>(null)
  const tap = (sticker: string) => {
    sfx.pop()
    setPop(sticker)
    setTimeout(() => setPop((x) => (x === sticker ? null : x)), 700)
  }
  return (
    <div className="page page-white">
      <header className="page-top">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h2>Albumul meu</h2>
      </header>
      <p className="album-hint">Strânge toate abțibildurile unei teme și Ninja primește un cadou special!</p>
      {UNITS.map((u) => {
        const { have, total } = setProgress(progress, u)
        const reward = itemById(u.setReward)
        const complete = have === total
        return (
          <section key={u.id} className={`album-unit ${complete ? 'album-complete' : ''}`}>
            <div className="album-head">
              <h3 style={{ color: u.colorDark }}>
                {u.world.icon} {u.title}
              </h3>
              <span className="album-count">
                {have}/{total}
              </span>
            </div>
            <div className="album-row">
              <div className="album-grid">
                {u.lessons.map((l) => {
                  const has = owned.has(l.sticker)
                  return (
                    <button
                      key={l.id}
                      className={`album-slot ${has ? 'owned' : ''} ${l.boss ? 'album-boss' : ''} ${pop === l.sticker ? 'album-pop' : ''}`}
                      style={has ? { borderColor: u.color } : undefined}
                      onClick={() => has && tap(l.sticker)}
                      aria-label={has ? 'Abțibild' : l.boss ? 'Abțibild boss' : 'Abțibild lipsă'}
                    >
                      {has ? l.sticker : l.boss ? '⚔️' : '?'}
                    </button>
                  )
                })}
              </div>
              {reward && (
                <div className={`album-reward ${complete ? 'on' : ''}`} title={reward.name}>
                  <Ninja size={74} outfit={{ [reward.slot]: reward.id }} />
                  <span>{complete ? '✓ ' : '🎁 '}{reward.name}</span>
                </div>
              )}
            </div>
          </section>
        )
      })}
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
        <h3>Teste (boss)</h3>
        <p className="note">
          La finalul fiecărei teme, {BOSS_NAME} pune {BOSS_QUESTIONS} întrebări din toate cuvintele temei. Testul e trecut
          cu {BOSS_HP} răspunsuri corecte din prima; abia apoi se deschide tema următoare.
        </p>
        <table className="boss-table">
          <thead>
            <tr>
              <th>Tema</th>
              <th>Rezultat</th>
              <th>Cel mai bun</th>
              <th>Încercări</th>
            </tr>
          </thead>
          <tbody>
            {UNITS.map((u) => {
              const r = progress.boss[u.id]
              return (
                <tr key={u.id}>
                  <td>
                    {u.world.icon} {u.title}
                  </td>
                  <td>{!r ? '—' : r.beaten ? '✅ trecut' : '⏳ încă nu'}</td>
                  <td>{r ? `${Math.round(r.best * 100)}%` : '—'}</td>
                  <td>{r?.tries ?? 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
          Tudor apasă 🎤, spune cuvântul și își aude imediat vocea. Înregistrarea rămâne doar pe acest dispozitiv și nu
          se salvează. Ninja nu spune niciodată „greșit”: dacă nu e sigur, îl roagă să mai spună o dată.
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
