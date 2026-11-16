import { useState } from 'react'
import type React from 'react'
import { UNITS } from '../content'
import { Dino, type Mood } from '../components/Dino'
import { currentLessonIndex, learnedWordIds, totalStars, type Progress } from '../progress'
import { instruction, speak } from '../speech'
import { sfx } from '../sfx'

// Horizontal offsets that make the path snake left and right.
const OFFSETS = [0, 70, 100, 70, 0, -70, -100, -70]

export function Home({
  progress,
  onStart,
  onFreePlay,
  onAlbum,
  onParents,
}: {
  progress: Progress
  onStart: (globalIndex: number) => void
  onFreePlay: () => void
  onAlbum: () => void
  onParents: () => void
}) {
  const current = currentLessonIndex(progress)
  const [mood, setMood] = useState<Mood>('idle')
  const canFreePlay = learnedWordIds(progress).size > 0
  let globalIndex = 0

  const locked = () => {
    sfx.wrong()
    setMood('oops')
    void speak(instruction(progress.settings.instructions, 'Încă nu! Mai întâi lecția de lângă mine.', 'Not yet! First the lesson next to me.'))
    setTimeout(() => setMood('idle'), 1500)
  }

  return (
    <div className="home">
      <header className="topbar">
        <span className="pill" aria-label="Stele">
          ⭐ {totalStars(progress)}
        </span>
        <div className="topbar-right">
          {canFreePlay && (
            <button className="pill pill-btn pill-play" onClick={onFreePlay}>
              🎈 <span className="pill-label">Joacă liberă</span>
            </button>
          )}
          <button className="pill pill-btn" onClick={onAlbum} aria-label="Album">
            📒
          </button>
          <button className="pill pill-btn pill-small" onClick={onParents} aria-label="Pentru părinți">
            🔒
          </button>
        </div>
      </header>

      <div className="path">
        {UNITS.map((unit) => (
          <section key={unit.id} className="unit">
            <div className="unit-banner" style={{ background: unit.color, boxShadow: `0 6px 0 ${unit.colorDark}` }}>
              <span>{unit.title}</span>
              <span className="unit-banner-sub">{unit.words.length} cuvinte</span>
            </div>
            <div className="nodes">
              {unit.lessons.map((lesson, i) => {
                const g = globalIndex++
                const stars = progress.stars[lesson.id] ?? 0
                const state = g < current ? 'done' : g === current ? 'current' : 'locked'
                const offset = OFFSETS[g % OFFSETS.length]
                const isReview = lesson.newWords.length === 0
                return (
                  <div key={lesson.id} className="node-row" style={{ '--x': offset } as React.CSSProperties}>
                    {state === 'current' && (
                      <div className={`node-dino ${offset > 0 ? 'node-dino-left' : 'node-dino-right'}`}>
                        <Dino mood={mood} size={110} />
                      </div>
                    )}
                    <button
                      className={`node node-${state}`}
                      style={
                        state !== 'locked'
                          ? { background: unit.color, boxShadow: `0 8px 0 ${unit.colorDark}` }
                          : undefined
                      }
                      onClick={() => {
                        if (state === 'locked') return locked()
                        sfx.tap()
                        onStart(g)
                      }}
                      aria-label={`${unit.title} lecția ${i + 1}`}
                    >
                      {state === 'locked' ? '🔒' : isReview ? '🏆' : state === 'done' ? '★' : '▶'}
                    </button>
                    {state === 'done' && (
                      <div className="node-stars">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={s <= stars ? 'on' : ''}>
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
        <div className="path-end">
          <Dino mood="sleep" size={90} />
          <p>Urmează: familia, mâncare și altele…</p>
        </div>
      </div>
    </div>
  )
}
