/**
 * Payments & Payouts page – /profile/payments
 *
 * Shows:
 * – Saved cards (Stripe PaymentMethods)
 * – "Add card" form (Stripe CardElement or mock)
 * – IBAN payout settings (for suppliers)
 *
 * Architecture:
 *  Frontend → POST /api/setup-intent → clientSecret
 *  Frontend → stripe.confirmCardSetup(clientSecret, { card }) → card saved in Stripe
 *  Frontend → POST /api/payment-methods/sync → saved in our DB
 *
 * In mock mode (no VITE_STRIPE_PUBLISHABLE_KEY) we show a simulated form.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Trash2, CheckCircle, Plus, Building2, ArrowLeft, Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { getStripe, isMockStripe } from '@/lib/stripe'
import {
  apiGetSavedCards, apiDeleteCard, apiSetDefaultCard,
  apiCreateSetupIntent, apiGetPayoutDetails, apiSavePayoutDetails,
  type SavedCard,
} from '@/api/payments'
import { useAuthStore } from '@/stores/authStore'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/* ── IBAN form schema ────────────────────────────────────── */
const ibanSchema = z.object({
  iban:         z.string().min(15, 'Невалиден IBAN').max(34),
  holder_name:  z.string().min(2, 'Въведи пълно име'),
})
type IbanForm = z.infer<typeof ibanSchema>

/* ── Card brand icon ─────────────────────────────────────── */
const BRAND_COLORS: Record<string, string> = {
  visa:       '#1A1F71',
  mastercard: '#EB001B',
  amex:       '#007BC1',
}
function CardBrand({ brand }: { brand: string }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_COLORS[brand] ?? '#666' }}>
      {brand}
    </span>
  )
}

/* ── Saved card item ─────────────────────────────────────── */
function CardItem({ card, onDelete, onSetDefault }: { card: SavedCard; onDelete: (id: string) => void; onSetDefault: (id: string) => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={clsx('flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors',
        card.is_default ? 'border-navy-300 bg-navy-50' : 'border-surface-200 bg-white')}
      style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-100 shrink-0">
        <CreditCard size={20} className="text-surface-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CardBrand brand={card.brand} />
          <span className="text-sm font-semibold text-surface-800">•••• {card.last4}</span>
          {card.is_default && (
            <span className="px-2 py-0.5 bg-navy-100 text-navy-600 text-xs font-medium rounded-full">По подразбиране</span>
          )}
        </div>
        <p className="text-xs text-surface-400 mt-0.5">Изтича {card.exp_month}/{card.exp_year}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!card.is_default && (
          <button onClick={() => onSetDefault(card.id)}
            className="text-xs text-navy-500 font-medium hover:text-navy-700 transition-colors px-2 py-1 rounded-lg hover:bg-navy-50">
            По подразб.
          </button>
        )}
        <button onClick={() => onDelete(card.id)}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
          aria-label="Изтрий карта">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

/* ── Add card form (real Stripe) ─────────────────────────── */
function StripeAddCardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const { clientSecret } = await apiCreateSetupIntent()
      const cardEl = elements.getElement(CardElement)
      if (!cardEl) return

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardEl },
      })
      if (result.error) {
        toast.error(result.error.message ?? 'Грешка при добавяне на карта')
      } else {
        toast.success('Картата е добавена успешно')
        onSuccess()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border-2 border-surface-200 rounded-xl focus-within:border-navy-400 transition-colors bg-white">
        <CardElement options={{
          style: {
            base: { fontSize: '15px', color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif", '::placeholder': { color: '#94a3b8' } },
            invalid: { color: '#ef4444' },
          },
          hidePostalCode: true,
        }} />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Запази карта
      </Button>
    </form>
  )
}

/* ── Add card form (mock mode) ───────────────────────────── */
function MockAddCardForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleMock() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Картата е добавена (тестов режим)')
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
        <Info size={14} className="text-orange-500 mt-0.5 shrink-0" />
        <p className="text-xs text-orange-700">
          <strong>Тестов режим</strong> – добави <code className="bg-orange-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> в <code className="bg-orange-100 px-1 rounded">.env</code> за да активираш истинска карта форма.
        </p>
      </div>
      <div className="p-3 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50 text-center">
        <p className="text-sm text-surface-400 font-mono">4242 4242 4242 4242 · 12/29 · 123</p>
        <p className="text-xs text-surface-400 mt-1">Тестова Stripe карта</p>
      </div>
      <Button onClick={handleMock} loading={loading} className="w-full">
        Добави тестова карта
      </Button>
    </div>
  )
}

