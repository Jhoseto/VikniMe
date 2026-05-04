/**
 * Swipe-back gesture hook (mobile only, < 1024px).
 * Detects a left-edge swipe (startX < 30px) and triggers navigate(-1) when > 40% of screen.
 */
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function useSwipeBack() {
  const navigate = useNavigate()
  const startX   = useRef<number | null>(null)

  useEffect(() => {
    if (window.innerWidth >= 1024) return

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      startX.current = touch.clientX < 30 ? touch.clientX : null
    }

    function onTouchEnd(e: TouchEvent) {
      if (startX.current === null) return
      const dx = e.changedTouches[0].clientX - startX.current
      if (dx > window.innerWidth * 0.4) navigate(-1)
      startX.current = null
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend',   onTouchEnd)
    }
  }, [navigate])
}
