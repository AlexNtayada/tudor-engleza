import { useEffect, useRef, useState } from 'react'
import type { Word } from '../content'
import { playBlob, saidWord, startRecording, type Recording } from '../recorder'
import { instruction, speak, stopSpeaking } from '../speech'
import { sfx } from '../sfx'

export type MicResult = 'heard' | 'tried' | 'no-mic'

type State = 'idle' | 'recording' | 'playing'

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
    onResult(take.heard.length && saidWord(take.heard, word.en) ? 'heard' : 'tried')
  }

  return (
    <button
      className={`mic mic-${size} mic-${state}`}
      onClick={() => void start()}
      aria-label={state === 'recording' ? 'Gata' : 'Spune tu'}
    >
      <span className="mic-icon">{state === 'playing' ? '👂' : '🎤'}</span>
      {state === 'recording' && <span className="mic-ring" />}
    </button>
  )
}

/** What Dino says after the child speaks. Never negative. */
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
