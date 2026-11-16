import { useEffect, useRef, useState } from 'react'
import { ALL_LESSONS, PLAYGROUND, UNITS, type World } from './content'
import { buildFreePlay, buildLesson, starsFor, type Step } from './lessons'
import { learnedWordIds, loadProgress, saveProgress, today, type Progress } from './progress'
import { chestAvailable, CHEST_STARS, levelFor } from './gamify'
import { Home } from './screens/Home'
import { LessonScreen } from './screens/Lesson'
import { Album, BreakScreen, FinishScreen, ParentGate, Parents, StartScreen } from './screens/Other'
import { DinoRoom, Playground } from './screens/Rewards'
import { Nav, type Tab } from './components/Nav'
import { OutfitContext } from './components/Outfit'
import { instruction, setSlowVoice, speak } from './speech'
import { micSupported } from './recorder'

type Screen =
  | { name: 'start' }
  | { name: Tab }
  | { name: 'lesson'; steps: Step[]; lessonIndex: number | null; world: World; id: number }
  | {
      name: 'finish'
      stars: number
      sticker?: string
      gained: number
      combos: number
      levelUp?: number
      chest: boolean
    }
  | { name: 'gate' }
  | { name: 'break' }

const BREAK_AFTER_SECONDS = 15 * 60
const TABS: string[] = ['home', 'play', 'album', 'dino', 'parents']

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>({ name: 'start' })
  const sinceBreak = useRef(0)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])
  useEffect(() => {
    setSlowVoice(progress.settings.slowVoice)
  }, [progress.settings.slowVoice])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen.name])

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

  const useMic = progress.settings.mic && micSupported()
  const withMic = (steps: Step[]) => steps.filter((s) => useMic || s.type !== 'speak')

  const startLesson = (globalIndex: number) => {
    const { unit, lesson } = ALL_LESSONS[globalIndex]
    const steps = withMic(buildLesson(unit, unit.lessons.indexOf(lesson)))
    setScreen({ name: 'lesson', steps, lessonIndex: globalIndex, world: unit.world, id: Date.now() })
  }

  const startFreePlay = (unitId?: string) => {
    const steps = buildFreePlay(learnedWordIds(progress), 10, Math.random, unitId)
    const world = UNITS.find((u) => u.id === unitId)?.world ?? PLAYGROUND
    setScreen({ name: 'lesson', steps, lessonIndex: null, world, id: Date.now() })
  }

  const finishLesson = (lessonIndex: number | null, mistakes: number, combos: number) => {
    const stars = starsFor(mistakes)
    const gained = stars + combos
    const day = today()
    let sticker: string | undefined
    const lesson = lessonIndex !== null ? ALL_LESSONS[lessonIndex].lesson : undefined
    if (lesson && !progress.stickers.includes(lesson.sticker)) sticker = lesson.sticker
    const before = levelFor(progress.earned)
    const after = levelFor(progress.earned + gained)
    setProgress((p) => ({
      ...p,
      stars: lesson ? { ...p.stars, [lesson.id]: Math.max(p.stars[lesson.id] ?? 0, stars) } : p.stars,
      stickers: sticker ? [...p.stickers, sticker] : p.stickers,
      wallet: p.wallet + gained,
      earned: p.earned + gained,
      daysPlayed: p.daysPlayed.includes(day) ? p.daysPlayed : [...p.daysPlayed, day],
    }))
    setScreen({
      name: 'finish',
      stars,
      sticker,
      gained,
      combos,
      levelUp: after > before ? after : undefined,
      chest: chestAvailable(progress, day),
    })
  }

  const openChest = () =>
    setProgress((p) => ({
      ...p,
      lastChest: today(),
      wallet: p.wallet + CHEST_STARS,
      earned: p.earned + CHEST_STARS,
    }))

  const name = progress.settings.childName || 'Tudor'

  const goTab = (t: Tab) => setScreen(t === 'parents' ? { name: 'gate' } : { name: t })

  const page = () => {
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
        return <Home progress={progress} onStart={startLesson} />
      case 'play':
        return <Playground progress={progress} onPlay={startFreePlay} />
      case 'dino':
        return <DinoRoom progress={progress} onChange={setProgress} />
      case 'lesson':
        return (
          <LessonScreen
            key={screen.id}
            steps={screen.steps}
            settings={progress.settings}
            world={screen.world}
            onExit={() => setScreen({ name: screen.lessonIndex === null ? 'play' : 'home' })}
            onFinish={(m, c) => finishLesson(screen.lessonIndex, m, c)}
          />
        )
      case 'finish':
        return (
          <FinishScreen
            {...screen}
            name={name}
            mode={progress.settings.instructions}
            suggestBreak={sinceBreak.current >= BREAK_AFTER_SECONDS}
            onOpenChest={openChest}
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

  const withNav = TABS.includes(screen.name) || screen.name === 'gate'
  return (
    <OutfitContext.Provider value={progress.outfit}>
      {withNav && (
        <Nav tab={screen.name === 'gate' ? 'parents' : (screen.name as Tab)} progress={progress} onTab={goTab} />
      )}
      <div className={withNav ? 'with-nav' : ''}>{page()}</div>
    </OutfitContext.Provider>
  )
}
