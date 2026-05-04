import { useLocation } from 'react-router-dom'

/* Routes where the BottomNavBar should be hidden (focused mode pages) */
const HIDE_ON_PATTERNS: RegExp[] = [
  /^\/chat\/[^/]+$/,
  /^\/bookings\/[^/]+\/confirm$/,
  /^\/bookings\/[^/]+\/review$/,
  /^\/profile\/edit$/,
  /^\/profile\/notification-settings$/,
  /^\/supplier\/services\/(new|.*\/edit|availability)$/,
]

export function useBottomNavVisible() {
  const { pathname } = useLocation()
  return !HIDE_ON_PATTERNS.some(re => re.test(pathname))
}
