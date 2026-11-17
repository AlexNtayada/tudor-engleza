import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { Word } from '../content'
import { Mascot, type Mood } from '../components/Mascot'
import { Picture } from '../components/Picture'
import { MicButton, micFeedback, type MicResult } from '../components/MicButton'
import { WorldBackdrop } from '../components/WorldBackdrop'
import { micSupported } from '../recorder'
import { instruction, speak, stopSpeaking, type Part } from '../speech'
import { sfx } from '../sfx'
import type { Progress, Settings } from '../progress'
import { PACKS, type Pack, type Sentence, type Thing } from './data'
import { splitAtKey, type SentenceStep } from './lessons'
import './propozitii.css'

const PRAISE = ['Great job!', 'Yes!', 'Awesome!', 'Super!', 'Well done!']

/** English part for the voice. */
const sayEn = (text: string): Part => ({ text, lang: 'en' })

/** A sentence as a Word, so the microphone can listen for its key word. */
function asWord(s: Sentence): Word {
  const first = s.scene.find((t) => t.e)?.e ?? '💬'
  return { id: s.id, say: s.text, en: s.text, ro: s.ro, visual: { kind: 'emoji', value: first }, check: s.key }
}

/** Draws a scene: emoji (repeated or scaled), colour blobs or digits. */
export function Scene({ things, size = 150 }: { things: Thing[]; size?: number }) {
  const count = things.reduce((n, t) => n + (t.n ?? 1), 0)
  const base = count > 3 ? size * 0.27 : count > 1 ? size * 0.34 : size * 0.4
  return (
    <span className="pz-scene" style={{ width: size, height: size }}>
      {things.flatMap((t, i) =>
        Array.from({ length: t.n ?? 1 }, (_, j) => {
          const key = `${i}-${j}`
          if (t.c)
            return (
              <Picture key={key} word={{ id: key, say: '', en: '', ro: '', visual: { kind: 'color', value: t.c } }} size={size * 0.8} />
            )
          if (t.digit !== undefined)
            return (
              <Picture
                key={key}
                word={{ id: key, say: '', en: '', ro: '', visual: { kind: 'number', value: t.digit } }}
                size={size * 0.85}
              />
            )
          return (
            <span key={key} className="pz-emoji-thing" style={{ fontSize: base * (t.s ?? 1) }} aria-hidden>
              {t.e}
            </span>
          )
        }),
      )}
    </span>
  )
}

/** The sentence as word bubbles. Tap a word to hear it. The key word can be hidden ("?") until found. */
function Chips({
  sentence,
  hideKey = false,
  active = -1,
}: {
  sentence: Sentence
  hideKey?: boolean
  active?: number
}) {
  const words = sentence.text.split(' ')
  return (
    <div className="pz-chips" aria-label={hideKey ? undefined : sentence.text}>
      {words.map((w, i) => {
        const isKey = w.toLowerCase() === sentence.key.toLowerCase()
        if (isKey && hideKey)
          return (
            <span key={i} className="pz-chip pz-chip-blank">
              ?
            </span>
          )
        return (
          <button
            key={i}
            className={`pz-chip ${isKey ? 'pz-chip-key' : ''} ${active === i ? 'pz-chip-on' : ''}`}
            onClick={() => {
              sfx.tap()
              void speak([sayEn(w)])
            }}
          >
            {w}
          </button>
        )
      })}
    </div>
  )
}

/** Reads the sentence and lights up each word as it goes. */
function useKaraoke(sentence: Sentence) {
  const [active, setActive] = useState(-1)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  useEffect(() => () => clearInterval(timer.current), [])
  const play = (slow = false) => {
    clearInterval(timer.current)
    const n = sentence.text.split(' ').length
    let i = 0
    setActive(0)
    timer.current = setInterval(
      () => {
        i++
        if (i >= n) {
          clearInterval(timer.current)
          setTimeout(() => setActive(-1), 400)
        } else setActive(i)
      },
      slow ? 620 : 380,
    )
    void speak([sayEn(sentence.text)], { slow })
  }
  return { active, play }
}

