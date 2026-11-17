import { mascot } from '../mascots'
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { PLAYGROUND, type Word, type World } from '../content'
import type { Step } from '../lessons'
import { Mascot, type Mood } from '../components/Mascot'
import { Picture } from '../components/Picture'
import { instruction, speak, stopSpeaking, type Part } from '../speech'
import { sfx } from '../sfx'
import type { Settings } from '../progress'
import { MicButton, micFeedback, type MicResult } from '../components/MicButton'
import { micSupported } from '../recorder'
import { COMBO_EVERY } from '../gamify'
import { BOSS_HP } from '../lessons'
import { Boss, bossFor, type BossMood } from '../components/Boss'
import { WorldBackdrop } from '../components/WorldBackdrop'

const PRAISE = ['Great job!', 'Yes!', 'Awesome!', 'Super!', 'Well done!']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function introParts(mode: Settings['instructions'], w: Word): Part[] {
  return [
    ...instruction(mode, `${cap(w.ro)}. În engleză:`, `This is ${w.say}.`),
    { text: w.say, lang: 'en' },
    ...instruction(mode, 'Spune și tu!', 'Now you say it!'),
  ]
}

function promptParts(mode: Settings['instructions'], step: Step): Part[] {
  if (step.type === 'intro') return introParts(mode, step.word)
  const w = step.target
  if (step.type === 'speak')
    return [...instruction(mode, 'Spune tu:', 'Your turn:'), { text: w.say, lang: 'en' }]
  switch (step.type) {
    case 'listen':
      return instruction(mode, 'Unde e', `Where is ${w.say}?`, w.say)
    case 'house':
      return instruction(mode, 'Unde e', `Where is ${w.say}?`, w.say)
    case 'feed':
      return [...instruction(mode, 'Mi-e foame!', "I'm hungry!"), { text: `I want ${w.say}!`, lang: 'en' }]
    case 'dress':
      return [
        ...instruction(mode, 'Mă îmbraci?', 'Dress me up!'),
        { text: `I need my ${w.say}!`, lang: 'en' },
      ]
    default:
      return instruction(mode, 'Sparge balonul cu', `Pop the balloon with ${w.say}!`, w.say)
  }
}

function bubbleText(step: Step): string {
  if (step.type === 'intro') return `${cap(step.word.ro)} = ${step.word.en}`
  if (step.type === 'listen') return `Unde e ${step.target.en}?`
  if (step.type === 'speak') return `Spune tu: ${step.target.en}`
  if (step.type === 'house') return `Unde e ${step.target.en}?`
  if (step.type === 'feed' || step.type === 'dress') return `${mascot().name} vrea: ${step.target.en}!`
  return `Sparge balonul: ${step.target.en}!`
}

export interface BossResult {
  defeated: boolean
  /** Questions answered right on the first try. */
  correct: number
  /** Questions answered. */
  total: number
}

