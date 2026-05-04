/**
 * Availability Wizard – /supplier/services/:id/availability
 *
 * Step 1 – Date Pattern (which days are available)
 * Step 2 – Time Range (hours of the day + excluded slots)
 *
 * Uses React DayPicker for specific dates selection.
 * State lives in Zustand (availabilityStore) so it persists across steps.
 * On SAVE → navigates back to ServiceFormPage with the config.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ArrowRight, Check, Plus, X, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { useAvailabilityStore, type DayPattern, type TimePattern } from '@/stores/availabilityStore'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { Button } from '@/components/ui/Button'

/* ── Constants ──────────────────────────────────────────── */
const DAY_PATTERNS: { value: DayPattern; label: string; desc: string }[] = [
  { value: 'every_day',      label: 'Всеки ден',              desc: 'Достъпен 7 дни в седмицата' },
  { value: 'weekdays',       label: 'Работни дни',            desc: 'Понеделник – Петък' },
  { value: 'weekends',       label: 'Почивни дни',            desc: 'Събота и Неделя' },
  { value: 'specific_days',  label: 'Конкретни дни',          desc: 'Избери дни от седмицата' },
  { value: 'specific_dates', label: 'Конкретни дати',         desc: 'Избери от календар' },
]

const WEEK_DAYS = ['Нед', 'Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб']

/* ── Step indicator ─────────────────────────────────────── */
function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      {[1, 2].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
            step === n ? 'text-white scale-110' : step > n ? 'bg-teal-100 text-teal-600' : 'bg-surface-100 text-surface-400')}
            style={step === n ? { background: 'var(--gradient-brand)' } : {}}>
            {step > n ? <Check size={14} /> : n}
          </div>
          {n < 2 && <div className={clsx('w-12 h-0.5 rounded-full transition-colors', step > n ? 'bg-teal-400' : 'bg-surface-200')} />}
        </div>
      ))}
    </div>
  )
}