function promptParts(mode: Settings['instructions'], step: SentenceStep): Part[] {
  const s = step.sentence
  switch (step.type) {
    case 'intro':
      return [...instruction(mode, `${s.ro} În engleză spunem:`, 'Listen!'), sayEn(s.text), ...instruction(mode, 'Spune și tu!', 'Now you say it!')]
    case 'pick':
      return [...instruction(mode, 'Ascultă și alege poza:', 'Listen and find the picture:'), sayEn(s.text)]
    case 'fill': {
      const { before, after } = splitAtKey(s)
      return [...instruction(mode, 'Ce cuvânt lipsește?', 'What is missing?'), sayEn(`${before}... hmm?`), ...(after ? [sayEn(after)] : [])]
    }
    case 'truth':
      return [...instruction(mode, 'Ascultă! Este adevărat?', 'Listen! Is it true?'), sayEn(step.said.text)]
    case 'say':
      return [...instruction(mode, 'Acum spune tu:', 'Now you say it:'), sayEn(s.text)]
  }
}

function bubbleText(step: SentenceStep): string {
  switch (step.type) {
    case 'intro':
      return step.sentence.ro
    case 'pick':
      return 'Ascultă și alege poza!'
    case 'fill':
      return 'Ce cuvânt lipsește?'
    case 'truth':
      return 'Adevărat sau nu?'
    case 'say':
      return 'Spune tu toată propoziția!'
  }
}

/** One round of a sentence pack. */
export function SentenceLesson({
  pack,
  steps,
  settings,
  onFinish,
  onExit,
}: {
  pack: Pack
  steps: SentenceStep[]
  settings: Settings
  onFinish: (mistakes: number) => void
  onExit: () => void
}) {
  const [index, setIndex] = useState(0)
  const [mood, setMood] = useState<Mood>('talk')
  const mistakes = useRef(0)
  const step = steps[index]
  const mode = settings.instructions

  const sayPrompt = (slow?: boolean) => {
    setMood('talk')
    void speak(promptParts(mode, step), { slow }).then(() => setMood((m) => (m === 'talk' ? 'idle' : m)))
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

  const onCorrect = (lead?: string) => {
    sfx.correct()
    setMood('happy')
    void speak([sayEn(lead ?? PRAISE[Math.floor(Math.random() * PRAISE.length)]), sayEn(step.sentence.text)])
    setTimeout(next, 2400)
  }

  const onWrong = (attempt: number, again: Part[]) => {
    sfx.wrong()
    setMood('oops')
    if (attempt <= 2) mistakes.current++
    void speak([...instruction(mode, 'Mai încearcă!', 'Try again!'), ...again])
    setTimeout(() => setMood('idle'), 1400)
  }

  const onMic = (r: MicResult) => {
    if (r === 'no-mic') return
    setMood(r === 'heard' ? 'happy' : 'talk')
    void micFeedback(r, asWord(step.sentence), mode).then(() => setMood('idle'))
  }

  return (
    <div className="lesson-wrap" style={{ '--c': pack.color, '--cd': pack.colorDark } as React.CSSProperties}>
      <WorldBackdrop world={pack.world} />
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
          <Mascot mood={mood} size={130} />
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
          {step.type === 'intro' && <Meet sentence={step.sentence} settings={settings} onMic={onMic} onNext={next} />}
          {step.type === 'say' && <SayIt sentence={step.sentence} settings={settings} onMic={onMic} onNext={next} />}
          {step.type === 'pick' && (
            <PickPicture
              step={step}
              onCorrect={() => onCorrect()}
              onWrong={(a) => onWrong(a, [sayEn(step.sentence.text)])}
            />
          )}
          {step.type === 'fill' && (
            <FillGap
              step={step}
              onCorrect={() => onCorrect()}
              onWrong={(a) => {
                const { before, after } = splitAtKey(step.sentence)
                onWrong(a, [sayEn(`${before}... hmm?`), ...(after ? [sayEn(after)] : [])])
              }}
            />
          )}
          {step.type === 'truth' && (
            <TrueOrNot
              step={step}
              onCorrect={(isTrue) => onCorrect(isTrue ? 'Yes! That is right!' : `No! It's not.`)}
              onWrong={(a) => onWrong(a, [sayEn(step.said.text)])}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function Meet({
  sentence,
  settings,
  onMic,
  onNext,
}: {
  sentence: Sentence
  settings: Settings
  onMic: (r: MicResult) => void
  onNext: () => void
}) {
  const [ready, setReady] = useState(false)
  const { active, play } = useKaraoke(sentence)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="intro pz-intro">
      <button
        className="card card-big pop-in pz-card-scene"
        onClick={() => {
          sfx.tap()
          play()
        }}
        aria-label={sentence.text}
      >
        <Scene things={sentence.scene} size={190} />
      </button>
      <div className="pz-intro-side">
        <Chips sentence={sentence} active={active} />
        <div className="pz-intro-actions">
          {settings.mic && micSupported() && <MicButton word={asWord(sentence)} recognize={settings.micCheck} size="small" onResult={onMic} />}
          <button className={`go-btn ${ready ? 'go-ready' : ''}`} onClick={onNext} aria-label="Mai departe">
            ➜
          </button>
        </div>
      </div>
    </div>
  )
}

function SayIt({
  sentence,
  settings,
  onMic,
  onNext,
}: {
  sentence: Sentence
  settings: Settings
  onMic: (r: MicResult) => void
  onNext: () => void
}) {
  const [canSkip, setCanSkip] = useState(false)
  const [tries, setTries] = useState(0)
  const { active, play } = useKaraoke(sentence)
  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), 4000)
    return () => clearTimeout(t)
  }, [])
  const handle = (r: MicResult) => {
    if (r === 'no-mic') return onNext()
    onMic(r)
    setTries((n) => n + 1)
    setCanSkip(true)
    if (r === 'heard' || tries + 1 >= 3) setTimeout(onNext, 3000)
  }
  return (
    <div className="intro pz-intro">
      <button className="card card-big pop-in pz-card-scene" onClick={() => play()} aria-label={sentence.text}>
        <Scene things={sentence.scene} size={170} />
      </button>
      <div className="pz-intro-side">
        <Chips sentence={sentence} active={active} />
        <div className="pz-intro-actions">
          <MicButton word={asWord(sentence)} recognize={settings.micCheck} onResult={handle} />
          <button className={`go-btn ${canSkip ? 'go-ready' : ''}`} onClick={onNext} aria-label="Mai departe">
            ➜
          </button>
        </div>
      </div>
    </div>
  )
}

