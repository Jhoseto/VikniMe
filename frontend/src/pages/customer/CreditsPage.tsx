import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Wallet, Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'

const MOCK_TRANSACTIONS = [
  { id: '1', label: 'Регистрационен бонус',  amount: +50,  date: '2024-01-15', type: 'credit' },
  { id: '2', label: 'Резервация – масаж',     amount: -30,  date: '2024-02-03', type: 'debit'  },
  { id: '3', label: 'Покана на приятел',      amount: +20,  date: '2024-02-10', type: 'credit' },
  { id: '4', label: 'Резервация – фитнес',    amount: -15,  date: '2024-03-01', type: 'debit'  },
]

const PACKAGES = [
  { credits: 50,  price: 4.99 },
  { credits: 120, price: 9.99,  popular: true },
  { credits: 300, price: 19.99 },
]

export default function CreditsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Кредити – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">Кредити</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-5">
        {/* Balance card */}
        <div className="rounded-2xl p-6 text-white text-center" style={{ background: 'var(--gradient-brand)' }}>
          <Wallet size={32} className="mx-auto mb-2 opacity-80" />
          <p className="text-white/70 text-sm mb-1">Наличен баланс</p>
          <p className="font-display font-black text-5xl">{profile?.credits ?? 0}</p>
          <p className="text-white/70 text-sm mt-1">кредита</p>
        </div>

        {/* Packages */}
        <div>
          <h2 className="font-display font-bold text-navy-500 mb-3">Купи кредити</h2>
          <div className="grid grid-cols-3 gap-3">
            {PACKAGES.map(pkg => (
              <button key={pkg.credits}
                onClick={() => toast.info('Плащане – предстои интеграция')}
                className="relative bg-white rounded-2xl p-4 text-center hover:shadow-md transition-all border-2 border-transparent hover:border-navy-200"
                style={{ boxShadow: 'var(--shadow-card)' }}>
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Популярен
                  </span>
                )}
                <p className="font-display font-black text-2xl text-navy-500">{pkg.credits}</p>
                <p className="text-xs text-surface-400 mb-2">кредита</p>
                <p className="font-bold text-sm text-orange-500">{pkg.price} лв.</p>
              </button>
            ))}
          </div>
        </div>

        {/* Invite friend */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <Gift size={24} className="text-orange-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-orange-800">Покани приятел</p>
            <p className="text-xs text-orange-600 mt-0.5">Получи 20 кредита за всяка регистрация</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText('https://vikni.me/ref/demo'); toast.success('Линкът е копиран!') }}>
            Копирай
          </Button>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="font-display font-bold text-navy-500 mb-3">История</h2>
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="bg-white rounded-2xl overflow-hidden divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
            {MOCK_TRANSACTIONS.map(t => (
              <motion.div key={t.id} variants={staggerItem}
                className="flex items-center gap-3.5 px-4 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${t.type === 'credit' ? 'bg-green-50' : 'bg-orange-50'}`}>
                  {t.type === 'credit' ? '➕' : '➖'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{t.label}</p>
                  <p className="text-xs text-surface-400">{t.date}</p>
                </div>
                <span className={`font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount} кр.
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
