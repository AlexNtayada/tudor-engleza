// The tudoo.ro homepage is plain HTML (so the text is there before any script runs); this script only
// draws the app's own characters into the placeholders: <span data-mascot="pip"> and <span data-logo>.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Mascot, type Mood } from '../src/components/Mascot'
import { TudooLogo } from '../src/components/TudooLogo'
import { MASCOTS, type MascotId } from '../src/mascots'
import { ALL_LESSONS, UNITS } from '../src/content'
import './site.css'

const ids = new Set<string>(MASCOTS.map((m) => m.id))

document.querySelectorAll<HTMLElement>('[data-mascot]').forEach((el) => {
  const kind = el.dataset.mascot ?? ''
  if (!ids.has(kind)) return
  const size = Number(el.dataset.size) || 120
  const mood = (el.dataset.mood ?? 'idle') as Mood
  createRoot(el).render(
    <StrictMode>
      <Mascot kind={kind as MascotId} size={size} mood={mood} outfit={{}} />
    </StrictMode>,
  )
})

document.querySelectorAll<HTMLElement>('[data-logo]').forEach((el) => createRoot(el).render(<TudooLogo />))

// Friends cheer when you point at them.
document.querySelectorAll<HTMLElement>('.friend').forEach((card) => {
  const dino = () => card.querySelector('.dino')
  card.addEventListener('pointerenter', () => dino()?.classList.replace('dino-idle', 'dino-happy'))
  card.addEventListener('pointerleave', () => dino()?.classList.replace('dino-happy', 'dino-idle'))
})

// Numbers and world names come from the app's own content, so the page follows when worlds are added.
// (The HTML keeps the same values as a fallback for crawlers and for visitors without scripts.)
const STATS: Record<string, number> = {
  units: UNITS.length,
  words: UNITS.reduce((n, u) => n + u.words.length, 0),
  lessons: ALL_LESSONS.length,
  friends: MASCOTS.length,
}

document.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
  const key = el.dataset.stat ?? ''
  if (key === 'worlds') {
    const names = UNITS.map((u) => u.title.toLocaleLowerCase('ro-RO'))
    const text = names.length > 1 ? `${names.slice(0, -1).join(', ')} și ${names[names.length - 1]}` : names.join('')
    el.textContent = text.charAt(0).toLocaleUpperCase('ro-RO') + text.slice(1)
  } else if (key === 'unitsDe') {
    // Romanian puts "de" between a number and the noun from 20 on ("13 lumi", "20 de lumi").
    const n = STATS.units
    el.textContent = n % 100 >= 20 || n % 100 === 0 ? `${n} de` : String(n)
  } else if (key in STATS) el.textContent = String(STATS[key])
})

// The stat tiles count up from 0 the first time they scroll into view.
const counters = [...document.querySelectorAll<HTMLElement>('[data-count]')]
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function countUp(el: HTMLElement, to: number) {
  const ms = 1400
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = String(Math.round(to * eased))
    if (t < 1) requestAnimationFrame(tick)
    else el.classList.add('counted')
  }
  requestAnimationFrame(tick)
}

counters.forEach((el) => {
  const to = STATS[el.dataset.count ?? ''] ?? Number(el.textContent)
  el.textContent = String(to)
})

if (!still && 'IntersectionObserver' in window) {
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        seen.unobserve(el)
        countUp(el, STATS[el.dataset.count ?? ''] ?? Number(el.textContent))
      }
    },
    { threshold: 0.6 },
  )
  counters.forEach((el) => {
    // Keep the tile from changing width while the digits run.
    el.style.minWidth = `${el.textContent?.length ?? 1}ch`
    el.textContent = '0'
    seen.observe(el)
  })
}
