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
