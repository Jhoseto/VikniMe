import { NavLink, Link } from 'react-router-dom'
import {
  Home, Search, CalendarDays, MessageCircle, Heart,
  User, Bell, Settings, LayoutDashboard, Users, Briefcase,
  Tag, ClipboardList, Flag, Wallet, CreditCard, Star,
  Headphones, ChevronRight, LogIn,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { clsx } from 'clsx'

/* ── .me gradient (from logo) ──────────────────────────────── */
const ME_GRADIENT        = 'linear-gradient(135deg, #7C4DCC 0%, #2DD4BF 100%)'
const ME_GRADIENT_SUBTLE = 'linear-gradient(90deg, rgba(124,77,204,0.10) 0%, rgba(45,212,191,0.06) 100%)'

/* ── Nav definitions ───────────────────────────────────────── */
const CUSTOMER_ITEMS = [
  { to: '/',                    label: 'Начало',     Icon: Home,         exact: true },
  { to: '/search',              label: 'Търсене',    Icon: Search },
  { to: '/bookings',            label: 'Резервации', Icon: CalendarDays },
  { to: '/chat',                label: 'Съобщения',  Icon: MessageCircle, badge: 'chat' },
  { to: '/favorites',           label: 'Любими',     Icon: Heart },
  { to: '/notifications',       label: 'Известия',   Icon: Bell,          badge: 'notif' },
]

const ACCOUNT_ITEMS = [
  { to: '/profile',             label: 'Профил',     Icon: User },
  { to: '/profile/credits',     label: 'Кредити',    Icon: Wallet },
  { to: '/profile/payments',    label: 'Плащания',   Icon: CreditCard },
]

const SUPPLIER_EXTRAS = [
  { to: '/supplier/dashboard',  label: 'Табло',      Icon: LayoutDashboard },
  { to: '/supplier/services',   label: 'Услуги',     Icon: Briefcase },
  { to: '/supplier/bookings',   label: 'Поръчки',    Icon: ClipboardList },
  { to: '/supplier/earnings',   label: 'Приходи',    Icon: Wallet },
]

const ADMIN_ITEMS = [
  { to: '/admin',               label: 'Табло',       Icon: LayoutDashboard },
  { to: '/admin/users',         label: 'Потребители', Icon: Users },
  { to: '/admin/services',      label: 'Услуги',      Icon: Briefcase },
  { to: '/admin/bookings',      label: 'Резервации',  Icon: CalendarDays },
  { to: '/admin/reviews',       label: 'Отзиви',      Icon: Star },
  { to: '/admin/categories',    label: 'Категории',   Icon: Tag },
  { to: '/admin/enrollments',   label: 'Заявки',      Icon: ClipboardList },
  { to: '/admin/support',       label: 'Поддръжка',   Icon: Headphones },
  { to: '/admin/reports',       label: 'Сигнали',     Icon: Flag },
]

/* ── Nav item ──────────────────────────────────────────────── */
interface NavItemProps {
  to: string
  label: string
  Icon: LucideIcon
  exact?: boolean
  collapsed: boolean
  badgeCount?: number
}

function NavItem({ to, label, Icon, exact, collapsed, badgeCount }: NavItemProps) {
  return (
    <div className="relative group/item">
      <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 rounded-xl transition-all duration-150 relative overflow-hidden',
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5',
            isActive ? 'font-semibold' : 'text-surface-500 hover:text-surface-800 hover:bg-surface-50/80'
          )
        }
        style={({ isActive }) =>
          isActive ? { background: ME_GRADIENT_SUBTLE, color: '#7C4DCC' } : {}
        }
      >
        {({ isActive }) => (
          <>
            {/* Active left accent bar */}
            {isActive && !collapsed && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                style={{ background: ME_GRADIENT }} />
            )}

            <span className="relative shrink-0">
              <Icon
                size={collapsed ? 19 : 17}
                strokeWidth={isActive ? 2.4 : 1.9}
                style={isActive ? { color: '#7C4DCC' } : {}}
                className="transition-colors"
              />
              {badgeCount != null && badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </span>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-sm whitespace-nowrap overflow-hidden flex-1"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Badge count in expanded mode */}
            {!collapsed && badgeCount != null && badgeCount > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </>
        )}
      </NavLink>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60]
          opacity-0 group-hover/item:opacity-100 transition-opacity duration-150">
          <div className="bg-navy-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            {label}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-navy-800" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Section label ─────────────────────────────────────────── */
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {!collapsed ? (
        <motion.div key="label"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-bold text-surface-300 uppercase tracking-[0.18em]">{label}</span>
        </motion.div>
      ) : (
        <motion.div key="divider"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="my-2 mx-auto w-5 h-px bg-surface-200 rounded-full" />
      )}
    </AnimatePresence>
  )
}

