import { useEffect, useMemo, useRef, useState } from 'react'
import type { Word } from '../content'
import type { Step } from '../lessons'
import { Dino, type Mood } from '../components/Dino'
import { Picture } from '../components/Picture'
import { instruction, speak, stopSpeaking, type Part } from '../speech'
import { sfx } from '../sfx'
import type { Settings } from '../progress'

const PRAISE = ['Great job!', 'Yes!', 'Awesome!', 'Super!', 'Well done!']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function introParts(mode: Settings['instructions'], w: Word): Part[] {
  return [
    ...instruction(mode, `${cap(w.ro)}. În engleză se spune:`, `This is ${w.say}.`),
    { text: w.say, lang: 'en' },
    ...instruction(mode, 'Spune și tu!', 'Now you say it!'),
  ]
}

function promptParts(mode: Settings['instructions'], step: Step): Part[] {
  if (step.type === 'intro') return introParts(mode, step.word)
  const w = step.target
  return step.type === 'listen'
    ? instruction(mode, 'Unde este', `Where is ${w.say}?`, w.say)
    : instruction(mode, 'Sparge balonul cu', `Pop the balloon with ${w.say}!`, w.say)
}

function bubbleText(step: Step): string {
  if (step.type === 'intro') return `${cap(step.word.ro)} = ${step.word.en}`
  if (step.type === 'listen') return `Unde este ${step.target.en}?`
  return `Sparge balonul: ${step.target.en}!`
}

export function LessonScreen({
  steps,
  settings,
  onFinish,
  onExit,
}: {
  steps: Step[]
  settings: Settings
  onFinish: (mistakes: number) => void
  onExit: () => void
}) {
  const [index, setIndex] = useState(0)
  const [mood, setMood] = useState<Mood>('talk')
  const mistakes = useRef(0)
  const step = steps[index]

  const sayPrompt = (slow?: boolean) => {
    setMood('talk')
    void speak(promptParts(settings.instructions, step), { slow }).then(() =>
      setMood((m) => (m === 'talk' ? 'idle' : m)),
    )
  }

  useEffect(() => {
    const t = setTimeout(() => sayPrompt(), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => () => stopSpeaking(), [])

  const next = () => {
    if (index + 1 >= steps.length) onFinish(mistakes.current)
    else setIndex(index + 1)
  }

  const onCorrect = (w: Word) => {
    sfx.correct()
    setMood('happy')
    void speak([{ text: PRAISE[Math.floor(Math.random() * PRAISE.length)], lang: 'en' }, { text: w.say, lang: 'en' }])
    setTimeout(next, 1700)
  }

  const onWrong = (target: Word, attempt: number) => {
    sfx.wrong()
    setMood('oops')
    if (attempt <= 2) mistakes.current++
    void speak([...instruction(settings.instructions, 'Mai încearcă!', 'Try again!'), { text: target.say, lang: 'en' }])
    setTimeout(() => setMood('idle'), 1400)
  }

  return (
    <div className="lesson">
      <header className="lesson-top">
        <button className="icon-btn" onClick={onExit} aria-label="Ieșire">
          ✕
        </button>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${(index / steps.length) * 100}%` }} />
        </div>
      </header>

      <div className="lesson-guide">
        <Dino mood={mood} size={130} />
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
        {step.type === 'intro' && <Intro word={step.word} onNext={next} />}
        {step.type === 'listen' && (
          <ListenTap target={step.target} choices={step.choices} onCorrect={onCorrect} onWrong={onWrong} />
        )}
        {step.type === 'balloons' && (
          <Balloons target={step.target} choices={step.choices} onCorrect={onCorrect} onWrong={onWrong} />
        )}
      </main>
    </div>
  )
}

function Intro({ word, onNext }: { word: Word; onNext: () => void }) {
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

const BALLOON_COLORS = ['#ff6b8b', '#ffc93c', '#6bcBff', '#b98bff', '#7be495', '#ff9f5a']

function Balloons(props: ChoiceProps) {
  const { wrong, done, hint, pick } = useChoice(props)
  const [popped, setPopped] = useState<string | null>(null)
  const layout = useMemo(
    () =>
      props.choices.map((_, i) => ({
        left: Math.min(1, Math.max(0, (i + (Math.random() - 0.5) * 0.3) / (props.choices.length - 1))),
        delay: -Math.random() * 6,
        duration: 9 + Math.random() * 3,
        color: BALLOON_COLORS[(i + Math.floor(Math.random() * 6)) % BALLOON_COLORS.length],
      })),
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
