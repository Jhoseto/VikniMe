import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Briefcase,
  CalendarDays,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  Search,
  User,
} from 'lucide-react'
import type { ProfileRow } from '@/types/database'

export type BottomNavItem = {
  path: string
  label: string
  icon: LucideIcon
  /** Match pathname for "active" and swipe (prefix or exact) */
  match: (pathname: string) => boolean
}

function bookingsPathForRole(role: ProfileRow['role'] | undefined): string {
  if (role === 'supplier') return '/supplier/bookings'
  return '/bookings'
}

/** Ordered left→right: used by bottom bar and horizontal swipe between tabs. */
export function getMobileBottomNavItems(profile: ProfileRow | null): BottomNavItem[] {
  const role = profile?.role
  const bookings = bookingsPathForRole(role)

  const items: BottomNavItem[] = [
    {
      path: '/',
      label: 'Начало',
      icon: Home,
      match: (p) => p === '/' || p === '',
    },
    {
      path: '/search',
      label: 'Търси',
      icon: Search,
      match: (p) => p === '/search' || p.startsWith('/category/'),
    },
  ]

  if (role === 'supplier' || role === 'admin') {
    items.push({
      path: '/supplier/dashboard',
      label: 'Панел',
      icon: LayoutDashboard,
      match: (p) => p.startsWith('/supplier/dashboard'),
    })
  }

  items.push(
    {
      path: bookings,
      label: 'Резервации',
      icon: CalendarDays,
      match: (p) =>
        p.startsWith('/bookings') ||
        p.startsWith('/supplier/bookings') ||
        p.startsWith('/admin/bookings'),
    },
    {
      path: '/chat',
      label: 'Чат',
      icon: MessageCircle,
      match: (p) => p.startsWith('/chat'),
    },
    {
      path: '/favorites',
      label: 'Любими',
      icon: Heart,
      match: (p) => p.startsWith('/favorites'),
    },
    {
      path: '/notifications',
      label: 'Известия',
      icon: Bell,
      match: (p) => p.startsWith('/notifications'),
    },
  )

  if (role === 'supplier' || role === 'admin') {
    items.push({
      path: '/supplier/services',
      label: 'Услуги',
      icon: Briefcase,
      match: (p) => p.startsWith('/supplier/services'),
    })
  }

  items.push({
    path: '/profile',
    label: 'Профил',
    icon: User,
    match: (p) => p.startsWith('/profile'),
  })

  return items
}

export function getBottomNavTabIndex(pathname: string, items: BottomNavItem[]): number {
  const i = items.findIndex((it) => it.match(pathname))
  return i >= 0 ? i : -1
}

export function getAdjacentTabPath(
  items: BottomNavItem[],
  pathname: string,
  direction: 'prev' | 'next',
): string | null {
  const idx = getBottomNavTabIndex(pathname, items)
  if (idx < 0) return null
  if (direction === 'prev' && idx > 0) return items[idx - 1]!.path
  if (direction === 'next' && idx < items.length - 1) return items[idx + 1]!.path
  return null
}
