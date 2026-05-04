import { Link } from 'react-router-dom'
import { MapPin, Star, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import type { ServiceRow } from '@/types/database'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useHaptic } from '@/hooks/useHaptic'

type Service = ServiceRow & {
  profiles?: { full_name: string | null; avatar_url: string | null } | null
  categories?: { name: string; slug: string } | null
}

interface ServiceCardProps {
  service: Service
  className?: string
}

const priceLabel: Record<string, string> = {
  fixed:      '€',
  hourly:     '€/ч.',
  negotiable: 'по договаряне',
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const image = service.images?.[0]
  const liked = useFavoritesStore(s => s.has(service.id))
  const toggleFav = useFavoritesStore(s => s.toggle)
  const { trigger } = useHaptic()

  const price = service.price_type === 'negotiable'
    ? 'По договаряне'
    : `${service.price} ${priceLabel[service.price_type]}`

  return (
    <motion.article
      whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className={clsx('group bg-white rounded-3xl overflow-hidden', className)}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <Link to={`/service/${service.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500">
        {/* ── Image ─────────────────────────────────────────── */}
        <div className="relative h-48 bg-surface-100 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--gradient-logo)' }}
            >
              <span className="font-display font-black text-5xl text-white/20 select-none">V</span>
            </div>
          )}

          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Category badge */}
          {service.categories && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-navy-600 text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm">
              {service.categories.name}
            </span>
          )}

          {/* Favourite button — 44×44 touch target with smaller visual */}
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFav(service.id); trigger('light') }}
            aria-label={liked ? 'Премахни от любими' : 'Добави в любими'}
            aria-pressed={liked}
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
          >
            <span className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm">
              <Heart
                size={15}
                className={clsx('transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-surface-400')}
              />
            </span>
          </button>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        <div className="p-4">
          <h3 className="font-display font-bold text-surface-800 text-sm leading-snug line-clamp-2 mb-1.5">
            {service.title}
          </h3>

          {service.location && (
            <div className="flex items-center gap-1 text-surface-400 text-xs mb-3">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{service.location}</span>
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-orange-400 fill-orange-400" />
              <span className="text-sm font-bold text-surface-700">{service.avg_rating.toFixed(1)}</span>
              {service.review_count > 0 && (
                <span className="text-xs text-surface-400">({service.review_count})</span>
              )}
            </div>
            <div className="text-right">
              {service.price_type !== 'negotiable' && (
                <span className="text-[10px] text-surface-400 block leading-none mb-0.5">от</span>
              )}
              <span className="text-sm font-black text-navy-500">{price}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
