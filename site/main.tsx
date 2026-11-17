// The tudoo.ro homepage is plain HTML (so the text is there before any script runs); this script only
// draws the app's own characters into the placeholders: <span data-mascot="pip"> and <span data-logo>.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Mascot, type Mood } from '../src/components/Mascot'
import { TudooLogo } from '../src/components/TudooLogo'
import { MASCOTS, type MascotId } from '../src/mascots'
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

// The numbers in "Tudoo! în cifre" count up from 0 the first time they scroll into view.
// The HTML already holds the final numbers, so without JS (or with reduced motion) nothing changes.
const counters = document.querySelectorAll<HTMLElement>('[data-count]')
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (counters.length && !reduce && 'IntersectionObserver' in window) {
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count) || 0
    const ms = 1100 + Math.min(target, 200) * 3
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) requestAnimationFrame(tick)
      else el.classList.add('counted')
    }
    requestAnimationFrame(tick)
  }
  counters.forEach((el) => (el.textContent = '0'))
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        run(e.target as HTMLElement)
      }
    },
    { threshold: 0.6 },
  )
  counters.forEach((el) => io.observe(el))
}
