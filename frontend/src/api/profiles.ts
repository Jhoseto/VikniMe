/**
 * Profiles API
 * Currently backed by mock data.
 */
import { MOCK_PROFILES, findProfile, getReviewsForSupplier, getServicesBySupplier } from '@/lib/mock/data'
import type { ProfileRow } from '@/types/database'

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms))

export async function apiGetProfile(id: string): Promise<ProfileRow | null> {
  await delay()
  return findProfile(id)
}

export async function apiGetSupplierPublicProfile(id: string) {
  await delay()
  const profile = findProfile(id)
  if (!profile || profile.role === 'customer') return null
  const services = getServicesBySupplier(id)
  const reviews  = getReviewsForSupplier(id)
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0
  return { profile, services, reviews, avgRating: Math.round(avgRating * 10) / 10 }
}

export async function apiUpdateProfile(id: string, updates: Partial<Pick<ProfileRow, 'full_name' | 'phone' | 'location' | 'bio' | 'avatar_url'>>) {
  await delay(600)
  const idx = MOCK_PROFILES.findIndex(p => p.id === id)
  if (idx === -1) throw new Error('Profile not found')
  Object.assign(MOCK_PROFILES[idx], updates, { updated_at: new Date().toISOString() })
  return MOCK_PROFILES[idx]
}
