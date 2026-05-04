/**
 * PWA App Badge API hook.
 * Sets/clears the app icon badge (unread count).
 * Supported in Chrome 81+ on Android/desktop.
 */
import { useEffect } from 'react'
import { useNotificationStore } from '@/stores/notificationStore'

export function useAppBadge() {
  const unreadCount = useNotificationStore(s => s.unreadCount)

  useEffect(() => {
    const nav = navigator as any
    if (!nav.setAppBadge) return

    if (unreadCount > 0) {
      nav.setAppBadge(unreadCount).catch(() => {/* ignore permission errors */})
    } else {
      nav.clearAppBadge().catch(() => {})
    }
  }, [unreadCount])
}
