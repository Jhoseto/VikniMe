import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  TrendingUp, Star, CalendarDays, Briefcase, ChevronRight, Clock, ArrowUpRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { useAuthStore } from '@/stores/authStore'
import { apiGetMyBookings, type BookingWithRelations } from '@/api/bookings'
import { apiGetServicesBySupplier, type ServiceWithRelations } from '@/api/services'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { staggerContainer, staggerItem } from '@/lib/motion'
import type { BookingRow } from '@/types/database'

/* ─── Stat card ──────────────────────────────────────────── */
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  gradient: string
  trend?: string
}
function StatCard({ label, value, icon, gradient, trend }: StatCardProps) {
  return (
    <motion.div variants={staggerItem}
      className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: gradient }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-400 font-medium">{label}</p>
        <p className="font-display font-black text-2xl text-navy-500">{value}</p>
        {trend && <p className="text-xs text-green-500 font-medium mt-0.5 flex items-center gap-0.5"><ArrowUpRight size={12} />{trend}</p>}
      </div>
    </motion.div>
  )
}

/* ─── Booking status helpers ─────────────────────────────── */
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

/* ─── Mini chart ─────────────────────────────────────────── */
function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${(d.value / max) * 60}px`, background: 'var(--gradient-brand)' }}
          />
          <span className="text-[9px] text-surface-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function SupplierDashboardPage() {
  const { profile } = useAuthStore()

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ['bookings', profile?.id, 'supplier'],
    queryFn:  () => apiGetMyBookings(profile!.id, 'supplier'),
    enabled:  !!profile,
  })

  const { data: services = [], isLoading: servicesLoading } = useQuery<ServiceWithRelations[]>({
    queryKey: ['services', 'supplier', profile?.id],
    queryFn:  () => apiGetServicesBySupplier(profile!.id),
    enabled:  !!profile,
  })

  const isLoading = bookingsLoading || servicesLoading

  const pending   = bookings.filter(b => b.status === 'pending')
  const completed = bookings.filter(b => b.status === 'completed')
  const totalEarnings = completed.reduce((s, b) => s + b.price, 0)
  const avgRating     = services.length ? services.reduce((s, sv) => s + sv.avg_rating, 0) / services.length : 0

  // Mock monthly chart data
  const chartData = [
    { label: 'Я', value: 2 }, { label: 'Ф', value: 4 }, { label: 'М', value: 3 },
    { label: 'А', value: 7 }, { label: 'М', value: 5 }, { label: 'Ю', value: bookings.length },
  ]

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Таблото на доставчика – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-4">
          <Avatar src={profile?.avatar_url} name={profile?.full_name ?? ''} userId={profile?.id} size="md" />
          <div>
            <p className="text-xs text-surface-400">Добре дошъл,</p>
            <h1 className="font-display font-bold text-xl text-navy-500">{profile?.full_name}</h1>
          </div>
          {pending.length > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Clock size={14} />
              {pending.length} нови
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-2 gap-3">
            <StatCard label="Общи приходи"   value={`${totalEarnings} €`} icon={<TrendingUp size={22} />} gradient="var(--gradient-brand)" trend="+12% тази седмица" />
            <StatCard label="Резервации"      value={bookings.length}         icon={<CalendarDays size={22} />} gradient="var(--gradient-primary)" />
            <StatCard label="Активни услуги"  value={services.length}         icon={<Briefcase size={22} />}   gradient="var(--gradient-energy)" />
            <StatCard label="Среден рейтинг"  value={avgRating.toFixed(1)}    icon={<Star size={22} />}        gradient="linear-gradient(135deg,#F59E0B,#EF4444)" />
          </motion.div>
        )}

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-navy-500">Приходи по месеци</h2>
            <span className="text-xs text-surface-400">Последни 6 месеца</span>
          </div>
          <MiniBarChart data={chartData} />
        </div>

        {/* Pending bookings */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-navy-500">Чакащи потвърждение</h2>
              <Link to="/supplier/bookings" className="text-xs text-navy-500 font-semibold hover:text-navy-700">Виж всички →</Link>
            </div>
            <div className="space-y-3">
              {pending.slice(0, 3).map(b => (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition-all"
                  style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 truncate">{b.service.title}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{b.customer.full_name}</p>
                    {b.scheduled_at && <p className="text-xs text-surface-500">{format(new Date(b.scheduled_at), 'd MMM, HH:mm', { locale: bg })}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="warning">Чакащ</Badge>
                    <span className="text-sm font-bold text-navy-500">{b.price} €</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-navy-500">Скорошни резервации</h2>
            <Link to="/supplier/bookings" className="text-xs text-navy-500 font-semibold hover:text-navy-700">Виж всички →</Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <EmptyState
                icon={CalendarDays}
                tone="teal"
                title="Нямаш резервации все още"
                size="compact"
                className="py-10 px-4"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
              {bookings.slice(0, 5).map(b => (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-50 transition-colors">
                  <Avatar src={b.customer.avatar_url} name={b.customer.full_name} userId={b.customer.id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{b.customer.full_name}</p>
                    <p className="text-xs text-surface-400 truncate">{b.service.title}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                  <ChevronRight size={14} className="text-surface-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My services quick links */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-navy-500">Моите услуги</h2>
            <Link to="/supplier/services" className="text-xs text-navy-500 font-semibold hover:text-navy-700">Управлявай →</Link>
          </div>
          {services.length === 0 ? (
            <Link to="/supplier/services/new"
              className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-navy-200 rounded-2xl p-6 text-navy-500 hover:bg-navy-50 transition-colors"
              style={{ boxShadow: 'var(--shadow-card)' }}>
              <Briefcase size={20} />
              <span className="font-semibold text-sm">Добави първата си услуга</span>
            </Link>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.slice(0, 4).map(svc => (
                <div key={svc.id} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                  style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 shrink-0">
                    {svc.images[0] ? <img src={svc.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: 'var(--gradient-brand)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 truncate">{svc.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="text-orange-400 fill-orange-400" />
                      <span className="text-xs text-surface-500">{svc.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-navy-500 shrink-0">{svc.price} €</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </AnimatedPage>
  )
}
