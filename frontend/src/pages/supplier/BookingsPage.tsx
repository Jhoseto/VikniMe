import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { apiGetMyBookings, apiUpdateBookingStatus, type BookingWithRelations } from '@/api/bookings'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'
import type { BookingRow } from '@/types/database'

type Status = BookingRow['status']
const STATUS_BADGE: Record<Status, Parameters<typeof Badge>[0]['variant']> = {
  pending: 'warning', confirmed: 'success', in_progress: 'navy', completed: 'teal', cancelled: 'neutral',
}
const STATUS_LABEL: Record<Status, string> = {
  pending: 'Чакащ', confirmed: 'Потвърден', in_progress: 'В процес', completed: 'Завършен', cancelled: 'Отменен',
}

const TABS = [
  { key: 'pending',   label: 'Чакащи' },
  { key: 'active',    label: 'Активни' },
  { key: 'completed', label: 'Завършени' },
] as const
type TabKey = typeof TABS[number]['key']

function BookingCard({ booking }: { booking: BookingWithRelations }) {
  const qc = useQueryClient()
  const { mutate: confirm, isPending: confirming } = useMutation({
    mutationFn: () => apiUpdateBookingStatus(booking.id, 'confirmed'),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Резервацията е потвърдена!') },
  })
  const { mutate: decline, isPending: declining } = useMutation({
    mutationFn: () => apiUpdateBookingStatus(booking.id, 'cancelled'),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Резервацията е отказана.') },
  })

  const scheduled = booking.scheduled_at ? new Date(booking.scheduled_at) : null

  return (
    <motion.div variants={staggerItem} className="bg-white rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-start gap-3">
        <Avatar src={booking.customer.avatar_url} name={booking.customer.full_name} userId={booking.customer.id} size="md" className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-surface-800">{booking.customer.full_name}</p>
            <Badge variant={STATUS_BADGE[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
          </div>
          <p className="text-xs text-surface-500 mt-0.5 truncate">{booking.service.title}</p>
          {scheduled && (
            <p className="flex items-center gap-1 text-xs text-surface-400 mt-1">
              <CalendarDays size={12} />
              {format(scheduled, 'dd MMM yyyy, HH:mm', { locale: bg })}
            </p>
          )}
          <p className="text-sm font-bold text-navy-500 mt-1">{booking.price} €</p>
        </div>
        <Link to={`/bookings/${booking.id}`} className="text-surface-300 hover:text-surface-500 transition-colors shrink-0 mt-1">
          <ChevronRight size={16} />
        </Link>
      </div>

      {booking.status === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-surface-100">
          <Button fullWidth size="sm" loading={confirming} leftIcon={<CheckCircle size={14} />} onClick={() => confirm()}>
            Потвърди
          </Button>
          <Button variant="outline" fullWidth size="sm" loading={declining} leftIcon={<XCircle size={14} />} onClick={() => {
            if (window.confirm('Откажи резервацията?')) decline()
          }}>
            Откажи
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default function SupplierBookingsPage() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState<TabKey>('pending')

  const { data: bookings = [], isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ['bookings', profile?.id, 'supplier'],
    queryFn:  () => apiGetMyBookings(profile!.id, 'supplier'),
    enabled:  !!profile,
  })

  const filtered = bookings.filter(b => {
    if (tab === 'pending')   return b.status === 'pending'
    if (tab === 'active')    return b.status === 'confirmed' || b.status === 'in_progress'
    if (tab === 'completed') return b.status === 'completed' || b.status === 'cancelled'
    return true
  })

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Поръчки – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="font-display font-bold text-navy-500 pt-4 pb-0">Поръчки</h1>
          <div className="flex gap-1 mt-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={clsx('flex-1 py-2.5 text-sm font-semibold border-b-2 transition-all',
                  tab === t.key ? 'border-navy-500 text-navy-500' : 'border-transparent text-surface-400 hover:text-surface-600')}>
                {t.label}
                {t.key === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays size={40} className="text-surface-200 mb-3" />
            <p className="font-semibold text-surface-600">Няма резервации в тази категория</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
            {filtered.map(b => <BookingCard key={b.id} booking={b} />)}
          </motion.div>
        )}
      </div>
      </AnimatedPage>
  )
}
