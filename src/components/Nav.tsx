import { mascot } from '../mascots'
import { useEffect, useRef, useState } from 'react'
import { Mascot } from './Mascot'
import { TudooLogo } from './TudooLogo'
import { levelFor } from '../gamify'
import type { Progress } from '../progress'

export type Tab = 'home' | 'play' | 'tower' | 'sentences' | 'speech' | 'album' | 'dino' | 'parents'

const FRIEND_ICON: Record<string, string> = { ninja: '🥷', pip: '🦊', bobo: '🐻', rici: '🦔', bip: '🤖', zuzu: '🐲' }

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🗺️', label: 'Hartă' },
  { id: 'play', icon: '🎈', label: 'Joacă' },
  { id: 'tower', icon: '🏰', label: 'Castelul' },
  { id: 'sentences', icon: '💬', label: 'Propoziții' },
  { id: 'speech', icon: '👅', label: 'Sunete' },
  { id: 'album', icon: '📒', label: 'Album' },
  // The friend's page (wardrobe); its icon and name follow the chosen friend. Parents get in through Settings.
  { id: 'dino', icon: '', label: '' },
]

function Logo() {
  return (
    <span className="logo">
      <span className="logo-text">
        <TudooLogo />
      </span>
    </span>
  )
}

/** Top bar (logo, links on desktop, stars and level) plus a bottom tab bar on phones. */
export function Nav({
  tab,
  progress,
  onTab,
  onSettings,
}: {
  tab: Tab
  progress: Progress
  onTab: (t: Tab) => void
  /** Settings, behind the parents' gate. */
  onSettings: () => void
}) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menu) return
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [menu])
  const childName = progress.settings.childName || 'Profil'
  const go = (fn: () => void) => () => {
    setMenu(false)
    fn()
  }
  const links = TABS.map((t) => (
    <button
      key={t.id}
      className={`nav-link ${tab === t.id ? 'on' : ''}`}
      onClick={() => onTab(t.id)}
      aria-current={tab === t.id ? 'page' : undefined}
    >
      <span className="nav-icon">{t.id === 'dino' ? FRIEND_ICON[mascot().id] ?? '🥷' : t.icon}</span>
      <span className="nav-label">{t.id === 'dino' ? mascot().name : t.label}</span>
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
        <a className="logo-btn" href="../" aria-label="Tudoo! – pagina principală">
          <Logo />
        </a>
        <nav className="appbar-links">{links}</nav>
        <div className="profile" ref={menuRef} aria-label={`${mascot().name}, nivelul ${levelFor(progress.earned)}, ${progress.wallet} stele`}>
          <span className="profile-stars">
            <span className="profile-star">⭐</span>
            <b>{progress.wallet}</b>
          </span>
          <button
            className={`avatar ${tab === 'dino' || menu ? 'avatar-on' : ''}`}
            onClick={() => setMenu((m) => !m)}
            aria-label={`Profilul lui ${childName}`}
            aria-haspopup="menu"
            aria-expanded={menu}
            title={`Profilul lui ${childName}`}
          >
            <span className="avatar-face">
              <Mascot size={92} mood="idle" />
            </span>
            <span className="avatar-level">{levelFor(progress.earned)}</span>
          </button>
          {menu && (
            <div className="profile-menu" role="menu">
              <div className="profile-menu-head">
                <span className="profile-menu-face">
                  <Mascot size={110} mood="happy" />
                </span>
                <span className="profile-menu-who">
                  <b>{childName}</b>
                  <span>
                    cu {mascot().name} · nivelul {levelFor(progress.earned)}
                  </span>
                </span>
              </div>
              <button role="menuitem" onClick={go(onSettings)}>
                <span aria-hidden="true">⚙️</span> Setări <small>pentru părinți</small>
              </button>
            </div>
          )}
        </div>
      </header>
      <nav className="tabbar">{links}</nav>
    </>
  )
}
