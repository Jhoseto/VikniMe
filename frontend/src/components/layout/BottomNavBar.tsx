import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, CalendarDays, MessageCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNotificationStore } from '@/stores/notificationStore'
import { useHaptic } from '@/hooks/useHaptic'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { to: '/', label: 'Начало', Icon: Home, exact: true },
  { to: '/search', label: 'Търси', Icon: Search },
  { to: '/bookings', label: 'Резервации', Icon: CalendarDays },
  { to: '/chat', label: 'Чат', Icon: MessageCircle },
  { to: '/profile', label: 'Профил', Icon: User },
]

/* .me gradient from logo */
const ACTIVE_GRADIENT = 'linear-gradient(135deg, #7C4DCC 0%, #2DD4BF 100%)'

export function BottomNavBar() {
  const { unreadCount } = useNotificationStore()
  const { trigger } = useHaptic()
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom bg-white/95 backdrop-blur-md border-t border-surface-200"
      style={{ boxShadow: '0 -4px 24px rgba(27,42,94,0.08)' }}
      aria-label="Основна навигация"
    >
      <ul className="flex items-end justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to)

          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className="relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors"
                onClick={() => trigger('light')}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Gradient pill indicator at top */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                    style={{ background: ACTIVE_GRADIENT }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative">
                  <motion.div
                    animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -2 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {isActive ? (
                      /* Gradient icon via SVG filter trick – use a wrapper with gradient bg + mask */
                      <div
                        className="rounded-lg"
                        style={{
                          background: ACTIVE_GRADIENT,
                          WebkitMaskImage: 'none',
                          padding: '5px',
                        }}
                      >
                        <Icon size={20} className="text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <Icon size={22} className="text-surface-400" strokeWidth={1.9} />
                    )}
                  </motion.div>

                  {label === 'Чат' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>

                <span
                  className={clsx(
                    'text-[10px] font-semibold transition-colors leading-none',
                    isActive ? 'text-violet-600' : 'text-surface-400'
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
