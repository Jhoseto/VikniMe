import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, CalendarCheck, Clock, MessageCircle, Star, Gift, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from '@/api/notifications'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'
import type { NotificationRow } from '@/types/database'

/* ── Notification type → icon + gradient ─────────────── */
const NOTIF_CONFIG: Record<string, { Icon: LucideIcon; gradient: string }> = {
  booking_confirmed: { Icon: CalendarCheck, gradient: 'linear-gradient(135deg,#10B981 0%,#2DD4BF 100%)' },
  booking_reminder:  { Icon: Clock,         gradient: 'linear-gradient(135deg,#F59E0B 0%,#E8581F 100%)' },
  booking_cancelled: { Icon: CalendarCheck, gradient: 'linear-gradient(135deg,#EF4444 0%,#F97316 100%)' },
  new_message:       { Icon: MessageCircle, gradient: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' },
  review_request:    { Icon: Star,          gradient: 'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)' },
  promo:             { Icon: Gift,          gradient: 'linear-gradient(135deg,#E8581F 0%,#7C4DCC 100%)' },
}
const DEFAULT_NOTIF = { Icon: Bell, gradient: 'linear-gradient(135deg,#1B2A5E 0%,#7C4DCC 100%)' }

function NotifIcon({ type }: { type: string }) {
  const cfg = NOTIF_CONFIG[type] ?? DEFAULT_NOTIF
  const { Icon } = cfg
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: cfg.gradient }}
    >
      <Icon size={20} strokeWidth={1.9} className="text-white" />
    </div>
  )
}

function NotifCard({ notif, onClick }: { notif: NotificationRow; onClick: () => void }) {
  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      className={clsx(
        'w-full flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all',
        notif.is_read ? 'bg-white' : 'bg-violet-50/60 border border-violet-100'
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <NotifIcon type={notif.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx('text-sm font-semibold leading-snug', notif.is_read ? 'text-surface-700' : 'text-navy-700')}>
            {notif.title}
          </p>
          {!notif.is_read && <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">{notif.body}</p>
        <p className="text-xs text-surface-400 mt-1.5">
          {format(new Date(notif.created_at), 'd MMM, HH:mm', { locale: bg })}
        </p>
      </div>
    </motion.button>
  )
}

/* ── Tab definitions ────────────────────────────────────── */
type TabKey = 'all' | 'bookings' | 'messages' | 'system'
const TABS: { key: TabKey; label: string; types: string[] }[] = [
  { key: 'all',      label: 'Всички',    types: [] },
  { key: 'bookings', label: 'Резервации', types: ['booking_confirmed', 'booking_reminder', 'booking_cancelled'] },
  { key: 'messages', label: 'Съобщения', types: ['new_message'] },
  { key: 'system',   label: 'Системни',  types: ['promo', 'review_request', 'system'] },
]

export default function NotificationsPage() {
  const { profile } = useAuthStore()
  const { setNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn:  async () => {
      const data = await apiGetNotifications(profile!.id)
      setNotifications(data)
      return data
    },
    enabled: !!profile,
  })

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => apiMarkNotificationRead(id),
    onSuccess:  (_, id)      => { markAsRead(id); qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })

  const { mutate: markAll, isPending: markingAll } = useMutation({
    mutationFn: () => apiMarkAllNotificationsRead(profile!.id),
    onSuccess:  () => { markAllAsRead(); qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })

  const unread = notifications.filter(n => !n.is_read).length

  const tab = TABS.find(t => t.key === activeTab)!
  const filtered = tab.types.length
    ? notifications.filter(n => tab.types.includes(n.type))
    : notifications

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Известия – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#1B2A5E 0%,#7C4DCC 100%)' }}>
                <Bell size={17} strokeWidth={2} className="text-white" />
              </div>
              <h1 className="font-display font-bold text-navy-600 text-lg leading-none">
                Известия
                {unread > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>
                )}
              </h1>
            </div>
            {unread > 0 && (
              <Button variant="ghost" size="sm" loading={markingAll} leftIcon={<CheckCheck size={15} />} onClick={() => markAll()}>
                Маркирай всички
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-none">
            {TABS.map(t => {
              const count = t.types.length
                ? notifications.filter(n => t.types.includes(n.type) && !n.is_read).length
                : unread
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={clsx('shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                    activeTab === t.key
                      ? 'text-white shadow-sm'
                      : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                  )}
                  style={activeTab === t.key ? { background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' } : {}}>
                  {t.label}
                  {count > 0 && (
                    <span className={clsx('w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center',
                      activeTab === t.key ? 'bg-white text-violet-600' : 'bg-orange-500 text-white')}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex gap-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                <Skeleton className="w-11 h-11 shrink-0" rounded="lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <EmptyState
              icon={Bell}
              tone="brand"
              title="Няма известия"
              description="Тук ще виждаш актуализации за резервации, съобщения и промоции."
              iconBackground="linear-gradient(135deg,#1B2A5E 0%,#7C4DCC 100%)"
            />
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
            {filtered.map(n => (
              <NotifCard key={n.id} notif={n} onClick={() => { if (!n.is_read) markRead(n.id) }} />
            ))}
          </motion.div>
        )}
      </div>
      </AnimatedPage>
  )
}
