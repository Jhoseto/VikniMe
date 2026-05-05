import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Search, ArrowRight, Star, ShieldCheck, Zap, RefreshCw,
  HeartHandshake, Mountain, Sparkles, Gem, ChefHat, Camera,
  Music2, GraduationCap, PawPrint, Dumbbell, Wrench, CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { apiGetCategories, apiGetFeaturedServices, type ServiceWithRelations } from '@/api/services'
import { useAuthStore } from '@/stores/authStore'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'
import type { CategoryRow } from '@/types/database'

/* ── Category icon map ─────────────────────────────────────── */
interface CatConfig { Icon: LucideIcon; gradient: string; glow: string }

const CAT_CONFIG: Record<string, CatConfig> = {
  massage:     { Icon: HeartHandshake, gradient: 'var(--gradient-cat-massage)',     glow: 'var(--glow-violet)' },
  sports:      { Icon: Mountain,       gradient: 'var(--gradient-cat-sports)',      glow: 'var(--glow-teal)'   },
  cleaning:    { Icon: Sparkles,       gradient: 'var(--gradient-cat-cleaning)',    glow: 'var(--glow-teal)'   },
  beauty:      { Icon: Gem,            gradient: 'var(--gradient-cat-beauty)',      glow: 'var(--glow-orange)' },
  cooking:     { Icon: ChefHat,        gradient: 'var(--gradient-cat-cooking)',     glow: 'var(--glow-orange)' },
  photography: { Icon: Camera,         gradient: 'var(--gradient-cat-photography)', glow: 'var(--glow-orange)' },
  music:       { Icon: Music2,         gradient: 'var(--gradient-cat-music)',       glow: 'var(--glow-violet)' },
  tutoring:    { Icon: GraduationCap,  gradient: 'var(--gradient-cat-tutoring)',    glow: 'var(--glow-navy)'   },
  pets:        { Icon: PawPrint,       gradient: 'var(--gradient-cat-pets)',        glow: 'var(--glow-orange)' },
  fitness:     { Icon: Dumbbell,       gradient: 'var(--gradient-cat-fitness)',     glow: 'var(--glow-violet)' },
}
const DEFAULT_CFG: CatConfig = { Icon: Wrench, gradient: 'var(--gradient-cat-default)', glow: 'var(--glow-navy)' }

/* ── Category card ─────────────────────────────────────────── */
function CategoryCard({ cat }: { cat: CategoryRow }) {
  const cfg = CAT_CONFIG[cat.slug] ?? DEFAULT_CFG
  const { Icon } = cfg

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <Link
        to={`/category/${cat.slug}`}
        className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl bg-white w-full focus-visible:outline-2 focus-visible:outline-violet-500"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Icon badge */}
        <motion.div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.gradient }}
          whileHover={{ boxShadow: cfg.glow }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={19} strokeWidth={1.75} className="text-white drop-shadow-sm" />
        </motion.div>

        <span className="text-[9.5px] font-semibold text-surface-600 text-center leading-tight w-full truncate px-1">
          {cat.name}
        </span>
      </Link>
    </motion.div>
  )
}

/* ── Hero image mosaic data ────────────────────────────────── */
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500&h=380&q=88&auto=format&fit=crop',
    alt: 'Масажотерапия',  Icon: HeartHandshake, label: 'Масаж & Спа',
  },
  {
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=380&q=88&auto=format&fit=crop',
    alt: 'Готвач',  Icon: ChefHat, label: 'Домашен готвач',
  },
  {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=380&q=88&auto=format&fit=crop',
    alt: 'Фитнес треньор', Icon: Dumbbell, label: 'Личен треньор',
  },
  {
    url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=500&h=380&q=88&auto=format&fit=crop',
    alt: 'Фотограф', Icon: Camera, label: 'Фотография',
  },
]

/* ── Premium hero choreography (slow, soft easing + spring) ─ */
const HERO_EASE = [0.22, 1, 0.36, 1] as const

const heroLeft: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.18 } },
}

const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: HERO_EASE },
  },
}

const heroScaleIn: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 110, damping: 22, mass: 0.9 },
  },
}

const heroStats: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const heroMosaic: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.55 } },
}

const heroMosaicItem: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 22 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.15, ease: HERO_EASE },
  },
}

const heroCards: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.95 } },
}

