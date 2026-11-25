// "Apără castelul" page: the board on one side, the question and the friends' cards on the other.
// Answer "Where is …?" right to earn a coin, spend coins to send friends up the path.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Mascot, type Mood } from '../components/Mascot'
import { Picture } from '../components/Picture'
import type { Word } from '../content'
import type { Progress } from '../progress'
import { sfx } from '../sfx'
import { instruction, speak, stopSpeaking } from '../speech'
import { Board } from './Board'
import { IslandMap } from './IslandMap'
import { LandsMap } from './LandsMap'
import { CastleSticker, castleById, currentCastle } from './castles'
import { mapById, type TowerMap } from './maps'
import {
  ASKS,
  ALLIES,
  ALLY_ORDER,
  BOARD,
  CASTLE_HP,
  ENEMIES,
  WAVES,
  canSend,
  earn,
  makeQuestion,
  newGame,
  pointAt,
  questionUnits,
  send,
  startWave,
  starsFor,
  step,
  type AllyKind,
  type Game,
  type GameEvent,
  type Question,
} from './engine'
import { AllySprite, EnemySprite, SpriteIcon } from './Sprites'
import './tower.css'

interface Fx {
  id: number
  x: number
  y: number
  born: number
  kind: 'poof' | 'hit'
}

/** One game on one land. */
export function TowerGame({
  map,
  progress,
  onEarn,
  onWin,
  onBack,
}: {
  map: TowerMap
  progress: Progress
  onEarn: (stars: number) => void
  onWin: (mapId: string) => void
  onBack: () => void
}) {
  const mode = progress.settings.instructions
  const units = useMemo(() => questionUnits(progress), [progress.stars]) // eslint-disable-line react-hooks/exhaustive-deps
  const game = useRef<Game>(newGame(map.path, map.speed))
  /** The last words asked, kept out of the next questions. */
  const recent = useRef<string[]>([])
  /** Winning this land for the first time gives its castle sticker. */
  const newCastle = useRef(!(progress.towerWins ?? []).includes(map.id))
  const fx = useRef<Fx[]>([])
  const fxId = useRef(0)
  const [, setFrame] = useState(0)
  const [paused, setPaused] = useState(false)
  const [castleHit, setCastleHit] = useState(0)
  const rewarded = useRef(false)
  const [earned, setEarned] = useState(0)

  const [q, setQ] = useState<Question>(() => makeQuestion(units))
  const [wrong, setWrong] = useState<string[]>([])
  const [right, setRight] = useState(false)
  const [mood, setMood] = useState<Mood>('talk')
  const [coinPop, setCoinPop] = useState(0)

  const g = game.current
  const over = g.phase === 'won' || g.phase === 'lost'

  const ask = useCallback(
    (question: Question) => {
      setMood('talk')
      const a = ASKS[question.ask]
      const w = question.target.say
      void speak(a.ro ? instruction(mode, a.ro, a.en.replace('{w}', w), w) : [{ text: w, lang: 'en' }])
    },
    [mode],
  )

  // Ask the first question once the page is open; stop talking when leaving.
  useEffect(() => {
    const t = setTimeout(() => ask(q), 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onEvents = useCallback(
    (events: GameEvent[]) => {
      const now = performance.now()
      for (const e of events) {
        if (e.type === 'hit') {
          sfx.tap()
          fx.current.push({ id: ++fxId.current, x: e.x, y: e.y, born: now, kind: 'hit' })
        } else if (e.type === 'defeat') {
          sfx.pop()
          fx.current.push({ id: ++fxId.current, x: e.x, y: e.y, born: now, kind: 'poof' })
        } else if (e.type === 'castle') {
          sfx.wrong()
          setCastleHit((n) => n + 1)
        } else if (e.type === 'waveDone') {
          sfx.correct()
        } else if (e.type === 'won') {
          sfx.fanfare()
          setMood('dance')
          void speak(newCastle.current ? instruction(mode, 'Abțibild nou!', 'New sticker!') : instruction(mode, 'Ai câștigat!', 'You won!'))
        } else if (e.type === 'lost') {
          setMood('oops')
          void speak(instruction(mode, 'Mai încercăm!', "Let's try again!"))
        }
      }
    },
    [mode],
  )

  // The game clock: runs while the page is open and not paused.
  useEffect(() => {
    if (paused) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const { game: next, events } = step(game.current, dt)
      game.current = next
      if (events.length) onEvents(events)
      fx.current = fx.current.filter((f) => now - f.born < 700)
      setFrame((n) => (n + 1) % 1e6)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, onEvents])

  // Pause by itself when the tab is hidden, so the castle isn't lost while nobody is looking.
  useEffect(() => {
    const onVis = () => document.hidden && setPaused(true)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Stars go to the wallet once, when the game ends.
  useEffect(() => {
    if (over && !rewarded.current) {
      rewarded.current = true
      const stars = starsFor(g)
      setEarned(stars)
      if (stars > 0) onEarn(stars)
      if (g.phase === 'won') onWin(map.id)
    }
  }, [over, g, onEarn, onWin, map.id])

  const nextQuestion = () => {
    recent.current = [...recent.current, q.target.id].slice(-5)
    const nq = makeQuestion(units, Math.random, recent.current, q.ask)
    setQ(nq)
    setWrong([])
    setRight(false)
    ask(nq)
  }

  const answer = (w: Word) => {
    if (right || wrong.includes(w.id) || over) return
    sfx.unlock()
    if (w.id === q.target.id) {
      sfx.correct()
      setRight(true)
      setMood('happy')
      game.current = earn(game.current)
      setCoinPop((n) => n + 1)
      void speak([{ text: w.say, lang: 'en' }])
      setTimeout(nextQuestion, 1300)
    } else {
      sfx.wrong()
      setMood('oops')
      setWrong((xs) => [...xs, w.id])
      void speak(instruction(mode, 'Mai încearcă!', 'Try again!'))
    }
  }

  const sendAlly = (kind: AllyKind) => {
    if (!canSend(game.current, kind)) return
    sfx.unlock()
    sfx.tap()
    game.current = send(game.current, kind)
    if (game.current.phase === 'ready') game.current = startWave(game.current)
    setFrame((n) => n + 1)
  }

  const go = () => {
    sfx.unlock()
    game.current = startWave(game.current)
    setPaused(false)
    setFrame((n) => n + 1)
  }

  const restart = () => {
    game.current = newGame(map.path, map.speed)
    rewarded.current = false
    fx.current = []
    setEarned(0)
    setPaused(false)
    setMood('talk')
    nextQuestion()
  }

  // The card to point at: enemies are coming, nobody is on the path, and there are coins for it.
  const threatened = g.enemies.length > 0 && g.allies.length === 0
  const hint: AllyKind | undefined = threatened
    ? [...ALLY_ORDER].reverse().find((k) => canSend(g, k))
    : undefined

  const now = performance.now()

  return (
    <div className="td-page">
      <div className="td-hud">
        <button className="td-pause td-back" onClick={onBack} aria-label="Înapoi la hărți">
          ←
        </button>
        <div className="td-wave">
          <small>Valul</small>
          <b>
            {Math.min(g.wave + 1, WAVES.length)}/{WAVES.length}
          </b>
        </div>
        <div className="td-coins" aria-label={`${g.coins} monede`}>
          <span className="td-coin">🪙</span>
          <b key={coinPop} className={coinPop ? 'td-bump' : ''}>
            {g.coins}
          </b>
        </div>
        <div key={castleHit} className={`td-hearts ${castleHit ? 'td-shake' : ''}`} aria-label={`Castelul are ${g.castle} inimi`}>
          {Array.from({ length: CASTLE_HP }, (_, i) => (
            <span key={i} className={i < g.castle ? '' : 'td-heart-off'}>
              ❤️
            </span>
          ))}
        </div>
        <button className="td-pause" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Continuă' : 'Pauză'} disabled={over}>
          {paused ? '▶' : '⏸'}
        </button>
      </div>

      <div className="td-board" style={{ boxShadow: `0 8px 0 ${map.edge}` }}>
        <svg viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} preserveAspectRatio="xMidYMid meet" className="td-svg">
          <Board map={map} castle={currentCastle(progress.towerWins, progress.castle)} />
          {[...g.enemies]
            .sort((a, b) => a.s - b.s)
            .map((e) => {
              const p = pointAt(e.s, map.path)
              const max = ENEMIES[e.kind].hp
              return (
                <g key={e.id} transform={`translate(${p.x} ${p.y})`}>
                  <g transform="scale(1.35)">
                    <g className={`td-walk ${e.hurt > 0 ? 'td-hurt' : ''}`}>
                      <EnemySprite kind={e.kind} slime={map.slime} boss={map.boss} />
                    </g>
                  </g>
                  {max > 1 && (
                    <g transform={`translate(${-max * 3.5} ${e.kind === 'boss' ? -104 : -64})`}>
                      {Array.from({ length: max }, (_, i) => (
                        <rect key={i} x={i * 7} y="0" width="6" height="6" rx="2" fill={i < e.hp ? '#ff5a5f' : '#e8ddd0'} stroke="#2b2118" strokeWidth="1" />
                      ))}
                    </g>
                  )}
                </g>
              )
            })}
          {g.allies.map((a) => {
            const p = pointAt(a.s, map.path)
            return (
              <g key={a.id} transform={`translate(${p.x} ${p.y})`}>
                <g transform="scale(1.35)">
                  <g className="td-walk td-ally">
                    <AllySprite kind={a.kind} />
                  </g>
                </g>
              </g>
            )
          })}
          {fx.current.map((f) => {
            const t = Math.min(1, (now - f.born) / 700)
            return f.kind === 'poof' ? (
              <g key={f.id} transform={`translate(${f.x} ${f.y - 18})`} opacity={1 - t}>
                <circle r={10 + t * 22} fill="#fff" opacity=".7" />
                <text y={-t * 30} textAnchor="middle" fontSize="20">
                  ⭐
                </text>
              </g>
            ) : (
              <g key={f.id} transform={`translate(${f.x} ${f.y - 22})`} opacity={1 - t}>
                <text textAnchor="middle" fontSize={16 + t * 8}>
                  💥
                </text>
              </g>
            )
          })}
        </svg>

        {(g.phase === 'ready' || g.phase === 'between') && (
          <div className="td-overlay td-overlay-soft">
            <div className="td-panel">
              <b className="td-panel-title">{g.phase === 'ready' ? 'Apără castelul!' : `Valul ${g.wave + 1}`}</b>
              <p>
                {g.phase === 'ready'
                  ? 'Monștrii ies din peșteră. Răspunde corect, primești 🪙 și trimiți prieteni pe drum!'
                  : 'Bravo! Strânge monede și pornește valul următor.'}
              </p>
              <button className="big-btn td-go" onClick={go}>
                Pornește ▶
              </button>
            </div>
          </div>
        )}
        {paused && !over && (
          <div className="td-overlay">
            <button className="big-btn td-go" onClick={() => setPaused(false)}>
              Continuă ▶
            </button>
          </div>
        )}
        {over && (
          <div className="td-overlay">
            <div className="td-panel">
              <Mascot size={120} mood={g.phase === 'won' ? 'dance' : 'oops'} />
              <b className="td-panel-title">{g.phase === 'won' ? 'Castelul e salvat!' : 'Monștrii au intrat!'}</b>
              {g.phase === 'won' && newCastle.current && (
                <div className="td-new-castle">
                  <CastleSticker id={map.id} size={120} />
                  <span>
                    Abțibild nou: <b>{castleById(map.id).name}</b>! Îl găsești în Album.
                  </span>
                </div>
              )}
              <p>
                Ai oprit {g.stopped} {g.stopped === 1 ? 'monstru' : 'monștri'}.
                {earned > 0 && (
                  <>
                    {' '}
                    Primești <b>{earned} ⭐</b>
                  </>
                )}
              </p>
              <button className="big-btn td-go" onClick={restart}>
                Joacă din nou
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="td-side">
        <div className={`td-question ${right ? 'td-question-right' : ''}`}>
          <div className="td-ask">
            <span className="td-friend">
              <Mascot size={78} mood={mood} />
            </span>
            <div className="td-bubble">
              <span>
                {ASKS[q.ask].bubble.split('{w}')[0]}
                <b>{q.target.en}</b>
                {ASKS[q.ask].bubble.split('{w}')[1]}
              </span>
              <button className="td-replay" onClick={() => ask(q)} aria-label="Ascultă din nou">
                🔊
              </button>
            </div>
          </div>
          <div className="td-options">
            {q.options.map((w) => (
              <button
                key={`${q.target.id}-${w.id}`}
                className={`td-option ${right && w.id === q.target.id ? 'td-option-right' : ''} ${wrong.includes(w.id) ? 'td-option-wrong' : ''}`}
                onClick={() => answer(w)}
                aria-label={w.en}
              >
                <Picture word={w} size={64} />
                {right && w.id === q.target.id && <span className="td-plus">+1 🪙</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="td-cards">
          {ALLY_ORDER.map((k) => {
            const a = ALLIES[k]
            const ok = canSend(g, k)
            return (
              <button
                key={k}
                className={`td-card td-card-${k} ${ok ? '' : 'td-card-off'} ${hint === k ? 'td-card-hint' : ''}`}
                onClick={() => sendAlly(k)}
                disabled={!ok}
                aria-label={`Trimite ${a.name}, costă ${a.cost} monede`}
              >
                <SpriteIcon ally={k} size={54} />
                <span className="td-card-name">{a.name}</span>
                <span className="td-card-cost">
                  {a.cost} 🪙 · 💪{a.power}
                </span>
              </button>
            )
          })}
        </div>

        <ol className="td-how">
          <li>
            <span>👂</span> Ascultă și alege poza bună: primești o monedă 🪙
          </li>
          <li>
            <span>👆</span> Apasă pe un prieten: pleacă pe drum și oprește monștrii
          </li>
          <li>
            <span>🏰</span> Ține monștrii departe de castel 5 valuri
          </li>
        </ol>
      </div>
    </div>
  )
}

/** Wide screens get the whole island at once; phones get the long road. */
function useWide(): boolean {
  const q = '(min-width: 901px)'
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

/** The castle page: pick a land, then defend the castle there. */
export function Tower({
  progress,
  onEarn,
  onWin,
  onAlbum,
}: {
  progress: Progress
  onEarn: (stars: number) => void
  onWin: (mapId: string) => void
  onAlbum: () => void
}) {
  const wins = progress.towerWins ?? []
  const [playing, setPlaying] = useState<string | null>(null)
  const wide = useWide()
  if (playing) {
    return <TowerGame key={playing} map={mapById(playing)} progress={progress} onEarn={onEarn} onWin={onWin} onBack={() => setPlaying(null)} />
  }
  const castle = castleById(currentCastle(wins, progress.castle))
  return (
    <div className={`page page-white td-lands ${wide ? 'td-lands-wide' : ''}`}>
      <div className={wide ? 'td-isl-wrap' : ''}>
        <header className="td-lands-head">
          <h2>Apără castelul!</h2>
          <button className="td-my-castle" onClick={onAlbum} aria-label="Schimbă castelul din Album">
            <CastleSticker id={castle.id} size={84} />
            <span>
              <b>{castle.name}</b>
              <small>📒 Schimbă-l din Album</small>
            </span>
          </button>
        </header>
        {wide ? <IslandMap wins={wins} onPlay={setPlaying} /> : <LandsMap wins={wins} onPlay={setPlaying} />}
      </div>
    </div>
  )
}
