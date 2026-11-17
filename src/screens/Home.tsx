import { useState } from 'react'
import { ALL_LESSONS, UNITS } from '../content'
import { Ninja, type Mood } from '../components/Ninja'
import { currentLessonIndex, learnedWordIds, today, type Progress } from '../progress'
import { levelFor, levelProgress, STARS_PER_LEVEL, streakDays } from '../gamify'
import type { Tab } from '../components/Nav'
import { UnitMap } from '../map/UnitMap'
import { biomeFor } from '../map/biomes'
import { bossFor } from '../components/Boss'
import { instruction, speak } from '../speech'
import { sfx } from '../sfx'

export function Home({
  progress,
  onStart,
  onFreePlay,
  onTab,
}: {
  progress: Progress
  onStart: (globalIndex: number) => void
  onFreePlay: () => void
  onTab: (t: Tab) => void
}) {
  const current = currentLessonIndex(progress)
  const [mood, setMood] = useState<Mood>('idle')
  let globalIndex = 0

  const locked = () => {
    sfx.wrong()
    setMood('oops')
    void speak(
      instruction(progress.settings.instructions, 'Încă nu! Mai întâi lecția de lângă mine.', 'Not yet! First the lesson next to me.'),
    )
    setTimeout(() => setMood('idle'), 1500)
  }

  return (
    <div className="home">
      <HomeHero progress={progress} current={current} mood={mood} onTab={onTab} />
      <UnitTiles progress={progress} current={current} />
      <DailyChallenges progress={progress} current={current} onStart={onStart} onFreePlay={onFreePlay} onTab={onTab} />
      <h2 className="home-section-title">Harta lui Ninja</h2>
      <div className="path">
        {UNITS.map((unit, ui) => {
          const first = globalIndex
          globalIndex += unit.lessons.length
          const biome = biomeFor(unit.id)
          return (
            <section key={unit.id} id={`unit-${unit.id}`} className="unit biome-unit" style={{ background: biome.ground }}>
              <div
                className="unit-banner bm-banner"
                style={{ color: unit.colorDark, boxShadow: '0 8px 22px rgba(60, 40, 10, 0.14)' }}
              >
                <span className="bm-title">
                  <span className="unit-icon bm-icon" style={{ background: `${unit.color}2e` }}>
                    {unit.world.icon}
                  </span>
                  {unit.title}
                </span>
                <span className="unit-banner-sub bm-sub">
                  {biome.name}
                  <span className="bm-count"> · {unit.words.length} cuvinte</span>
                </span>
              </div>
              <UnitMap
                unit={unit}
                unitIndex={ui}
                firstGlobal={first}
                current={current}
                stars={progress.stars}
                mood={mood}
                onOpen={(g, state) => {
                  if (state === 'locked') return locked()
                  sfx.tap()
                  onStart(g)
                }}
              />
            </section>
          )
        })}
        <div className="path-end">
          <Ninja mood="sleep" size={90} />
          <p>Urmează: și mai multe teme, în curând…</p>
        </div>
      </div>
    </div>
  )
}

/** Sunny header: greeting, Ninja with a speech bubble, and the level card. */
function HomeHero({ progress, current, mood, onTab }: { progress: Progress; current: number; mood: Mood; onTab: (t: Tab) => void }) {
  const name = progress.settings.childName || 'Tudor'
  const level = levelFor(progress.earned)
  const inLevel = progress.earned % STARS_PER_LEVEL
  const done = current >= ALL_LESSONS.length
  return (
    <section className="hero">
      <div className="hero-sun" aria-hidden />
      <span className="hero-spark hero-spark-1" aria-hidden>
        ⭐
      </span>
      <span className="hero-spark hero-spark-2" aria-hidden>
        ✨
      </span>
      <span className="hero-spark hero-spark-3" aria-hidden>
        ⭐
      </span>
      <div className="hero-top">
        <div className="hero-hello">
          <span>Salut,</span>
          <b>{name}!</b>
        </div>
      </div>
      <div className="hero-stage">
        <Ninja mood={mood === 'idle' ? 'happy' : mood} size={150} />
        <span className="hero-bubble">
          {done ? 'Ai terminat tot! Bravo!' : progress.earned ? 'Hai să continuăm!' : 'Hai să învățăm engleză!'}
        </span>
      </div>
      <button className="level-card" onClick={() => onTab('dino')} aria-label={`Ninja, nivelul ${level}`}>
        <span className="level-card-head">
          <b>Ninja isteț 🏅</b>
          <span className="level-card-link">Garderoba ›</span>
        </span>
        <span className="level-card-row">
          <span className="meter">
            <span
              className="meter-fill"
              style={{
                width: `${Math.max(levelProgress(progress.earned) * 100, 6)}%`,
              }}
            />
            <span className="meter-text">
              {inLevel}/{STARS_PER_LEVEL} ⭐
            </span>
          </span>
          <span className="lv-pill">Nv {level}</span>
        </span>
      </button>
    </section>
  )
}

