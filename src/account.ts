// Parent account, kept in Supabase (EU). Talks to its REST endpoints with fetch, so the app stays
// a static site. Accounts are off until the build gets VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// (see docs/conturi.md). The account only stores the parent's email and the family's progress.
import type { Family } from './profiles'

const URL_BASE = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

export const accountsEnabled = !!URL_BASE && !!ANON
export const googleEnabled = accountsEnabled && import.meta.env.VITE_SUPABASE_GOOGLE === '1'

interface Session {
  access_token: string
  refresh_token: string
  /** Seconds since epoch. */
  expires_at: number
  user: { id: string; email: string }
}

const SESSION = 'tudoo-session'

function readSession(): Session | undefined {
  try {
    const raw = localStorage.getItem(SESSION)
    return raw ? (JSON.parse(raw) as Session) : undefined
  } catch {
    return undefined
  }
}

function writeSession(s: Session | undefined) {
  try {
    if (s) localStorage.setItem(SESSION, JSON.stringify(s))
    else localStorage.removeItem(SESSION)
  } catch {
    /* storage unavailable */
  }
}

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const headers: Record<string, string> = {
    apikey: ANON,
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (init.token) headers.Authorization = `Bearer ${init.token}`
  const res = await fetch(`${URL_BASE}${path}`, { ...init, headers })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try {
      const j = JSON.parse(text) as { msg?: string; message?: string; error_description?: string }
      msg = j.msg ?? j.message ?? j.error_description ?? text
    } catch {
      /* keep the raw text */
    }
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return (text ? JSON.parse(text) : undefined) as T
}

function fromTokens(t: { access_token: string; refresh_token: string; expires_in?: number; expires_at?: number; user: Session['user'] }): Session {
  const expires_at = t.expires_at ?? Math.floor(Date.now() / 1000) + (t.expires_in ?? 3600)
  return { access_token: t.access_token, refresh_token: t.refresh_token, expires_at, user: { id: t.user.id, email: t.user.email } }
}

/** The signed-in parent's email, if any. */
export function signedInEmail(): string | undefined {
  return accountsEnabled ? readSession()?.user.email : undefined
}

/** Sends a 6-digit sign-in code to the email (makes the account when it does not exist yet). */
export async function sendCode(email: string): Promise<void> {
  await call('/auth/v1/otp', { method: 'POST', body: JSON.stringify({ email, create_user: true }) })
}

export async function verifyCode(email: string, token: string): Promise<string> {
  const t = await call<Parameters<typeof fromTokens>[0]>('/auth/v1/verify', {
    method: 'POST',
    body: JSON.stringify({ type: 'email', email, token }),
  })
  const s = fromTokens(t)
  writeSession(s)
  return s.user.email
}

/** Where to send the browser for "Continue with Google"; it comes back with the tokens in the hash. */
export function googleUrl(): string {
  const back = window.location.href.split('#')[0]
  return `${URL_BASE}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(back)}`
}

/** After the Google redirect: keeps the session from the URL hash. Returns the email when it did. */
export async function finishRedirect(): Promise<string | undefined> {
  if (!accountsEnabled || !window.location.hash.includes('access_token=')) return undefined
  const h = new URLSearchParams(window.location.hash.slice(1))
  history.replaceState(null, '', window.location.pathname + window.location.search)
  const access_token = h.get('access_token') ?? ''
  const refresh_token = h.get('refresh_token') ?? ''
  const user = await call<{ id: string; email: string }>('/auth/v1/user', { token: access_token })
  const s = fromTokens({ access_token, refresh_token, expires_in: Number(h.get('expires_in') ?? 3600), user })
  writeSession(s)
  return s.user.email
}

async function token(): Promise<Session | undefined> {
  const s = readSession()
  if (!s) return undefined
  if (s.expires_at - 60 > Date.now() / 1000) return s
  try {
    const t = await call<Parameters<typeof fromTokens>[0]>('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    })
    const next = fromTokens(t)
    writeSession(next)
    return next
  } catch {
    writeSession(undefined)
    return undefined
  }
}

export async function signOut(): Promise<void> {
  const s = readSession()
  writeSession(undefined)
  if (s) await call('/auth/v1/logout', { method: 'POST', token: s.access_token }).catch(() => undefined)
}

/** The family saved in the account, or undefined when the account has none yet. */
export async function fetchFamily(): Promise<Family | undefined> {
  const s = await token()
  if (!s) return undefined
  const rows = await call<{ data: Family }[]>('/rest/v1/families?select=data', { token: s.access_token })
  return rows[0]?.data
}

export async function saveFamily(f: Family): Promise<void> {
  const s = await token()
  if (!s) return
  await call('/rest/v1/families?on_conflict=user_id', {
    method: 'POST',
    token: s.access_token,
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: s.user.id, data: f, updated_at: new Date().toISOString() }),
  })
}

/** Deletes the account and everything saved in it (progress on this device stays). */
export async function deleteAccount(): Promise<void> {
  const s = await token()
  if (!s) return
  await call('/rest/v1/rpc/delete_my_account', { method: 'POST', token: s.access_token, body: '{}' })
  writeSession(undefined)
}
