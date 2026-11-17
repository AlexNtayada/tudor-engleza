import { useEffect, useRef, useState } from 'react'
import { Ninja } from './Ninja'
import { levelFor } from '../gamify'
import type { Progress } from '../progress'

export type Tab = 'home' | 'play' | 'sentences' | 'speech' | 'album' | 'dino' | 'parents'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🗺️', label: 'Hartă' },
  { id: 'play', icon: '🎈', label: 'Joacă' },
  { id: 'sentences', icon: '💬', label: 'Propoziții' },
  { id: 'speech', icon: '👅', label: 'Sunete' },
  { id: 'album', icon: '📒', label: 'Album' },
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
  const bar = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const overHero = tab === 'home'
  useEffect(() => {
    // The home hero runs up behind the bar: it needs the bar's height, and the bar turns solid once you scroll.
    const el = bar.current
    if (!el) return
    const setH = () => document.documentElement.style.setProperty('--appbar-h', `${el.offsetHeight}px`)
    setH()
    const ro = new ResizeObserver(setH)
    ro.observe(el)
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return (
    <>
      <header ref={bar} className={`appbar ${overHero && !scrolled ? 'appbar-hero' : ''}`}>
        <button className="logo-btn" onClick={() => onTab('home')} aria-label="Acasă">
          <Logo />
        </button>
        <nav className="appbar-links">{links}</nav>
        <div className="profile" aria-label={`Ninja, nivelul ${levelFor(progress.earned)}, ${progress.wallet} stele`}>
          <span className="profile-stars">
            <span className="profile-star">⭐</span>
            <b>{progress.wallet}</b>
          </span>
          <button className={`avatar ${tab === 'dino' ? 'avatar-on' : ''}`} onClick={() => onTab('dino')} aria-label="Pagina lui Ninja" title="Pagina lui Ninja">
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
