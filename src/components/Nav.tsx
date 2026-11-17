import { Ninja } from './Ninja'
import { levelFor } from '../gamify'
import type { Progress } from '../progress'

export type Tab = 'home' | 'play' | 'speech' | 'album' | 'dino' | 'parents'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🗺️', label: 'Hartă' },
  { id: 'play', icon: '🎈', label: 'Joacă' },
  { id: 'speech', icon: '👅', label: 'Sunete' },
  { id: 'album', icon: '📒', label: 'Album' },
  { id: 'dino', icon: '🥷', label: 'Ninja' },
  { id: 'parents', icon: '🔒', label: 'Părinți' },
]

function Logo() {
  return (
    <span className="logo">
      <Ninja size={52} mood="idle" />
      <span className="logo-text">
        Ninja <b>English</b>
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
        <div className="profile" aria-label={`Ninja, nivelul ${levelFor(progress.earned)}, ${progress.wallet} stele`}>
          <span className="profile-stars">
            <span className="profile-star">⭐</span>
            <b>{progress.wallet}</b>
          </span>
          <button className="avatar" onClick={() => onTab('dino')} aria-label="Pagina lui Ninja" title="Pagina lui Ninja">
            <span className="avatar-face">
              <Ninja size={92} mood="idle" />
            </span>
            <span className="avatar-level">{levelFor(progress.earned)}</span>
          </button>
        </div>
      </header>
      <nav className="tabbar">{links}</nav>
    </>
  )
}
