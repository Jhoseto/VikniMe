/**
 * Auth API
 * Currently uses an in-memory mock session. Replace with real backend calls when ready.
 *
 * Demo accounts:
 *   demo@vikni.me      / demo1234  → role: customer
 *   supplier@vikni.me  / demo1234  → role: supplier
 *   admin@vikni.me     / demo1234  → role: admin
 */
import { MOCK_PROFILES } from '@/lib/mock/data'
import type { ProfileRow } from '@/types/database'

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

const DEMO_ACCOUNTS: Record<string, { profileId: string; password: string }> = {
  'demo@vikni.me':     { profileId: 'user-customer-1', password: 'demo1234' },
  'supplier@vikni.me': { profileId: 'supplier-1',      password: 'demo1234' },
  'admin@vikni.me':    { profileId: 'admin-1',          password: 'demo1234' },
}

// In-memory session token (simulates localStorage-persisted session)
const SESSION_KEY = 'vikni_mock_session'

interface MockSession {
  userId: string
  email:  string
  token:  string
}

function saveSession(session: MockSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getStoredSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as MockSession) : null
  } catch {
    return null
  }
}

export async function apiSignIn(email: string, password: string): Promise<ProfileRow> {
  await delay()
  const account = DEMO_ACCOUNTS[email.toLowerCase()]
  if (!account || account.password !== password) {
    throw new Error('Грешен имейл или парола.')
  }
  const profile = MOCK_PROFILES.find(p => p.id === account.profileId)
  if (!profile) throw new Error('Потребителят не е намерен.')
  saveSession({ userId: profile.id, email: profile.email, token: `mock-token-${profile.id}` })
  return profile
}

export async function apiSignUp(params: {
  email: string
  password: string
  full_name: string
  role: 'customer' | 'supplier'
}): Promise<{ needsEmailVerification: boolean }> {
  await delay(800)
  if (DEMO_ACCOUNTS[params.email.toLowerCase()]) {
    throw new Error('Имейлът вече е регистриран. Влез в профила си.')
  }
  // In mock mode we just pretend to send a verification email
  return { needsEmailVerification: true }
}

export async function apiSignOut(): Promise<void> {
  await delay(300)
  clearSession()
}

export async function apiResetPassword(email: string): Promise<void> {
  await delay(700)
  // Mock: always succeeds
  console.info('[mock] Password reset email sent to', email)
}

export async function apiUpdatePassword(_newPassword: string): Promise<void> {
  await delay(600)
  // Mock: always succeeds
}

export async function apiGetSessionProfile(): Promise<ProfileRow | null> {
  await delay(200)
  const session = getStoredSession()
  if (!session) return null
  return MOCK_PROFILES.find(p => p.id === session.userId) ?? null
}

export async function apiSignInWithOAuth(provider: 'google' | 'facebook'): Promise<ProfileRow> {
  await delay(1000)
  // Mock: always logs in as customer demo user
  const profile = MOCK_PROFILES.find(p => p.id === 'user-customer-1')!
  saveSession({ userId: profile.id, email: profile.email, token: `mock-oauth-${provider}` })
  return profile
}
