/**
 * Notifications API
 * Currently backed by mock data.
 */
import { MOCK_NOTIFICATIONS } from '@/lib/mock/data'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export async function apiGetNotifications(userId: string) {
  await delay()
  return MOCK_NOTIFICATIONS
    .filter(n => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function apiMarkNotificationRead(id: string) {
  await delay(200)
  const n = MOCK_NOTIFICATIONS.find(n => n.id === id)
  if (n) n.is_read = true
}

export async function apiMarkAllNotificationsRead(userId: string) {
  await delay(300)
  MOCK_NOTIFICATIONS
    .filter(n => n.user_id === userId)
    .forEach(n => { n.is_read = true })
}
