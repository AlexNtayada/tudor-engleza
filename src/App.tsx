import { mascotById, setActiveMascot, type MascotId } from './mascots'
import { MascotPicker } from './screens/MascotPicker'
import { useEffect, useRef, useState } from 'react'
import { ALL_LESSONS, PLAYGROUND, UNITS, type World } from './content'
import { buildFreePlay, buildLesson, starsFor, type Step } from './lessons'
import { hasPlayed, learnedWordIds, loadProgress, saveProgress, today, type Progress } from './progress'
import { addChild, applyFamily, familyFrom, loadStore, removeChild, saveStore, type Family, type ProfileStore } from './profiles'
import { accountsEnabled, fetchFamily, finishRedirect, saveFamily, signedInEmail, signOut } from './account'
import { setSfxEnabled } from './sfx'
import { OnboardLevel, OnboardName } from './screens/Onboarding'
import { SettingsScreen } from './screens/Settings'
import { AccountScreen, SyncChoice } from './screens/Account'
import { BOSS_BONUS, chestAvailable, CHEST_STARS, claimSetRewards, levelFor, streakDays, type Item } from './gamify'
import { Home } from './screens/Home'
import { LessonScreen, type BossResult } from './screens/Lesson'
import { Album, BreakScreen, FinishScreen, ParentGate, Parents, StartScreen } from './screens/Other'
import { NinjaRoom, Playground } from './screens/Rewards'
import { Nav, type Tab } from './components/Nav'
import { OutfitContext } from './components/Outfit'
import { instruction, setSlowVoice, speak } from './speech'
import { micSupported } from './recorder'
import { Logopedie } from './logopedie/Logopedie'
import { Propozitii, SentenceLesson } from './propozitii/Propozitii'
import { PACKS } from './propozitii/data'
import { buildSentenceLesson, type SentenceStep } from './propozitii/lessons'

/** The greeting when the app opens is played softer, so it doesn't startle. */
const GREETING_VOLUME = 0.55

type Screen =
  | { name: 'start' }
  | { name: Tab }
  | {
      name: 'lesson'
      steps: Step[]
      lessonIndex: number | null
      world: World
      id: number
      boss?: string
    }
  | {
      name: 'finish'
      stars: number
      sticker?: string
      gained: number
      combos: number
      levelUp?: number
      chest: boolean
      boss?: BossResult
      lessonIndex: number | null
      gifts: Item[]
      /** Set when the round was a sentence pack: go back to the sentences page, retry the same pack. */
      pack?: string
    }
  | { name: 'sentence'; pack: string; steps: SentenceStep[]; id: number }
  | { name: 'gate' }
  /** Pick the friend: from the intro (then go home) or from the friend's page / Parents (then go back). */
  | { name: 'pick'; back: 'start' | 'dino' | 'settings' | 'onboard' }
  | { name: 'break' }
  /** First run for a new child: name, then the friend picker, then the level. */
  | { name: 'onboard'; step: 'name' | 'level' }
  | { name: 'settings' }
  | { name: 'account'; back: 'settings' | 'onboard' }
  | { name: 'sync'; remote: Family }

const BREAK_AFTER_SECONDS = 15 * 60
const TABS: string[] = ['home', 'play', 'sentences', 'speech', 'album', 'dino', 'parents']

