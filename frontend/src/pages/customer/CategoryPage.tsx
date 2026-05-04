import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, HeartHandshake, Mountain, Sparkles, Gem, ChefHat, Camera, Music2, GraduationCap, PawPrint, Dumbbell, Wrench, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { apiGetServicesByCategory, apiGetCategoryBySlug, type ServiceWithRelations } from '@/api/services'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'
import type { CategoryRow } from '@/types/database'

type SortKey = 'rating' | 'price_asc' | 'price_desc' | 'newest'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rating',     label: 'Топ рейтинг' },
  { value: 'price_asc',  label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'newest',     label: 'Нови' },
]

function sortServices(services: ServiceWithRelations[], sort: SortKey): ServiceWithRelations[] {
  const s = [...services]
  switch (sort) {
    case 'price_asc':  return s.sort((a, b) => a.price - b.price)
    case 'price_desc': return s.sort((a, b) => b.price - a.price)
    case 'newest':     return s.sort((a, b) => b.created_at.localeCompare(a.created_at))
    default:           return s.sort((a, b) => b.avg_rating - a.avg_rating)
  }
}

interface CatHeader { Icon: LucideIcon; gradient: string }

const CATEGORY_HEADERS: Record<string, CatHeader> = {
  massage:     { Icon: HeartHandshake, gradient: 'var(--gradient-cat-massage)'     },
  sports:      { Icon: Mountain,       gradient: 'var(--gradient-cat-sports)'      },
  cleaning:    { Icon: Sparkles,       gradient: 'var(--gradient-cat-cleaning)'    },
  beauty:      { Icon: Gem,            gradient: 'var(--gradient-cat-beauty)'      },
  cooking:     { Icon: ChefHat,        gradient: 'var(--gradient-cat-cooking)'     },
  photography: { Icon: Camera,         gradient: 'var(--gradient-cat-photography)' },
  music:       { Icon: Music2,         gradient: 'var(--gradient-cat-music)'       },
  tutoring:    { Icon: GraduationCap,  gradient: 'var(--gradient-cat-tutoring)'    },
  pets:        { Icon: PawPrint,       gradient: 'var(--gradient-cat-pets)'        },
  fitness:     { Icon: Dumbbell,       gradient: 'var(--gradient-cat-fitness)'     },
}
const DEFAULT_HEADER: CatHeader = { Icon: Wrench, gradient: 'var(--gradient-cat-default)' }

export default function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [sort, setSort] = useState<SortKey>('rating')

  const { data: category, isLoading: catLoading } = useQuery<CategoryRow | null>({
    queryKey: ['category', slug],
    queryFn: () => apiGetCategoryBySlug(slug),
  })

  const { data: rawServices = [], isLoading: svcLoading } = useQuery<ServiceWithRelations[]>({
    queryKey: ['services', 'category', slug],
    queryFn: () => apiGetServicesByCategory(slug),
    enabled: !!slug,
  })

  const services = sortServices(rawServices, sort)
  const header = CATEGORY_HEADERS[slug] ?? DEFAULT_HEADER
  const { Icon: HeaderIcon } = header
  const isLoading = catLoading || svcLoading

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet>
        <title>{category?.name ?? 'Категория'} – Vikni.me</title>
      </Helmet>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: header.gradient }}>
        {/* Subtle mesh */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-20 bg-white pointer-events-none" />

        <div className="relative px-4 pt-4 pb-10 safe-top">
          <Link to="/search" className="inline-flex items-center gap-1.5 text-white/70 text-sm hover:text-white mb-6 transition-colors font-medium">
            <ArrowLeft size={16} /> Назад
          </Link>
          <div className="flex items-center gap-5">
            {/* Premium icon badge */}
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg">
              <HeaderIcon size={30} strokeWidth={1.75} className="text-white drop-shadow" />
            </motion.div>
            <div>
              {catLoading ? (
                <div className="skeleton h-7 w-36 rounded-lg mb-1.5 bg-white/20" />
              ) : (
                <motion.h1 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  className="font-display font-black text-2xl text-white">
                  {category?.name}
                </motion.h1>
              )}
              <p className="text-white/60 text-sm font-medium mt-0.5">
                {isLoading ? '' : `${services.length} ${services.length === 1 ? 'услуга' : 'услуги'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sort bar ────────────────────────────────────── */}
      <div className="bg-white border-b border-surface-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm text-surface-500 font-medium">{services.length} резултата</p>
          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => setSort(opt.value)}
                className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                  sort === opt.value ? 'border-navy-400 bg-navy-50 text-navy-600' : 'border-surface-200 text-surface-500 hover:border-surface-300')}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services grid ───────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: header.gradient }}>
              <HeaderIcon size={34} strokeWidth={1.5} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-surface-700 text-lg mb-2">Все още няма услуги</h3>
            <p className="text-surface-400 text-sm">Бъди първият доставчик в тази категория!</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <motion.div key={service.id} variants={staggerItem}>
                <ServiceCard service={service} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="h-24 lg:hidden" />
    </AnimatedPage>
  )
}