const heroCardEntrance: Variants = {
  hidden: { opacity: 0, y: 30, rotateY: -18, scale: 0.93 },
  show: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 95, damping: 18, mass: 0.95 },
  },
}

/* Title — per-line mask reveal */
const heroTitle: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.28 } },
}

const heroTitleLine: Variants = {
  hidden: { y: '115%', opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.05, ease: HERO_EASE },
  },
}

/* ── Hero spotlight cards (left of image mosaic) ───────────── */
const HERO_SPOTLIGHT = [
  {
    name: 'Елена С.',
    title: 'Фитнес треньор',
    rating: 4.89,
    price: '55 €/ч',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&q=80&auto=format&fit=crop&crop=face',
  },
  {
    name: 'Иван П.',
    title: 'Личен готвач',
    rating: 4.92,
    price: '95 €/ч',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&q=80&auto=format&fit=crop&crop=face',
  },
  {
    name: 'Диана К.',
    title: 'Фотограф',
    rating: 4.94,
    price: '70 €/ч',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&q=80&auto=format&fit=crop&crop=face',
  },
] as const

function HeroSpotlightCard({
  name,
  title,
  rating,
  price,
  avatar,
  onReserve,
}: {
  name: string
  title: string
  rating: number
  price: string
  avatar: string
  onReserve: () => void
}) {
  return (
    <div
      className="rounded-2xl p-3 w-[12.75rem] max-w-full flex flex-col shrink-0"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 16px 48px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.55)',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <img
          src={avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-surface-800 leading-tight truncate">{name}</p>
          <p className="text-xs text-surface-400 truncate">{title}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={10} fill="#F59E0B" className="text-amber-400" />
          ))}
          <span className="text-xs font-bold text-surface-700 ml-1">{rating.toFixed(2)}</span>
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: '#1B2A5E' }}>
          {price}
        </span>
      </div>
      <button
        type="button"
        onClick={onReserve}
        className="mt-1.5 w-full py-1.5 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg,#7C4DCC,#2DD4BF)' }}
      >
        Резервирай
      </button>
    </div>
  )
}

/* ── How-it-works data ─────────────────────────────────────── */
const STEPS = [
  {
    Icon: Search, step: 1, title: 'Намери услуга',
    desc: 'Търси по категория, локация или ключова дума.',
    gradient: 'linear-gradient(135deg,#1B2A5E,#4A6FA8)',
    glow: 'rgba(27,42,94,0.28)',
  },
  {
    Icon: Star, step: 2, title: 'Избери доставчик',
    desc: 'Прегледай профили, рейтинги и автентични отзиви.',
    gradient: 'linear-gradient(135deg,#E8581F,#F9A325)',
    glow: 'rgba(232,88,31,0.28)',
  },
  {
    Icon: ShieldCheck, step: 3, title: 'Резервирай безопасно',
    desc: 'Плащане с гаранция – парите са защитени до завършване.',
    gradient: 'linear-gradient(135deg,#7C4DCC,#1B2A5E)',
    glow: 'rgba(124,77,204,0.28)',
  },
  {
    Icon: Zap, step: 4, title: 'Наслади се!',
    desc: 'Специалистът идва при теб. Без стрес, без хаос.',
    gradient: 'linear-gradient(135deg,#0A9E8D,#2DD4BF)',
    glow: 'rgba(10,158,141,0.28)',
  },
]

/* ── Queries ───────────────────────────────────────────────── */
function useCategories() {
  return useQuery<CategoryRow[]>({
    queryKey: ['categories'],
    queryFn: apiGetCategories,
    staleTime: 1000 * 60 * 10,
  })
}
function useFeaturedServices() {
  return useQuery<ServiceWithRelations[]>({
    queryKey: ['services', 'featured'],
    queryFn: apiGetFeaturedServices,
    staleTime: 1000 * 60 * 5,
  })
}

/* ── Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const { data: categories = [], isLoading: catLoading } = useCategories()
  const { data: services = [], isLoading: svcLoading } = useFeaturedServices()

  const { containerRef, pullY, isRefreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({
    onRefresh: async () => {
      await qc.invalidateQueries({ queryKey: ['services'] })
      await qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  return (
    <AnimatedPage>
      <Helmet>
        <title>Vikni.me – Намери специалист</title>
        <meta name="description" content="Платформа за услуги – намери музикант, DJ, масажист, фотограф, готвач и още." />
      </Helmet>

      {/* Pull-to-refresh indicator */}
      <motion.div style={{ y: pullY, opacity: pullY }} className="flex items-center justify-center py-3 text-violet-500">
        <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
      </motion.div>

      <div ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Single background for entire hero (all columns) — slow fade in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: HERO_EASE }}
            className="absolute inset-0"
            style={{ background: 'linear-gradient(140deg, #080f24 0%, #101d48 50%, #1a1155 100%)' }}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.045 }}
            transition={{ duration: 1.6, ease: HERO_EASE, delay: 0.1 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, x: [0, 28, -16, 0], y: [0, -22, 12, 0] }}
              transition={{
                opacity: { duration: 1.8, ease: HERO_EASE },
                scale: { duration: 1.8, ease: HERO_EASE },
                x: { duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1.8 },
                y: { duration: 22, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1.8 },
              }}
              className="absolute -top-40 -left-20 w-96 h-96 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(124,77,204,0.28), transparent 70%)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, x: [0, -22, 18, 0], y: [0, 18, -14, 0] }}
              transition={{
                opacity: { duration: 1.8, ease: HERO_EASE, delay: 0.15 },
                scale: { duration: 1.8, ease: HERO_EASE, delay: 0.15 },
                x: { duration: 24, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1.95 },
                y: { duration: 19, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1.95 },
              }}
              className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(232,88,31,0.18), transparent 70%)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, x: [0, 18, -22, 0], y: [0, -14, 18, 0] }}
              transition={{
                opacity: { duration: 2.0, ease: HERO_EASE, delay: 0.25 },
                scale: { duration: 2.0, ease: HERO_EASE, delay: 0.25 },
                x: { duration: 26, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 2.1 },
                y: { duration: 21, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 2.1 },
              }}
              className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.1), transparent 70%)' }}
            />
          </div>

          <div className="relative z-[1] flex flex-col lg:flex-row lg:items-stretch lg:[min-height:min(90vh,680px)]">

            {/* ── LEFT: Content panel ─────────────────────── */}
            <motion.div
              variants={heroLeft}
              initial="hidden"
              animate="show"
              className="relative flex-1 lg:min-w-0 flex flex-col justify-center px-5 pt-9 pb-12 lg:pl-14 lg:pr-10 lg:py-20 safe-top"
            >
              <div className="relative max-w-lg">
                {/* Headline — per-line mask reveal */}
                <motion.h1
                  variants={heroTitle}
                  className="font-display font-black leading-[1.08] tracking-tight mb-3"
                  style={{ fontSize: 'clamp(1.85rem, 5.5vw, 3.4rem)' }}
                >
                  <span className="block overflow-hidden pb-1">
                    <motion.span variants={heroTitleLine} className="block will-change-transform">
                      <span className="text-gray-300">ВИКНИ </span>
                      <span
                        style={{
                          background: 'linear-gradient(90deg,rgb(181,5,187) 0%,rgb(37,164,249) 45%,rgb(3,248,228) 100%)',
                          backgroundSize: '200% 100%',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                          animation: 'heroTextSheen 7s ease-in-out 1.6s infinite',
                        }}
                      >
                        Твоя човек
                      </span>
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-1">
                    <motion.span variants={heroTitleLine} className="block text-gray-300 will-change-transform">
                      за всеки повод
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-1">
                    <motion.span
                      variants={heroTitleLine}
                      className="block will-change-transform"
                      style={{
                        background: 'linear-gradient(90deg,rgb(181,5,187) 0%,rgb(37,164,249) 45%,rgb(3,248,228) 100%)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        animation: 'heroTextSheen 7s ease-in-out 1.85s infinite',
                      }}
                    >
                      по всяко време
                    </motion.span>
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={heroFadeUp}
                  className="text-white/55 text-sm lg:text-lg mb-8 leading-relaxed max-w-md"
                >
                  Музиканти, DJ's, масажисти, фотографи, готвачи, треньори и много други — резервирай онлайн, плати сигурно.
                </motion.p>

                {/* Search button + entrance halo */}
                <div className="relative mb-9">
                  <motion.div
                    aria-hidden
                    className="absolute -inset-4 rounded-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(closest-side, rgba(124,77,204,0.45), transparent 70%)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.85, 0] }}
                    transition={{ delay: 0.7, duration: 1.7, ease: 'easeInOut', times: [0, 0.45, 1] }}
                  />
                  <motion.button
                    variants={heroScaleIn}
                    whileHover={{ y: -2, transition: { duration: 0.25, ease: HERO_EASE } }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => navigate('/search')}
                    className="relative w-full flex items-center gap-3.5 bg-white rounded-2xl text-left group"
                    style={{ padding: '14px 18px', boxShadow: '0 24px 60px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)' }}
                    aria-label="Търси"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' }}>
                      <Search size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface-700 text-sm font-semibold leading-tight">Каква услуга търсиш?</p>
                      <p className="text-surface-400 text-xs leading-tight mt-0.5">Музикант, DJ, масаж, фотография, готвач...</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-300"
                      style={{ background: 'linear-gradient(135deg,#7C4DCC,#2DD4BF)' }}>
                      <ArrowRight size={15} className="text-white" />
                    </div>
                  </motion.button>
                </div>

                {/* Trust stats — staggered */}
                <motion.div
                  variants={heroStats}
                  className="grid grid-cols-3 gap-4 lg:flex lg:gap-10"
                >
                  {[
                    { value: '2 400+', label: 'специалисти' },
                    { value: '18 000+', label: 'резервации' },
                    { value: '4.9★', label: 'рейтинг' },
                  ].map(({ value, label }) => (
                    <motion.div key={label} variants={heroFadeUp}>
                      <p className="font-display font-black text-white text-lg lg:text-2xl leading-none tracking-tight">{value}</p>
                      <p className="text-white/45 text-[10px] lg:text-xs mt-1.5 font-medium">{label}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA buttons (guests) */}
                {!profile && (
                  <motion.div
                    variants={heroFadeUp}
                    className="flex items-center gap-3 mt-9 flex-wrap"
                  >
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.25, ease: HERO_EASE }}
                      onClick={() => navigate('/register')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-navy-700"
                      style={{ background: 'white', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.35)' }}
                    >
                      <CheckCircle2 size={15} />
                      Регистрирай се безплатно
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.25, ease: HERO_EASE }}
                      onClick={() => navigate('/login')}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ color: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.16)' }}
                    >
                      Вход
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* ── CENTER: Spotlight cards (3D entrance + float hover) ─ */}
            <motion.div
              variants={heroCards}
              initial="hidden"
              animate="show"
              className="hidden lg:flex lg:self-stretch flex-col justify-evenly shrink-0 w-[14rem] py-6 px-2 items-center relative"
              style={{ perspective: '1100px' }}
            >
              {HERO_SPOTLIGHT.map((spec) => (
                <motion.div
                  key={spec.name}
                  variants={heroCardEntrance}
                  whileHover={{
                    y: -6,
                    rotateX: 3,
                    rotateY: -4,
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 240, damping: 22 },
                  }}
                  className="relative z-10 will-change-transform"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <HeroSpotlightCard
                    {...spec}
                    onReserve={() => navigate('/search')}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* ── RIGHT: Full-bleed mosaic (original cell sizes) ─ */}
            <div className="hidden lg:block relative lg:w-[44%] shrink-0 overflow-hidden">

              {/* 2×2 image grid — same as before: fills entire right column */}
              <motion.div
                variants={heroMosaic}
                initial="hidden"
                animate="show"
                className="absolute inset-0 grid grid-cols-2 gap-2.5 p-5"
              >
                {HERO_IMAGES.map((img, i) => (
                  <motion.div
                    key={i}
                    variants={heroMosaicItem}
                    whileHover={{ scale: 1.018, transition: { duration: 0.45, ease: HERO_EASE } }}
                    className="relative rounded-2xl overflow-hidden will-change-transform group"
                  >
                    {/* Continuous Ken Burns drift on the image itself */}
                    <motion.img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{ filter: 'brightness(0.88) saturate(1.1)' }}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1.02, 1], x: [0, -6, 6, 0], y: [0, 4, -4, 0] }}
                      transition={{
                        duration: 18 + i * 2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'mirror',
                        delay: 1.4 + i * 0.2,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Specular shine on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
                      }}
                    />
                    <div
                      className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    >
                      <img.Icon size={10} className="text-white shrink-0" />
                      <span className="text-white text-[10px] font-semibold whitespace-nowrap">{img.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Left gradient blend with content panel */}
              <div
                className="absolute inset-y-0 left-0 w-10 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #101d48, transparent)' }}
              />

              {/* Online badge with pulsing halo rings */}
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.85, ease: HERO_EASE, delay: 1.2 }}
                className="absolute top-6 right-5 z-20"
              >
                <div className="relative">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.45)' }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.55, 1.85], opacity: [0.55, 0.18, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.6 }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.4)' }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1.7], opacity: [0.4, 0.12, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 2.4 }}
                  />
                  <div
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px -4px rgba(16,185,129,0.5)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-xs font-bold">Достъпна сега</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ── Categories ───────────────────────────────────── */}
        <section className="px-4 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-black text-navy-500">Категории</h2>
                <p className="text-surface-400 text-xs mt-0.5">Избери сфера на услугата</p>
              </div>
              <Link to="/search"
                className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors">
                Всички <ArrowRight size={13} />
              </Link>
            </div>

            {catLoading ? (
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton h-[92px] w-[78px] lg:w-auto lg:flex-1 rounded-2xl shrink-0" />
                ))}
              </div>
            ) : (
              /* Mobile: horizontal scroll. Desktop ≥lg: equal-width grid in 1 row */
              <motion.div variants={staggerContainer} initial="initial" animate="animate"
                className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 lg:grid lg:gap-2 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0"
                style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
              >
                {categories.map(cat => (
                  <motion.div key={cat.id} variants={staggerItem}
                    className="shrink-0 w-[78px] lg:w-auto">
                    <CategoryCard cat={cat} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ── Featured Services ─────────────────────────────── */}
        <section className="px-4 pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-black text-navy-500">Топ услуги</h2>
                <p className="text-surface-400 text-xs mt-0.5">Най-търсени тази седмица</p>
              </div>
              <Link to="/search"
                className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors">
                Виж всички <ArrowRight size={13} />
              </Link>
            </div>

            {svcLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((svc, i) => (
                  <motion.div key={svc.id} variants={staggerItem} custom={i}>
                    <ServiceCard service={svc} className="h-full" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────── */}
        <section className="px-4 py-14 lg:py-20 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)' }}>

          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #1B2A5E 1.5px, transparent 1.5px)', backgroundSize: '36px 36px' }} />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-12">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-violet-500 mb-3 block">Процесът</span>
              <h2 className="font-display text-2xl md:text-3xl font-black text-navy-500">Как работи</h2>
              <p className="text-surface-400 mt-2 text-sm">4 прости стъпки до твоята услуга</p>
            </div>

            <motion.div variants={staggerContainer} initial="initial" whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map(({ Icon, step, title, desc, gradient, glow }, i) => (
                <motion.div key={i} variants={staggerItem}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                  className="relative bg-white rounded-3xl p-7 overflow-hidden group cursor-default"
                  style={{ boxShadow: 'var(--shadow-card)' }}>

                  {/* Step number badge */}
                  <div className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: gradient }}>
                    {step}
                  </div>

                  {/* Icon container */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                    style={{ background: gradient }}>
                    <Icon size={24} strokeWidth={1.75} className="text-white" />
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1.5px rgba(124,77,204,0.12), 0 16px 48px -8px ${glow}` }} />

                  <h3 className="font-display font-bold text-surface-800 text-base mb-2">{title}</h3>
                  <p className="text-surface-400 text-xs leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────── */}
        {!profile && (
          <section className="px-4 py-12">
            <div className="max-w-3xl mx-auto rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
              style={{ background: 'var(--gradient-logo)' }}>
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, white 1.5px, transparent 1.5px), radial-gradient(circle at 70% 30%, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
              <div className="relative">
                <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-3">
                  Готов да предлагаш услуги?
                </h2>
                <p className="text-white/75 mb-8 text-sm md:text-base leading-relaxed">
                  Регистрирай се като доставчик и започни да получаваш клиенти днес.<br className="hidden md:block" />
                  Нулева такса за регистрация.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate('/register')}
                    style={{ background: 'white', color: 'var(--color-navy-600)', fontWeight: 700, boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)' }}>
                    Стани доставчик
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => navigate('/search')}
                    style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)' }}>
                    Разгледай услуги
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="h-6 lg:hidden" />
      </div>
    </AnimatedPage>
  )
}
