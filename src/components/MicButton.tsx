import { useEffect, useRef, useState } from 'react'
import type { Word } from '../content'
import { playBlob, saidWord, startRecording, type Recording } from '../recorder'
import { instruction, speak, stopSpeaking } from '../speech'
import { sfx } from '../sfx'

export type MicResult = 'heard' | 'tried' | 'no-mic'

type State = 'idle' | 'recording' | 'playing'

let spaceOwner: symbol | undefined

/**
 * Keyboard: Space starts recording (and stops it early if pressed again).
 * Only the most recently shown mic listens, so one press never starts two.
 */
export function useSpaceKey(handler: { current: () => void }) {
  useEffect(() => {
    const me = Symbol('mic')
    spaceOwner = me
    const isSpace = (e: KeyboardEvent) => e.code === 'Space' || e.key === ' '
    const down = (e: KeyboardEvent) => {
      if (!isSpace(e) || spaceOwner !== me) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      e.stopPropagation()
      if (!e.repeat) handler.current()
    }
    // Stop the focused button from also "clicking" on Space release.
    const up = (e: KeyboardEvent) => {
      if (isSpace(e) && spaceOwner === me) e.preventDefault()
    }
    window.addEventListener('keydown', down, true)
    window.addEventListener('keyup', up, true)
    return () => {
      if (spaceOwner === me) spaceOwner = undefined
      window.removeEventListener('keydown', down, true)
      window.removeEventListener('keyup', up, true)
    }
  }, [handler])
}

/**
 * Big microphone button: tap, say the word, hear yourself back.
 * `onResult` tells the parent whether recognition heard the word ('heard'),
 * the child spoke but we could not confirm it ('tried'), or the mic is unavailable ('no-mic').
 */
export function MicButton({
  word,
  recognize,
  size = 'big',
  onResult,
}: {
  word: Word
  recognize: boolean
  size?: 'big' | 'small'
  onResult: (r: MicResult) => void
}) {
  const [state, setState] = useState<State>('idle')
  const rec = useRef<Recording | undefined>(undefined)
  const alive = useRef(true)
  useEffect(
    () => () => {
      alive.current = false
      rec.current?.stop()
    },
    [],
  )

  const startRef = useRef<() => void>(() => {})
  useSpaceKey(startRef)

  const start = async () => {
    if (state === 'recording') {
      rec.current?.stop()
      return
    }
    if (state !== 'idle') return
    stopSpeaking()
    sfx.tap()
    setState('recording')
    const r = await startRecording({ maxMs: 3000, recognize })
    if (!alive.current) return r?.stop()
    if (!r) {
      setState('idle')
      onResult('no-mic')
      return
    }
    rec.current = r
    const take = await r.done
    if (!alive.current) return
    setState('playing')
    if (take.audio) await playBlob(take.audio)
    if (!alive.current) return
    setState('idle')
    onResult(take.heard.length && saidWord(take.heard, word.check ?? word.en) ? 'heard' : 'tried')
  }

  startRef.current = () => void start()

  return (
    <button
      className={`mic mic-${size} mic-${state}`}
      onClick={() => void start()}
      aria-label={state === 'recording' ? 'Gata' : 'Spune tu'}
    >
      <span className="mic-icon">{state === 'playing' ? '👂' : '🎤'}</span>
      {state === 'recording' && <span className="mic-ring" />}
      <span className="mic-key" aria-hidden>
        Space
      </span>
    </button>
  )
}

/** What Ninja says after the child speaks. Never negative. */
export function micFeedback(result: MicResult, word: Word, mode: 'ro' | 'en') {
  if (result === 'heard') {
    sfx.correct()
    return speak([
      { text: 'Perfect!', lang: 'en' },
      { text: word.say, lang: 'en' },
    ])
  }
  if (result === 'tried') {
    sfx.tap()
    return speak([
      ...instruction(mode, 'Bravo! Încă o dată, cu mine:', 'Good try! Say it with me:'),
      { text: word.say, lang: 'en' },
    ])
  }
  return Promise.resolve()
}
