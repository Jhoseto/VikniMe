import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, SlidersHorizontal, X, ChevronDown, Map as MapIcon, LayoutGrid,
  HeartHandshake, Mountain, Sparkles, Gem, ChefHat, Camera,
  Music2, GraduationCap, PawPrint, Dumbbell, Wrench, ArrowUpDown, WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useDebounce } from '@/hooks/useDebounce'
import { apiSearchServices, apiGetCategories, type ServiceWithRelations, type SearchFilters } from '@/api/services'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { LocationPicker } from '@/components/shared/LocationPicker'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'
import type { CategoryRow } from '@/types/database'

const ServiceMap = lazy(() => import('@/components/shared/ServiceMap').then(m => ({ default: m.ServiceMap })))

/* ── Category icon map ────────────────────────────────────── */
interface CatConfig { Icon: LucideIcon; gradient: string }
const CAT_CONFIG: Record<string, CatConfig> = {
  massage:     { Icon: HeartHandshake, gradient: 'var(--gradient-cat-massage)' },
  sports:      { Icon: Mountain,       gradient: 'var(--gradient-cat-sports)' },
  cleaning:    { Icon: Sparkles,       gradient: 'var(--gradient-cat-cleaning)' },
  beauty:      { Icon: Gem,            gradient: 'var(--gradient-cat-beauty)' },
  cooking:     { Icon: ChefHat,        gradient: 'var(--gradient-cat-cooking)' },
  photography: { Icon: Camera,         gradient: 'var(--gradient-cat-photography)' },
  music:       { Icon: Music2,         gradient: 'var(--gradient-cat-music)' },
  tutoring:    { Icon: GraduationCap,  gradient: 'var(--gradient-cat-tutoring)' },
  pets:        { Icon: PawPrint,       gradient: 'var(--gradient-cat-pets)' },
  fitness:     { Icon: Dumbbell,       gradient: 'var(--gradient-cat-fitness)' },
}
const DEFAULT_CFG: CatConfig = { Icon: Wrench, gradient: 'var(--gradient-cat-default)' }

const ME_GRADIENT = 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)'

/* ── Sort / filter constants ──────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'rating',     label: 'Най-висок рейтинг' },
  { value: 'price_asc',  label: 'Цена: ниска → висока' },
  { value: 'price_desc', label: 'Цена: висока → ниска' },
  { value: 'newest',     label: 'Най-нови' },
] as const
type SortValue = typeof SORT_OPTIONS[number]['value']

const PRICE_RANGES = [
  { label: 'Всички цени', min: undefined, max: undefined },
  { label: 'До 50 €',   min: 0,   max: 50 },
  { label: '50–150 €',  min: 50,  max: 150 },
  { label: '150–500 €', min: 150, max: 500 },
  { label: 'Над 500 €', min: 500, max: undefined },
]

/* ── Filter panel content ─────────────────────────────────── */
interface FilterContentProps {
  local:    SearchFilters
  setLocal: React.Dispatch<React.SetStateAction<SearchFilters>>
  categories: CategoryRow[]
  onReset:  () => void
  onApply?: () => void
  isSheet?: boolean
}

