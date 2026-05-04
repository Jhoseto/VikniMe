import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, CalendarDays, MessageCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { apiGetChatList } from '@/api/messages'
import { useAuthStore } from '@/stores/authStore'
import { useHaptic } from '@/hooks/useHaptic'
import { useBottomNavVisible } from '@/hooks/useBottomNavVisible'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { to: '/',          label: 'Начало',     Icon: Home,         exact: true },
  { to: '/search',    label: 'Търси',      Icon: Search },
  { to: '/bookings',  label: 'Резервации', Icon: CalendarDays },
  { to: '/chat',      label: 'Чат',        Icon: MessageCircle },
  { to: '/profile',   label: 'Профил',     Icon: User },
]

/* .me gradient from logo */
const ACTIVE_GRADIENT = 'linear-gradient(135deg, #7C4DCC 0%, #2DD4BF 100%)'

export function BottomNavBar() {
  const { profile } = useAuthStore()
  const { trigger } = useHaptic()
  const location = useLocation()
  const visible = useBottomNavVisible()

  /* Real chat unread (sum across threads) */
  const { data: threads = [] } = useQuery({
    queryKey: ['chat-list', profile?.id],
    queryFn:  () => apiGetChatList(profile!.id),
    enabled:  !!profile,
    refetchInterval: 30_000,
  })
  const unreadCount = threads.reduce((acc, t) => acc + t.unreadCount, 0)

  if (!visible) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-surface-200/80"
      style={{
        boxShadow: '0 -4px 24px rgba(27,42,94,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Основна навигация"
    >
      <ul className="flex items-stretch px-1 pt-1.5">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to)
          const isChat = label === 'Чат'

          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                onClick={() => trigger('light')}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 pt-1 pb-2 select-none"
              >
                {/* Top gradient indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[3px] rounded-b-full"
                    style={{ background: ACTIVE_GRADIENT }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}

                {/* Icon container — fixed size, no layout shift on active toggle */}
                <span className="relative w-10 h-10 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: isActive ? 1 : 0.95 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={isActive
                      ? { background: ACTIVE_GRADIENT, boxShadow: '0 4px 14px -4px rgba(124,77,204,0.45)' }
                      : { background: 'transparent' }
                    }
                  >
                    <Icon
                      size={isActive ? 19 : 22}
                      className={isActive ? 'text-white' : 'text-surface-400'}
                      strokeWidth={isActive ? 2.4 : 1.9}
                    />
                  </motion.div>

                  {/* Unread badge */}
                  {isChat && unreadCount > 0 && (
                    <span
                      className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={clsx(
                    'text-[10px] font-bold leading-none tracking-tight transition-colors',
                    isActive ? 'text-violet-700' : 'text-surface-400'
                  )}
                >
                  {label}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