export function LessonScreen({
  steps,
  settings,
  world = PLAYGROUND,
  boss,
  onFinish,
  onExit,
}: {
  steps: Step[]
  settings: Settings
  world?: World
  /** Unit whose boss guards this stage; when set, first-try answers knock the boss out. */
  boss?: string
  onFinish: (mistakes: number, combos: number, boss?: BossResult) => void
  onExit: () => void
}) {
  const [bossHp, setBossHp] = useState(BOSS_HP)
  const [bossMood, setBossMood] = useState<BossMood>('idle')
  const bossInfo = bossFor(boss)
  const [throwKey, setThrowKey] = useState(0)
  const bossCorrect = useRef(0)
  const bossAnswered = useRef(0)
  const bossOver = useRef(false)
  const [index, setIndex] = useState(0)
  const [mood, setMood] = useState<Mood>('talk')
  const [combo, setCombo] = useState(0)
  const mistakes = useRef(0)
  const streak = useRef(0)
  const combos = useRef(0)
  const missedThisStep = useRef(false)
  const step = steps[index]
  useEffect(() => {
    missedThisStep.current = false
  }, [index])

  const sayPrompt = (slow?: boolean) => {
    setMood('talk')
    const intro =
      boss && index === 0 && !slow
        ? instruction(
            settings.instructions,
            `A venit ${bossInfo.name}!`,
            `Here comes ${bossInfo.name}!`,
          )
        : []
    void speak([...intro, ...promptParts(settings.instructions, step)], { slow }).then(() =>
      setMood((m) => (m === 'talk' ? 'idle' : m)),
    )
  }

  useEffect(() => {
    const t = setTimeout(() => sayPrompt(), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => () => stopSpeaking(), [])

  const bossResult = (): BossResult | undefined =>
    boss ? { defeated: bossOver.current, correct: bossCorrect.current, total: bossAnswered.current } : undefined

  const next = () => {
    if (index + 1 >= steps.length) onFinish(mistakes.current, combos.current, bossResult())
    else setIndex(index + 1)
  }

  const onCorrect = (w: Word, praise?: string) => {
    sfx.correct()
    setMood('happy')
    if (boss) {
      bossAnswered.current++
      if (!missedThisStep.current) {
        bossCorrect.current++
        setThrowKey((k) => k + 1)
        const hp = bossHp - 1
        setBossHp(hp)
        setTimeout(() => setBossMood(hp <= 0 ? 'down' : 'hit'), 380)
        if (hp <= 0) {
          bossOver.current = true
          setTimeout(() => sfx.fanfare(), 600)
          void speak([
            { text: 'You won!', lang: 'en' },
          ])
          setTimeout(() => onFinish(mistakes.current, combos.current, bossResult()), 2600)
          return
        }
        setTimeout(() => setBossMood('idle'), 1300)
      }
    }
    let isCombo = false
    if (missedThisStep.current) streak.current = 0
    else {
      streak.current++
      if (streak.current % COMBO_EVERY === 0) {
        isCombo = true
        combos.current++
        setCombo((c) => c + 1)
        setTimeout(() => sfx.fanfare(), 250)
      }
    }
    void speak([
      { text: praise ?? PRAISE[Math.floor(Math.random() * PRAISE.length)], lang: 'en' },
      { text: isCombo ? 'Super combo!' : w.say, lang: 'en' },
    ])
    setTimeout(next, isCombo ? 2300 : 1700)
  }

  const onWrong = (target: Word, attempt: number, custom?: Part[]) => {
    sfx.wrong()
    setMood('oops')
    if (boss) {
      setBossMood('laugh')
      setTimeout(() => setBossMood('idle'), 1300)
    }
    missedThisStep.current = true
    streak.current = 0
    if (attempt <= 2) mistakes.current++
    void speak(
      custom ?? [...instruction(settings.instructions, 'Mai încearcă!', 'Try again!'), { text: target.say, lang: 'en' }],
    )
    setTimeout(() => setMood('idle'), 1400)
  }

  const onMic = (w: Word, r: MicResult) => {
    if (r === 'no-mic') return
    setMood(r === 'heard' ? 'happy' : 'talk')
    void micFeedback(r, w, settings.instructions).then(() => setMood('idle'))
  }

  return (
    <div className="lesson-wrap">
      <WorldBackdrop world={world} />
    <div className="lesson">
      <header className="lesson-top">
        <button className="icon-btn" onClick={onExit} aria-label="Ieșire">
          ✕
        </button>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${(index / steps.length) * 100}%` }} />
        </div>
      </header>

      {boss && (
        <div className="boss-bar">
          <div className="boss-info">
            <b>{bossInfo.name}</b>
            <small className="boss-title">{bossInfo.title}</small>
            <span className="boss-hp" aria-label={`Viață: ${bossHp}`}>
              {Array.from({ length: BOSS_HP }, (_, i) => (
                <span key={i} className={i < bossHp ? 'on' : ''}>
                  ♥
                </span>
              ))}
            </span>
          </div>
          <div className="boss-stage">
            {throwKey > 0 && (
              <span className="throw-star" key={throwKey} aria-hidden>
                ⭐
              </span>
            )}
            <Boss unitId={boss} mood={bossMood} size={130} />
          </div>
        </div>
      )}

      <div className="lesson-guide">
        {step.type !== 'feed' && step.type !== 'dress' && <Mascot mood={mood} size={130} />}
        <div className="bubble">
          <span className="bubble-text">{bubbleText(step)}</span>
          <span className="speak-btns">
            <button className="speak-btn" onClick={() => sayPrompt(false)} aria-label="Ascultă din nou">
              🔊
            </button>
            <button className="speak-btn" onClick={() => sayPrompt(true)} aria-label="Ascultă rar">
              🐢
            </button>
          </span>
        </div>
      </div>

      <main className="lesson-stage" key={index}>
        {step.type === 'intro' && (
          <Intro word={step.word} onNext={next} settings={settings} onMic={(r) => onMic(step.word, r)} />
        )}
        {step.type === 'speak' && (
          <SayIt word={step.target} settings={settings} onNext={next} onMic={(r) => onMic(step.target, r)} />
        )}
        {step.type === 'listen' && (
          <ListenTap target={step.target} choices={step.choices} onCorrect={onCorrect} onWrong={onWrong} />
        )}
        {step.type === 'balloons' && (
          <Balloons target={step.target} choices={step.choices} onCorrect={onCorrect} onWrong={onWrong} />
        )}
        {step.type === 'house' && (
          <House target={step.target} choices={step.choices} onCorrect={onCorrect} onWrong={onWrong} />
        )}
        {step.type === 'dress' && (
          <Feed
            target={step.target}
            choices={step.choices}
            mood={mood}
            happy="✨"
            onCorrect={(w) => onCorrect(w, 'Thank you!')}
            onWrong={(t, a) =>
              onWrong(t, a, [
                { text: 'Not that one!', lang: 'en' },
                { text: `I need my ${t.say}!`, lang: 'en' },
              ])
            }
          />
        )}
        {step.type === 'feed' && (
          <Feed
            target={step.target}
            choices={step.choices}
            mood={mood}
            onCorrect={(w) => onCorrect(w, 'Yummy!')}
            onWrong={(t, a) =>
              onWrong(t, a, [
                { text: 'No, thank you!', lang: 'en' },
                { text: `I want ${t.say}!`, lang: 'en' },
              ])
            }
          />
        )}
      </main>
      {combo > 0 && (
        <div className="combo" key={combo} aria-live="polite">
          <span>🔥 Super combo!</span>
          <span className="combo-plus">+1 ⭐</span>
        </div>
      )}
    </div>
    </div>
  )
}

function SayIt({
  word,
  settings,
  onNext,
  onMic,
}: {
  word: Word
  settings: Settings
  onNext: () => void
  onMic: (r: MicResult) => void
}) {
  const [canSkip, setCanSkip] = useState(false)
  const [tries, setTries] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), 4000)
    return () => clearTimeout(t)
  }, [])
  const handle = (r: MicResult) => {
    if (r === 'no-mic') return onNext()
    onMic(r)
    setTries((n) => n + 1)
    setCanSkip(true)
    if (r === 'heard' || tries + 1 >= 3) setTimeout(onNext, 2600)
  }
  return (
    <div className="intro">
      <div className="card card-big pop-in">
        <Picture word={word} size={180} />
        <span className="card-word">{word.en}</span>
      </div>
      <MicButton word={word} recognize={settings.micCheck} onResult={handle} />
      <button className={`go-btn ${canSkip ? 'go-ready' : ''}`} onClick={onNext} aria-label="Mai departe">
        ➜
      </button>
    </div>
  )
}

function Intro({
  word,
  onNext,
  settings,
  onMic,
}: {
  word: Word
  onNext: () => void
  settings: Settings
  onMic: (r: MicResult) => void
}) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1800)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="intro">
      <button
        className="card card-big pop-in"
        onClick={() => {
          sfx.tap()
          void speak([{ text: word.say, lang: 'en' }])
        }}
        aria-label={word.en}
      >
        <Picture word={word} size={200} />
        <span className="card-word">{word.en}</span>
      </button>
      {settings.mic && micSupported() && (
        <MicButton word={word} recognize={settings.micCheck} size="small" onResult={onMic} />
      )}
      <button className={`go-btn ${ready ? 'go-ready' : ''}`} onClick={onNext} aria-label="Mai departe">
        ➜
      </button>
    </div>
  )
}

interface ChoiceProps {
  target: Word
  choices: Word[]
  onCorrect: (w: Word) => void
  onWrong: (target: Word, attempt: number) => void
}

function House(props: ChoiceProps) {
  const { wrong, done, hint, pick } = useChoice(props)
  return (
    <div className="house">
      <div className="house-roof">
        <span className="house-chimney" />
      </div>
      <div className="house-wall">
        {props.choices.map((w, i) => {
          const isTarget = w.id === props.target.id
          const cls = [
            'window',
            wrong.includes(w.id) ? 'window-wrong' : '',
            done && isTarget ? 'window-right' : '',
            hint && isTarget ? 'window-hint' : '',
          ].join(' ')
          return (
            <button key={w.id} className={cls} onClick={() => pick(w)} aria-label={w.en} style={{ animationDelay: `${i * 120}ms` }}>
              <span className="window-glass">
                <Picture word={w} size={96} />
              </span>
              <span className="shutter shutter-l" style={{ animationDelay: `${300 + i * 150}ms` }} />
              <span className="shutter shutter-r" style={{ animationDelay: `${300 + i * 150}ms` }} />
            </button>
          )
        })}
        <span className="house-door" />
      </div>
    </div>
  )
}

function Feed(props: ChoiceProps & { mood: Mood; happy?: string }) {
  const { wrong, done, hint, pick } = useChoice(props)
  const dinoRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; sx: number; sy: number; moved: boolean } | null>(null)
  const [eaten, setEaten] = useState<{ id: string; dx: number; dy: number } | null>(null)

  const overDino = (x: number, y: number) => {
    const r = dinoRef.current?.getBoundingClientRect()
    return !!r && x > r.left && x < r.right && y > r.top && y < r.bottom
  }

  const feed = (w: Word, el: HTMLElement) => {
    const ok = pick(w)
    if (ok) {
      const a = el.getBoundingClientRect()
      const b = dinoRef.current!.getBoundingClientRect()
      setEaten({ id: w.id, dx: b.left + b.width * 0.55 - (a.left + a.width / 2), dy: b.top + b.height * 0.45 - (a.top + a.height / 2) })
    }
  }

  const down = (e: RPointerEvent<HTMLButtonElement>, w: Word) => {
    if (done) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id: w.id, x: 0, y: 0, sx: e.clientX, sy: e.clientY, moved: false })
  }
  const move = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    const x = e.clientX - drag.sx
    const y = e.clientY - drag.sy
    setDrag({ ...drag, x, y, moved: drag.moved || Math.hypot(x, y) > 12 })
  }
  const up = (e: RPointerEvent<HTMLButtonElement>, w: Word) => {
    if (!drag) return
    const wasDrag = drag.moved
    setDrag(null)
    if (!wasDrag || overDino(e.clientX, e.clientY)) feed(w, e.currentTarget)
  }

  return (
    <div className="feed">
      <div className="feed-dino" ref={dinoRef}>
        <Mascot mood={done ? 'happy' : props.mood === 'oops' ? 'oops' : 'talk'} size={210} />
        {done && <span className="yum">{props.happy ?? '😋'}</span>}
      </div>
      <div className="feed-table">
        {props.choices.map((w) => {
          const isTarget = w.id === props.target.id
          const d = drag?.id === w.id ? drag : null
          const gone = eaten?.id === w.id ? eaten : null
          const style = gone
            ? { transform: `translate(${gone.dx}px, ${gone.dy}px) scale(0.2)`, opacity: 0, transition: 'transform 0.6s ease-in, opacity 0.6s 0.3s' }
            : d
              ? { transform: `translate(${d.x}px, ${d.y}px) scale(1.1)`, zIndex: 5, transition: 'none' }
              : undefined
          const cls = [
            'food',
            wrong.includes(w.id) ? 'food-wrong' : '',
            hint && isTarget ? 'food-hint' : '',
            done && !isTarget ? 'food-fade' : '',
          ].join(' ')
          return (
            <button
              key={`${w.id}-${wrong.filter((x) => x === w.id).length}`}
              className={cls}
              style={style}
              onPointerDown={(e) => down(e, w)}
              onPointerMove={move}
              onPointerUp={(e) => up(e, w)}
              onPointerCancel={() => setDrag(null)}
              onClick={(e) => e.detail === 0 && feed(w, e.currentTarget)}
              aria-label={w.en}
            >
              <Picture word={w} size={110} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function useChoice({ target, onCorrect, onWrong }: ChoiceProps) {
  const [wrong, setWrong] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const attempts = useRef(0)
  const pick = (w: Word) => {
    if (done) return false
    if (w.id === target.id) {
      setDone(true)
      onCorrect(w)
      return true
    }
    attempts.current++
    setWrong((x) => [...x, w.id])
    onWrong(target, attempts.current)
    return false
  }
  return { wrong, done, hint: attempts.current >= 2 && !done, pick }
}

function ListenTap(props: ChoiceProps) {
  const { wrong, done, hint, pick } = useChoice(props)
  return (
    <div className="choices">
      {props.choices.map((w, i) => {
        const isTarget = w.id === props.target.id
        const cls = [
          'card',
          'pop-in',
          wrong.includes(w.id) ? 'card-wrong' : '',
          done && isTarget ? 'card-right' : '',
          hint && isTarget ? 'card-hint' : '',
        ].join(' ')
        return (
          <button
            key={`${w.id}-${wrong.filter((x) => x === w.id).length}`}
            className={cls}
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => pick(w)}
            aria-label={w.en}
          >
            <Picture word={w} size={150} />
          </button>
        )
      })}
    </div>
  )
}

/** Seconds for a balloon to float from bottom to top (slowest adds up to 4 more). */
const BALLOON_SECONDS = 20
const BALLOON_COLORS = ['#ff6b8b', '#ffc93c', '#6bcBff', '#b98bff', '#7be495', '#ff9f5a']

function Balloons(props: ChoiceProps) {
  const { wrong, done, hint, pick } = useChoice(props)
  const [popped, setPopped] = useState<string | null>(null)
  const layout = useMemo(
    () =>
      props.choices.map((_, i) => {
        // Slow, calm float so a 5-year-old has time to aim and tap.
        const duration = BALLOON_SECONDS + Math.random() * 4
        return {
          left: Math.min(1, Math.max(0, (i + (Math.random() - 0.5) * 0.3) / (props.choices.length - 1))),
          delay: -(0.15 + Math.random() * 0.55) * duration,
          duration,
          color: BALLOON_COLORS[(i + Math.floor(Math.random() * 6)) % BALLOON_COLORS.length],
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <div className="balloon-sky">
      {props.choices.map((w, i) => {
        const l = layout[i]
        const isTarget = w.id === props.target.id
        const isColorWord = w.visual.kind === 'color'
        const fill = isColorWord ? (w.visual as { value: string }).value : l.color
        const cls = [
          'balloon',
          popped === w.id ? 'balloon-popped' : '',
          wrong.includes(w.id) ? 'balloon-wrong' : '',
          hint && isTarget ? 'balloon-hint' : '',
          done && !isTarget ? 'balloon-fade' : '',
        ].join(' ')
        return (
          <button
            key={w.id}
            className={cls}
            style={{
              left: `calc((100% - var(--bw)) * ${l.left})`,
              animationDelay: `${l.delay}s`,
              animationDuration: `${l.duration}s`,
            }}
            onClick={() => {
              if (pick(w)) {
                sfx.pop()
                setPopped(w.id)
              }
            }}
            aria-label={w.en}
          >
            <svg viewBox="0 0 120 170" className="balloon-svg">
              <path d="M60 128 Q 52 150 62 168" stroke="#9aa5b8" strokeWidth="2.5" fill="none" />
              <path d="M54 124 L 66 124 L 60 132 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
              <ellipse cx="60" cy="64" rx="54" ry="62" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
              <ellipse cx="38" cy="34" rx="12" ry="18" fill="#fff" opacity="0.4" transform="rotate(25 38 34)" />
            </svg>
            {!isColorWord && (
              <span className="balloon-pic">
                <Picture word={w} size={74} />
              </span>
            )}
            {popped === w.id && <span className="burst">✨</span>}
          </button>
        )
      })}
    </div>
  )
}