function FilterContent({ local, setLocal, categories, onReset, onApply, isSheet = false }: FilterContentProps) {
  const activeRange = PRICE_RANGES.findIndex(r => r.min === local.minPrice && r.max === local.maxPrice)

  return (
    <div className={clsx('space-y-6', isSheet ? 'py-4 pad-x-safe' : 'px-4 pt-4 pb-6')}>

      {/* Location — FIRST */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1B2A5E,#4A6FA8)' }}>
            <MapIcon size={11} className="text-white" />
          </div>
          <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider">Локация</h3>
        </div>
        <LocationPicker
          value={local.location ?? ''}
          onChange={loc => setLocal(l => ({ ...l, location: loc || undefined }))}
          placeholder="Избери град..."
          className="w-full"
        />
      </div>

      {/* Sort */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: ME_GRADIENT }}>
            <ArrowUpDown size={12} className="text-white" />
          </div>
          <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider">Сортиране</h3>
        </div>
        <div className={clsx('gap-2', isSheet ? 'grid grid-cols-2' : 'flex flex-col')}>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => setLocal(l => ({ ...l, sortBy: opt.value as SortValue }))}
              className={clsx(
                'px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all text-left',
                local.sortBy === opt.value
                  ? 'border-transparent text-violet-700'
                  : 'border-surface-100 bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-700'
              )}
              style={local.sortBy === opt.value ? { background: 'rgba(124,77,204,0.08)', borderColor: 'rgba(124,77,204,0.3)' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#E8581F,#F59E0B)' }}>
            <LayoutGrid size={12} className="text-white" />
          </div>
          <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider">Категория</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setLocal(l => ({ ...l, categorySlug: undefined }))}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
              !local.categorySlug ? 'border-transparent text-violet-700' : 'border-surface-100 bg-surface-50 text-surface-500 hover:bg-surface-100'
            )}
            style={!local.categorySlug ? { background: 'rgba(124,77,204,0.08)', borderColor: 'rgba(124,77,204,0.3)' } : {}}
          >
            Всички
          </button>
          {categories.map(cat => {
            const cfg = CAT_CONFIG[cat.slug] ?? DEFAULT_CFG
            const active = local.categorySlug === cat.slug
            return (
              <button key={cat.id} onClick={() => setLocal(l => ({ ...l, categorySlug: cat.slug }))}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                  active ? 'border-transparent text-violet-700' : 'border-surface-100 bg-surface-50 text-surface-500 hover:bg-surface-100'
                )}
                style={active ? { background: 'rgba(124,77,204,0.08)', borderColor: 'rgba(124,77,204,0.3)' } : {}}
              >
                <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.gradient }}>
                  <cfg.Icon size={9} strokeWidth={2} className="text-white" />
                </span>
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10B981,#2DD4BF)' }}>
            <span className="text-white text-[10px] font-black">€</span>
          </div>
          <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider">Ценови диапазон</h3>
        </div>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, i) => (
            <button key={i}
              onClick={() => setLocal(l => ({ ...l, minPrice: range.min, maxPrice: range.max }))}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                activeRange === i ? 'border-transparent text-violet-700' : 'border-surface-100 bg-surface-50 text-surface-500 hover:bg-surface-100'
              )}
              style={activeRange === i ? { background: 'rgba(124,77,204,0.08)', borderColor: 'rgba(124,77,204,0.3)' } : {}}
            >
              {range.label}
              {activeRange === i && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: ME_GRADIENT }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={clsx('flex gap-2 pt-1', isSheet ? '' : 'flex-col')}>
        <Button variant="outline" onClick={onReset} size="sm" className={isSheet ? '' : 'w-full'}>
          Изчисти всички
        </Button>
        {isSheet && onApply && (
          <Button onClick={onApply} fullWidth>Приложи филтри</Button>
        )}
      </div>
    </div>
  )
}

