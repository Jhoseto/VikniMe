import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'
import { Star, Shield, Clock } from 'lucide-react'

const TESTIMONIALS = [
  { text: 'Намерих страхотен масажист за 20 минути. Невероятна платформа!', author: 'Мария Д., София' },
  { text: 'Като доставчик увеличих приходите си 3 пъти за 2 месеца.', author: 'Георги С., Банско' },
  { text: 'Простото резервиране и сигурното плащане са перфектни.', author: 'Елена К., Пловдив' },
]

const STATS = [
  { value: '2 400+', label: 'Специалисти' },
  { value: '18 000+', label: 'Резервации' },
  { value: '4.9★', label: 'Среден рейтинг' },
]

export function AuthLayout() {
  const { profile, isInitialized } = useAuthStore()

  if (isInitialized && profile) {
    return <Navigate to="/" replace />
  }

  const testimonial = TESTIMONIALS[Math.floor(Date.now() / 1000 / 86400) % TESTIMONIALS.length]

  return (
    <div className="min-h-screen flex">

      {/* ── Left Brand Panel (desktop only) ───────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-10 text-white overflow-hidden shrink-0"
        style={{ background: 'var(--gradient-hero)' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'var(--gradient-brand)' }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gradient-energy)' }} />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link to="/" aria-label="vikni.me – начало">
            <div className="inline-flex bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg shadow-black/20">
              <img src="/logo.png" alt="vikni.me" className="h-8 w-auto object-contain" />
            </div>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative space-y-6">
          <div>
            <h1 className="font-display font-black text-4xl xl:text-5xl leading-tight mb-4">
              Намери<br />
              <span className="text-orange-300">специалист</span><br />
              до 5 минути
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Масажисти, ски инструктори, фотографи, готвачи и още – всичко на едно място.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="font-display font-black text-2xl text-orange-300">{s.value}</p>
                <p className="text-xs text-white/60 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-orange-300 fill-orange-300" />)}
            </div>
            <p className="text-white/90 text-sm leading-relaxed italic mb-3">"{testimonial.text}"</p>
            <p className="text-white/60 text-xs font-medium">– {testimonial.author}</p>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Shield, text: 'Сигурно плащане' },
              { icon: Clock, text: 'Бързо резервиране' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/80">
                <Icon size={12} /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-3 text-white/50 text-xs">
          <Link to="/terms" className="hover:text-white/80 transition-colors">Условия</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-white/80 transition-colors">Поверителност</Link>
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden safe-top px-6 py-3 flex items-center" style={{ background: 'var(--gradient-brand)' }}>
          <Link to="/" aria-label="vikni.me – начало">
            <div className="inline-flex bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md shadow-black/15">
              <img src="/logo.png" alt="vikni.me" className="h-7 w-auto object-contain" />
            </div>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 bg-surface-50 lg:bg-white">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl lg:shadow-none p-6 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </div>

        <div className="lg:hidden safe-bottom px-6 py-4 flex items-center justify-center gap-4 bg-surface-50 text-surface-400 text-xs">
          <Link to="/terms" className="hover:text-surface-600 transition-colors">Условия</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-surface-600 transition-colors">Поверителност</Link>
        </div>
      </div>
    </div>
  )
}
