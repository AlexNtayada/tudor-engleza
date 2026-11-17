import { useState } from 'react'
import { Mascot } from '../components/Mascot'
import { MASCOTS, mascotById, type MascotId } from '../mascots'
import { speak } from '../speech'
import { sfx } from '../sfx'
import type { Settings } from '../progress'

/** "Pick your friend": six mascots, tap one to hear it, then confirm. Used in the intro and from the friend's page. */
export function MascotPicker({
  current,
  name,
  onPick,
  onBack,
}: {
  current?: MascotId
  name: string
  mode?: Settings['instructions']
  onPick: (id: MascotId) => void
  onBack?: () => void
}) {
  const [chosen, setChosen] = useState<MascotId | undefined>(current)
  const info = chosen ? mascotById(chosen) : undefined

  const tap = (id: MascotId) => {
    const m = mascotById(id)
    sfx.tap()
    setChosen(id)
    // Each friend introduces itself in its own recorded voice.
    void speak([{ text: `Eu sunt ${m.title}!`, lang: 'ro' }], { friend: id })
  }

  return (
    <div className="page picker">
      {onBack && (
        <button className="picker-back" onClick={onBack} aria-label="Înapoi">
          ←
        </button>
      )}
      <h1 className="picker-title">Alege-ți prietenul!</h1>
      <p className="picker-sub">Cu cine vrei să înveți engleză, {name}?</p>
      <div className="picker-grid" role="radiogroup" aria-label="Prieteni">
        {MASCOTS.map((m) => {
          const on = chosen === m.id
          return (
            <button
              key={m.id}
              role="radio"
              aria-checked={on}
              className={`picker-card ${on ? 'on' : ''}`}
              style={{ ['--pc' as string]: m.color }}
              onClick={() => tap(m.id)}
            >
              <Mascot kind={m.id} mood={on ? 'dance' : 'idle'} size={120} outfit={{}} />
              <b className="picker-name">{m.title}</b>
              <span className="picker-blurb">{m.blurb}</span>
              {on && <span className="picker-check">✓</span>}
            </button>
          )
        })}
      </div>
      <button
        className="big-btn picker-go"
        disabled={!info}
        onClick={() => {
          if (!chosen) return
          sfx.fanfare()
          onPick(chosen)
        }}
      >
        {info ? `▶ Hai cu ${info.name}!` : 'Atinge un prieten'}
      </button>
    </div>
  )
}