/* ── Step 1: Date Pattern ───────────────────────────────── */
function StepDate({ onNext }: { onNext: () => void }) {
  const { config, setConfig } = useAvailabilityStore()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-navy-500 mb-1">Кога си достъпен?</h2>
        <p className="text-sm text-surface-500">Избери кои дни предлагаш услугата</p>
      </div>

      {/* Day pattern options */}
      <div className="space-y-2">
        {DAY_PATTERNS.map(opt => (
          <button key={opt.value} onClick={() => setConfig({ dayPattern: opt.value })}
            className={clsx('w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all',
              config.dayPattern === opt.value
                ? 'border-navy-400 bg-navy-50'
                : 'border-surface-200 bg-white hover:border-surface-300')}>
            <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
              config.dayPattern === opt.value ? 'border-navy-500' : 'border-surface-300')}>
              {config.dayPattern === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-navy-500" />}
            </div>
            <div>
              <p className={clsx('text-sm font-semibold', config.dayPattern === opt.value ? 'text-navy-600' : 'text-surface-800')}>{opt.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Specific weekdays picker */}
      <AnimatePresence>
        {config.dayPattern === 'specific_days' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="pt-2">
              <p className="text-xs font-semibold text-surface-500 mb-2">Избери дни:</p>
              <div className="flex gap-2 flex-wrap">
                {WEEK_DAYS.map((day, i) => (
                  <button key={i}
                    onClick={() => {
                      const days = config.weekDays.includes(i)
                        ? config.weekDays.filter(d => d !== i)
                        : [...config.weekDays, i]
                      setConfig({ weekDays: days })
                    }}
                    className={clsx('w-12 h-12 rounded-xl text-xs font-bold border-2 transition-all',
                      config.weekDays.includes(i)
                        ? 'border-navy-400 bg-navy-50 text-navy-600'
                        : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300')}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Specific dates calendar */}
      <AnimatePresence>
        {config.dayPattern === 'specific_dates' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="pt-2 flex justify-center">
              <DayPicker
                mode="multiple"
                selected={config.specificDates}
                onSelect={dates => setConfig({ specificDates: dates ?? [] })}
                disabled={{ before: new Date() }}
                classNames={{
                  root:      'rdp-custom',
                  day:       'rdp-day',
                  selected:  'rdp-day_selected',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button onClick={onNext} className="w-full mt-2">
        Напред <ArrowRight size={16} className="ml-1.5" />
      </Button>
    </div>
  )
}

/* ── Step 2: Time ──────────────────────────────────────── */
function StepTime({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const { config, setConfig } = useAvailabilityStore()
  const [newFrom, setNewFrom] = useState('12:00')
  const [newTo, setNewTo]     = useState('13:00')

  function addExcluded() {
    if (newFrom >= newTo) { toast.error('Началният час трябва да е преди крайния'); return }
    setConfig({ excludedSlots: [...config.excludedSlots, { from: newFrom, to: newTo }] })
  }
  function removeExcluded(i: number) {
    setConfig({ excludedSlots: config.excludedSlots.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-lg text-navy-500 mb-1">В кои часове?</h2>
        <p className="text-sm text-surface-500">Настрой работното си време</p>
      </div>

      {/* Time pattern */}
      <div className="space-y-2">
        {([
          { value: 'all_day', label: 'Целия ден (00:00 – 23:59)', desc: 'Клиентите избират час сами' },
          { value: 'range',   label: 'От–До диапазон',            desc: 'Задай конкретни работни часове' },
        ] as { value: TimePattern; label: string; desc: string }[]).map(opt => (
          <button key={opt.value} onClick={() => setConfig({ timePattern: opt.value })}
            className={clsx('w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all',
              config.timePattern === opt.value ? 'border-navy-400 bg-navy-50' : 'border-surface-200 bg-white hover:border-surface-300')}>
            <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              config.timePattern === opt.value ? 'border-navy-500' : 'border-surface-300')}>
              {config.timePattern === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-navy-500" />}
            </div>
            <div>
              <p className={clsx('text-sm font-semibold', config.timePattern === opt.value ? 'text-navy-600' : 'text-surface-800')}>{opt.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Time range inputs */}
      <AnimatePresence>
        {config.timePattern === 'range' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1">
                <p className="text-xs font-semibold text-surface-500 mb-1.5">От</p>
                <input type="time" value={config.timeFrom} onChange={e => setConfig({ timeFrom: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl text-sm focus:border-navy-400 outline-none transition-colors font-mono" />
              </div>
              <div className="pt-5 text-surface-400 font-medium">—</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-surface-500 mb-1.5">До</p>
                <input type="time" value={config.timeTo} onChange={e => setConfig({ timeTo: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl text-sm focus:border-navy-400 outline-none transition-colors font-mono" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Excluded slots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-surface-700 flex items-center gap-1.5">
            <Clock size={14} className="text-surface-400" /> Изключени периоди
          </p>
          <span className="text-xs text-surface-400">(напр. обедна почивка)</span>
        </div>
        {config.excludedSlots.map((slot, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 p-2.5 bg-surface-50 rounded-xl">
            <span className="text-sm font-mono text-surface-700">{slot.from} – {slot.to}</span>
            <button onClick={() => removeExcluded(i)} className="ml-auto text-red-400 hover:text-red-600 transition-colors"><X size={14} /></button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input type="time" value={newFrom} onChange={e => setNewFrom(e.target.value)}
            className="flex-1 px-2.5 py-2 border border-surface-200 rounded-xl text-xs font-mono focus:border-navy-400 outline-none" />
          <span className="flex items-center text-surface-400 text-xs">—</span>
          <input type="time" value={newTo} onChange={e => setNewTo(e.target.value)}
            className="flex-1 px-2.5 py-2 border border-surface-200 rounded-xl text-xs font-mono focus:border-navy-400 outline-none" />
          <button onClick={addExcluded}
            className="px-3 py-2 rounded-xl text-white text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
            style={{ background: 'var(--gradient-brand)' }}>
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-sm text-teal-800">
        <p className="font-semibold mb-1">Обобщение:</p>
        <p>📅 {DAY_PATTERNS.find(d => d.value === config.dayPattern)?.label}</p>
        <p>⏰ {config.timePattern === 'all_day' ? 'Целия ден' : `${config.timeFrom} – ${config.timeTo}`}</p>
        {config.excludedSlots.length > 0 && (
          <p>🚫 {config.excludedSlots.length} изключени периода</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft size={16} className="mr-1.5" /> Назад
        </Button>
        <Button onClick={onSave} className="flex-1">
          <Check size={16} className="mr-1.5" /> Запази
        </Button>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────── */
export default function AvailabilityWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)

  function handleSave() {
    toast.success('Наличността е запазена успешно!')
    navigate(-1)
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Наличност – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top" style={{ boxShadow: 'var(--shadow-top)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => step === 1 ? navigate(-1) : setStep(1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 transition-colors" aria-label="Назад">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">Wizard за наличност</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <StepBar step={step} />

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepDate onNext={() => setStep(2)} />
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepTime onBack={() => setStep(1)} onSave={handleSave} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