/** Theme tiles: tap one to jump to it on the map. */
function UnitTiles({ progress, current }: { progress: Progress; current: number }) {
  let start = 0
  return (
    <nav className="tiles" aria-label="Teme">
      {UNITS.map((u) => {
        const first = start
        start += u.lessons.length
        const open = first <= current
        const complete = u.lessons.every((l) => progress.stars[l.id])
        return (
          <button
            key={u.id}
            className={`tile ${open ? '' : 'tile-locked'}`}
            onClick={() => {
              sfx.tap()
              document.getElementById(`unit-${u.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <span className="tile-icon" style={{ background: open ? `${u.color}33` : undefined }}>
              {open ? u.world.icon : '🔒'}
              {complete && <i className="tile-done">✓</i>}
            </span>
            <span className="tile-label">{u.title}</span>
          </button>
        )
      })}
    </nav>
  )
}

/** Today's little goals, each a row with a big check button. */
function DailyChallenges({
  progress,
  current,
  onStart,
  onFreePlay,
  onTab,
}: {
  progress: Progress
  current: number
  onStart: (globalIndex: number) => void
  onFreePlay: () => void
  onTab: (t: Tab) => void
}) {
  const day = today()
  const next = ALL_LESSONS[current]
  const learned = learnedWordIds(progress).size
  const streak = streakDays(progress.daysPlayed)
  const rows: {
    key: string
    icon: string
    color: string
    title: string
    sub: string
    badge?: string
    done: boolean
    go: () => void
  }[] = []
  if (next) {
    rows.push({
      key: 'lesson',
      icon: next.lesson.boss ? '⚔️' : next.unit.world.icon,
      color: next.unit.color,
      title: 'O lecție pe hartă',
      sub: next.lesson.boss
        ? `Urmează: ${bossFor(next.unit.id).name}, testul temei ${next.unit.title}`
        : `Urmează: ${next.unit.title}, lecția ${next.unit.lessons.indexOf(next.lesson) + 1}`,
      badge: '3 ⭐',
      done: progress.daysPlayed.includes(day),
      go: () => onStart(current),
    })
  }
  if (learned > 0) {
    rows.push({
      key: 'play',
      icon: '🎲',
      color: '#ffb547',
      title: 'Joacă liberă',
      sub: `${learned} cuvinte învățate`,
      done: false,
      go: onFreePlay,
    })
  }
  rows.push({
    key: 'speech',
    icon: '👅',
    color: '#ff8fb1',
    title: 'Sunetele R și L',
    sub: 'Exersăm cu Ninja',
    done: (progress.speechLog[day] ?? []).length > 0,
    go: () => onTab('speech'),
  })
  return (
    <section className="daily">
      <div className="daily-head">
        <h2 className="home-section-title">Provocările zilei</h2>
        <span className={`streak ${streak ? 'on' : ''}`} title="Zile la rând">
          🔥 {streak} {streak === 1 ? 'zi' : 'zile'}
        </span>
      </div>
      {rows.map((r) => (
        <button
          key={r.key}
          className={`challenge ${r.done ? 'challenge-done' : ''}`}
          onClick={() => {
            sfx.tap()
            r.go()
          }}
        >
          <span className="hex" style={{ background: r.color }}>
            {r.icon}
          </span>
          <span className="challenge-text">
            <b>{r.title}</b>
            <span>{r.sub}</span>
          </span>
          {r.badge && <span className="challenge-badge">{r.badge}</span>}
          <span className="check" aria-hidden>
            {r.done ? '✓' : '▶'}
          </span>
        </button>
      ))}
    </section>
  )
}
