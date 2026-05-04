/**
 * Pull-to-refresh hook using @use-gesture/react.
 * Attach the returned ref to the scrollable container.
 * `onRefresh` is called when user pulls down > threshold.
 */
import { useRef, useState } from 'react'
import { useSpring } from 'framer-motion'

export interface PullToRefreshOptions {
  threshold?: number
  onRefresh: () => Promise<void>
}

export function usePullToRefresh({ threshold = 80, onRefresh }: PullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pullY = useSpring(0, { stiffness: 500, damping: 40 })

  let startY = 0

  function onTouchStart(e: React.TouchEvent) {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY = e.touches[0].clientY
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!startY || isRefreshing) return
    const dy = e.touches[0].clientY - startY
    if (dy > 0) {
      setIsPulling(true)
      pullY.set(Math.min(dy * 0.5, threshold * 1.2))
    }
  }

  async function onTouchEnd() {
    if (!isPulling) return
    setIsPulling(false)
    const current = pullY.get()
    if (current >= threshold) {
      setIsRefreshing(true)
      pullY.set(threshold * 0.6)
      try { await onRefresh() } finally {
        setIsRefreshing(false)
        pullY.set(0)
        startY = 0
      }
    } else {
      pullY.set(0)
      startY = 0
    }
  }

  return { containerRef, pullY, isPulling, isRefreshing, onTouchStart, onTouchMove, onTouchEnd }
}
