import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { apiUpdateProfile } from '@/api/profiles'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slideFromRight } from '@/lib/motion'

const steps = ['Добре дошъл', 'Основна информация', 'Готово'] as const

const schema = z.object({
  full_name: z.string().min(2, 'Поне 2 символа'),
  phone:     z.string().regex(/^\+?\d{8,15}$/, 'Невалиден телефон').optional().or(z.literal('')),
  location:  z.string().max(100).optional().or(z.literal('')),
  bio:       z.string().max(300, 'Максимум 300 символа').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { profile, setProfile } = useAuthStore()

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? '', phone: '', location: '', bio: '' },
  })

  async function goNext() {
    if (step === 0) { setStep(1); return }
    const valid = await trigger(['full_name', 'phone', 'location', 'bio'])
    if (valid) await handleSubmit(onSubmit)()
  }

  async function onSubmit({ full_name, phone, location, bio }: FormData) {
    if (!profile) return
    try {
      const updated = await apiUpdateProfile(profile.id, {
        full_name, phone: phone || null, location: location || null, bio: bio || null,
      })
      setProfile(updated)
      setStep(2)
    } catch {
      toast.error('Грешка при запис. Опитай отново.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-primary)' }}>
      <div className="safe-top px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
        <p className="text-white/70 text-xs">Стъпка {Math.min(step + 1, 3)} от 3</p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <motion.div key="s0" variants={slideFromRight} initial="initial" animate="animate" exit="exit" className="p-7 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ background: 'var(--gradient-brand)' }}>
                  <span className="font-display font-black text-4xl text-white">V</span>
                </div>
                <h1 className="font-display text-2xl font-bold text-navy-500">Добре дошъл в<br />vikni.me!</h1>
                <p className="text-surface-500 text-sm leading-relaxed">Ще отнеме само минута да настроим профила ти.</p>
                <Button fullWidth size="lg" onClick={goNext} rightIcon={<ArrowRight size={16} />}>Започни</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" variants={slideFromRight} initial="initial" animate="animate" exit="exit" className="p-7 space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-navy-500">Основна информация</h2>
                  <p className="text-surface-400 text-sm mt-1">Помага на другите да те познаят</p>
                </div>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  <Input {...register('full_name')} label="Пълно име" placeholder="Иван Иванов" error={errors.full_name?.message} required />
                  <Input {...register('phone')} label="Телефон (незадължително)" type="tel" placeholder="+359 88 888 8888" leftElement={<Phone size={16} />} error={errors.phone?.message} />
                  <Input {...register('location')} label="Град (незадължително)" placeholder="София" leftElement={<MapPin size={16} />} error={errors.location?.message} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-surface-700">Кратко представяне <span className="text-surface-400 font-normal">(незадължително)</span></label>
                    <textarea {...register('bio')} rows={3} placeholder="Разкажи нещо за себе си..."
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm placeholder:text-surface-400 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 resize-none" />
                    {errors.bio && <p className="text-xs text-error">{errors.bio.message}</p>}
                  </div>
                </form>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)} leftIcon={<ArrowLeft size={16} />}>Назад</Button>
                  <Button fullWidth loading={isSubmitting} onClick={goNext} rightIcon={<ArrowRight size={16} />}>Продължи</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" variants={slideFromRight} initial="initial" animate="animate" exit="exit" className="p-7 text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle size={40} className="text-green-500" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-navy-500">Готово!</h2>
                <p className="text-surface-500 text-sm leading-relaxed">Профилът ти е настроен. Вече можеш да търсиш услуги.</p>
                <Button fullWidth size="lg" onClick={() => navigate('/', { replace: true })}>Към началото</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
