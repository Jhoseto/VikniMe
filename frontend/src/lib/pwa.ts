import { useEffect, useState } from 'react'

/**
 * True when the app runs in installed PWA / standalone mode.
 * Splash, install banners, and other PWA-only chrome should gate on this.
 */
export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true
  const displayStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  return iosStandalone || displayStandalone
}

export function useIsStandaloneApp(): boolean {
  const [value, setValue] = useState<boolean>(() => isStandaloneApp())

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(display-mode: standalone)')
    const update = () => setValue(isStandaloneApp())
    update()
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update)
      return () => mql.removeEventListener('change', update)
    }
    mql.addListener(update)
    return () => mql.removeListener(update)
  }, [])

  return value
}