/* ── Mobile filter sheet ──────────────────────────────────── */
function FilterSheet({ open, onClose, categories, filters, onApply }:
  { open: boolean; onClose: () => void; categories: CategoryRow[]; filters: SearchFilters; onApply: (f: SearchFilters) => void }) {
  const [local, setLocal] = useState<SearchFilters>(filters)

  /* Sync local state from props every time the sheet is opened */
  useEffect(() => {
    if (open) setLocal(filters)
  }, [open, filters])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[88vh] flex flex-col safe-bottom"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-surface-300" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-surface-100 pad-x-safe">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ME_GRADIENT }}>
                  <SlidersHorizontal size={15} className="text-white" />
                </div>
                <h2 className="font-display font-bold text-navy-600">Филтри</h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Затвори филтрите" className="p-2 rounded-full hover:bg-surface-100 transition-colors">
                <X size={18} className="text-surface-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterContent
                local={local} setLocal={setLocal} categories={categories}
                onReset={() => { const f = { sortBy: 'rating' as SortValue }; setLocal(f); onApply(f); onClose() }}
                onApply={() => { onApply(local); onClose() }}
                isSheet
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Search hook ──────────────────────────────────────────── */
function useSearch(filters: SearchFilters) {
  return useQuery<ServiceWithRelations[]>({
    queryKey: ['search', filters],
    queryFn:  () => apiSearchServices(filters),
    staleTime: 0,
  })
}

/* ── Page ─────────────────────────────────────────────────── */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters]   = useState(false)
  const [showMap,     setShowMap]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const initialQuery = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(initialQuery)
  const debouncedQuery = useDebounce(inputValue, 350)

  const [filters, setFilters] = useState<SearchFilters>({
    query:        initialQuery,
    categorySlug: searchParams.get('category') ?? undefined,
    sortBy:       'rating',
  })

  const activeFilters = { ...filters, query: debouncedQuery }
  const { data: results = [], isPending, isFetching, isError, refetch } = useSearch(activeFilters)
  const showResultsSkeleton = isPending || (isFetching && results.length === 0)
  const { data: categories = [] } = useQuery<CategoryRow[]>({ queryKey: ['categories'], queryFn: apiGetCategories })

  const handleQueryChange = useCallback((q: string) => {
    setInputValue(q)
    setSearchParams(p => { q ? p.set('q', q) : p.delete('q'); return p }, { replace: true })
  }, [setSearchParams])

  const handleApplyFilters = useCallback((f: SearchFilters) => {
    setFilters(f)
    if (f.categorySlug) setSearchParams(p => { p.set('category', f.categorySlug!); return p }, { replace: true })
    else setSearchParams(p => { p.delete('category'); return p }, { replace: true })
  }, [setSearchParams])

  const activeCount = [
    filters.categorySlug,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.location,
  ].filter(Boolean).length

  return (
    <AnimatedPage className="min-h-screen bg-surface-50 flex flex-col">
      <Helmet>
        <title>Търсене – Vikni.me</title>
        <meta name="description" content="Търси и резервирай услуги – масаж, ски уроци, фотография, готвачи и още." />
      </Helmet>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-surface-100 safe-top"
        style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-3 flex items-center gap-2.5">

          {/* Search input */}
          <div className="flex-1 relative flex items-center group">
            <div className="absolute left-3.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all"
              style={{ background: inputValue ? ME_GRADIENT : undefined }}>
              <Search size={13} className={inputValue ? 'text-white' : 'text-surface-400'} />
            </div>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Търси услуга или специалист..."
              className="w-full h-11 pl-10 pr-10 bg-surface-50 border-2 border-surface-200 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-surface-400 focus:bg-white focus:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/35 focus-visible:ring-offset-1"
              onFocus={e => e.currentTarget.style.borderColor = '#7C4DCC'}
              onBlur={e => e.currentTarget.style.borderColor = ''}
              aria-label="Търсене"
            />
            {inputValue && (
              <button onClick={() => handleQueryChange('')}
                aria-label="Изчисти"
                className="absolute right-1 w-9 h-9 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter button (mobile) */}
          <button
            onClick={() => setShowFilters(true)}
            className={clsx(
              'lg:hidden relative flex items-center gap-1.5 h-11 px-3.5 rounded-2xl border-2 text-sm font-semibold transition-all shrink-0',
              activeCount > 0 ? 'text-white border-transparent' : 'border-surface-200 text-surface-500 hover:border-surface-300 bg-surface-50'
            )}
            style={activeCount > 0 ? { background: ME_GRADIENT } : {}}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Филтри</span>
            {activeCount > 0 && (
              <span className="bg-white/30 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Map toggle */}
          <button
            onClick={() => setShowMap(m => !m)}
            className={clsx(
              'flex items-center gap-1.5 h-11 px-3.5 rounded-2xl border-2 text-sm font-semibold transition-all shrink-0',
              showMap ? 'text-white border-transparent' : 'border-surface-200 text-surface-500 hover:border-surface-300 bg-surface-50'
            )}
            style={showMap ? { background: 'linear-gradient(135deg,#10B981,#2DD4BF)' } : {}}
          >
            {showMap ? <LayoutGrid size={15} /> : <MapIcon size={15} />}
            <span className="hidden sm:inline">{showMap ? 'Списък' : 'Карта'}</span>
          </button>
        </div>
      </div>

      {/* ── Body: filter sidebar + content ──────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Desktop filter sidebar ──────────────────────── */}
        <aside className="hidden lg:flex lg:flex-col w-64 xl:w-72 shrink-0 border-r border-surface-100 bg-white sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto">
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-surface-100">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ME_GRADIENT }}>
              <SlidersHorizontal size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-navy-600 text-sm">Филтри</span>
            {activeCount > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: ME_GRADIENT }}>{activeCount}</span>
            )}
          </div>
          <FilterContent
            local={filters}
            setLocal={(updater) => {
              const updated = typeof updater === 'function' ? updater(filters) : updater
              handleApplyFilters(updated)
            }}
            categories={categories}
            onReset={() => handleApplyFilters({ sortBy: 'rating' })}
          />
        </aside>

        {/* ── Results area ────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Category chips row */}
          <div className="bg-white border-b border-surface-100">
            <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
              {/* All */}
              <button
                onClick={() => handleApplyFilters({ ...filters, categorySlug: undefined })}
                className={clsx(
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap',
                  !filters.categorySlug ? 'text-white border-transparent' : 'border-surface-100 bg-surface-50 text-surface-500 hover:bg-surface-100'
                )}
                style={!filters.categorySlug ? { background: ME_GRADIENT } : {}}
              >
                Всички
              </button>

              {categories.map(cat => {
                const cfg = CAT_CONFIG[cat.slug] ?? DEFAULT_CFG
                const active = filters.categorySlug === cat.slug
                return (
                  <button key={cat.id}
                    onClick={() => handleApplyFilters({ ...filters, categorySlug: cat.slug })}
                    className={clsx(
                      'shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap',
                      active ? 'text-violet-700 border-transparent' : 'border-surface-100 bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                    )}
                    style={active ? { background: 'rgba(124,77,204,0.08)', borderColor: 'rgba(124,77,204,0.3)' } : {}}
                  >
                    <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: cfg.gradient }}>
                      <cfg.Icon size={10} strokeWidth={2} className="text-white" />
                    </span>
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Map — същите хоризонтални отстояния като чиповете и резултатите (px-4) */}
          <AnimatePresence>
            {showMap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '50vh' }}
                exit={{ opacity: 0, height: 0 }}
                className="shrink-0 overflow-hidden bg-surface-100"
              >
                <div className="h-full min-h-0 box-border px-4 py-3">
                  <Suspense fallback={<div className="h-full min-h-[160px] flex items-center justify-center text-surface-400 text-sm">Зарежда карта...</div>}>
                    <ServiceMap services={results} className="h-full w-full min-h-0" />
                  </Suspense>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 px-4 py-4">

            {/* Results meta row */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-surface-500 shrink-0">
                {isError ? (
                  <span className="text-surface-400">—</span>
                ) : showResultsSkeleton ? (
                  <span className="animate-pulse">Търсене…</span>
                ) : (
                  <>
                    <strong className="text-surface-800 font-bold">{results.length}</strong>
                    {' '}{results.length === 1 ? 'резултат' : 'резултата'}
                    {debouncedQuery && <> за <em className="not-italic font-semibold text-violet-600">„{debouncedQuery}“</em></>}
                  </>
                )}
              </p>

              {/* Sort – mobile */}
              <div className="relative lg:hidden">
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                <select
                  value={filters.sortBy ?? 'rating'}
                  onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as SortValue }))}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold bg-surface-50 border-2 border-surface-100 rounded-xl text-surface-600 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400/35 focus-visible:ring-offset-1"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Cards */}
            {isError ? (
              <EmptyState
                icon={WifiOff}
                tone="danger"
                title="Неуспешно зареждане"
                description="Провери връзката с интернет и опитай отново."
                size="hero"
              >
                <Button type="button" variant="primary" onClick={() => refetch()}>
                  Опитай отново
                </Button>
              </EmptyState>
            ) : showResultsSkeleton ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <EmptyState
                  className="[&_h3]:text-xl"
                  icon={Search}
                  title="Няма намерени резултати"
                  description="Опитай с различна дума или промени филтрите."
                  iconBackground={ME_GRADIENT}
                  tone="teal"
                >
                  <Button
                    variant="outline"
                    onClick={() => { handleQueryChange(''); handleApplyFilters({ sortBy: 'rating' }) }}
                  >
                    Изчисти търсенето
                  </Button>
                </EmptyState>
              </motion.div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {results.map(service => (
                  <motion.div key={service.id} variants={staggerItem}>
                    <ServiceCard service={service} className="h-full" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
      </div>
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categories}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </AnimatedPage>
  )
}
