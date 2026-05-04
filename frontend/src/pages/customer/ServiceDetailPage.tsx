import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Star, MapPin, Share2, Heart, ChevronLeft, ChevronRight, ZoomIn,
  Clock, MessageCircle, CheckCircle, ShieldCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { format, isBefore, startOfDay } from 'date-fns'
import { bg } from 'date-fns/locale'
import { apiGetServiceById, type ServiceWithRelations } from '@/api/services'
import { apiGetReviewsForService, type ReviewWithReviewer } from '@/api/reviews'
import { apiCreateBooking } from '@/api/bookings'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useHaptic } from '@/hooks/useHaptic'
import { MOCK_BOOKINGS } from '@/lib/mock/data'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { Lightbox } from '@/components/shared/Lightbox'
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'

/* ─── Booked time slots (mock conflict check) ────────────── */
const ALL_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

function getBookedSlotsForDate(serviceId: string, dateStr: string): string[] {
  return MOCK_BOOKINGS
    .filter(b => b.service_id === serviceId && b.scheduled_at?.startsWith(dateStr))
    .map(b => b.scheduled_at?.slice(11, 16) ?? '')
    .filter(Boolean)
}

/* ─── Price label ────────────────────────────────────────── */
const priceLabel = { fixed: '€', hourly: '€/ч.', negotiable: '' }

/* ─── Image Gallery ──────────────────────────────────────── */
function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const prev = () => setIdx(i => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setIdx(i => (i === images.length - 1 ? 0 : i + 1))

  if (!images.length) {
    return (
      <div className="w-full h-64 md:h-80 flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
        <span className="font-display font-black text-6xl text-white/20">V</span>
      </div>
    )
  }

  return (
    <>
      <div className="relative w-full h-64 md:h-80 overflow-hidden bg-surface-100 cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`${title} – снимка ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white pointer-events-none">
          <ZoomIn size={14} />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors" aria-label="Предишна">
              <ChevronLeft size={18} />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-12 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors" aria-label="Следваща">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }} className={clsx('w-2 h-2 rounded-full transition-all', i === idx ? 'bg-white scale-125' : 'bg-white/50')} aria-label={`Снимка ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <AnimatePresence>
        {lightboxOpen && <Lightbox images={images} initialIndex={idx} onClose={() => setLightboxOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ─── Booking Widget ─────────────────────────────────────── */
function BookingWidget({ service }: { service: ServiceWithRelations }) {
  const { profile } = useAuthStore()
  const navigate    = useNavigate()
  const qc          = useQueryClient()
  const [selected, setSelected] = useState<Date | undefined>()
  const [time, setTime] = useState<string | null>(null)

  const dateStr = selected ? format(selected, 'yyyy-MM-dd') : ''
  const bookedSlots = dateStr ? getBookedSlotsForDate(service.id, dateStr) : []

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!profile) throw new Error('not-auth')
      if (!selected || !time) throw new Error('no-date')
      return apiCreateBooking({
        service_id:   service.id,
        customer_id:  profile.id,
        supplier_id:  service.supplier_id,
        scheduled_at: new Date(`${dateStr}T${time}`).toISOString(),
        price:        service.price,
      })
    },
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Резервацията е изпратена!')
      navigate(`/bookings/${booking.id}`)
    },
    onError: (err) => {
      if (err.message === 'not-auth') { toast.error('Трябва да влезеш в профила си.'); navigate('/login'); return }
      if (err.message === 'no-date')  { toast.error('Избери дата и час.'); return }
      toast.error('Грешка при резервация.')
    },
  })

  const displayPrice = service.price_type === 'negotiable'
    ? 'По договаряне'
    : `${service.price} ${priceLabel[service.price_type]}`

  const today = startOfDay(new Date())

  return (
    <div className="bg-white rounded-2xl overflow-hidden sticky top-20" style={{ boxShadow: 'var(--shadow-card-hover)' }}>
      <div className="px-5 pt-5 pb-3 border-b border-surface-100">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-black text-2xl text-navy-500">{displayPrice}</span>
          {service.price_type !== 'negotiable' && (
            <Badge variant="navy" className="text-xs">Фиксирана цена</Badge>
          )}
        </div>
      </div>

      {/* DayPicker */}
      <div className="px-2 py-1">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-3 pt-2 mb-1">Избери дата</p>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(day) => { setSelected(day); setTime(null) }}
          locale={bg}
          disabled={(day) => isBefore(day, today)}
          classNames={{
            root: 'w-full text-sm',
            month_caption: 'text-sm font-semibold text-navy-500 capitalize px-2 mb-1',
            day: 'rounded-lg text-xs w-8 h-8',
            selected: '!bg-navy-500 !text-white font-bold rounded-lg',
            today: 'font-bold text-orange-500',
            disabled: 'opacity-30 cursor-not-allowed',
          }}
        />
      </div>

      {/* Time slots */}
      {selected && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={13} className="text-surface-400" />
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Час</p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_SLOTS.map(slot => {
              const booked = bookedSlots.includes(slot)
              const active = time === slot
              return (
                <button key={slot} onClick={() => !booked && setTime(slot)} disabled={booked}
                  className={clsx('py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                    booked  ? 'border-surface-100 bg-surface-50 text-surface-300 cursor-not-allowed line-through'
                    : active ? 'border-navy-500 bg-navy-500 text-white'
                             : 'border-surface-200 text-surface-600 hover:border-navy-300 hover:text-navy-600')}>
                  {slot}
                </button>
              )
            })}
          </div>
          {bookedSlots.length > 0 && (
            <p className="text-[10px] text-surface-400 mt-2">Зачеркнатите часове са вече резервирани.</p>
          )}
        </div>
      )}

      <div className="px-4 pb-5 space-y-3">
        <Button fullWidth size="lg" loading={isPending} disabled={!selected || !time}
          onClick={() => mutate()}>
          {profile ? (selected && time ? `Резервирай – ${format(selected, 'dd.MM')} в ${time}` : 'Избери дата и час') : 'Влез и резервирай'}
        </Button>
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <ShieldCheck size={14} className="text-green-500 shrink-0" />
          Плащате само след потвърждение. Безплатно анулиране до 24 часа.
        </div>
      </div>
    </div>
  )
}

