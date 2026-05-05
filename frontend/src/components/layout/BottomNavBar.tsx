import { useLayoutEffect, useMemo, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { apiGetChatList } from '@/api/messages'
import { useAuthStore } from '@/stores/authStore'
import { useHaptic } from '@/hooks/useHaptic'
import { useBottomNavVisible } from '@/hooks/useBottomNavVisible'
import {
  getBottomNavTabIndex,
  getMobileBottomNavItems,
} from '@/components/layout/bottomNavConfig'
import { clsx } from 'clsx'

/* .me gradient from logo */
const ACTIVE_GRADIENT = 'linear-gradient(135deg, #7C4DCC 0%, #2DD4BF 100%)'

export function BottomNavBar() {
  const { profile } = useAuthStore()
  const { trigger } = useHaptic()
  const location = useLocation()
  const visible = useBottomNavVisible()
  const listRef = useRef<HTMLUListElement>(null)

  const items = useMemo(() => getMobileBottomNavItems(profile), [profile])
  const activeIndex = useMemo(
    () => getBottomNavTabIndex(location.pathname, items),
    [location.pathname, items],
  )

  const { data: threads = [] } = useQuery({
    queryKey: ['chat-list', profile?.id],
    queryFn: () => apiGetChatList(profile!.id),
    enabled: !!profile,
    refetchInterval: 30_000,
  })
  const unreadCount = threads.reduce((acc, t) => acc + t.unreadCount, 0)

  useLayoutEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const li = listRef.current.children[activeIndex] as HTMLElement | undefined
    li?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, items.length, location.pathname])

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
      <ul
        ref={listRef}
        className={clsx(
          'flex items-stretch pt-1.5 gap-0.5',
          'overflow-x-auto overflow-y-hidden',
          'scroll-smooth snap-x snap-mandatory',
          '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          'pl-[max(0.5rem,env(safe-area-inset-left,0px))]',
          'pr-[max(0.5rem,env(safe-area-inset-right,0px))]',
        )}
      >
        {items.map(({ path, label, icon: Icon, match }) => {
          const isActive = match(location.pathname)
          const isChat = path === '/chat'

          return (
            <li key={`${path}-${label}`} className="flex-none snap-center min-w-[4.1rem] max-w-[5.25rem]">
              <NavLink
                to={path}
                onClick={() => trigger('light')}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 pt-1 pb-2 px-0.5 select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[3px] rounded-b-full"
                    style={{ background: ACTIVE_GRADIENT }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}

                <span className="relative w-10 h-10 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: isActive ? 1 : 0.95 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={
                      isActive
                        ? {
                            background: ACTIVE_GRADIENT,
                            boxShadow: '0 4px 14px -4px rgba(124,77,204,0.45)',
                          }
                        : { background: 'transparent' }
                    }
                  >
                    <Icon
                      size={isActive ? 19 : 22}
                      className={isActive ? 'text-white' : 'text-surface-400'}
                      strokeWidth={isActive ? 2.4 : 1.9}
                    />
                  </motion.div>

                  {isChat && unreadCount > 0 && (
                    <span
                      className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>

                <span
                  className={clsx(
                    'text-[9px] font-bold leading-none tracking-tight text-center line-clamp-2 transition-colors px-0.5',
                    isActive ? 'text-violet-700' : 'text-surface-400',
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
