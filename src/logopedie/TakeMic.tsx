import { useEffect, useRef, useState } from 'react'
import { useSpaceKey } from '../components/MicButton'
import { playBlob, startRecording, type Recording } from '../recorder'
import { stopSpeaking } from '../speech'
import { sfx } from '../sfx'
import type { ActivityId, SoundId } from './data'
import { saveTake } from './takes'

export type TakeResult = 'done' | 'no-mic'

/**
 * Mic for speech practice: record, hear yourself back, and (if the parent allows) keep the clip
 * so they can listen later. It never judges the pronunciation.
 */
export function TakeMic({
  sound,
  activity,
  label,
  save,
  maxMs = 3000,
  playBack = true,
  onLevel,
  onStart,
  onDone,
}: {
  sound: SoundId
  activity: ActivityId
  label: string
  save: boolean
  maxMs?: number
  playBack?: boolean
  onLevel?: (v: number) => void
  onStart?: () => void
  onDone: (r: TakeResult) => void
}) {
  const [state, setState] = useState<'idle' | 'recording' | 'playing'>('idle')
  const rec = useRef<Recording | undefined>(undefined)
  const alive = useRef(true)
  const level = useRef(onLevel)
  level.current = onLevel
  useEffect(
    () => () => {
      alive.current = false
      rec.current?.stop()
    },
    [],
  )

  const start = async () => {
    if (state === 'recording') return rec.current?.stop()
    if (state !== 'idle') return
    stopSpeaking()
    sfx.tap()
    setState('recording')
    onStart?.()
    const r = await startRecording({ maxMs, recognize: false, onLevel: (v) => level.current?.(v) })
    if (!alive.current) return r?.stop()
    if (!r) {
      setState('idle')
      return onDone('no-mic')
    }
    rec.current = r
    const take = await r.done
    if (take.audio && save) void saveTake({ sound, activity, label, audio: take.audio })
    if (!alive.current) return
    if (take.audio && playBack) {
      setState('playing')
      await playBlob(take.audio)
      if (!alive.current) return
    }
    setState('idle')
    onDone('done')
  }

  const startRef = useRef(() => {})
  startRef.current = () => void start()
  useSpaceKey(startRef)

  return (
    <button
      className={`mic mic-big mic-${state}`}
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