/* ─── Review Card ────────────────────────────────────────── */
function ReviewCard({ review }: { review: ReviewWithReviewer }) {
  return (
    <motion.div variants={staggerItem} className="flex gap-3">
      <Avatar src={review.reviewer.avatar_url} name={review.reviewer.full_name} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm text-surface-800">{review.reviewer.full_name}</span>
          <span className="text-xs text-surface-400">{format(new Date(review.created_at), 'd MMM yyyy', { locale: bg })}</span>
        </div>
        <StarRating value={review.rating} size={13} className="mt-0.5 mb-1.5" />
        {review.comment && <p className="text-sm text-surface-600 leading-relaxed">{review.comment}</p>}
      </div>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ServiceDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const liked = useFavoritesStore(s => s.has(id))
  const toggleFav = useFavoritesStore(s => s.toggle)
  const { trigger } = useHaptic()

  const { data: service, isLoading } = useQuery<ServiceWithRelations | null>({
    queryKey: ['service', id],
    queryFn:  () => apiGetServiceById(id),
  })

  const { data: reviews = [] } = useQuery<ReviewWithReviewer[]>({
    queryKey: ['reviews', 'service', id],
    queryFn:  () => apiGetReviewsForService(id),
    enabled:  !!id,
  })

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: service?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Линкът е копиран!')
    }
  }

  if (isLoading) return <ServiceDetailSkeleton />
  if (!service)  return (
    <div className="min-h-screen flex items-center justify-center text-surface-400">Услугата не е намерена.</div>
  )

  const displayPrice = service.price_type === 'negotiable'
    ? 'По договаряне'
    : `${service.price} ${priceLabel[service.price_type]}`

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet>
        <title>{service.title} – Vikni.me</title>
        <meta name="description" content={service.description.slice(0, 155)} />
        <meta property="og:title" content={service.title} />
        <meta property="og:image" content={service.images[0] ?? ''} />
      </Helmet>

      {/* ── Gallery ─────────────────────────────────────── */}
      <div className="relative">
        <ImageGallery images={service.images} title={service.title} />
        {/* Back + Share buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors" aria-label="Назад">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare}
              className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors" aria-label="Сподели">
              <Share2 size={16} />
            </button>
            <button
              onClick={() => { toggleFav(id); trigger('light') }}
              aria-label={liked ? 'Премахни от любими' : 'Добави в любими'}
              aria-pressed={liked}
              className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors">
              <Heart size={16} className={clsx(liked && 'fill-red-500 text-red-500')} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Title & meta */}
          <motion.div variants={fadeUp} initial="initial" animate="animate">
            {service.categories && (
              <Link to={`/category/${service.categories.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-navy-700 mb-2 transition-colors">
                {service.categories.name} →
              </Link>
            )}
            <h1 className="font-display text-2xl font-bold text-surface-900 mb-3">{service.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
              <div className="flex items-center gap-1.5">
                <Star size={15} className="text-orange-400 fill-orange-400" />
                <strong className="text-surface-700">{service.avg_rating.toFixed(1)}</strong>
                <span>({service.review_count} отзива)</span>
              </div>
              {service.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} /> {service.location}
                </div>
              )}
            </div>
          </motion.div>

          {/* Mobile price + CTA */}
          <div className="lg:hidden bg-white rounded-2xl p-4 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div>
              <p className="text-xs text-surface-400 mb-0.5">Цена</p>
              <p className="font-display font-black text-xl text-navy-500">{displayPrice}</p>
            </div>
            <Link to={`#booking`} className="px-5 py-2.5 rounded-full text-white font-semibold text-sm" style={{ background: 'var(--gradient-brand)' }}>
              Резервирай
            </Link>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-bold text-navy-500 mb-3">За услугата</h2>
            <p className="text-surface-600 text-sm leading-relaxed whitespace-pre-line">{service.description}</p>
          </div>

          {/* Supplier card */}
          {service.profiles && (
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-display font-bold text-navy-500 mb-4">Доставчик</h2>
              <div className="flex items-center gap-4">
                <Avatar src={service.profiles.avatar_url} name={service.profiles.full_name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-800">{service.profiles.full_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle size={13} className="text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Верифициран</span>
                  </div>
                </div>
                <Link to={`/supplier/${service.supplier_id}`}
                  className="flex items-center gap-1.5 px-4 py-2 border-2 border-navy-200 text-navy-600 hover:bg-navy-50 rounded-full text-sm font-medium transition-colors shrink-0">
                  <MessageCircle size={14} /> Профил
                </Link>
              </div>
            </div>
          )}

          {/* What's included */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-bold text-navy-500 mb-3">Включено в услугата</h2>
            <ul className="space-y-2 text-sm text-surface-600">
              {['Идва при вас (до 15 км. безплатно)', 'Собствено оборудване и материали', 'Платете само след изпълнение', 'Безплатно анулиране до 24 ч.'].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile booking widget */}
          <div id="booking" className="lg:hidden">
            <h2 className="font-display font-bold text-navy-500 mb-3">Резервирай</h2>
            <BookingWidget service={service} />
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            {/* Rating summary */}
            <div className="flex items-start gap-5 mb-5 pb-5 border-b border-surface-100">
              <div className="text-center shrink-0">
                <p className="font-display font-black text-4xl text-navy-500">{service.avg_rating.toFixed(1)}</p>
                <StarRating value={service.avg_rating} size={14} className="mt-1" />
                <p className="text-xs text-surface-400 mt-1">{reviews.length} отзива</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-right text-surface-500 font-medium">{star}</span>
                      <Star size={10} className="text-orange-400 fill-orange-400 shrink-0" />
                      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: (5 - star) * 0.08 }}
                          className="h-full bg-orange-400 rounded-full" />
                      </div>
                      <span className="w-7 text-surface-400">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <h2 className="font-display font-bold text-navy-500 mb-4">Отзиви</h2>
            {reviews.length === 0 ? (
              <p className="text-surface-400 text-sm">Все още няма отзиви.</p>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 divide-y divide-surface-100">
                {reviews.map(r => (
                  <div key={r.id} className="pt-5 first:pt-0">
                    <ReviewCard review={r} />
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right column – desktop booking widget */}
        <div className="hidden lg:block">
          <div id="booking-desktop">
            <BookingWidget service={service} />
          </div>
        </div>
      </div>
      </AnimatedPage>
  )
}

function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Skeleton className="w-full h-64 md:h-80" rounded="sm" />
      <div className="max-w-5xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <Skeleton className="h-5 w-32 mb-3" />
            <SkeletonText lines={4} />
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-11 w-full mb-3" />
            <Skeleton className="h-11 w-full mb-4" />
            <Skeleton className="h-11 w-full" rounded="full" />
          </div>
        </div>
      </div>
    </div>
  )
}
