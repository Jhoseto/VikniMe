/**
 * Booking Confirmation page – /bookings/:id/confirm
 *
 * Stripe payment flow:
 *  1. Page loads → apiCreatePaymentIntent(amount) → clientSecret
 *  2. User picks card or enters new card (Stripe CardElement)
 *  3. stripe.confirmCardPayment(clientSecret, { payment_method })
 *  4. On success: confetti animation + Sonner toast + navigate to booking detail
 *
 * Mock mode: skips Stripe, simulates 1.2s delay.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, CreditCard, Shield, CheckCircle, Coins, Zap, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { getStripe, isMockStripe } from '@/lib/stripe'
import { apiCreatePaymentIntent, apiConfirmMockPayment, apiGetSavedCards, type SavedCard } from '@/api/payments'
import { useAuthStore } from '@/stores/authStore'
import { MOCK_BOOKINGS } from '@/lib/mock/data'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { Button } from '@/components/ui/Button'

/* ── Confetti burst ──────────────────────────────────────── */
function Confetti() {
  const colors = ['#8B5CF6', '#2DD4BF', '#F97316', '#1B2A5E', '#F5A623', '#EC4899']
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ left: `${Math.random() * 100}%`, backgroundColor: colors[i % colors.length] }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', x: (Math.random() - 0.5) * 400, rotate: Math.random() * 720, opacity: 0 }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

/* ── Success state ───────────────────────────────────────── */
function SuccessView({ bookingId }: { bookingId: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-brand-glow)' }}>
        <CheckCircle size={48} className="text-white" />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="font-display text-2xl font-black text-navy-500 mb-2">
        Резервацията е потвърдена!
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="text-surface-500 mb-8 text-sm max-w-xs">
        Получи потвърждение по имейл. Доставчикът ще се свърже с теб скоро.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="flex flex-col gap-2 w-full max-w-xs">
        <Link to={`/bookings/${bookingId}`}
          className="block text-center py-3 px-6 rounded-2xl text-white font-semibold"
          style={{ background: 'var(--gradient-brand)' }}>
          Виж резервацията
        </Link>
        {'share' in navigator && (
          <button onClick={() => navigator.share({ title: 'Резервирах услуга в Vikni.me!', url: window.location.origin })}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-surface-600 hover:bg-surface-100 transition-colors font-medium text-sm border border-surface-200">
            <Share2 size={15} /> Сподели
          </button>
        )}
        <Link to="/" className="block text-center py-3 px-6 rounded-2xl text-surface-600 hover:bg-surface-100 transition-colors font-medium text-sm">
          Към началната страница
        </Link>
      </motion.div>
    </div>
  )
}

/* ── Inner payment form ──────────────────────────────────── */
interface PayFormProps {
  booking: typeof MOCK_BOOKINGS[number]
  onSuccess: () => void
}

