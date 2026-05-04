import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Banknote, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { apiGetMyBookings, type BookingWithRelations } from '@/api/bookings'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'

export default function SupplierEarningsPage() {
  const navigate   = useNavigate()
  const { profile } = useAuthStore()

  const { data: bookings = [], isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ['bookings', profile?.id, 'supplier'],
    queryFn:  () => apiGetMyBookings(profile!.id, 'supplier'),
    enabled:  !!profile,
  })

  const completed     = bookings.filter(b => b.status === 'completed')
  const totalGross    = completed.reduce((s, b) => s + b.price, 0)
  const platformFee   = Math.round(totalGross * 0.1 * 100) / 100
  const netEarnings   = Math.round((totalGross - platformFee) * 100) / 100
  const pendingPayout = Math.round(netEarnings * 0.3 * 100) / 100

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Приходи – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">Приходи</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Summary card */}
        <div className="rounded-2xl p-6 text-white" style={{ background: 'var(--gradient-primary)' }}>
          <p className="text-white/70 text-sm mb-1">Общо нетни приходи</p>
          <p className="font-display font-black text-4xl mb-4">{netEarnings} лв.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/60">Брутни</p>
              <p className="font-bold">{totalGross} лв.</p>
            </div>
            <div>
              <p className="text-white/60">Такса платформа (10%)</p>
              <p className="font-bold">-{platformFee} лв.</p>
            </div>
          </div>
        </div>

        {/* Payout card */}
        <div className="bg-white rounded-2xl p-5 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div>
            <p className="text-xs text-surface-400 mb-1">Чакащо изплащане</p>
            <p className="font-display font-black text-2xl text-navy-500">{pendingPayout} лв.</p>
          </div>
          <Button leftIcon={<Banknote size={15} />} onClick={() => toast.info('IBAN изплащане – предстои интеграция')}>
            Изтегли
          </Button>
        </div>

        {/* IBAN settings */}
        <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-display font-semibold text-navy-500">Банкова сметка</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center">
              <CreditCard size={18} className="text-surface-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-700">BG12 XXXX XXXX 1234 5678 90</p>
              <p className="text-xs text-surface-400 mt-0.5">Иван Иванов</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info('Промяна на IBAN – предстои')}>Промени</Button>
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="font-display font-semibold text-navy-500 mb-3">История на изплащанията</h2>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : completed.length === 0 ? (
            <div className="text-center py-8 text-surface-400 text-sm">Нямаш завършени резервации.</div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate"
              className="bg-white rounded-2xl overflow-hidden divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
              {completed.map(b => (
                <motion.div key={b.id} variants={staggerItem} className="flex items-center gap-3.5 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{b.service.title}</p>
                    <p className="text-xs text-surface-400">{b.scheduled_at ? format(new Date(b.scheduled_at), 'd MMM yyyy', { locale: bg }) : '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-green-600">+{Math.round(b.price * 0.9)} лв.</p>
                    <p className="text-xs text-surface-400">след такса</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