export default function App() {
  const [store, setStore] = useState<ProfileStore>(loadStore)
  const [progress, setProgress] = useState<Progress>(() => claimSetRewards(loadProgress(loadStore().active)).progress)
  const [screen, setScreen] = useState<Screen>({ name: 'start' })
  const [email, setEmail] = useState<string | undefined>(signedInEmail)
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const sinceBreak = useRef(0)
  /** The last progress written for each child, so loading or switching a child is not counted as a change. */
  const lastSaved = useRef<string>('')
  const pushTimer = useRef<number>()
  // Set before rendering so every screen (and every spoken sentence) uses the friend the child picked.
  setActiveMascot(progress.mascot)

  const adoptFamily = (f: Family) => {
    const next = applyFamily(f)
    if (!next) return
    const p = claimSetRewards(loadProgress(next.active)).progress
    lastSaved.current = next.active + JSON.stringify(p)
    setStore(next)
    setProgress(p)
  }

  const pushFamily = (s: ProfileStore, p: Progress) => {
    window.clearTimeout(pushTimer.current)
    setSyncState('saving')
    pushTimer.current = window.setTimeout(() => {
      saveFamily(familyFrom(s, p)).then(
        () => setSyncState('saved'),
        () => setSyncState('error'),
      )
    }, 2500)
  }

  useEffect(() => {
    saveProgress(progress, store.active)
    const json = store.active + JSON.stringify(progress)
    if (json === lastSaved.current) return
    const first = lastSaved.current === ''
    lastSaved.current = json
    if (first) return
    const name = progress.settings.childName
    const next = {
      ...store,
      list: store.list.map((c) => (c.id === store.active ? { ...c, name } : c)),
      updatedAt: new Date().toISOString(),
    }
    saveStore(next)
    if (email) pushFamily(next, progress)
  }, [progress, store.active])

  // Account: finish a Google sign-in, else bring in a newer copy saved from another device.
  useEffect(() => {
    if (!accountsEnabled) return
    void (async () => {
      try {
        const viaGoogle = await finishRedirect()
        if (viaGoogle) return signedIn(viaGoogle)
        if (!signedInEmail()) return
        const remote = await fetchFamily()
        if (remote && remote.savedAt > (loadStore().updatedAt || '')) adoptFamily(remote)
        else if (!remote || remote.savedAt < loadStore().updatedAt) pushFamily(loadStore(), progress)
        setSyncState('saved')
      } catch {
        setSyncState('error')
      }
    })()
  }, [])

  /** Right after the parent signs in: merge the account with what this device has. */
  const signedIn = async (who: string) => {
    setEmail(who)
    const remote = await fetchFamily().catch(() => undefined)
    const local = familyFrom(loadStore(), progress)
    const back: Screen = progress.onboarded === false ? { name: 'onboard', step: 'name' } : { name: 'settings' }
    if (!remote?.profiles?.length) {
      setSyncState('saving')
      await saveFamily(local).then(
        () => setSyncState('saved'),
        () => setSyncState('error'),
      )
      setScreen(back)
    } else if (!local.profiles.some((c) => hasPlayed(c.progress))) {
      adoptFamily(remote)
      setSyncState('saved')
      setScreen({ name: 'home' })
    } else {
      setScreen({ name: 'sync', remote })
    }
  }

  const switchChild = (id: string, next: ProfileStore = store) => {
    const s = { ...next, active: id }
    saveStore(s)
    const p = claimSetRewards(loadProgress(id)).progress
    lastSaved.current = id + JSON.stringify(p)
    setStore(s)
    setProgress(p)
    return p
  }

  useEffect(() => {
    setSfxEnabled(progress.settings.sfx)
  }, [progress.settings.sfx])
  useEffect(() => {
    setSlowVoice(progress.settings.slowVoice)
  }, [progress.settings.slowVoice])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen.name])

  // Count play time while a lesson is open and the tab is visible.
  useEffect(() => {
    if (screen.name !== 'lesson' && screen.name !== 'sentence') return
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
    setScreen({
      name: 'lesson',
      steps,
      lessonIndex: globalIndex,
      world: unit.world,
      id: Date.now(),
      boss: lesson.boss ? unit.id : undefined,
    })
  }

  const startFreePlay = (unitId?: string) => {
    const steps = buildFreePlay(learnedWordIds(progress), 10, Math.random, unitId)
    const world = UNITS.find((u) => u.id === unitId)?.world ?? PLAYGROUND
    setScreen({ name: 'lesson', steps, lessonIndex: null, world, id: Date.now() })
  }

  const finishLesson = (lessonIndex: number | null, mistakes: number, combos: number, boss?: BossResult) => {
    const day = today()
    const found = lessonIndex !== null ? ALL_LESSONS[lessonIndex] : undefined
    const lost = !!boss && !boss.defeated
    // A boss that got away gives no lesson stars (the next unit stays locked), only a star for trying.
    const stars = lost ? 0 : starsFor(mistakes)
    const gained = lost ? 1 : stars + combos + (boss ? BOSS_BONUS : 0)
    const lesson = lost ? undefined : found?.lesson
    const sticker = lesson && !progress.stickers.includes(lesson.sticker) ? lesson.sticker : undefined
    const before = levelFor(progress.earned)
    const after = levelFor(progress.earned + gained)

    let next: Progress = {
      ...progress,
      stars: lesson ? { ...progress.stars, [lesson.id]: Math.max(progress.stars[lesson.id] ?? 0, stars) } : progress.stars,
      stickers: sticker ? [...progress.stickers, sticker] : progress.stickers,
      wallet: progress.wallet + gained,
      earned: progress.earned + gained,
      daysPlayed: progress.daysPlayed.includes(day) ? progress.daysPlayed : [...progress.daysPlayed, day],
    }
    if (boss && found) {
      const score = boss.total ? boss.correct / boss.total : 0
      const prev = next.boss[found.unit.id]
      next = {
        ...next,
        boss: {
          ...next.boss,
          [found.unit.id]: {
            best: Math.max(prev?.best ?? 0, score),
            tries: (prev?.tries ?? 0) + 1,
            beaten: (prev?.beaten ?? false) || boss.defeated,
            last: score,
            lastDay: day,
          },
        },
      }
    }
    const claimed = claimSetRewards(next)
    setProgress(claimed.progress)
    setScreen({
      name: 'finish',
      stars,
      sticker,
      gained,
      combos,
      levelUp: after > before ? after : undefined,
      chest: chestAvailable(progress, day),
      boss,
      lessonIndex,
      gifts: claimed.given,
    })
  }

  const startSentences = (packId: string) => {
    const pack = PACKS.find((p) => p.id === packId)
    if (!pack) return
    const steps = buildSentenceLesson(pack).filter((s) => useMic || s.type !== 'say')
    setScreen({ name: 'sentence', pack: packId, steps, id: Date.now() })
  }

  const finishSentences = (packId: string, mistakes: number) => {
    const day = today()
    const stars = starsFor(mistakes)
    const before = levelFor(progress.earned)
    const after = levelFor(progress.earned + stars)
    setProgress({
      ...progress,
      sentences: { ...progress.sentences, [packId]: Math.max(progress.sentences[packId] ?? 0, stars) },
      wallet: progress.wallet + stars,
      earned: progress.earned + stars,
      daysPlayed: progress.daysPlayed.includes(day) ? progress.daysPlayed : [...progress.daysPlayed, day],
    })
    setScreen({
      name: 'finish',
      stars,
      gained: stars,
      combos: 0,
      levelUp: after > before ? after : undefined,
      chest: chestAvailable(progress, day),
      lessonIndex: null,
      gifts: [],
      pack: packId,
    })
  }

  const openChest = () =>
    setProgress((p) => ({
      ...p,
      lastChest: today(),
      wallet: p.wallet + CHEST_STARS,
      earned: p.earned + CHEST_STARS,
    }))

  const name = progress.settings.childName || (progress.onboarded === false ? 'prietene' : 'Tudor')

  const earnSpeech = (key: string, stars: number) =>
    setProgress((p) => {
      const d = today()
      const log = p.speechLog[d] ?? []
      return {
        ...p,
        wallet: p.wallet + stars,
        earned: p.earned + stars,
        speechLog: { ...p.speechLog, [d]: log.includes(key) ? log : [...log, key] },
      }
    })

  const goTab = (t: Tab) => setScreen(t === 'parents' ? { name: 'gate' } : { name: t })

  const page = () => {
    switch (screen.name) {
      case 'start':
        return (
          <StartScreen
            name={name}
            chosen={progress.mascot}
            onPick={() => {
              if (progress.onboarded === false) return setScreen({ name: 'onboard', step: 'name' })
              void speak([
                { text: 'Hello.', lang: 'en' },
                ...instruction(progress.settings.instructions, 'Alege-ți un prieten!', 'Pick a friend!'),
              ], { volume: GREETING_VOLUME })
              setScreen({ name: 'pick', back: 'start' })
            }}
            onPlay={() => {
              void speak([
                { text: 'Hello.', lang: 'en' },
                ...instruction(progress.settings.instructions, 'Hai să învățăm engleză.', "Let's learn English!"),
              ], { volume: GREETING_VOLUME })
              setScreen({ name: 'home' })
            }}
          />
        )
      case 'home':
        return <Home progress={progress} onStart={startLesson} onFreePlay={() => startFreePlay()} onTab={goTab} />
      case 'play':
        return <Playground progress={progress} onPlay={startFreePlay} />
      case 'speech':
        return <Logopedie progress={progress} onEarn={earnSpeech} onParents={() => setScreen({ name: 'gate' })} />
      case 'sentences':
        return <Propozitii progress={progress} onStart={startSentences} />
      case 'sentence': {
        const pack = PACKS.find((p) => p.id === screen.pack)!
        return (
          <SentenceLesson
            key={screen.id}
            pack={pack}
            steps={screen.steps}
            settings={progress.settings}
            onExit={() => setScreen({ name: 'sentences' })}
            onFinish={(m) => finishSentences(screen.pack, m)}
          />
        )
      }
      case 'dino':
        return <NinjaRoom progress={progress} onChange={setProgress} onPickFriend={() => setScreen({ name: 'pick', back: 'dino' })} />
      case 'pick':
        return (
          <MascotPicker
            current={progress.mascot}
            name={name}
            mode={progress.settings.instructions}
            onBack={() =>
              setScreen(
                screen.back === 'onboard'
                  ? { name: 'onboard', step: 'name' }
                  : screen.back === 'start'
                    ? { name: 'start' }
                    : screen.back === 'settings'
                      ? { name: 'settings' }
                      : { name: screen.back },
              )
            }
            onPick={(id: MascotId) => {
              const m = mascotById(id)
              setProgress((p) => ({ ...p, mascot: id }))
              if (screen.back === 'onboard') {
                void speak([{ text: m.hello, lang: 'en' }])
                setScreen({ name: 'onboard', step: 'level' })
              } else if (screen.back === 'start') {
                void speak([
                  { text: 'Hello.', lang: 'en' },
                  ...instruction(progress.settings.instructions, 'Hai să învățăm engleză.', "Let's learn English!"),
                ], { volume: GREETING_VOLUME })
                setScreen({ name: 'home' })
              } else {
                void speak([{ text: m.hello, lang: 'en' }])
                setScreen(screen.back === 'settings' ? { name: 'settings' } : { name: 'dino' })
              }
            }}
          />
        )
      case 'lesson':
        return (
          <LessonScreen
            key={screen.id}
            steps={screen.steps}
            settings={progress.settings}
            world={screen.world}
            onExit={() => setScreen({ name: screen.lessonIndex === null ? 'play' : 'home' })}
            boss={screen.boss}
            onFinish={(m, c, b) => finishLesson(screen.lessonIndex, m, c, b)}
          />
        )
      case 'finish':
        return (
          <FinishScreen
            {...screen}
            name={name}
            earned={progress.earned}
            streak={streakDays(progress.daysPlayed)}
            mode={progress.settings.instructions}
            suggestBreak={progress.settings.breaks && sinceBreak.current >= BREAK_AFTER_SECONDS}
            onOpenChest={openChest}
            onContinue={() => setScreen({ name: screen.pack ? 'sentences' : 'home' })}
            onRetry={
              screen.pack
                ? () => startSentences(screen.pack!)
                : screen.lessonIndex !== null
                  ? () => startLesson(screen.lessonIndex!)
                  : undefined
            }
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
        return (
          <Parents
            progress={progress}
            onChange={setProgress}
            onBack={() => setScreen({ name: 'home' })}
            onSettings={() => setScreen({ name: 'settings' })}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            progress={progress}
            store={store}
            email={email}
            syncState={syncState}
            onChange={setProgress}
            onBack={() => setScreen({ name: 'parents' })}
            onPickFriend={() => setScreen({ name: 'pick', back: 'settings' })}
            onAccount={() => setScreen({ name: 'account', back: 'settings' })}
            onSignOut={() => {
              void signOut()
              setEmail(undefined)
              setSyncState('idle')
            }}
            onSwitchChild={(id) => {
              switchChild(id)
              setScreen({ name: 'home' })
            }}
            onAddChild={() => {
              const next = addChild(store)
              saveStore(next)
              switchChild(next.active, next)
              setScreen({ name: 'onboard', step: 'name' })
            }}
            onRemoveChild={(id) => {
              const next = removeChild(store, id)
              saveStore(next)
              setStore(next)
              if (email) pushFamily(next, progress)
            }}
          />
        )
      case 'onboard':
        return screen.step === 'name' ? (
          <OnboardName
            initial={progress.settings.childName}
            canLogIn={accountsEnabled && !email}
            onLogIn={() => setScreen({ name: 'account', back: 'onboard' })}
            onNext={(childName) => {
              setProgress((p) => ({ ...p, settings: { ...p.settings, childName } }))
              void speak([{ text: 'Hello.', lang: 'en' }, ...instruction(progress.settings.instructions, 'Alege-ți un prieten!', 'Pick a friend!')])
              setScreen({ name: 'pick', back: 'onboard' })
            }}
          />
        ) : (
          <OnboardLevel
            name={name}
            settings={progress.settings}
            onDone={(patch) => {
              setProgress((p) => ({ ...p, onboarded: true, settings: { ...p.settings, ...patch } }))
              void speak([
                { text: 'Hello.', lang: 'en' },
                ...instruction(patch.instructions ?? progress.settings.instructions, 'Hai să învățăm engleză.', "Let's learn English!"),
              ])
              setScreen({ name: 'home' })
            }}
          />
        )
      case 'account':
        return (
          <AccountScreen
            childName={progress.settings.childName}
            onBack={() => setScreen(screen.back === 'onboard' ? { name: 'onboard', step: 'name' } : { name: 'settings' })}
            onSignedIn={signedIn}
          />
        )
      case 'sync':
        return (
          <SyncChoice
            onUseAccount={() => {
              adoptFamily(screen.remote)
              setSyncState('saved')
              setScreen({ name: 'home' })
            }}
            onUseDevice={() => {
              setSyncState('saving')
              saveFamily(familyFrom(loadStore(), progress)).then(
                () => setSyncState('saved'),
                () => setSyncState('error'),
              )
              setScreen({ name: 'settings' })
            }}
          />
        )
    }
  }

  const withNav = TABS.includes(screen.name) || screen.name === 'gate' || screen.name === 'settings'
  return (
    <OutfitContext.Provider value={progress.outfit}>
      {withNav && (
        <Nav tab={screen.name === 'gate' || screen.name === 'settings' ? 'parents' : (screen.name as Tab)} progress={progress} onTab={goTab} />
      )}
      <div className={withNav ? 'with-nav' : ''}>{page()}</div>
    </OutfitContext.Provider>
  )
}
