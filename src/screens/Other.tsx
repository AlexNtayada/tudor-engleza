import { mascot, g, MASCOTS, mascotById, type MascotId } from '../mascots'
import { TudooLogo } from '../components/TudooLogo'
import { useEffect, useMemo, useState } from 'react'
import { ALL_LESSONS, UNITS } from '../content'
import { BOSS_BONUS, CHEST_STARS, levelFor, setProgress, itemById, STARS_PER_LEVEL, type Item } from '../gamify'
import { Boss, bossFor } from '../components/Boss'
import type { BossResult } from './Lesson'
import { BOSS_HP, BOSS_QUESTIONS } from '../lessons'
import { Mascot } from '../components/Mascot'
import { instruction, speak, hasRomanianVoice, speechSupported } from '../speech'
import { micSupported, recognitionSupported } from '../recorder'
import { sfx } from '../sfx'
import { SpeechPanel } from '../logopedie/Recordings'
import {
  ALL_LESSONS_COUNT,
  DEFAULT_PROGRESS,
  exportProgress,
  importProgress,
  learnedWordIds,
  today,
  totalStars,
  TOTAL_WORDS,
  type Progress,
  type Settings,
} from '../progress'

/** Intro: the app name, the whole crew of friends on a hill, and "pick your friend". */
export function StartScreen({
  name,
  chosen,
  onPick,
  onPlay,
}: {
  name: string
  chosen?: MascotId
  onPick: () => void
  onPlay: () => void
}) {
  const friend = chosen ? mascotById(chosen) : undefined
  return (
    <div className="center-screen intro">
      <div className="intro-sky" aria-hidden>
        <span className="intro-cloud intro-cloud-1" />
        <span className="intro-cloud intro-cloud-2" />
        <span className="intro-cloud intro-cloud-3" />
        {['A', 'B', 'C', '1', '2', '3', '★', '♪'].map((t, i) => (
          <span key={t} className={`intro-bubble intro-bubble-${i + 1}`}>
            {t}
          </span>
        ))}
        <svg className="intro-hills" viewBox="0 0 1200 260" preserveAspectRatio="none">
          <path d="M0 120 Q 220 30 460 110 T 900 90 T 1200 100 L 1200 260 L 0 260 Z" fill="#9be08a" />
          <path d="M0 170 Q 300 100 620 160 T 1200 150 L 1200 260 L 0 260 Z" fill="#6fcf72" />
        </svg>
      </div>
      <div className="intro-head">
        <h1 className="intro-title">
          <TudooLogo />
        </h1>
        <p className="intro-sub">Salut, {name}! Învățăm engleză cu prietenii.</p>
      </div>
      <div className="intro-crew">
        {MASCOTS.map((m, i) => (
          <span key={m.id} className={`intro-friend ${chosen === m.id ? 'on' : ''}`} style={{ animationDelay: `${i * 0.25}s` }}>
            <Mascot kind={m.id} mood={chosen === m.id || i % 2 === 0 ? 'happy' : 'idle'} size={chosen === m.id ? 132 : 112} outfit={chosen === m.id ? undefined : {}} />
          </span>
        ))}
      </div>
      <div className="intro-actions">
        <button
          className="big-btn intro-go"
          onClick={() => {
            sfx.unlock()
            sfx.tap()
            onPick()
          }}
        >
          👆 Alege-ți prietenul!
        </button>
        {friend && (
          <button
            className="intro-play"
            onClick={() => {
              sfx.unlock()
              sfx.tap()
              onPlay()
            }}
          >
            ▶ Joacă cu {friend.name}
          </button>
        )}
      </div>
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
  earned = 0,
  streak = 0,
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
  earned?: number
  streak?: number
}) {
  const [chestOpen, setChestOpen] = useState(false)
  const lost = !!boss && !boss.defeated
  const bossUnit = lessonIndex !== null ? ALL_LESSONS[lessonIndex]?.unit.id : undefined
  const bossName = bossFor(bossUnit).name
  useEffect(() => {
    sfx.fanfare()
    const t = setTimeout(() => {
      if (boss && !boss.defeated) {
        void speak([
          { text: `Good try, ${name}!`, lang: 'en' },
          ...instruction(
            mode,
            `${bossName} a scăpat de data asta. Mai exersăm puțin și îl prindem!`,
            `${bossName} got away this time. Let's practice and try again!`,
          ),
        ])
        return
      }
      void speak([
        { text: `Great job, ${name}!`, lang: 'en' },
        ...(boss ? instruction(mode, `Ai trecut testul! ${bossName} a fost învins!`, 'You passed the test!') : []),
        ...(gifts.length ? instruction(mode, `Album complet! Ai primit un cadou pentru ${mascot().name}!`, `Album complete! A present for ${mascot().name}!`) : []),
        ...(levelUp
          ? instruction(mode, `Ura! ${mascot().name} a crescut!`, `Hooray! ${mascot().name} is now level ${levelUp}!`).concat(
              mode === 'ro' && hasRomanianVoice() ? [{ text: `Nivelul ${levelUp}!`, lang: 'ro' }] : [],
            )
          : []),
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
    return (
      <div className="center-screen finish finish-boss-lost">
        <div className="boss-duel">
          <Mascot mood="oops" size={150} />
          <Boss unitId={bossUnit} mood="laugh" size={150} />
        </div>
        <h2 className="finish-title">{bossName} a scăpat de data asta!</h2>
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

  const level = levelFor(earned)
  const inLevel = earned % STARS_PER_LEVEL
  return (
    <div className="finish-screen">
      <div className="sunburst" aria-hidden />
      <div className="confetti" aria-hidden>
        {Array.from({ length: 36 }, (_, i) => (
          <i
            key={i}
            style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.18}s`, animationDuration: `${2.4 + (i % 5) * 0.4}s` }}
          />
        ))}
      </div>
      <header className="finish-head">
        <button className="soft-btn" onClick={onContinue} aria-label="Înapoi la hartă">
          ←
        </button>
        <h2>{boss ? 'Test trecut!' : 'Lecție terminată!'}</h2>
        {onRetry ? (
          <button className="soft-btn" onClick={onRetry} aria-label="Încă o dată">
            ↻
          </button>
        ) : (
          <span className="soft-btn-space" />
        )}
      </header>

      <div className="finish-card">
        <div className="trophy">
          <div className="trophy-frame">
            {sticker ? (
              <span className="sticker">{sticker}</span>
            ) : boss ? (
              <span className="sticker">🏆</span>
            ) : (
              <Mascot mood="dance" size={120} />
            )}
            <span className="trophy-clip" aria-hidden />
          </div>
          <div className="finish-stars">
            {[1, 2, 3].map((s) => (
              <span key={s} className={s <= stars ? 'on' : ''} style={{ animationDelay: `${0.3 + s * 0.25}s` }}>
                ★
              </span>
            ))}
          </div>
        </div>

        {boss && <p className="finish-sub finish-boss-won">🏆 {bossName} a fost învins!</p>}
        {sticker && <p className="finish-sub">Abțibild nou în album!</p>}

        <div className="finish-level">
          <b>{mascot().name} {g('isteț', 'isteață')} 🏅</b>
          <div className="finish-level-row">
            <span className="lv-chip">Nv {level}</span>
            <span className="meter">
              <span className="meter-fill" style={{ width: `${Math.max((inLevel / STARS_PER_LEVEL) * 100, 6)}%` }} />
            </span>
            <span className="lv-chip lv-chip-next">Nv {level + 1}</span>
          </div>
          <span className="finish-level-text">
            {inLevel}/{STARS_PER_LEVEL} ⭐ <b>+{gained}</b>
          </span>
        </div>

        <div className="stat-tiles">
          <div className="stat-tile">
            {levelUp && <span className="stat-flag">Nivel nou!</span>}
            <span className="stat-icon">⭐</span>
            <span>
              <b>+{gained}</b>
              <small>stele{boss ? ` (+${BOSS_BONUS} boss)` : ''}</small>
            </span>
          </div>
          <div className="stat-tile">
            <span className="stat-icon">🔥</span>
            <span>
              <b>× {combos}</b>
              <small>serii la rând</small>
            </span>
          </div>
          <div className="stat-tile stat-wide">
            <span className="stat-icon stat-icon-sun">☀️</span>
            <span>
              <b className="stat-orange">
                {streak} {streak === 1 ? 'zi' : 'zile'} cu soare
              </b>
              <small>la rând</small>
            </span>
            {levelUp && <span className="stat-level">🥷 Nivelul {levelUp}!</span>}
          </div>
        </div>

        {gifts.map((g) => (
          <div key={g.id} className="gift-won">
            <Mascot size={90} outfit={{ [g.slot]: g.id }} />
            <span>
              Album complet! Cadou: <b>{g.name}</b>
            </span>
          </div>
        ))}

        <div className="finish-bottom">
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
          <div className="finish-cheer">
            <span className="hero-bubble">Bravo, {name}!</span>
            <Mascot mood="dance" size={96} />
          </div>
        </div>
      </div>

      <div className="finish-actions">
        {suggestBreak && (
          <button className="big-btn big-btn-soft" onClick={onBreak}>
            😴 Pauză
          </button>
        )}
        <button className="big-btn big-btn-dark" onClick={onContinue}>
          Mai departe ➜
        </button>
      </div>
    </div>
  )
}

export function BreakScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="center-screen break">
      <Mascot mood="sleep" size={220} />
      <p className="break-text">{mascot().name} se odihnește puțin. Bea apă, sari de 5 ori și revino!</p>
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
      <p className="album-hint">Strânge toate abțibildurile unei teme și {mascot().name} primește un cadou special!</p>
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
                  <Mascot size={74} outfit={{ [reward.slot]: reward.id }} />
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
  onPickFriend,
}: {
  progress: Progress
  onChange: (p: Progress) => void
  onBack: () => void
  onPickFriend: () => void
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
          La finalul fiecărei teme, un boss pune {BOSS_QUESTIONS} întrebări din toate cuvintele temei. Testul e trecut
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
                    {u.world.icon} {u.title} <small className="boss-table-name">({bossFor(u.id).name})</small>
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
          <span>Prietenul din aplicație</span>
          <button className="friend-pick" onClick={onPickFriend}>
            <Mascot size={44} outfit={{}} />
            <b>{mascot().title}</b>
            <span>Schimbă ›</span>
          </button>
        </div>
        <div className="field">
          <span>Instrucțiunile lui {mascot().name}</span>
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
        <button className="link-btn" onClick={() => void speak(instruction(s.instructions, `Salut! Eu sunt ${mascot().title}.`, `Hi! I am ${mascot().name}.`))}>
          🔊 Testează vocea
        </button>
        {!speechSupported() && <p className="note warn">Browserul acesta nu poate vorbi. Folosește Chrome sau Edge.</p>}
        {speechSupported() && !roVoice && s.instructions === 'ro' && (
          <p className="note warn">
            Pe acest dispozitiv nu am găsit o voce în română, așa că {mascot().name} spune instrucțiunile în engleză (textul în
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
          acest dispozitiv și nu se salvează. {mascot().name} nu spune niciodată „greșit”: dacă nu e sigur, îl roagă să mai spună o dată.
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
            Browserul acesta nu poate verifica ce a spus; {mascot().name} îl laudă oricum după ce se aude. Verificarea merge în Chrome și
            Edge.
          </p>
        )}
        {!micSupported() && <p className="note warn">Browserul acesta nu are acces la microfon.</p>}
      </section>

      <SpeechPanel save={s.speechSave} onSave={(v) => set({ speechSave: v })} speechLog={progress.speechLog} />

      <MoveProgress progress={progress} onChange={onChange} />

      <section className="panel">
        <h3>Despre timp</h3>
        <p className="note">
          Nu există limită de timp. {mascot().name} propune o pauză după aproximativ 15 minute de joacă, dar nu blochează nimic.
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

/** Parents area: save the progress to a file and load it on another device (or at a new address). */
function MoveProgress({ progress, onChange }: { progress: Progress; onChange: (p: Progress) => void }) {
  const [msg, setMsg] = useState('')
  const save = () => {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `progres-tudoo-${today()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    setMsg('Fișierul s-a descărcat. Deschide-l din „Încarcă progresul” pe celălalt dispozitiv.')
  }
  const load = async (file: File | undefined) => {
    if (!file) return
    const p = importProgress(await file.text())
    if (!p) {
      setMsg('Fișierul ales nu este un progres Tudoo!.')
      return
    }
    if (window.confirm(`Înlocuiești progresul de aici cu cel din fișier (${Object.keys(p.stars).length} lecții terminate)?`)) {
      onChange(p)
      setMsg('Gata! Progresul a fost încărcat.')
    }
  }
  return (
    <section className="panel">
      <h3>Mută progresul</h3>
      <p className="note">
        Progresul stă doar pe acest dispozitiv. Ca să-l muți pe alt telefon sau calculator, salvează-l într-un fișier și
        încarcă-l acolo. Înregistrările din „Sunete” nu se mută.
      </p>
      <div className="seg">
        <button onClick={save}>💾 Salvează progresul</button>
        <label className="seg-file">
          📂 Încarcă progresul
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              void load(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {msg && <p className="note">{msg}</p>}
    </section>
  )
}
