import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import {
  User, Edit3, CalendarDays, Wallet, Bell, Settings,
  LogOut, ChevronRight, Shield, Star, Briefcase, HelpCircle, CreditCard,
  Zap, ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { apiSignOut, apiSignIn } from '@/api/auth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'

interface MenuItemProps {
  to?: string
  onClick?: () => void
  icon: React.ReactNode
  label: string
  description?: string
  badge?: string | number
  danger?: boolean
  gradient?: string
}

function MenuItem({ to, onClick, icon, label, description, badge, danger, gradient }: MenuItemProps) {
  const cls = clsx(
    'flex items-center gap-3.5 py-3.5 px-4 bg-white hover:bg-surface-50/80 transition-colors cursor-pointer',
    danger && 'hover:bg-red-50'
  )
  const inner = (
    <>
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
        style={{ background: danger ? 'linear-gradient(135deg,#EF4444 0%,#F97316 100%)' : (gradient ?? 'linear-gradient(135deg,#1B2A5E 0%,#7C4DCC 100%)') }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', danger ? 'text-error' : 'text-surface-800')}>{label}</p>
        {description && <p className="text-xs text-surface-400 mt-0.5">{description}</p>}
      </div>
      {badge !== undefined && (
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
      <ChevronRight size={16} className={danger ? 'text-error/50' : 'text-surface-300'} />
    </>
  )

  if (to) return <Link to={to} className={cls}>{inner}</Link>
  return <button onClick={onClick} className={clsx(cls, 'w-full text-left')}>{inner}</button>
}

function MenuSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
      {children}
    </div>
  )
}

const DEMO_ACCOUNTS = [
  { email: 'demo@vikni.me',     password: 'demo1234', label: 'Клиент',        color: '#7C4DCC' },
  { email: 'supplier@vikni.me', password: 'demo1234', label: 'Доставчик',     color: '#E8581F' },
  { email: 'admin@vikni.me',    password: 'demo1234', label: 'Администратор', color: '#1B2A5E' },
]

export default function ProfilePage() {
  const { profile, reset, setProfile } = useAuthStore()
  const navigate = useNavigate()

  async function handleSignOut() {
    await apiSignOut()
    reset()
    toast.success('Излязохте от профила.')
    navigate('/login', { replace: true })
  }

  async function switchDemo(email: string, password: string) {
    try {
      const p = await apiSignIn(email, password)
      setProfile(p)
      toast.success(`Превключено на: ${p.full_name}`)
      navigate('/', { replace: true })
    } catch {
      toast.error('Грешка при превключване.')
    }
  }

  if (!profile) return null

  const isSupplier = profile.role === 'supplier' || profile.role === 'admin'

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Профил – Vikni.me</title></Helmet>

      {/* ── Demo Switcher ─────────────────────────────────── */}
      <div className="bg-navy-900 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider shrink-0">Demo:</span>
          {DEMO_ACCOUNTS.map(acc => {
            const active = profile.email === acc.email
            return (
              <button key={acc.email} onClick={() => !active && switchDemo(acc.email, acc.password)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                style={{
                  background: active ? acc.color : 'rgba(255,255,255,0.08)',
                  color: active ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: active ? 'default' : 'pointer',
                }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {acc.label}
                {active && <span className="opacity-60">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Profile Header ────────────────────────────────── */}
      <div className="bg-white" style={{ boxShadow: 'var(--shadow-top)' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={profile.avatar_url} name={profile.full_name} userId={profile.id} size="xl" />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <Shield size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl text-surface-900 truncate">{profile.full_name}</h1>
              <p className="text-sm text-surface-500 truncate">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant={profile.role === 'admin' ? 'violet' : profile.role === 'supplier' ? 'navy' : 'neutral'}>
                  {profile.role === 'admin' ? 'Администратор' : profile.role === 'supplier' ? 'Доставчик' : 'Клиент'}
                </Badge>
                {profile.is_verified && <Badge variant="success">Верифициран</Badge>}
              </div>
            </div>
            <Link to="/profile/edit" className="p-2 rounded-full hover:bg-surface-100 transition-colors" aria-label="Редактирай">
              <Edit3 size={20} className="text-surface-600" />
            </Link>
          </div>

          {/* Credits */}
          <Link to="/profile/credits"
            className="mt-4 flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Wallet size={18} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">Кредити</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg text-orange-600">{profile.credits}</span>
              <span className="text-xs text-orange-500 font-medium">кр.</span>
              <ChevronRight size={14} className="text-orange-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Menu ─────────────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        <motion.div variants={staggerItem}>
          <MenuSection>
            <MenuItem to="/bookings"      icon={<CalendarDays size={18} />} label="Моите резервации" description="Предстоящи и минали"
              gradient="linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)" />
            <MenuItem to="/favorites"     icon={<Star size={18} />}         label="Запазени услуги"
              gradient="linear-gradient(135deg,#E8581F 0%,#F59E0B 100%)" />
            <MenuItem to="/notifications" icon={<Bell size={18} />}         label="Известия"
              gradient="linear-gradient(135deg,#1B2A5E 0%,#7C4DCC 100%)" />
          </MenuSection>
        </motion.div>

        {/* ── Become a Supplier CTA (customers only) ──────── */}
        {!isSupplier && (
          <motion.div variants={staggerItem}>
            <Link to="/enroll"
              className="relative flex items-center gap-4 p-5 rounded-2xl overflow-hidden group"
              style={{ background: 'linear-gradient(135deg,#1B2A5E 0%,#7C4DCC 60%,#2DD4BF 100%)' }}>
              {/* Subtle dot texture */}
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Zap size={22} className="text-white" fill="white" />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0 relative">
                <p className="font-bold text-white text-base leading-tight">Стани доставчик</p>
                <p className="text-white/65 text-xs mt-0.5 leading-snug">
                  Предлагай услуги и печели пари. Нулева такса за регистрация.
                </p>
              </div>
              {/* Arrow */}
              <div className="relative w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                <ArrowRight size={16} className="text-white" />
              </div>
            </Link>
          </motion.div>
        )}

        {isSupplier && (
          <motion.div variants={staggerItem}>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-1 mb-2">Доставчик</p>
            <MenuSection>
              <MenuItem to="/supplier/dashboard" icon={<Briefcase size={18} />}    label="Табло на доставчик"
                gradient="linear-gradient(135deg,#1B2A5E 0%,#2563EB 100%)" />
              <MenuItem to="/supplier/services"  icon={<Star size={18} />}         label="Моите услуги"
                gradient="linear-gradient(135deg,#E8581F 0%,#F59E0B 100%)" />
              <MenuItem to="/supplier/bookings"  icon={<CalendarDays size={18} />} label="Поръчки"
                gradient="linear-gradient(135deg,#10B981 0%,#2DD4BF 100%)" />
            </MenuSection>
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <MenuSection>
            <MenuItem to="/profile/edit"                  icon={<User size={18} />}       label="Лична информация"
              gradient="linear-gradient(135deg,#7C4DCC 0%,#A78BFA 100%)" />
            <MenuItem to="/profile/payments"              icon={<CreditCard size={18} />} label="Плащания и карти" description="Stripe · Сигурно"
              gradient="linear-gradient(135deg,#10B981 0%,#2DD4BF 100%)" />
            <MenuItem to="/profile/notification-settings" icon={<Settings size={18} />}   label="Настройки за известия"
              gradient="linear-gradient(135deg,#1B2A5E 0%,#4B5563 100%)" />
          </MenuSection>
        </motion.div>

        <motion.div variants={staggerItem}>
          <MenuSection>
            <MenuItem to="/terms"   icon={<HelpCircle size={18} />} label="Условия за ползване"
              gradient="linear-gradient(135deg,#64748B 0%,#94A3B8 100%)" />
            <MenuItem to="/privacy" icon={<Shield size={18} />}     label="Поверителност"
              gradient="linear-gradient(135deg,#1B2A5E 0%,#3B82F6 100%)" />
            <MenuItem onClick={handleSignOut} icon={<LogOut size={18} />} label="Изход" danger />
          </MenuSection>
        </motion.div>

        <motion.div variants={staggerItem}>
          <p className="text-center text-xs text-surface-400 py-2">
            vikni.me · v1.0.0-beta · © {new Date().getFullYear()}
          </p>
        </motion.div>
      </motion.div>
      </AnimatedPage>
  )
}