/** Shared state for tapping the right answer: wrong taps shake, after two misses the answer glows. */
function useAnswer(onCorrect: () => void, onWrong: (attempt: number) => void) {
  const [wrong, setWrong] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const attempts = useRef(0)
  const pick = (id: string, right: boolean) => {
    if (done) return
    if (right) {
      setDone(true)
      onCorrect()
      return
    }
    attempts.current++
    setWrong((x) => [...x, id])
    onWrong(attempts.current)
  }
  return { wrong, done, hint: attempts.current >= 2 && !done, pick }
}

function cardClass(id: string, right: boolean, a: { wrong: string[]; done: boolean; hint: boolean }) {
  return [
    'card',
    'pop-in',
    a.wrong.includes(id) ? 'card-wrong' : '',
    a.done && right ? 'card-right' : '',
    a.hint && right ? 'card-hint' : '',
  ].join(' ')
}

function PickPicture({
  step,
  onCorrect,
  onWrong,
}: {
  step: Extract<SentenceStep, { type: 'pick' }>
  onCorrect: () => void
  onWrong: (attempt: number) => void
}) {
  const a = useAnswer(onCorrect, onWrong)
  return (
    <div className="choices">
      {step.choices.map((c, i) => {
        const right = c.id === step.sentence.id
        return (
          <button
            key={`${c.id}-${a.wrong.filter((x) => x === c.id).length}`}
            className={cardClass(c.id, right, a)}
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => a.pick(c.id, right)}
            aria-label={c.text}
          >
            <Scene things={c.scene} size={150} />
          </button>
        )
      })}
    </div>
  )
}

