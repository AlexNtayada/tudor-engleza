import { useState } from 'react'
import type React from 'react'
import { UNITS } from '../content'
import { Dino, type Mood } from '../components/Dino'
import { currentLessonIndex, type Progress } from '../progress'
import { WorldBackdrop } from '../components/WorldBackdrop'
import { instruction, speak } from '../speech'
import { sfx } from '../sfx'

// Horizontal offsets that make the path snake left and right.
const OFFSETS = [0, 70, 100, 70, 0, -70, -100, -70]

export function Home({ progress, onStart }: { progress: Progress; onStart: (globalIndex: number) => void }) {
  const current = currentLessonIndex(progress)
  const [mood, setMood] = useState<Mood>('idle')
  let globalIndex = 0

  const locked = () => {
    sfx.wrong()
    setMood('oops')
    void speak(instruction(progress.settings.instructions, 'Încă nu! Mai întâi lecția de lângă mine.', 'Not yet! First the lesson next to me.'))
    setTimeout(() => setMood('idle'), 1500)
  }

  return (
    <div className="home">
      <div className="path">
        {UNITS.map((unit) => (
          <section key={unit.id} className="unit">
            <WorldBackdrop world={unit.world} fixed={false} />
            <div className="unit-banner" style={{ background: unit.color, boxShadow: `0 6px 0 ${unit.colorDark}` }}>
              <span>
                <span className="unit-icon">{unit.world.icon}</span> {unit.title}
              </span>
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
          <p>Urmează: haine, corpul, vremea…</p>
        </div>
      </div>
    </div>
  )
}
