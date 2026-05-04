import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star, MapPin, CheckCircle, MessageCircle, Share2, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { toast } from 'sonner'
import { apiGetSupplierPublicProfile } from '@/api/profiles'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'

export default function SupplierProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn:  () => apiGetSupplierPublicProfile(id),
    enabled:  !!id,
  })

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: data?.profile.full_name ?? 'Доставчик', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Линкът е копиран!')
    }
  }

  if (isLoading) return <SupplierSkeleton />
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-surface-400">Профилът не е намерен.</div>
  )

  const { profile, services, reviews, avgRating } = data

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet>
        <title>{profile.full_name} – Vikni.me</title>
        <meta name="description" content={profile.bio ?? `Профил на ${profile.full_name} в Vikni.me`} />
      </Helmet>

      {/* ── Cover + Avatar ──────────────────────────────── */}
      <div className="relative">
        {/* Cover */}
        <div className="h-36 md:h-48" style={{ background: 'var(--gradient-brand)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Back + Share */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors" aria-label="Назад">
            <ArrowLeft size={18} />
          </button>
          <button onClick={handleShare}
            className="w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors" aria-label="Сподели">
            <Share2 size={16} />
          </button>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="ring-4 ring-white rounded-full">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
          </div>
        </div>
      </div>

      {/* ── Profile Info ─────────────────────────────────── */}
      <div className="pt-16 px-4 pb-5 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-surface-900">{profile.full_name}</h1>

        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          {profile.is_verified && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle size={11} /> Верифициран
            </Badge>
          )}
          {profile.location && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <MapPin size={13} /> {profile.location}
            </span>
          )}
          <span className="text-xs text-surface-400">
            На платформата от {format(new Date(profile.created_at), 'MMM yyyy', { locale: bg })}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-5 py-4 bg-white rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="text-center">
            <div className="font-display font-black text-2xl text-navy-500">{services.length}</div>
            <div className="text-xs text-surface-400 mt-0.5">Услуги</div>
          </div>
          <div className="w-px h-10 bg-surface-200" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star size={16} className="text-orange-400 fill-orange-400" />
              <span className="font-display font-black text-2xl text-navy-500">{avgRating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-surface-400 mt-0.5">Рейтинг</div>
          </div>
          <div className="w-px h-10 bg-surface-200" />
          <div className="text-center">
            <div className="font-display font-black text-2xl text-navy-500">{reviews.length}</div>
            <div className="text-xs text-surface-400 mt-0.5">Отзива</div>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-surface-600 leading-relaxed">{profile.bio}</p>
        )}

        {/* Contact CTA */}
        <div className="flex gap-3 justify-center mt-5">
          <Link to="/search"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'var(--gradient-brand)' }}>
            <Calendar size={15} /> Резервирай
          </Link>
          <button
            onClick={() => toast.info('Изпрати съобщение след резервация.')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-navy-200 text-navy-600 hover:bg-navy-50 font-semibold text-sm transition-colors">
            <MessageCircle size={15} /> Съобщение
          </button>
        </div>
      </div>

      {/* ── Services ─────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="px-4 py-5 max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-navy-500 text-lg mb-4">Услуги ({services.length})</h2>
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(svc => (
              <motion.div key={svc.id} variants={staggerItem}>
                <ServiceCard service={svc} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ── Reviews ──────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="px-4 py-5 max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-navy-500 text-lg mb-4">Отзиви ({reviews.length})</h2>
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            {reviews.map(r => (
              <motion.div key={r.id} variants={staggerItem}
                className="bg-white rounded-2xl p-4 flex gap-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                <Avatar src={r.reviewer.avatar_url} name={r.reviewer.full_name} size="sm" className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-sm text-surface-800">{r.reviewer.full_name}</span>
                    <span className="text-xs text-surface-400">{format(new Date(r.created_at), 'd MMM yyyy', { locale: bg })}</span>
                  </div>
                  <StarRating value={r.rating} size={13} className="mt-0.5 mb-1.5" />
                  {r.comment && <p className="text-sm text-surface-600 leading-relaxed">{r.comment}</p>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <div className="h-24 lg:hidden" />
    </AnimatedPage>
  )
}

function SupplierSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="h-36 bg-surface-200" />
      <div className="flex flex-col items-center px-4 pt-16 pb-6 gap-3">
        <Skeleton className="w-20 h-20" rounded="full" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full max-w-sm rounded-2xl" />
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}