function FillGap({
  step,
  onCorrect,
  onWrong,
}: {
  step: Extract<SentenceStep, { type: 'fill' }>
  onCorrect: () => void
  onWrong: (attempt: number) => void
}) {
  const a = useAnswer(onCorrect, onWrong)
  return (
    <div className="pz-fill">
      <div className="pz-fill-top">
        <div className="card pz-card-scene pz-fill-scene pop-in">
          <Scene things={step.sentence.scene} size={140} />
        </div>
        <Chips sentence={step.sentence} hideKey={!a.done} />
      </div>
      <div className="choices pz-choices-small">
        {step.choices.map((c, i) => {
          const right = c.key === step.sentence.key
          return (
            <button
              key={`${c.key}-${a.wrong.filter((x) => x === c.key).length}`}
              className={cardClass(c.key, right, a)}
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => {
                if (!right && !a.done) void speak([sayEn(c.key)])
                a.pick(c.key, right)
              }}
              aria-label={c.key}
            >
              <Scene things={c.keyPic} size={104} />
              <span className="pz-key-word">{c.key}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TrueOrNot({
  step,
  onCorrect,
  onWrong,
}: {
  step: Extract<SentenceStep, { type: 'truth' }>
  onCorrect: (isTrue: boolean) => void
  onWrong: (attempt: number) => void
}) {
  const isTrue = step.said.id === step.sentence.id
  const a = useAnswer(() => onCorrect(isTrue), onWrong)
  const btn = (yes: boolean) => {
    const id = yes ? 'yes' : 'no'
    const right = yes === isTrue
    const cls = [
      'pz-truth-btn',
      yes ? 'pz-yes' : 'pz-no',
      a.wrong.includes(id) ? 'card-wrong' : '',
      a.done && right ? 'pz-truth-right' : '',
      a.hint && right ? 'card-hint' : '',
    ].join(' ')
    return (
      <button key={`${id}-${a.wrong.length}`} className={cls} onClick={() => a.pick(id, right)} aria-label={yes ? 'Da' : 'Nu'}>
        <span className="pz-truth-icon">{yes ? '👍' : '👎'}</span>
        <span>{yes ? 'Da' : 'Nu'}</span>
      </button>
    )
  }
  return (
    <div className="pz-truth">
      <div className="card card-big pz-card-scene pop-in">
        <Scene things={step.sentence.scene} size={180} />
      </div>
      <div className="pz-truth-btns">
        {btn(true)}
        {btn(false)}
      </div>
    </div>
  )
}

/** The sentences page: one card per pack, with the best stars won. */
export function Propozitii({ progress, onStart }: { progress: Progress; onStart: (packId: string) => void }) {
  const mode = progress.settings.instructions
  useEffect(() => {
    const t = setTimeout(
      () => void speak(instruction(mode, 'Hai să spunem propoziții întregi, ca un ninja adevărat!', "Let's say whole sentences!")),
      300,
    )
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [mode])
  return (
    <div className="page page-white pz-page">
      <h2 className="page-title">Propoziții</h2>
      <div className="play-hello">
        <Mascot mood="talk" size={110} />
        <span className="bubble">Alege un joc și spunem propoziții întregi!</span>
      </div>
      <div className="pz-grid">
        {PACKS.map((p) => {
          const best = progress.sentences[p.id] ?? 0
          return (
            <button
              key={p.id}
              className="pz-pack"
              style={{ '--c': p.color, '--cd': p.colorDark } as React.CSSProperties}
              onClick={() => {
                sfx.tap()
                onStart(p.id)
              }}
            >
              <span className="pz-pack-emoji">{p.emoji}</span>
              <span className="pz-pack-title">{p.title}</span>
              <span className="pz-pack-pattern">{p.pattern}</span>
              <span className="pz-pack-stars" aria-label={`${best} stele`}>
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= best ? 'on' : ''}>
                    ★
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
