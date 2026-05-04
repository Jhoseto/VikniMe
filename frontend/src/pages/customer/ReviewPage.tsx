import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Star } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { apiGetBookingById } from '@/api/bookings'
import { apiCreateReview } from '@/api/reviews'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { clsx } from 'clsx'

const RATINGS = [1, 2, 3, 4, 5]
const RATING_LABELS = ['Много лошо', 'Лошо', 'Добре', 'Много добре', 'Отлично']

export default function ReviewPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const { data: booking } = useQuery({
    queryKey: ['booking', id],
    queryFn:  () => apiGetBookingById(id),
  })

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => apiCreateReview({
      service_id:  booking!.service_id,
      reviewer_id: profile!.id,
      rating,
      comment: comment.trim() || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Благодарим за отзива!')
      navigate(`/bookings/${id}`, { replace: true })
    },
    onError: () => toast.error('Грешка при изпращане.'),
  })

  if (!booking) return null

  const displayed = hovered || rating

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Остави отзив – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">Остави отзив</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        {/* Service info */}
        <div className="text-center">
          <p className="text-sm text-surface-500 mb-1">Оценяваш</p>
          <h2 className="font-display font-bold text-lg text-surface-900">{booking.service.title}</h2>
        </div>

        {/* Star picker */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3" onMouseLeave={() => setHovered(0)}>
            {RATINGS.map(r => (
              <button key={r}
                onMouseEnter={() => setHovered(r)}
                onClick={() => setRating(r)}
                className="transition-transform hover:scale-110"
                aria-label={`${r} звезди`}>
                <Star
                  size={40}
                  className={clsx('transition-colors', r <= displayed ? 'text-orange-400 fill-orange-400' : 'text-surface-200 fill-surface-200')}
                />
              </button>
            ))}
          </div>
          <p className="font-semibold text-lg text-surface-700">
            {RATING_LABELS[(displayed || rating) - 1]}
          </p>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <label className="text-sm font-semibold text-navy-500">Коментар (по избор)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Разкажи за своя опит с услугата..."
            className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors"
          />
          <p className="text-xs text-surface-400 text-right">{comment.length}/500</p>
        </div>

        <Button fullWidth size="lg" loading={isPending} onClick={() => submit()} leftIcon={<Star size={16} />}>
          Изпрати отзива
        </Button>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
