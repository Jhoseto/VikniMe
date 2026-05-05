import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { apiGetMyBookings, type BookingWithRelations } from '@/api/bookings'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'
import type { BookingRow } from '@/types/database'

/* ─── Status helpers ─────────────────────────────────────── */
type Status = BookingRow['status']

const STATUS_LABEL: Record<Status, string> = {
  pending:     'Чакащ',
  confirmed:   'Потвърден',
  in_progress: 'В процес',
  completed:   'Завършен',
  cancelled:   'Отменен',
}

const STATUS_BADGE: Record<Status, Parameters<typeof Badge>[0]['variant']> = {
  pending:     'warning',
  confirmed:   'success',
  in_progress: 'navy',
  completed:   'teal',
  cancelled:   'neutral',
}

const TABS: { key: 'upcoming' | 'past'; label: string }[] = [
  { key: 'upcoming', label: 'Предстоящи' },
  { key: 'past',     label: 'Минали' },
]

/* ─── Booking Card ───────────────────────────────────────── */
function BookingCard({ booking }: { booking: BookingWithRelations }) {
  const scheduled = booking.scheduled_at ? new Date(booking.scheduled_at) : null

  return (
    <motion.div variants={staggerItem}>
      <Link to={`/bookings/${booking.id}`}
        className="flex items-center gap-4 bg-white rounded-2xl p-4 hover:shadow-md transition-all group"
        style={{ boxShadow: 'var(--shadow-card)' }}>
        {/* Image/Avatar */}
        <div className="relative shrink-0">
          {booking.service.images[0] ? (
            <img src={booking.service.images[0]} alt={booking.service.title}
              className="w-16 h-16 rounded-xl object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <CalendarDays size={20} className="text-white" />
            </div>
          )}
          <div className="absolute -bottom-1.5 -right-1.5">
            <Avatar src={booking.supplier.avatar_url} name={booking.supplier.full_name} userId={booking.supplier.id} size="xs" className="ring-2 ring-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-surface-800 text-sm truncate">{booking.service.title}</p>
          <p className="text-xs text-surface-500 mt-0.5">{booking.supplier.full_name}</p>
          {scheduled && (
            <p className="flex items-center gap-1 text-xs text-surface-400 mt-1">
              <CalendarDays size={12} />
              {format(scheduled, 'dd MMM yyyy, HH:mm', { locale: bg })}
            </p>
          )}
        </div>

        {/* Status + price */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={STATUS_BADGE[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
          <span className="text-sm font-bold text-navy-500">{booking.price} €</span>
          <ChevronRight size={16} className="text-surface-300 group-hover:text-surface-500 transition-colors" />
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function BookingsPage() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const { data: bookings = [], isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ['bookings', profile?.id],
    queryFn:  () => apiGetMyBookings(profile!.id),
    enabled:  !!profile,
  })

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress')
  const past     = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')
  const current  = tab === 'upcoming' ? upcoming : past

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Моите резервации – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' }}>
              <CalendarDays size={17} strokeWidth={2} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-navy-600 text-lg leading-none">Моите резервации</h1>
          </div>
          <div className="flex gap-1 pb-0">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={clsx('flex-1 py-2.5 text-sm font-semibold border-b-2 transition-all',
                  tab === t.key ? 'border-navy-500 text-navy-500' : 'border-transparent text-surface-400 hover:text-surface-600')}>
                {t.label}
                {t.key === 'upcoming' && upcoming.length > 0 && (
                  <span className="ml-1.5 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{upcoming.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <Skeleton className="w-16 h-16 shrink-0" rounded="lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : current.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <EmptyState
              icon={CalendarDays}
              tone="teal"
              title={tab === 'upcoming' ? 'Нямаш предстоящи резервации' : 'Нямаш минали резервации'}
              description={
                tab === 'upcoming'
                  ? 'Намери услуга и направи резервация.'
                  : 'Тук ще виждаш завършените и отменените резервации.'
              }
            >
              {tab === 'upcoming' && (
                <Link to="/search" className="px-6 py-2.5 rounded-full text-white font-semibold text-sm hover:opacity-90 shadow-md"
                  style={{ background: 'var(--gradient-brand)' }}>
                  Намери услуга
                </Link>
              )}
            </EmptyState>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
            {current.map(b => <BookingCard key={b.id} booking={b} />)}
          </motion.div>
        )}
      </div>
      </AnimatedPage>
  )
}
