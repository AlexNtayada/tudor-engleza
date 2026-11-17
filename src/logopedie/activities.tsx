import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { Ninja, type Mood } from '../components/Ninja'
import { getCamera } from '../recorder'
import { speakRo, stopSpeaking } from '../speech'
import { sfx } from '../sfx'
import {
  buildListenRounds,
  POSITIONS,
  RO_NUMBERS,
  sillyForm,
  type ActivityId,
  type Position,
  type SoundInfo,
  type SpeechWord,
} from './data'
import { Mouth } from './Mouth'
import { TakeMic } from './TakeMic'

export interface ActivityProps {
  s: SoundInfo
  /** Keep recordings for the parent. */
  save: boolean
  micOk: boolean
  hasRo: boolean
  onFinish: () => void
  onBack: () => void
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** The word with the practised sound highlighted. */
export function Marked({ text, sound }: { text: string; sound: string }) {
  return (
    <span className="lp-word">
      {[...text].map((ch, i) =>
        ch.toLowerCase() === sound ? (
          <b key={i} className="lp-hl">
            {ch}
          </b>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  )
}

function Shell({
  title,
  onBack,
  mood,
  bubble,
  onRepeat,
  done,
  total,
  children,
  className = '',
}: {
  title: string
  onBack: () => void
  mood: Mood
  bubble: React.ReactNode
  onRepeat?: () => void
  done?: number
  total?: number
  children: React.ReactNode
  className?: string
}) {
  useEffect(() => () => stopSpeaking(), [])
  return (
    <div className={`lp-activity ${className}`}>
      <header className="lp-top">
        <button className="icon-btn" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
        <h2>{title}</h2>
        {total !== undefined && (
          <div className="progress" aria-hidden>
            <div className="progress-fill" style={{ width: `${((done ?? 0) / total) * 100}%` }} />
          </div>
        )}
      </header>
      <div className="lesson-guide lp-guide">
        <Ninja mood={mood} size={104} />
        <div className="bubble">
          <span>{bubble}</span>
          {onRepeat && (
            <button className="speak-btn" onClick={onRepeat} aria-label="Ascultă din nou">
              🔊
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

/**
 * Record with the mic when it works; otherwise a big thumbs-up the parent taps after Tudor says it.
 */
function Say(props: {
  s: SoundInfo
  activity: ActivityId
  label: string
  save: boolean
  micOk: boolean
  maxMs?: number
  onLevel?: (v: number) => void
  onStart?: () => void
  onDone: () => void
}) {
  const [noMic, setNoMic] = useState(!props.micOk)
  if (noMic)
    return (
      <button className="go-btn go-ready lp-thumb" onClick={props.onDone} aria-label="Am spus">
        👍
      </button>
    )
  return (
    <TakeMic
      sound={props.s.id}
      activity={props.activity}
      label={props.label}
      save={props.save}
      maxMs={props.maxMs}
      onLevel={props.onLevel}
      onStart={props.onStart}
      onDone={(r) => (r === 'no-mic' ? setNoMic(true) : props.onDone())}
    />
  )
}

/* ---------------- 1. Mouth warm-up ---------------- */

function MirrorView({ onClose }: { onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let alive = true
    let stream: MediaStream | undefined
    void getCamera().then((st) => {
      if (!alive) return st?.getTracks().forEach((t) => t.stop())
      if (!st) return setFailed(true)
      stream = st
      if (video.current) video.current.srcObject = st
    })
    return () => {
      alive = false
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])
  return (
    <div className="lp-mirror">
      {failed ? (
        <p>Nu am acces la cameră. Folosiți o oglindă adevărată 🙂</p>
      ) : (
        <video ref={video} autoPlay muted playsInline />
      )}
      <button className="icon-btn lp-mirror-close" onClick={onClose} aria-label="Închide oglinda">
        ✕
      </button>
    </div>
  )
}

export function WarmUp({ s, hasRo, onFinish, onBack }: ActivityProps) {
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'show' | 'count' | 'done'>('show')
  const [count, setCount] = useState(0)
  const [mirror, setMirror] = useState(false)
  const token = useRef(0)
  const ex = s.exercises[i]

  useEffect(() => {
    token.current++
    setPhase('show')
    setCount(0)
    const t = setTimeout(() => void speakRo(ex.say), 300)
    return () => {
      clearTimeout(t)
      token.current++
    }
  }, [ex])

  const go = async () => {
    const my = ++token.current
    setPhase('count')
    sfx.tap()
    for (let n = 1; n <= ex.count; n++) {
      if (token.current !== my) return
      setCount(n)
      await Promise.all([speakRo(RO_NUMBERS[n - 1]), wait(hasRo ? 650 : 1100)])
    }
    if (token.current !== my) return
    setPhase('done')
    sfx.correct()
    void speakRo('Bravo!')
  }

  const next = () => {
    sfx.tap()
    if (i + 1 < s.exercises.length) setI(i + 1)
    else onFinish()
  }

  return (
    <Shell
      title="Gimnastica limbii"
      onBack={onBack}
      mood={phase === 'done' ? 'happy' : 'talk'}
      bubble={
        <>
          <b>
            {ex.emoji} {ex.name}.
          </b>{' '}
          {phase === 'done' ? 'Bravo! Ai făcut ca mine!' : ex.say}
        </>
      }
      onRepeat={() => void speakRo(ex.say)}
      done={i + (phase === 'done' ? 1 : 0)}
      total={s.exercises.length}
    >
      <div className="lp-stage lp-warm">
        <div className="lp-mouth-wrap">
          <Mouth anim={ex.id} />
          {mirror && <MirrorView onClose={() => setMirror(false)} />}
        </div>
        <div className="lp-count" aria-label={`${count} din ${ex.count}`}>
          {Array.from({ length: ex.count }, (_, n) => (
            <span key={n} className={n < count ? 'on' : ''}>
              {n < count ? n + 1 : ''}
            </span>
          ))}
        </div>
        <div className="lp-actions">
          {!mirror && (
            <button className="pill pill-btn lp-mirror-btn" onClick={() => setMirror(true)}>
              🪞 Oglinda
            </button>
          )}
          {phase === 'show' && (
            <button className="big-btn" onClick={() => void go()}>
              ▶ Hai!
            </button>
          )}
          {phase === 'count' && <span className="lp-counting">{RO_NUMBERS[count - 1] ?? ''}</span>}
          {phase === 'done' && (
            <button className="go-btn go-ready" onClick={next} aria-label="Mai departe">
              ➜
            </button>
          )}
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- 2. The long sound ---------------- */

const SOUND_SAY: Record<string, { ask: string; goal: string }> = {
  r: {
    ask: 'Pornește motorașul! Spune rrrrr cât poți de lung, cu limba sus, după dinți.',
    goal: 'Ura! Motorașul a ajuns la steag!',
  },
  l: {
    ask: 'Cântă ca păsărica: llllll, cu vârful limbii sus, după dinți.',
    goal: 'Ura! Păsărica a ajuns în copac!',
  },
}

export function SoundRace({ s, save, micOk, onFinish, onBack }: ActivityProps) {
  const say = SOUND_SAY[s.id]
  const [pos, setPos] = useState(0)
  const [moving, setMoving] = useState(false)
  const [reached, setReached] = useState(false)
  const posRef = useRef(0)
  const floor = useRef<number[]>([])
  const hold = useRef<number | undefined>(undefined)

  useEffect(() => {
    const t = setTimeout(() => void speakRo(say.ask), 300)
    return () => {
      clearTimeout(t)
      clearInterval(hold.current)
    }
  }, [say])

  const advance = (step: number) => {
    if (posRef.current >= 100) return
    posRef.current = Math.min(100, posRef.current + step)
    setPos(posRef.current)
    if (posRef.current >= 100) {
      setReached(true)
      setMoving(false)
      sfx.fanfare()
    }
  }

  const onLevel = (v: number) => {
    // Learn the room's background noise from the first frames, then move while there is sound.
    if (floor.current.length < 10) {
      floor.current.push(v)
      return
    }
    const thr = Math.max(0.12, Math.min(...floor.current) * 2.5)
    const on = v > thr
    setMoving(on)
    if (on) advance(0.4)
  }

  const finishSoon = () => {
    void speakRo(say.goal)
    setTimeout(onFinish, 1800)
  }

  const startHold = () => {
    clearInterval(hold.current)
    setMoving(true)
    hold.current = window.setInterval(() => advance(0.8), 30)
  }
  const endHold = () => {
    clearInterval(hold.current)
    setMoving(false)
    if (posRef.current >= 100) finishSoon()
  }

  return (
    <Shell
      title={`Sunetul ${s.letter}`}
      onBack={onBack}
      mood={reached ? 'dance' : moving ? 'happy' : 'talk'}
      bubble={reached ? say.goal : say.ask}
      onRepeat={() => void speakRo(say.ask)}
      done={pos}
      total={100}
    >
      <div className="lp-stage">
        <div className={`lp-track lp-track-${s.id}`}>
          <span className="lp-goal">{s.goal}</span>
          <span
            className={`lp-vehicle ${moving ? 'moving' : ''}`}
            style={{ left: `calc(${pos}% * 0.82)` }}
          >
            <span className="lp-flip">{s.vehicle}</span>
            {moving && <span className="lp-puff">{s.long}</span>}
          </span>
        </div>
        <p className="lp-big-letter" style={{ color: s.color }}>
          {s.long.toUpperCase()}
        </p>
        <div className="lp-actions">
          {!reached && micOk && (
            <Say
              s={s}
              activity="sound"
              label={s.long}
              save={save}
              micOk={micOk}
              maxMs={6000}
              onLevel={onLevel}
              onStart={() => (floor.current = [])}
              onDone={() => {
                setMoving(false)
                if (posRef.current >= 100) finishSoon()
                else void speakRo('Bravo! Încă o dată!')
              }}
            />
          )}
          {!reached && (
            <button
              className="pill pill-btn lp-hold"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onContextMenu={(e) => e.preventDefault()}
            >
              ✋ Ține apăsat cât spune
            </button>
          )}
          {reached && (
            <button className="go-btn go-ready" onClick={onFinish} aria-label="Mai departe">
              ➜
            </button>
          )}
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- 3. Syllable train ---------------- */

export function Syllables({ s, save, micOk, onFinish, onBack }: ActivityProps) {
  const [row, setRow] = useState(0)
  const [sel, setSel] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [leaving, setLeaving] = useState(false)
  const items = s.rows[row].items
  const sayItem = (i: number) => void speakRo(items[i].toLowerCase())

  useEffect(() => {
    setSel(0)
    setDone(new Set())
    setLeaving(false)
    const t = setTimeout(() => void speakRo(['Spune după mine:', items[0].toLowerCase()]), 300)
    return () => clearTimeout(t)
  }, [row, items])

  const said = () => {
    const next = new Set(done).add(sel)
    setDone(next)
    sfx.correct()
    if (next.size === items.length) {
      setLeaving(true)
      sfx.fanfare()
      void speakRo('Tu-tuuu! Bravo!')
      setTimeout(onFinish, 2200)
      return
    }
    const n = items.findIndex((_, i) => !next.has(i) && i > sel)
    const target = n === -1 ? items.findIndex((_, i) => !next.has(i)) : n
    setTimeout(() => {
      setSel(target)
      sayItem(target)
    }, 500)
  }

  return (
    <Shell
      title="Trenul silabelor"
      onBack={onBack}
      mood={leaving ? 'dance' : 'talk'}
      bubble={leaving ? 'Tu-tuuu! Trenul pleacă!' : <>Spune după mine: <b>{items[sel]}</b></>}
      onRepeat={() => sayItem(sel)}
      done={done.size}
      total={items.length}
    >
      <div className="lp-tabs" role="tablist">
        {s.rows.map((r, i) => (
          <button key={r.name} className={i === row ? 'on' : ''} onClick={() => setRow(i)} role="tab">
            {r.name}
          </button>
        ))}
      </div>
      <div className="lp-stage">
        <div className={`lp-train ${leaving ? 'leaving' : ''}`}>
          {items.map((it, i) => (
            <button
              key={it}
              className={`lp-wagon ${i === sel ? 'sel' : ''} ${done.has(i) ? 'done' : ''}`}
              style={{ '--c': s.color } as React.CSSProperties}
              onClick={() => {
                setSel(i)
                sayItem(i)
              }}
            >
              <span>{it}</span>
              {done.has(i) && <i>⭐</i>}
            </button>
          ))}
          <span className="lp-engine lp-flip">🚂</span>
        </div>
        <div className="lp-actions">
          {!leaving && (
            <Say key={`${row}-${sel}`} s={s} activity="syllables" label={items[sel]} save={save} micOk={micOk} onDone={said} />
          )}
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- 4. Words ---------------- */

export function Words({ s, save, micOk, onFinish, onBack }: ActivityProps) {
  const [position, setPosition] = useState<Position>('start')
  const [idx, setIdx] = useState(0)
  const [cheer, setCheer] = useState(false)
  const list = s.words[position]
  const word = list[idx]

  useEffect(() => {
    setCheer(false)
    const t = setTimeout(() => void speakRo(word.text), 350)
    return () => clearTimeout(t)
  }, [word])

  const said = () => {
    setCheer(true)
    sfx.correct()
    void speakRo(['Bravo!', word.text])
    setTimeout(() => {
      if (idx + 1 < list.length) setIdx(idx + 1)
      else onFinish()
    }, 1600)
  }

  return (
    <Shell
      title="Cuvinte"
      onBack={onBack}
      mood={cheer ? 'happy' : 'talk'}
      bubble={cheer ? 'Bravo!' : 'Spune după mine!'}
      onRepeat={() => void speakRo(word.text)}
      done={idx + (cheer ? 1 : 0)}
      total={list.length}
    >
      <div className="lp-tabs" role="tablist">
        {POSITIONS.map((p) => (
          <button
            key={p.id}
            className={p.id === position ? 'on' : ''}
            onClick={() => {
              setPosition(p.id)
              setIdx(0)
            }}
            role="tab"
          >
            <span className="lp-mark">{p.mark(s.letter)}</span> {p.label}
          </button>
        ))}
      </div>
      <div className="lp-stage">
        <div className={`card card-big lp-word-card ${cheer ? 'card-right' : ''}`} key={word.text}>
          <span className="lp-emoji">{word.emoji}</span>
          <Marked text={word.text} sound={s.id} />
          <div className="speak-btns">
            <button className="speak-btn" onClick={() => void speakRo(word.text)} aria-label="Ascultă">
              🔊
            </button>
            <button
              className="speak-btn"
              onClick={() => void speakRo(word.syl.split('-'), { slow: true })}
              aria-label="Ascultă rar, pe silabe"
            >
              🐢
            </button>
          </div>
          <span className="lp-syl">{word.syl}</span>
        </div>
        <div className="lp-actions">
          {!cheer && <Say key={word.text} s={s} activity="words" label={word.text} save={save} micOk={micOk} onDone={said} />}
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- 5. Listening: did Ninja say it right? ---------------- */

export function Listen({ s, hasRo, onFinish, onBack }: ActivityProps) {
  const rounds = useMemo(() => buildListenRounds(s.id, 6), [s.id])
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState<'right' | 'oops' | undefined>()
  const round = rounds[idx]
  const said = (r: { word: SpeechWord; silly: boolean }) => (r.silly ? sillyForm(r.word.text, s.id) : r.word.text)

  useEffect(() => {
    setAnswer(undefined)
    const t = setTimeout(() => void speakRo(idx === 0 ? ['Ascultă bine!', said(round)] : said(round)), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  if (!hasRo)
    return (
      <Shell title="Urechiușa" onBack={onBack} mood="oops" bubble="Aici am nevoie de voce în română.">
        <p className="note warn lp-note">
          Pe acest dispozitiv nu există o voce românească, așa că Ninja nu poate rosti cuvintele. Jocul merge în
          Microsoft Edge pe Windows (sau pe un telefon cu voce română). Până atunci îl puteți juca voi: spuneți un cuvânt
          corect sau „cu i” (rață / iață), iar Tudor ghicește.
        </p>
      </Shell>
    )

  const pick = (thinksSilly: boolean) => {
    if (answer) return
    const right = thinksSilly === round.silly
    setAnswer(right ? 'right' : 'oops')
    if (right) sfx.correct()
    else sfx.tap()
    const text = round.word.text
    void speakRo(
      right
        ? round.silly
          ? ['Exact! Ninja a greșit. Corect este:', text]
          : ['Da! Ninja a spus bine:', text]
        : round.silly
          ? ['Ascultă: Ninja a zis', sillyForm(text, s.id), 'Corect este:', text]
          : ['Ninja a spus bine:', text],
    )
  }

  const next = () => {
    sfx.tap()
    if (idx + 1 < rounds.length) setIdx(idx + 1)
    else onFinish()
  }

  const bubble = !answer ? (
    'Ninja a spus bine?'
  ) : answer === 'right' ? (
    round.silly ? (
      <>
        Exact! Corect este <Marked text={round.word.text} sound={s.id} />
      </>
    ) : (
      'Da! Ninja a spus bine.'
    )
  ) : round.silly ? (
    <>
      Ninja a zis „{sillyForm(round.word.text, s.id)}”. Corect: <Marked text={round.word.text} sound={s.id} />
    </>
  ) : (
    'Ninja a spus bine de data asta!'
  )

  return (
    <Shell
      title="Urechiușa"
      onBack={onBack}
      mood={answer === 'right' ? 'happy' : 'talk'}
      bubble={bubble}
      onRepeat={() => void speakRo(said(round))}
      done={idx + (answer ? 1 : 0)}
      total={rounds.length}
    >
      <div className="lp-stage">
        <div className="card card-big lp-word-card" key={idx}>
          <span className="lp-emoji">{round.word.emoji}</span>
          {answer && <Marked text={round.word.text} sound={s.id} />}
        </div>
        <div className="lp-actions">
          {!answer ? (
            <>
              <button className="lp-choice lp-choice-ok" onClick={() => pick(false)}>
                <span>👍</span>A spus bine
              </button>
              <button className="lp-choice lp-choice-silly" onClick={() => pick(true)}>
                <span>🙃</span>A greșit!
              </button>
            </>
          ) : (
            <button className="go-btn go-ready" onClick={next} aria-label="Mai departe">
              ➜
            </button>
          )}
        </div>
      </div>
    </Shell>
  )
}
