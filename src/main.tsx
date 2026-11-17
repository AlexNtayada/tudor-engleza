/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { registerSW } from 'virtual:pwa-register'

// Fixes (like a re-recorded voice) should reach the phone without the parent closing the app:
// look for a new version every 10 minutes and whenever the app comes back to the screen.
// autoUpdate then switches to it right away.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const check = () => void reg.update().catch(() => {})
    setInterval(check, 10 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check()
    })
  },
})

// Voice clips used to be cached under 'voices' with no version, so re-recorded clips never reached
// phones. They now live in 'voices-2' with versioned URLs; drop the old cache once.
if (typeof caches !== 'undefined') void caches.delete('voices').catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