/* ── Sidebar ───────────────────────────────────────────────── */
export function LeftSidebar() {
  const { profile } = useAuthStore()
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUiStore()
  const { unreadCount } = useNotificationStore()
  const isSupplier = profile?.role === 'supplier' || profile?.role === 'admin'
  const isAdmin    = profile?.role === 'admin'

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 border-r border-surface-100 bg-white shrink-0 overflow-visible relative z-30"
      style={{ boxShadow: '1px 0 0 0 rgb(0 0 0 / 0.04)' }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="h-16 flex items-center border-b border-surface-100 shrink-0 overflow-hidden px-4">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div key="icon"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }}
              className="mx-auto">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: ME_GRADIENT }}>
                <span className="font-display font-black text-base text-white leading-none">V</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="logo"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <img src="/logo.png" alt="vikni.me" className="h-9 w-auto object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-visible py-3 space-y-0.5 px-2">
        {CUSTOMER_ITEMS.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed}
            badgeCount={item.badge === 'notif' ? unreadCount : undefined}
          />
        ))}

        <SectionLabel label="Акаунт" collapsed={collapsed} />
        {ACCOUNT_ITEMS.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {isSupplier && (
          <>
            <SectionLabel label="Доставчик" collapsed={collapsed} />
            {SUPPLIER_EXTRAS.map(item => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <SectionLabel label="Администрация" collapsed={collapsed} />
            {ADMIN_ITEMS.map(item => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </>
        )}

        <SectionLabel label="Още" collapsed={collapsed} />
        <NavItem to="/profile/notification-settings" label="Настройки" Icon={Settings} collapsed={collapsed} />
      </nav>

      {/* ── Profile card (bottom) ─────────────────────────── */}
      <div className="shrink-0 border-t border-surface-100 p-2">
        {profile ? (
          <Link to="/profile"
            className="flex items-center gap-3 rounded-xl hover:bg-surface-50 transition-colors overflow-hidden"
            style={{ padding: collapsed ? '8px 0' : '8px 10px' }}>
            {/* Avatar */}
            <div className="shrink-0 mx-auto" style={collapsed ? {} : { marginLeft: 0 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name ?? ''}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-100" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: ME_GRADIENT }}>
                  {initials}
                </div>
              )}
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div key="info"
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.18 }}
                  className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-semibold text-surface-800 truncate leading-tight">
                    {profile.full_name ?? profile.email}
                  </p>
                  <p className="text-[11px] text-surface-400 truncate leading-tight">{profile.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        ) : (
          <Link to="/login"
            className="flex items-center gap-3 rounded-xl hover:bg-surface-50 transition-colors overflow-hidden"
            style={{ padding: collapsed ? '8px 0' : '8px 10px' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mx-auto"
              style={{ background: ME_GRADIENT }}>
              <LogIn size={14} />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span key="login-label"
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.18 }}
                  className="text-sm font-semibold text-surface-700 whitespace-nowrap overflow-hidden">
                  Вход / Регистрация
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────────── */}
      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        aria-label={collapsed ? 'Разшири менюто' : 'Скрий менюто'}
        className="absolute -right-3.5 top-[72px] w-7 h-7 rounded-full bg-white border border-surface-200 flex items-center justify-center z-50 shadow-md hover:shadow-lg transition-shadow"
        style={{ boxShadow: '0 2px 8px rgba(27,42,94,0.14)' }}
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.25 }}>
          <ChevronRight size={13} className="text-surface-500" />
        </motion.div>
      </motion.button>
    </motion.aside>
  )
}