/* ── IBAN / Payout section ────────────────────────────────── */
function PayoutSection() {
  const qc = useQueryClient()
  const { data: payout, isLoading } = useQuery({
    queryKey: ['payout-details'],
    queryFn: apiGetPayoutDetails,
  })
  const [editing, setEditing] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<IbanForm>({
    resolver: zodResolver(ibanSchema),
    defaultValues: { iban: payout?.iban ?? '', holder_name: payout?.holder_name ?? '' },
  })

  const save = useMutation({
    mutationFn: apiSavePayoutDetails,
    onSuccess: () => { toast.success('IBAN данните са запазени'); setEditing(false); qc.invalidateQueries({ queryKey: ['payout-details'] }) },
  })

  if (isLoading) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-navy-500 flex items-center gap-2">
          <Building2 size={18} /> Изплащания (IBAN)
        </h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-navy-500 font-medium hover:text-navy-700 transition-colors">
            {payout ? 'Промени' : 'Добави'}
          </button>
        )}
      </div>

      {!editing && payout ? (
        <div className="p-4 rounded-2xl border-2 border-surface-200 bg-white" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm font-semibold text-surface-800">{payout.holder_name}</p>
          <p className="text-sm text-surface-500 font-mono mt-1">{payout.iban}</p>
        </div>
      ) : !editing ? (
        <EmptyState
          icon={Building2}
          tone="teal"
          title="Нямаш добавен IBAN"
          description="Добави банкова сметка, за да получаваш изплащания като доставчик."
          size="compact"
          className="py-6"
        />
      ) : (
        <form onSubmit={handleSubmit(d => save.mutate(d))} className="space-y-3">
          <Input label="IBAN" placeholder="BG80 BNBG 9661 1020 3456 78" {...register('iban')} error={errors.iban?.message} />
          <Input label="Титуляр" placeholder="Мария Николова" {...register('holder_name')} error={errors.holder_name?.message} />
          <div className="flex gap-2">
            <Button type="submit" loading={save.isPending} className="flex-1">Запази</Button>
            <Button variant="outline" type="button" onClick={() => setEditing(false)} className="flex-1">Откажи</Button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────── */
export default function PaymentsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [showAddCard, setShowAddCard] = useState(false)

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['saved-cards'],
    queryFn: apiGetSavedCards,
  })

  const deleteCard = useMutation({
    mutationFn: apiDeleteCard,
    onSuccess: () => { toast.success('Картата е изтрита'); qc.invalidateQueries({ queryKey: ['saved-cards'] }) },
  })
  const setDefault = useMutation({
    mutationFn: apiSetDefaultCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-cards'] }),
  })

  const isSupplier = profile?.role === 'supplier' || profile?.role === 'admin'

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Плащания – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top" style={{ boxShadow: 'var(--shadow-top)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 transition-colors" aria-label="Назад">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">Плащания</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Saved cards */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-navy-500 flex items-center gap-2">
            <CreditCard size={18} /> Запазени карти
          </h2>
          {!showAddCard && (
            <button onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors">
              <Plus size={16} /> Добави
            </button>
          )}
        </div>

        {/* Add card form */}
        <AnimatePresence>
          {showAddCard && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="p-4 rounded-2xl bg-white border-2 border-navy-200 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-surface-800">Нова карта</p>
                  <button onClick={() => setShowAddCard(false)} className="text-xs text-surface-400 hover:text-surface-600">Откажи</button>
                </div>
                {isMockStripe ? (
                  <MockAddCardForm onSuccess={() => { setShowAddCard(false); qc.invalidateQueries({ queryKey: ['saved-cards'] }) }} />
                ) : (
                  <Elements stripe={getStripe()}>
                    <StripeAddCardForm onSuccess={() => { setShowAddCard(false); qc.invalidateQueries({ queryKey: ['saved-cards'] }) }} />
                  </Elements>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            tone="brand"
            title="Нямаш запазени карти"
            description="Добави карта за по-бързо плащане при резервации."
            size="compact"
            className="py-10"
          />
        ) : (
          <div className="space-y-2">
            {cards.map(card => (
              <CardItem key={card.id} card={card}
                onDelete={id => { if (window.confirm('Изтрий тази карта?')) deleteCard.mutate(id) }}
                onSetDefault={id => setDefault.mutate(id)} />
            ))}
          </div>
        )}

        {/* Stripe badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <CheckCircle size={13} className="text-teal-500" />
          <p className="text-xs text-surface-400">
            Плащанията се обработват сигурно от{' '}
            <span className="font-semibold text-surface-600">Stripe</span>
            {isMockStripe && ' (тестов режим)'}
          </p>
        </div>

        {/* IBAN section for suppliers */}
        {isSupplier && <PayoutSection />}
      </div>

      <div className="h-24" />
    </AnimatedPage>
  )
}
