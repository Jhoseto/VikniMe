/**
 * LocationPicker — Geolocation API + city autocomplete.
 *
 * Mobile  : Vaul bottom sheet
 * Desktop : Portal-rendered popover (escapes overflow contexts cleanly)
 */
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from 'vaul'
import { MapPin, LocateFixed, Search, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

const BG_CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора',
  'Плевен', 'Велико Търново', 'Благоевград', 'Банско', 'Боровец',
  'Несебър', 'Пампорово', 'Казанлък', 'Видин', 'Ямбол', 'Монтана',
  'Хасково', 'Шумен', 'Кърджали', 'Добрич', 'Враца', 'Габрово',
]

interface LocationPickerProps {
  value:    string
  onChange: (location: string) => void
  placeholder?: string
  className?: string
}

const ME_GRADIENT = 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)'

/* ─── List of cities ──────────────────────────────────────── */
function CityList({ query, selected, onSelect }: { query: string; selected: string; onSelect: (c: string) => void }) {
  const filtered = BG_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
  if (filtered.length === 0) {
    return <p className="text-sm text-surface-400 text-center py-6">Няма намерени градове</p>
  }
  return (
    <ul className="space-y-0.5">
      {filtered.map(city => (
        <li key={city}>
          <button onClick={() => onSelect(city)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              city === selected ? 'text-violet-700' : 'text-surface-700 hover:bg-surface-50'
            )}
            style={city === selected ? { background: 'rgba(124,77,204,0.08)' } : {}}
          >
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className={city === selected ? 'text-violet-500' : 'text-surface-400'} />
              {city}
            </div>
            {city === selected && <Check size={15} className="text-violet-500" />}
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ─── GPS button ──────────────────────────────────────────── */
function GeoButton({ onLocate }: { onLocate: (city: string) => void }) {
  const [loading, setLoading] = useState(false)

  async function handleGeo() {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude } = pos.coords
        const city = latitude > 43 ? 'Варна' : latitude > 42.3 ? 'София' : 'Пловдив'
        onLocate(city); setLoading(false)
      },
      () => setLoading(false),
      { timeout: 8000 },
    )
  }

  return (
    <button onClick={handleGeo} disabled={loading}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:brightness-105"
      style={{ background: ME_GRADIENT, boxShadow: '0 4px 14px -4px rgba(124,77,204,0.35)' }}
    >
      <LocateFixed size={15} className={loading ? 'animate-pulse' : ''} />
      {loading ? 'Определяне на локация...' : 'Моята локация (GPS)'}
    </button>
  )
}

/* ─── Picker ──────────────────────────────────────────────── */
export function LocationPicker({ value, onChange, placeholder = 'Избери град...', className }: LocationPickerProps) {
  const [query, setQuery]         = useState('')
  const [open, setOpen]           = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [pos, setPos]             = useState<{ top: number; left: number; width: number } | null>(null)
  const anchorRef                 = useRef<HTMLButtonElement>(null)

  /* Detect desktop viewport */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  /* Recompute popover position when opened or window scrolls/resizes */
  useLayoutEffect(() => {
    if (!open || !isDesktop) return
    const update = () => {
      const r = anchorRef.current?.getBoundingClientRect()
      if (r) setPos({ top: r.bottom + 8, left: r.left, width: Math.max(r.width, 280) })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, isDesktop])

  function select(city: string) {
    onChange(city); setOpen(false); setQuery('')
  }

  /* ─── Trigger ─────────────────────────────────────────── */
  const trigger = (
    <button
      ref={anchorRef}
      type="button"
      onClick={() => setOpen(o => !o)}
      className={clsx(
        'w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
        value
          ? 'text-violet-700 border-transparent'
          : 'border-surface-200 text-surface-500 hover:border-surface-300 bg-surface-50',
        className,
      )}
      style={value ? { background: 'rgba(124,77,204,0.08)', borderColor: 'rgba(124,77,204,0.3)' } : {}}
    >
      <MapPin size={15} className={value ? 'text-violet-500' : 'text-surface-400'} />
      <span className="truncate flex-1 text-left">{value || placeholder}</span>
      {value ? (
        <span
          role="button"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); onChange('') }}
          className="ml-1 p-0.5 rounded-full hover:bg-violet-200/40 transition-colors text-surface-400 hover:text-surface-700 shrink-0"
        >
          <X size={13} />
        </span>
      ) : null}
    </button>
  )

  /* ─── Picker body ─────────────────────────────────────── */
  const body = (
    <div className="space-y-2.5">
      {/* Search input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Търси град..."
          autoFocus
          className="w-full h-10 pl-9 pr-3 bg-surface-50 border-2 border-surface-100 rounded-xl text-sm font-medium outline-none focus:border-violet-300 transition-colors placeholder:text-surface-400"
        />
      </div>

      {/* GPS */}
      <GeoButton onLocate={select} />

      {/* Cities */}
      <div className="max-h-60 overflow-y-auto -mr-1 pr-1">
        <CityList query={query} selected={value} onSelect={select} />
      </div>
    </div>
  )

  /* ─── Desktop: Portal-rendered popover ──────────────── */
  if (isDesktop) {
    return (
      <>
        {trigger}
        {open && pos && createPortal(
          <AnimatePresence>
            {/* Backdrop (click outside to close) */}
            <motion.div
              key="loc-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="loc-popover"
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                position: 'fixed',
                top: pos.top, left: pos.left, width: pos.width,
                zIndex: 90,
                boxShadow: '0 24px 60px -8px rgba(27,42,94,0.28), 0 0 0 1px rgba(27,42,94,0.06)',
              }}
              className="bg-white rounded-2xl p-3"
            >
              {body}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
      </>
    )
  }

  /* ─── Mobile: Vaul drawer ──────────────────────────── */
  return (
    <>
      {trigger}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-[90] flex flex-col rounded-t-3xl bg-white safe-bottom"
            style={{ maxHeight: '85vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)' }}
          >
            <Drawer.Title className="sr-only">Избери локация</Drawer.Title>
            <div className="w-10 h-1 bg-surface-200 rounded-full mx-auto mt-3 mb-4 shrink-0" />
            <div className="px-5 pb-6 overflow-y-auto">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ME_GRADIENT }}>
                  <MapPin size={14} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-navy-600 text-base">Избери локация</h3>
              </div>
              {body}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
