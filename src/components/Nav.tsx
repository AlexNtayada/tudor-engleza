import { Dino } from './Dino'
import { levelFor } from '../gamify'
import type { Progress } from '../progress'

export type Tab = 'home' | 'play' | 'album' | 'dino' | 'parents'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🗺️', label: 'Hartă' },
  { id: 'play', icon: '🎈', label: 'Joacă' },
  { id: 'album', icon: '📒', label: 'Album' },
  { id: 'dino', icon: '🦖', label: 'Dino' },
  { id: 'parents', icon: '🔒', label: 'Părinți' },
]

function Logo() {
  return (
    <span className="logo">
      <Dino size={52} mood="idle" />
      <span className="logo-text">
        Dino <b>English</b>
      </span>
    </span>
  )
}

/** Top bar (logo, links on desktop, stars and level) plus a bottom tab bar on phones. */
export function Nav({ tab, progress, onTab }: { tab: Tab; progress: Progress; onTab: (t: Tab) => void }) {
  const links = TABS.map((t) => (
    <button
      key={t.id}
      className={`nav-link ${tab === t.id ? 'on' : ''} ${t.id === 'parents' ? 'nav-parents' : ''}`}
      onClick={() => onTab(t.id)}
      aria-current={tab === t.id ? 'page' : undefined}
    >
      <span className="nav-icon">{t.icon}</span>
      <span className="nav-label">{t.label}</span>
    </button>
  ))
  return (
    <>
      <header className="appbar">
        <button className="logo-btn" onClick={() => onTab('home')} aria-label="Acasă">
          <Logo />
        </button>
        <nav className="appbar-links">{links}</nav>
        <div className="appbar-stats">
          <span className="pill" aria-label="Stele">
            ⭐ {progress.wallet}
          </span>
          <span className="pill pill-level" aria-label="Nivel">
            🦖 {levelFor(progress.earned)}
          </span>
        </div>
      </header>
      <nav className="tabbar">{links}</nav>
    </>
  )
}
