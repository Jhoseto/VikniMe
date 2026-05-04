import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, MessageCircle, Star, AlertTriangle, RefreshCw } from 'lucide-react'
import { Drawer } from 'vaul'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { apiGetBookingById, apiUpdateBookingStatus, type BookingWithRelations } from '@/api/bookings'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { fadeUp } from '@/lib/motion'
import type { BookingRow } from '@/types/database'

const CANCEL_REASONS = [
  'Намерих по-подходящ специалист',
  'Промяна в плановете ми',
  'Финансови причини',
  'Услугата не отговаря на нуждите ми',
  'Доставчикът не отговори',
  'Техническа грешка при резервацията',
  'Друга причина',
]

interface CancelSheetProps {
  open:     boolean
  onClose:  () => void
  onCancel: (reason: string) => void
  loading:  boolean
  price:    number
}

function CancelSheet({ open, onClose, onCancel, loading, price }: CancelSheetProps) {
  const [reason, setReason] = useState('')

  return (
    <Drawer.Root open={open} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white safe-bottom" aria-label="Отмяна на резервация">
          <div className="w-10 h-1 bg-surface-200 rounded-full mx-auto mt-3 mb-4 shrink-0" />
          <div className="px-5 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-error" />
              </div>
              <div>
                <h3 className="font-display font-bold text-surface-800">Отмяна на резервация</h3>
                <p className="text-xs text-surface-500 mt-0.5">Моля избери причина за отмяна</p>
              </div>
            </div>

            {/* Reason dropdown */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5 block">Причина</label>
              <select value={reason} onChange={e => setReason(e.target.value)}
                className="w-full h-11 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-navy-400 transition-colors">
                <option value="">-- Избери причина --</option>
                {CANCEL_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Refund policy */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-2">
                <RefreshCw size={15} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="text-xs text-orange-700 leading-relaxed">
                  <p className="font-semibold mb-1">Политика за връщане на средства</p>
                  <p>• Анулиране до 24 ч. преди услугата → <strong>100% възстановяване</strong></p>
                  <p>• Анулиране между 24–1 ч. → <strong>50% ({Math.round(price * 0.5)} €)</strong></p>
                  <p>• Анулиране под 1 ч. преди услугата → <strong>без възстановяване</strong></p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-none">Назад</Button>
              <Button variant="ghost"
                className="flex-1 !text-error !border-error/30 hover:!bg-red-50"
                loading={loading}
                disabled={!reason}
                onClick={() => onCancel(reason)}>
                Потвърди отмяната
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

type Status = BookingRow['status']

const STATUS_LABEL: Record<Status, string> = {
  pending:     'Чакащ потвърждение',
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


export default function BookingDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data: booking, isLoading } = useQuery<BookingWithRelations | null>({
    queryKey: ['booking', id],
    queryFn:  () => apiGetBookingById(id),
  })

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: (_reason: string) => apiUpdateBookingStatus(id, 'cancelled'),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['booking', id] })
      setCancelOpen(false)
      toast.success('Резервацията е отменена. Ще получиш имейл с детайли за възстановяването.')
    },
    onError: () => toast.error('Грешка при отмяна.'),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-surface-50 px-4 py-6 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-24" /><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  )
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-surface-400">Резервацията не е намерена.</div>

  const scheduled   = booking.scheduled_at ? new Date(booking.scheduled_at) : null
  const isCustomer  = profile?.id === booking.customer_id
  /* Only the customer can cancel via this UI; suppliers manage from their dashboard */
  const canCancel   = isCustomer && ['pending', 'confirmed'].includes(booking.status)
  const canReview   = booking.status === 'completed' && isCustomer

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Резервация – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors" aria-label="Назад">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500 flex-1">Детайли на резервация</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Status card */}
        <motion.div variants={fadeUp} initial="initial" animate="animate"
          className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-3">
            <Badge variant={STATUS_BADGE[booking.status]} className="text-sm px-3 py-1">
              {STATUS_LABEL[booking.status]}
            </Badge>
            <span className="text-xs text-surface-400">#{booking.id.slice(-6).toUpperCase()}</span>
          </div>

          {/* Service */}
          <div className="flex items-center gap-3 py-3 border-y border-surface-100 my-3">
            {booking.service.images[0] ? (
              <img src={booking.service.images[0]} alt={booking.service.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl shrink-0" style={{ background: 'var(--gradient-brand)' }} />
            )}
            <div className="flex-1 min-w-0">
              <Link to={`/service/${booking.service_id}`} className="font-semibold text-sm text-surface-800 hover:text-navy-600 transition-colors line-clamp-2">
                {booking.service.title}
              </Link>
            </div>
          </div>

          {/* Details */}
          <dl className="space-y-3 text-sm">
            {scheduled && (
              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-surface-400 shrink-0" />
                <div>
                  <dt className="text-xs text-surface-400">Дата и час</dt>
                  <dd className="font-medium text-surface-700">{format(scheduled, 'EEEE, dd MMMM yyyy, HH:mm', { locale: bg })}</dd>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Star size={16} className="text-surface-400 shrink-0" />
              <div>
                <dt className="text-xs text-surface-400">Цена</dt>
                <dd className="font-bold text-navy-500">{booking.price} €</dd>
              </div>
            </div>
            {booking.notes && (
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-surface-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-surface-400">Бележки</dt>
                  <dd className="text-surface-700 leading-relaxed">{booking.notes}</dd>
                </div>
              </div>
            )}
          </dl>
        </motion.div>

        {/* Supplier / Customer card */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Avatar
            src={isCustomer ? booking.supplier.avatar_url : booking.customer.avatar_url}
            name={isCustomer ? booking.supplier.full_name : booking.customer.full_name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-400 mb-0.5">{isCustomer ? 'Доставчик' : 'Клиент'}</p>
            <p className="font-semibold text-sm text-surface-800">
              {isCustomer ? booking.supplier.full_name : booking.customer.full_name}
            </p>
          </div>
          {isCustomer && (
            <Link to={`/supplier/${booking.supplier_id}`}
              className="px-4 py-2 border-2 border-navy-200 text-navy-600 hover:bg-navy-50 rounded-full text-xs font-medium transition-colors shrink-0">
              Профил
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {canReview && (
            <Link to={`/bookings/${id}/review`}>
              <Button fullWidth leftIcon={<Star size={16} />}>Остави отзив</Button>
            </Link>
          )}
          {canCancel && (
            <Button variant="outline" fullWidth onClick={() => setCancelOpen(true)}
              className="!text-error !border-error/40 hover:!bg-red-50">
              Отмени резервацията
            </Button>
          )}
          <Link to={`/chat/${isCustomer ? booking.supplier_id : booking.customer_id}`} className="block">
            <Button variant="secondary" fullWidth leftIcon={<MessageCircle size={16} />}>
              Изпрати съобщение
            </Button>
          </Link>
        </div>
      </div>
      <CancelSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onCancel={reason => cancel(reason)}
        loading={cancelling}
        price={booking.price}
      />
    </AnimatedPage>
  )
}
