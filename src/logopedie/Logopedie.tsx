import { mascot } from '../mascots'
import { useEffect, useState } from 'react'
import type React from 'react'
import { Mascot } from '../components/Mascot'
import { micSupported } from '../recorder'
import { hasRomanianVoice, speakRo, stopSpeaking } from '../speech'
import { sfx } from '../sfx'
import { today, type Progress } from '../progress'
import { ACTIVITIES, COMMON_TIPS, SOUNDS, type ActivityId, type SoundId, type SoundInfo } from './data'
import { Listen, SoundRace, Syllables, WarmUp, Words, type ActivityProps } from './activities'
import './logopedie.css'

export const SPEECH_STARS = 2

const SCREENS: Record<ActivityId, (p: ActivityProps) => React.ReactElement> = {
  warmup: WarmUp,
  sound: SoundRace,
  syllables: Syllables,
  words: Words,
  listen: Listen,
}

export function Disclaimer() {
  return (
    <p className="note lp-disclaimer">
      <b>Important:</b> exercițiile de aici sunt o joacă de exersat acasă. Ele completează, dar nu înlocuiesc, lucrul cu
      un logoped. R este adesea printre ultimele sunete învățate; dacă Tudor încă îl înlocuiește (sau pe L) în jur de 5–6
      ani, o evaluare la un logoped vă spune exact ce exerciții i se potrivesc. Aplicația nu verifică automat
      pronunția: înregistrările sunt ca să-l ascultați voi.
    </p>
  )
}

function ParentBox({ s, onParents }: { s?: SoundInfo; onParents: () => void }) {
  return (
    <details className="panel lp-parents">
      <summary>👨‍👩‍👦 Pentru părinți</summary>
      <Disclaimer />
      <ul className="lp-tips">
        {[...(s?.tips ?? []), ...COMMON_TIPS].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <button className="link-btn" onClick={onParents}>
        🎧 Ascultă înregistrările lui Tudor (Zona părinților)
      </button>
    </details>
  )
}

export function Logopedie({
  progress,
  onEarn,
  onParents,
}: {
  progress: Progress
  onEarn: (key: string, stars: number) => void
  onParents: () => void
}) {
  const [sound, setSound] = useState<SoundId | undefined>()
  const [activity, setActivity] = useState<ActivityId | undefined>()
  const [party, setParty] = useState(false)
  const hasRo = hasRomanianVoice()
  const micOk = progress.settings.mic && micSupported()
  const doneToday = new Set(progress.speechLog[today()] ?? [])
  const name = progress.settings.childName || 'Tudor'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [sound, activity, party])
  useEffect(() => () => stopSpeaking(), [])

  useEffect(() => {
    if (!sound && !activity) {
      const t = setTimeout(() => void speakRo(`Salut, ${name}! Hai să ne jucăm cu sunetele!`), 300)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound, activity])

  if (party && sound) {
    return (
      <div className="center-screen finish lp-party">
        <div className="confetti" aria-hidden>
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 8) * 0.15}s` }} />
          ))}
        </div>
        <Mascot mood="dance" size={200} />
        <div className="finish-gains">
          <span className="gain">+{SPEECH_STARS} ⭐</span>
        </div>
        <button
          className="big-btn"
          onClick={() => {
            sfx.tap()
            setParty(false)
          }}
        >
          ➜
        </button>
      </div>
    )
  }

  if (sound && activity) {
    const Screen = SCREENS[activity]
    return (
      <Screen
        s={SOUNDS[sound]}
        save={progress.settings.speechSave}
        micOk={micOk}
        hasRo={hasRo}
        onBack={() => setActivity(undefined)}
        onFinish={() => {
          onEarn(`${sound}:${activity}`, SPEECH_STARS)
          sfx.fanfare()
          void speakRo(`Bravo, ${name}!`)
          setActivity(undefined)
          setParty(true)
        }}
      />
    )
  }

  if (sound) {
    const s = SOUNDS[sound]
    return (
      <div className="page page-white lp-page">
        <header className="page-top">
          <button className="icon-btn" onClick={() => setSound(undefined)} aria-label="Înapoi">
            ←
          </button>
          <h2>
            <span className="lp-letter-sm" style={{ background: s.color }}>
              {s.letter}
            </span>{' '}
            {s.title}
          </h2>
        </header>
        <div className="lp-path">
          {ACTIVITIES.map((a, i) => {
            const done = doneToday.has(`${sound}:${a.id}`)
            return (
              <button
                key={a.id}
                className={`lp-station ${done ? 'done' : ''}`}
                style={{ '--c': s.color, '--cd': s.colorDark } as React.CSSProperties}
                onClick={() => {
                  sfx.tap()
                  setActivity(a.id)
                }}
              >
                <span className="lp-step">{i + 1}</span>
                <span className="lp-station-emoji">{a.emoji(s)}</span>
                <span className="lp-station-text">
                  <b>{a.name}</b>
                  <small>{a.hint}</small>
                </span>
                {done && <span className="lp-check">✓</span>}
              </button>
            )
          })}
        </div>
        <ParentBox s={s} onParents={onParents} />
      </div>
    )
  }

  return (
    <div className="page page-white lp-page">
      <h2 className="page-title">Sunetele vesele</h2>
      <div className="play-hello">
        <Mascot mood="talk" size={110} />
        <span className="bubble">Cu ce sunet ne jucăm azi?</span>
      </div>
      <div className="lp-sounds">
        {(Object.values(SOUNDS) as SoundInfo[]).map((s) => (
          <button
            key={s.id}
            className="lp-sound"
            style={{ '--c': s.color, '--cd': s.colorDark } as React.CSSProperties}
            onClick={() => {
              sfx.tap()
              setSound(s.id)
              void speakRo(s.id === 'r' ? 'Motorașul: rrrr!' : 'Cântecul: la, la, la!')
            }}
          >
            <span className="lp-letter">{s.letter}</span>
            <span className="lp-sound-emoji">{s.vehicle}</span>
            <span className="lp-sound-title">{s.title}</span>
          </button>
        ))}
      </div>
      {!hasRo && (
        <p className="note warn lp-note">
          Pentru părinți: pe acest dispozitiv nu există o voce românească, așa că {mascot().name} nu poate rosti exercițiile. Citiți
          voi textul din bulă. Cea mai simplă soluție pe PC: deschideți aplicația în <b>Microsoft Edge</b>, care are voci
          românești incluse.
        </p>
      )}
      <ParentBox onParents={onParents} />
    </div>
  )
}
