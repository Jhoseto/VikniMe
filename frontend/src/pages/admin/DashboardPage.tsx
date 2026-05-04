import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, Briefcase, CalendarDays, TrendingUp, ChevronRight, Clock } from 'lucide-react'
import { MOCK_PROFILES, MOCK_SERVICES, MOCK_BOOKINGS, MOCK_CATEGORIES } from '@/lib/mock/data'
import { Badge } from '@/components/ui/Badge'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'
import type { BookingRow } from '@/types/database'

type Status = BookingRow['status']
const STATUS_BADGE: Record<Status, Parameters<typeof Badge>[0]['variant']> = {
  pending: 'warning', confirmed: 'success', in_progress: 'navy', completed: 'teal', cancelled: 'neutral',
}
const STATUS_LABEL: Record<Status, string> = {
  pending: 'Чакащ', confirmed: 'Потвърден', in_progress: 'В процес', completed: 'Завършен', cancelled: 'Отменен',
}

interface StatCardProps { label: string; value: number | string; icon: React.ReactNode; to: string; color: string }
function StatCard({ label, value, icon, to, color }: StatCardProps) {
  return (
    <motion.div variants={staggerItem}>
      <Link to={to} className="flex items-center gap-4 bg-white rounded-2xl p-5 hover:shadow-md transition-all" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`} style={{ background: color }}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-display font-black text-navy-500">{value}</p>
          <p className="text-xs text-surface-400 font-medium">{label}</p>
        </div>
        <ChevronRight size={16} className="text-surface-300" />
      </Link>
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  const totalUsers     = MOCK_PROFILES.length
  const totalSuppliers = MOCK_PROFILES.filter(p => p.role === 'supplier').length
  const totalServices  = MOCK_SERVICES.length
  const totalBookings  = MOCK_BOOKINGS.length
  const pendingBookings = MOCK_BOOKINGS.filter(b => b.status === 'pending')
  const totalRevenue   = MOCK_BOOKINGS.filter(b => b.status === 'completed').reduce((s, b) => s + b.price * 0.1, 0)

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Admin Dashboard – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-5xl mx-auto px-5 py-5">
          <h1 className="font-display text-2xl font-bold text-navy-500">Администраторски панел</h1>
          <p className="text-surface-400 text-sm mt-0.5">Vikni.me · Общ преглед</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6 space-y-6">
        {/* Stat cards */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Потребители"  value={totalUsers}    icon={<Users size={22} />}       to="/admin/users"    color="var(--gradient-primary)" />
          <StatCard label="Услуги"       value={totalServices} icon={<Briefcase size={22} />}   to="/admin/services" color="var(--gradient-brand)" />
          <StatCard label="Резервации"   value={totalBookings} icon={<CalendarDays size={22} />} to="/admin/bookings" color="var(--gradient-energy)" />
          <StatCard label="Приходи (комис.)" value={`${totalRevenue.toFixed(0)} €`} icon={<TrendingUp size={22} />} to="/admin" color="linear-gradient(135deg,#10B981,#059669)" />
        </motion.div>

        {/* Quick info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Разпределение</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-surface-600">Клиенти</span><strong className="text-navy-500">{MOCK_PROFILES.filter(p => p.role === 'customer').length}</strong></div>
              <div className="flex justify-between"><span className="text-surface-600">Доставчици</span><strong className="text-navy-500">{totalSuppliers}</strong></div>
              <div className="flex justify-between"><span className="text-surface-600">Категории</span><strong className="text-navy-500">{MOCK_CATEGORIES.length}</strong></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Резервации</p>
            <div className="space-y-2">
              {(['pending','confirmed','completed','cancelled'] as Status[]).map(s => (
                <div key={s} className="flex justify-between items-center">
                  <Badge variant={STATUS_BADGE[s]}>{STATUS_LABEL[s]}</Badge>
                  <strong className="text-navy-500">{MOCK_BOOKINGS.filter(b => b.status === s).length}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Бързи действия</p>
            <div className="space-y-2">
              {[
                { label: 'Потребители',   to: '/admin/users' },
                { label: 'Услуги',        to: '/admin/services' },
                { label: 'Категории',     to: '/admin/categories' },
                { label: 'Заявки',        to: '/admin/enrollments' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="flex items-center justify-between py-1 text-navy-500 hover:text-navy-700 transition-colors">
                  <span>{l.label}</span><ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Pending bookings */}
        {pendingBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-orange-500" />
              <h2 className="font-display font-bold text-navy-500">Чакащи потвърждение ({pendingBookings.length})</h2>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
              {pendingBookings.slice(0, 5).map(b => (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{b.service.title}</p>
                    <p className="text-xs text-surface-400">{b.customer.full_name} → {b.supplier.full_name}</p>
                  </div>
                  <span className="font-bold text-navy-500 shrink-0">{b.price} €</span>
                  <Badge variant="warning">Чакащ</Badge>
                  <ChevronRight size={14} className="text-surface-300 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
