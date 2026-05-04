import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, MessageCircle, Star, Tag, Shield } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  icon: React.ReactNode
}

function SettingToggle({ checked, onChange, label, description, icon }: ToggleProps) {
  return (
    <div className="flex items-center gap-3.5 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center shrink-0 text-surface-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-800">{label}</p>
        {description && <p className="text-xs text-surface-400 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${checked ? 'bg-navy-500' : 'bg-surface-300'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    bookingUpdates:  true,
    messages:        true,
    reviews:         true,
    promotions:      false,
    pushEnabled:     true,
    emailEnabled:    true,
  })

  function toggle(key: keyof typeof settings) {
    setSettings(s => ({ ...s, [key]: !s[key] }))
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Настройки за известия – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500">Настройки за известия</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl px-4 divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Вид известия</p>
          <SettingToggle checked={settings.bookingUpdates} onChange={() => toggle('bookingUpdates')}
            icon={<Bell size={18} />} label="Резервации" description="Потвърждения, напомняния и отмяна" />
          <SettingToggle checked={settings.messages} onChange={() => toggle('messages')}
            icon={<MessageCircle size={18} />} label="Съобщения" description="Нови чат съобщения" />
          <SettingToggle checked={settings.reviews} onChange={() => toggle('reviews')}
            icon={<Star size={18} />} label="Отзиви" description="Заявки за оценка на услуга" />
          <SettingToggle checked={settings.promotions} onChange={() => toggle('promotions')}
            icon={<Tag size={18} />} label="Промоции" description="Специални оферти и отстъпки" />
        </div>

        <div className="bg-white rounded-2xl px-4 divide-y divide-surface-100" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Канал</p>
          <SettingToggle checked={settings.pushEnabled} onChange={() => toggle('pushEnabled')}
            icon={<Bell size={18} />} label="Push известия" description="В браузъра / на телефона" />
          <SettingToggle checked={settings.emailEnabled} onChange={() => toggle('emailEnabled')}
            icon={<Shield size={18} />} label="Email известия" description="На регистрирания имейл" />
        </div>

        <Button fullWidth onClick={() => toast.success('Настройките са запазени.')} leftIcon={<Bell size={15} />}>
          Запази настройките
        </Button>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
