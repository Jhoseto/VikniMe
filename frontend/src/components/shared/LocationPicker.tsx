/**
 * LocationPicker – Geolocation API + city autocomplete.
 *
 * Mobile: Vaul bottom sheet with search + "Моята локация"
 * Desktop: inline popover (shown directly below the trigger button)
 *
 * City list is a static Bulgarian cities dataset (no external API needed).
 * In production: replace with Google Places / Mapbox Geocoding API.
 */
import { useState, useRef, useEffect } from 'react'
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
            className={clsx('w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors',
              city === selected ? 'bg-navy-50 text-navy-600' : 'text-surface-700 hover:bg-surface-50')}>
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className={city === selected ? 'text-navy-500' : 'text-surface-400'} />
              {city}
            </div>
            {city === selected && <Check size={15} className="text-navy-500" />}
          </button>
        </li>
      ))}
    </ul>
  )
}

function GeoButton({ onLocate }: { onLocate: (city: string) => void }) {
  const [loading, setLoading] = useState(false)

  async function handleGeo() {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        // Mock reverse geocoding – in production use Mapbox/Google
        const { latitude } = pos.coords
        const city = latitude > 43 ? 'Варна' : latitude > 42.3 ? 'София' : 'Пловдив'
        onLocate(city)
        setLoading(false)
      },
      () => { setLoading(false) },
      { timeout: 8000 }
    )
  }

  return (
    <button onClick={handleGeo} disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors border border-navy-200 disabled:opacity-50">
      <LocateFixed size={16} className={loading ? 'animate-pulse text-navy-400' : ''} />
      {loading ? 'Определяне на локация...' : 'Моята локация (GPS)'}
    </button>
  )
}

export function LocationPicker({ value, onChange, placeholder = 'Избери град...', className }: LocationPickerProps) {
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const anchorRef               = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  function select(city: string) {
    onChange(city)
    setOpen(false)
    setQuery('')
  }

  const trigger = (
    <button ref={anchorRef} onClick={() => setOpen(true)}
      className={clsx('flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all hover:border-navy-300',
        value ? 'border-navy-300 bg-navy-50 text-navy-600' : 'border-surface-200 text-surface-500',
        className)}>
      <MapPin size={15} className={value ? 'text-navy-500' : 'text-surface-400'} />
      <span className="truncate">{value || placeholder}</span>
      {value && (
        <button onClick={e => { e.stopPropagation(); onChange('') }}
          className="ml-auto text-surface-400 hover:text-surface-600 transition-colors shrink-0">
          <X size={13} />
        </button>
      )}
    </button>
  )

  const content = (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Търси град..."
          autoFocus
          className="w-full h-10 pl-9 pr-3 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-navy-400 transition-colors" />
      </div>

      {/* GPS */}
      <GeoButton onLocate={select} />

      {/* List */}
      <div className="max-h-60 overflow-y-auto">
        <CityList query={query} selected={value} onSelect={select} />
      </div>
    </div>
  )

  /* Desktop: popover */
  if (isDesktop) {
    return (
      <div className="relative">
        {trigger}
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute top-full left-0 z-40 mt-2 p-3 bg-white rounded-2xl w-72"
                style={{ boxShadow: 'var(--shadow-card-hover)' }}>
                {content}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* Mobile: Vaul drawer */
  return (
    <>
      {trigger}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white safe-bottom" style={{ maxHeight: '80vh' }}>
            <div className="w-10 h-1 bg-surface-200 rounded-full mx-auto mt-3 mb-4 shrink-0" />
            <div className="px-4 pb-6 overflow-y-auto">
              <h3 className="font-display font-bold text-navy-500 mb-4">Избери локация</h3>
              {content}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
