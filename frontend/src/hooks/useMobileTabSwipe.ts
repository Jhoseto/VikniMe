import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  getAdjacentTabPath,
  getMobileBottomNavItems,
} from '@/components/layout/bottomNavConfig'
import { useAuthStore } from '@/stores/authStore'
import { useHaptic } from '@/hooks/useHaptic'

const MIN_DX = 56
const VERTICAL_DOMINANCE = 1.15

/**
 * Horizontal swipe on the main pane moves to prev/next bottom-nav tab (same order as icons).
 * Only runs when `enabled` and current path matches a tab root; skips targets inside [data-no-tab-swipe].
 */
export function useMobileTabSwipe(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile } = useAuthStore()
  const { trigger } = useHaptic()
  const items = useMemo(() => getMobileBottomNavItems(profile), [profile])

  useEffect(() => {
    if (!enabled) return
    const root = ref.current
    if (!root) return

    let startX = 0
    let startY = 0

    const touchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      startX = e.touches[0]!.clientX
      startY = e.touches[0]!.clientY
    }

    const touchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      if (!t) return

      const target = e.target as Node | null
      if (target && root.contains(target)) {
        const el = (target as Element).closest?.('[data-no-tab-swipe]')
        if (el && root.contains(el)) return
      }

      const dx = t.clientX - startX
      const dy = t.clientY - startY
      if (Math.abs(dy) * VERTICAL_DOMINANCE >= Math.abs(dx)) return
      if (Math.abs(dx) < MIN_DX) return

      const dir = dx < 0 ? 'next' : 'prev'
      const nextPath = getAdjacentTabPath(items, pathname, dir)
      if (!nextPath || nextPath === pathname) return

      trigger('light')
      navigate(nextPath)
    }

    root.addEventListener('touchstart', touchStart, { passive: true })
    root.addEventListener('touchend', touchEnd, { passive: true })
    return () => {
      root.removeEventListener('touchstart', touchStart)
      root.removeEventListener('touchend', touchEnd)
    }
  }, [enabled, items, navigate, pathname, trigger])

  return ref
}
