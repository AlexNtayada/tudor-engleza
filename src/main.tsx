import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Voice clips used to be cached under 'voices' with no version, so re-recorded clips never reached
// phones. They now live in 'voices-2' with versioned URLs; drop the old cache once.
if (typeof caches !== 'undefined') void caches.delete('voices').catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
