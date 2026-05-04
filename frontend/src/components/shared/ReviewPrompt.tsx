/**
 * ReviewPrompt – Vaul bottom sheet that appears automatically
 * after a completed booking's scheduled date has passed.
 *
 * Logic:
 *  1. On mount, scan MOCK_BOOKINGS for completed bookings whose
 *     scheduled_at < now and haven't been reviewed yet.
 *  2. Filter out those dismissed (stored in localStorage with 24h delay).
 *  3. Show a Vaul sheet for the first pending review.
 *
 * The user can: ★ Submit a review   |   ⏰ Remind me later (24h)   |   ✕ Dismiss forever
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer } from 'vaul'
import { Star, Clock, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useAuthStore } from '@/stores/authStore'
import { MOCK_BOOKINGS, MOCK_REVIEWS } from '@/lib/mock/data'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'vikni_review_dismiss'

function getDismissed(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function setDismissed(id: string, until: number) {
  const d = getDismissed(); d[id] = until; localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
}

interface PendingReview {
  bookingId:    string
  serviceTitle: string
  serviceImage: string
  supplierName: string
}

export function ReviewPrompt() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen]   = useState(false)
  const [pending, setPending] = useState<PendingReview | null>(null)
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)

  useEffect(() => {
    if (!profile) return
    const dismissed = getDismissed()
    const now = Date.now()

    const candidate = MOCK_BOOKINGS.find(b => {
      if (b.customer_id !== profile.id) return false
      if (b.status !== 'completed' && b.status !== 'confirmed') return false
      if (!b.scheduled_at) return false
      if (new Date(b.scheduled_at) > new Date()) return false

      // Check not already reviewed
      const hasReview = MOCK_REVIEWS.some(r => r.booking_id === b.id && r.reviewer_id === profile.id)
      if (hasReview) return false

      // Check not snoozed
      const until = dismissed[b.id] ?? 0
      if (until > now) return false

      return true
    })

    if (candidate) {
      setPending({
        bookingId:    candidate.id,
        serviceTitle: candidate.service.title,
        serviceImage: candidate.service.images[0] ?? '',
        supplierName: candidate.supplier.full_name ?? '',
      })
      // Delay 2s before showing to let the page settle
      setTimeout(() => setOpen(true), 2000)
    }
  }, [profile])

  function handleSnooze() {
    if (!pending) return
    setDismissed(pending.bookingId, Date.now() + 24 * 60 * 60 * 1000)
    setOpen(false)
  }

  function handleDismiss() {
    if (!pending) return
        setDismissed(pending.bookingId, Date.now() + 365 * 24 * 60 * 60 * 1000)
    setOpen(false)
  }

  function handleReview() {
    if (!pending) return
    setOpen(false)
    navigate(`/bookings/${pending.bookingId}/review`)
  }

  if (!pending) return null

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl overflow-hidden bg-white safe-bottom"
          aria-label="Оцени услугата">
          {/* Handle */}
          <div className="w-10 h-1 bg-surface-200 rounded-full mx-auto mt-3 mb-4 shrink-0" />

          {/* Dismiss */}
          <button onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-400 transition-colors"
            aria-label="Затвори">
            <X size={16} />
          </button>

          <div className="px-6 pb-8">
            {/* Service info */}
            <div className="flex items-center gap-3 mb-5">
              {pending.serviceImage && (
                <img src={pending.serviceImage} alt={pending.serviceTitle}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-surface-400 mb-0.5">Как беше?</p>
                <p className="font-display font-bold text-navy-500 text-sm leading-snug line-clamp-2">{pending.serviceTitle}</p>
                <p className="text-xs text-surface-500 mt-0.5">с {pending.supplierName}</p>
              </div>
            </div>

            {/* Stars */}
            <p className="text-sm font-semibold text-surface-700 text-center mb-3">Дай оценка на услугата</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(n => (
                <motion.button key={n}
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  whileTap={{ scale: 1.3 }}
                  animate={{ scale: n <= (hover || rating) ? 1.15 : 1 }}
                  className="focus:outline-none" aria-label={`${n} звезди`}>
                  <Star size={36}
                    className={clsx('transition-colors', n <= (hover || rating) ? 'text-orange-400 fill-orange-400' : 'text-surface-200 fill-surface-200')} />
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={handleReview} className="w-full" disabled={rating === 0}>
                {rating > 0 ? `Напиши отзив (${rating}★)` : 'Избери оценка'}
              </Button>
              <button onClick={handleSnooze}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-surface-500 hover:text-surface-700 transition-colors">
                <Clock size={15} /> Напомни ми след 24 часа
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
