import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Search, ArrowRight, Star, ShieldCheck, Zap, RefreshCw,
  HeartHandshake, Mountain, Sparkles, Gem, ChefHat, Camera,
  Music2, GraduationCap, PawPrint, Dumbbell, Wrench, CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
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
  const greeting = profile?.full_name?.split(' ')[0] ?? null

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
        <meta name="description" content="Платформа за услуги – намери масажист, фотограф, готвач и още." />
      </Helmet>

      {/* Pull-to-refresh indicator */}
      <motion.div style={{ y: pullY, opacity: pullY }} className="flex items-center justify-center py-3 text-violet-500">
        <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
      </motion.div>

      <div ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="flex flex-col lg:flex-row" style={{ minHeight: 'min(90vh, 680px)' }}>

            {/* ── LEFT: Content panel ─────────────────────── */}
            <div className="relative flex-1 lg:w-[56%] flex flex-col justify-center px-6 py-14 lg:px-14 lg:py-20 safe-top"
              style={{ background: 'linear-gradient(140deg, #080f24 0%, #101d48 50%, #1a1155 100%)' }}>

              {/* Mesh dot texture */}
              <div className="absolute inset-0 opacity-[0.045] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

              {/* Ambient glow blobs */}
              <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,77,204,0.28), transparent 70%)' }} />
              <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(232,88,31,0.18), transparent 70%)' }} />
              <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.1), transparent 70%)' }} />

              <div className="relative max-w-lg">
                {/* Live badge */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 border"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-white/65 text-xs font-semibold tracking-wide">
                    {profile && greeting ? `Здравей, ${greeting} 👋` : '1 247 специалисти онлайн сега'}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.07 } }}
                  className="font-display font-black leading-[1.08] mb-6"
                  style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}>
                  <span className="text-white">Намери </span>
                  <span style={{
                    background: 'linear-gradient(90deg, #E8581F 0%, #F9A325 45%, #2DD4BF 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>специалист</span>
                  <br />
                  <span className="text-white">за всяка нужда</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.14 } }}
                  className="text-white/50 text-base lg:text-lg mb-8 leading-relaxed">
                  Масажисти, фотографи, готвачи, треньори — резервирай онлайн, плати сигурно. Без стрес.
                </motion.p>

                {/* Search button */}
                <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center gap-3.5 bg-white rounded-2xl text-left group transition-all duration-300 mb-8"
                  style={{ padding: '14px 18px', boxShadow: '0 24px 60px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)' }}
                  aria-label="Търси">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' }}>
                    <Search size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-700 text-sm font-semibold leading-tight">Каква услуга търсиш?</p>
                    <p className="text-surface-400 text-xs leading-tight mt-0.5">Масаж, фотография, готвач...</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#7C4DCC,#2DD4BF)' }}>
                    <ArrowRight size={15} className="text-white" />
                  </div>
                </motion.button>

                {/* Trust stats */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
                  className="flex items-start gap-8 flex-wrap">
                  {[
                    { value: '2 400+', label: 'специалисти' },
                    { value: '18 000+', label: 'резервации' },
                    { value: '4.9★', label: 'среден рейтинг' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="font-display font-black text-white text-2xl leading-none">{value}</p>
                      <p className="text-white/40 text-xs mt-1 font-medium">{label}</p>
                    </div>
                  ))}
                </motion.div>

                {/* CTA buttons (guests) */}
                {!profile && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.38 } }}
                    className="flex items-center gap-3 mt-8 flex-wrap">
                    <button onClick={() => navigate('/register')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-navy-700 hover:brightness-105 transition-all"
                      style={{ background: 'white', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.35)' }}>
                      <CheckCircle2 size={15} />
                      Регистрирай се безплатно
                    </button>
                    <button onClick={() => navigate('/login')}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}>
                      Вход
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Image mosaic (desktop only) ──────── */}
            <div className="hidden lg:block relative lg:w-[44%] overflow-hidden"
              style={{ background: '#080f24' }}>

              {/* 2×2 image grid */}
              <div className="absolute inset-0 grid grid-cols-2 gap-2.5 p-5">
                {HERO_IMAGES.map((img, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.92, y: i % 2 === 0 ? -12 : 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.09, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                    className="relative rounded-2xl overflow-hidden"
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy"
                      style={{ filter: 'brightness(0.88) saturate(1.1)' }} />
                    {/* Dark gradient bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Service label chip */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                      <img.Icon size={10} className="text-white shrink-0" />
                      <span className="text-white text-[10px] font-semibold whitespace-nowrap">{img.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Left gradient blend with content panel */}
              <div className="absolute inset-y-0 left-0 w-10 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #101d48, transparent)' }} />

              {/* Floating specialist card */}
              <motion.div
                initial={{ opacity: 0, y: 24, x: 12 }} animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute bottom-10 right-5 rounded-2xl p-4 z-20 w-52"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px -8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.6)' }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&q=80&auto=format&fit=crop&crop=face"
                    alt="Специалист"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-surface-800 leading-tight truncate">Мария Д.</p>
                    <p className="text-xs text-surface-400 truncate">Масажотерапевт</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={10} fill="#F59E0B" className="text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-surface-700 ml-1">4.97</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#1B2A5E' }}>80 лв/ч</span>
                </div>
                <button className="mt-2.5 w-full py-1.5 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#7C4DCC,#2DD4BF)' }}>
                  Резервирай
                </button>
              </motion.div>

              {/* Online badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
                className="absolute top-6 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px -4px rgba(16,185,129,0.5)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-xs font-bold">Достъпна сега</span>
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
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton h-[88px] rounded-2xl" />
                ))}
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate"
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
                {categories.map(cat => (
                  <motion.div key={cat.id} variants={staggerItem}>
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
