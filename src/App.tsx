import { useEffect, useRef, useState } from 'react'
import { ALL_LESSONS } from './content'
import { buildFreePlay, buildLesson, starsFor, type Step } from './lessons'
import { learnedWordIds, loadProgress, saveProgress, today, type Progress } from './progress'
import { Home } from './screens/Home'
import { LessonScreen } from './screens/Lesson'
import { Album, BreakScreen, FinishScreen, ParentGate, Parents, StartScreen } from './screens/Other'
import { instruction, setSlowVoice, speak } from './speech'

type Screen =
  | { name: 'start' }
  | { name: 'home' }
  | { name: 'lesson'; steps: Step[]; lessonIndex: number | null; id: number }
  | { name: 'finish'; stars: number; sticker?: string }
  | { name: 'album' }
  | { name: 'gate' }
  | { name: 'parents' }
  | { name: 'break' }

const BREAK_AFTER_SECONDS = 15 * 60

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>({ name: 'start' })
  const sinceBreak = useRef(0)

  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => setSlowVoice(progress.settings.slowVoice), [progress.settings.slowVoice])

  // Count play time while a lesson is open and the tab is visible.
  useEffect(() => {
    if (screen.name !== 'lesson') return
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      sinceBreak.current += 5
      setProgress((p) => {
        const d = today()
        return { ...p, playSeconds: { ...p.playSeconds, [d]: (p.playSeconds[d] ?? 0) + 5 } }
      })
    }, 5000)
    return () => clearInterval(id)
  }, [screen.name])

  const startLesson = (globalIndex: number) => {
    const { unit, lesson } = ALL_LESSONS[globalIndex]
    const steps = buildLesson(unit, unit.lessons.indexOf(lesson))
    setScreen({ name: 'lesson', steps, lessonIndex: globalIndex, id: Date.now() })
  }

  const finishLesson = (lessonIndex: number | null, mistakes: number) => {
    const stars = starsFor(mistakes)
    let sticker: string | undefined
    if (lessonIndex !== null) {
      const { lesson } = ALL_LESSONS[lessonIndex]
      if (!progress.stickers.includes(lesson.sticker)) sticker = lesson.sticker
      setProgress((p) => ({
        ...p,
        stars: { ...p.stars, [lesson.id]: Math.max(p.stars[lesson.id] ?? 0, stars) },
        stickers: sticker ? [...p.stickers, sticker] : p.stickers,
      }))
    }
    setScreen({ name: 'finish', stars, sticker })
  }

  const name = progress.settings.childName || 'Tudor'

  switch (screen.name) {
    case 'start':
      return (
        <StartScreen
          name={name}
          onGo={() => {
            void speak([
              { text: `Hello, ${name}!`, lang: 'en' },
              ...instruction(progress.settings.instructions, 'Eu sunt Dino. Hai să învățăm engleză!', "I'm Dino. Let's learn English!"),
            ])
            setScreen({ name: 'home' })
          }}
        />
      )
    case 'home':
      return (
        <Home
          progress={progress}
          onStart={startLesson}
          onFreePlay={() =>
            setScreen({ name: 'lesson', steps: buildFreePlay(learnedWordIds(progress)), lessonIndex: null, id: Date.now() })
          }
          onAlbum={() => setScreen({ name: 'album' })}
          onParents={() => setScreen({ name: 'gate' })}
        />
      )
    case 'lesson':
      return (
        <LessonScreen
          key={screen.id}
          steps={screen.steps}
          settings={progress.settings}
          onExit={() => setScreen({ name: 'home' })}
          onFinish={(m) => finishLesson(screen.lessonIndex, m)}
        />
      )
    case 'finish':
      return (
        <FinishScreen
          stars={screen.stars}
          sticker={screen.sticker}
          name={name}
          mode={progress.settings.instructions}
          suggestBreak={sinceBreak.current >= BREAK_AFTER_SECONDS}
          onContinue={() => setScreen({ name: 'home' })}
          onBreak={() => {
            sinceBreak.current = 0
            setScreen({ name: 'break' })
          }}
        />
      )
    case 'break':
      return <BreakScreen onBack={() => setScreen({ name: 'home' })} />
    case 'album':
      return <Album progress={progress} onBack={() => setScreen({ name: 'home' })} />
    case 'gate':
      return <ParentGate onPass={() => setScreen({ name: 'parents' })} onBack={() => setScreen({ name: 'home' })} />
    case 'parents':
      return <Parents progress={progress} onChange={setProgress} onBack={() => setScreen({ name: 'home' })} />
  }
}

