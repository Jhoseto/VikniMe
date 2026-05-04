import { useEffect, useState } from 'react'

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const

type Breakpoint = keyof typeof BREAKPOINTS

export function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  const is = (bp: Breakpoint) => width >= BREAKPOINTS[bp]

  return {
    width,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    is,
  }
}