function PaymentForm({ booking, onSuccess }: PayFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { profile } = useAuthStore()
  const [method, setMethod] = useState<'saved' | 'new' | 'credits'>('saved')
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: savedCards = [] } = useQuery<SavedCard[]>({
    queryKey: ['saved-cards'],
    queryFn: apiGetSavedCards,
  })

  useEffect(() => {
    if (savedCards.length > 0) {
      setSelectedCard(savedCards.find(c => c.is_default)?.id ?? savedCards[0].id)
    } else {
      setMethod('new')
    }
  }, [savedCards])

  const canUseCredits = (profile?.credits ?? 0) >= booking.price
  const PLATFORM_FEE = Math.round(booking.price * 0.05 * 100) / 100
  const VAT = Math.round(booking.price * 0.2 * 100) / 100
  const total = booking.price + PLATFORM_FEE + VAT

  async function handlePay() {
    setLoading(true)
    try {
      if (isMockStripe || method === 'credits') {
        const intent = await apiCreatePaymentIntent(total)
        await apiConfirmMockPayment(intent.id)
        toast.success('Плащането е успешно!', { icon: '🎉' })
        onSuccess()
        return
      }
      if (!stripe || !elements) return
      const intent = await apiCreatePaymentIntent(total)

      let paymentMethod: string | { card: unknown } | undefined
      if (method === 'saved' && selectedCard) {
        paymentMethod = selectedCard
      } else {
        const cardEl = elements.getElement(CardElement)
        if (!cardEl) return
        paymentMethod = { card: cardEl }
      }

      const result = await stripe.confirmCardPayment(intent.clientSecret, { payment_method: paymentMethod as any })
      if (result.error) {
        toast.error(result.error.message ?? 'Грешка при плащане')
      } else {
        toast.success('Плащането е успешно!', { icon: '🎉' })
        onSuccess()
      }
    } catch {
      toast.error('Грешка при плащане')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Price breakdown */}
      <div className="p-4 rounded-2xl bg-white border border-surface-200 space-y-2.5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex justify-between text-sm">
          <span className="text-surface-600">Цена на услугата</span>
          <span className="font-medium">{booking.price} лв.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-surface-600">Такса платформа (5%)</span>
          <span className="font-medium">{PLATFORM_FEE} лв.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-surface-600">ДДС (20%)</span>
          <span className="font-medium">{VAT} лв.</span>
        </div>
        <div className="border-t border-surface-100 pt-2 flex justify-between">
          <span className="font-bold text-surface-800">Общо</span>
          <span className="font-bold text-lg text-navy-500">{total.toFixed(2)} лв.</span>
        </div>
      </div>

      {/* Payment method tabs */}
      <div>
        <p className="text-sm font-semibold text-surface-700 mb-3">Начин на плащане</p>
        <div className="flex gap-2 mb-4">
          {savedCards.length > 0 && (
            <button onClick={() => setMethod('saved')}
              className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                method === 'saved' ? 'border-navy-400 bg-navy-50 text-navy-600' : 'border-surface-200 text-surface-500 hover:border-surface-300')}>
              <CreditCard size={15} /> Запазена
            </button>
          )}
          <button onClick={() => setMethod('new')}
            className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
              method === 'new' ? 'border-navy-400 bg-navy-50 text-navy-600' : 'border-surface-200 text-surface-500 hover:border-surface-300')}>
            <CreditCard size={15} /> Нова карта
          </button>
          {canUseCredits && (
            <button onClick={() => setMethod('credits')}
              className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                method === 'credits' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-surface-200 text-surface-500 hover:border-surface-300')}>
              <Coins size={15} /> Кредити
            </button>
          )}
        </div>

        {/* Saved cards */}
        <AnimatePresence mode="wait">
          {method === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {savedCards.map(card => (
                <label key={card.id} className={clsx('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                  selectedCard === card.id ? 'border-navy-400 bg-navy-50' : 'border-surface-200 bg-white hover:border-surface-300')}>
                  <input type="radio" name="card" value={card.id} checked={selectedCard === card.id}
                    onChange={() => setSelectedCard(card.id)} className="accent-navy-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-800 capitalize">{card.brand} •••• {card.last4}</p>
                    <p className="text-xs text-surface-400">Изтича {card.exp_month}/{card.exp_year}</p>
                  </div>
                  {card.is_default && <span className="text-xs text-navy-500 font-medium">По подразб.</span>}
                </label>
              ))}
            </motion.div>
          )}

          {method === 'new' && (
            <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isMockStripe ? (
                <div className="p-3 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50 text-center">
                  <p className="text-sm text-surface-400 font-mono">4242 4242 4242 4242</p>
                  <p className="text-xs text-surface-400 mt-1">Тестова Stripe карта (без реален ключ)</p>
                </div>
              ) : (
                <div className="p-3 border-2 border-surface-200 rounded-xl focus-within:border-navy-400 transition-colors bg-white">
                  <CardElement options={{
                    style: {
                      base: { fontSize: '15px', color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif", '::placeholder': { color: '#94a3b8' } },
                      invalid: { color: '#ef4444' },
                    },
                    hidePostalCode: true,
                  }} />
                </div>
              )}
            </motion.div>
          )}

          {method === 'credits' && (
            <motion.div key="credits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-teal-50 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-teal-600" />
                <p className="text-sm font-semibold text-teal-800">Плащане с кредити</p>
              </div>
              <p className="text-xs text-teal-700">Баланс: <strong>{profile?.credits ?? 0} кредита</strong></p>
              <p className="text-xs text-teal-600 mt-1">Ще бъдат използвани {total.toFixed(2)} кредита за тази поръчка.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stripe security note */}
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-teal-500 shrink-0" />
        <p className="text-xs text-surface-400">
          Плащанията се обработват сигурно от <strong className="text-surface-600">Stripe</strong>. Данните ти са криптирани.
        </p>
      </div>

      <Button onClick={handlePay} loading={loading} className="w-full h-14 text-base">
        Плати {total.toFixed(2)} лв.
      </Button>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────── */
export default function BookingConfirmPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paid, setPaid] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const booking = MOCK_BOOKINGS.find(b => b.id === id) ?? MOCK_BOOKINGS[0]

  function handleSuccess() {
    setShowConfetti(true)
    setPaid(true)
    setTimeout(() => setShowConfetti(false), 3500)
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Потвърди резервацията – Vikni.me</title></Helmet>

      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top" style={{ boxShadow: 'var(--shadow-top)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 transition-colors" aria-label="Назад">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">
            {paid ? 'Успешно плащане' : 'Потвърди резервацията'}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {paid ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessView bookingId={booking.id} />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Booking summary */}
              <div className="p-4 rounded-2xl bg-white border border-surface-200 flex gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                {booking.service.images[0] && (
                  <img src={booking.service.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-surface-800 line-clamp-2">{booking.service.title}</p>
                  <p className="text-xs text-surface-500 mt-1">{booking.supplier.full_name}</p>
                  <p className="text-xs text-navy-500 font-medium mt-1.5">
                    {booking.scheduled_at ? format(new Date(booking.scheduled_at), 'dd MMMM yyyy, HH:mm', { locale: bg }) : '—'}
                  </p>
                </div>
              </div>

              {/* Stripe Elements wrapper */}
              <Elements stripe={getStripe()}>
                <PaymentForm booking={booking} onSuccess={handleSuccess} />
              </Elements>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-16" />
    </AnimatedPage>
  )
}
