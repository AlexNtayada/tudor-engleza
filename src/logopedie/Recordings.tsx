import { useEffect, useState } from 'react'
import { playBlob } from '../recorder'
import { ACTIVITIES, type SoundId } from './data'
import { clearTakes, deleteTake, listTakes, MAX_TAKES, type Take } from './takes'
import { Disclaimer } from './Logopedie'

const ACT_NAME = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a.name]))

function dayLabel(at: number) {
  return new Date(at).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function fileName(t: Take) {
  const d = new Date(t.at)
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`
  const ext = t.audio.type.includes('mp4') ? 'm4a' : t.audio.type.includes('ogg') ? 'ogg' : 'webm'
  return `tudor-${t.sound}-${t.label.toLowerCase()}-${stamp}.${ext}`
}

/** Parent area: practice summary and Tudor's speech-therapy recordings. */
export function SpeechPanel({
  save,
  onSave,
  speechLog,
}: {
  save: boolean
  onSave: (v: boolean) => void
  speechLog: Record<string, string[]>
}) {
  const [takes, setTakes] = useState<Take[] | undefined>()
  const [filter, setFilter] = useState<'all' | SoundId>('all')
  const [playing, setPlaying] = useState<string | undefined>()

  const reload = () => void listTakes().then(setTakes)
  useEffect(reload, [])

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const daysThisWeek = week.filter((k) => (speechLog[k] ?? []).length > 0).length
  const totalDays = Object.values(speechLog).filter((v) => v.length > 0).length

  const shown = (takes ?? []).filter((t) => filter === 'all' || t.sound === filter)
  const groups: { day: string; items: Take[] }[] = []
  for (const t of shown) {
    const day = dayLabel(t.at)
    const g = groups[groups.length - 1]
    if (g?.day === day) g.items.push(t)
    else groups.push({ day, items: [t] })
  }

  const play = async (t: Take) => {
    setPlaying(t.id)
    await playBlob(t.audio)
    setPlaying((p) => (p === t.id ? undefined : p))
  }

  const download = (t: Take) => {
    const url = URL.createObjectURL(t.audio)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName(t)
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  return (
    <section className="panel lp-rec-panel">
      <h3>Logopedie (L și R)</h3>
      <div className="stats">
        <div>
          <b>{daysThisWeek}/7</b>
          <span>zile săptămâna asta</span>
        </div>
        <div>
          <b>{totalDays}</b>
          <span>zile în total</span>
        </div>
        <div>
          <b>{takes?.length ?? '…'}</b>
          <span>înregistrări</span>
        </div>
      </div>
      <div className="field">
        <span>Păstrează înregistrările 🎤</span>
        <div className="seg">
          <button className={save ? 'on' : ''} onClick={() => onSave(true)}>
            Da
          </button>
          <button className={!save ? 'on' : ''} onClick={() => onSave(false)}>
            Nu
          </button>
        </div>
      </div>
      <p className="note">
        Înregistrările rămân doar pe acest dispozitiv (nu se trimit nicăieri). Se păstrează ultimele {MAX_TAKES}; cele
        mai vechi se șterg singure. Ascultați câte una din săptămâni diferite ca să auziți progresul.
      </p>

      <div className="seg lp-filter">
        {(
          [
            ['all', 'Toate'],
            ['r', 'R'],
            ['l', 'L'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {takes === undefined ? (
        <p className="note">Se încarcă…</p>
      ) : shown.length === 0 ? (
        <p className="note">Încă nu sunt înregistrări. Apar aici după ce Tudor apasă 🎤 în „Sunete”.</p>
      ) : (
        groups.map((g) => (
          <div key={g.day} className="lp-rec-day">
            <h4>{g.day}</h4>
            {g.items.map((t) => (
              <div key={t.id} className="lp-rec">
                <button
                  className={`speak-btn ${playing === t.id ? 'lp-playing' : ''}`}
                  onClick={() => void play(t)}
                  aria-label={`Ascultă ${t.label}`}
                >
                  {playing === t.id ? '🔊' : '▶'}
                </button>
                <span className="lp-rec-label">
                  <b>{t.label}</b>
                  <small>
                    {t.sound.toUpperCase()} · {ACT_NAME[t.activity]} ·{' '}
                    {new Date(t.at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </span>
                <button className="link-btn" onClick={() => download(t)} aria-label="Descarcă">
                  ⬇
                </button>
                <button
                  className="link-btn danger"
                  onClick={() => void deleteTake(t.id).then(reload)}
                  aria-label="Șterge"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        ))
      )}
      {!!takes?.length && (
        <button
          className="link-btn danger"
          onClick={() => {
            if (window.confirm('Ștergi toate înregistrările de logopedie?')) void clearTakes().then(reload)
          }}
        >
          Șterge toate înregistrările
        </button>
      )}
      <Disclaimer />
    </section>
  )
}
