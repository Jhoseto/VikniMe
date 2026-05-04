import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle, ArrowRight, Briefcase, CreditCard, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { fadeUp, slideFromBottom } from '@/lib/motion'

const schema = z.object({
  full_name:  z.string().min(2, 'Въведи пълното си юридическо/физическо лице'),
  iban:       z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, 'Невалиден IBAN'),
  profession: z.string().min(2, 'Въведи специалност'),
  bio:        z.string().min(30, 'Поне 30 символа').max(500),
  agree:      z.literal(true, { error: 'Трябва да се съгласиш с условията' }),
})
type FormData = z.infer<typeof schema>

const STEPS = [
  { icon: <Briefcase size={24} />, title: 'Специалност',    desc: 'Какво предлагаш?' },
  { icon: <CreditCard size={24} />, title: 'Плащания',      desc: 'Банкова сметка за изплащания' },
  { icon: <Shield size={24} />,     title: 'Потвърждение',  desc: 'Преглед и изпращане' },
]

export default function EnrollPage() {
  const navigate = useNavigate()
  const { profile, setProfile } = useAuthStore()
  const [step, setStep]     = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? '', iban: '', profession: '', bio: '', agree: undefined },
  })

  async function nextStep() {
    const fields: (keyof FormData)[][] = [['profession', 'bio'], ['full_name', 'iban'], ['agree']]
    const ok = await trigger(fields[step])
    if (ok) setStep(s => s + 1)
  }

  async function onSubmit(_data: FormData) {
    await new Promise(r => setTimeout(r, 800))
    if (profile) setProfile({ ...profile, role: 'supplier' as any })
    setSubmitted(true)
    toast.success('Заявката е изпратена! Ще получиш имейл при одобрение.')
  }

  if (submitted) {
    return (
      <AnimatedPage className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-display font-black text-2xl text-navy-500 mb-3">Заявката е изпратена!</h1>
          <p className="text-surface-500 mb-6 leading-relaxed">
            Ще разгледаме заявката ти и ще ти изпратим имейл при одобрение. Обикновено отнема 1–2 работни дни.
          </p>
          <Button fullWidth onClick={() => navigate('/')}>Към началото</Button>
        </motion.div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Стани доставчик – Vikni.me</title></Helmet>

      {/* Hero */}
      <div className="px-4 py-8 text-center" style={{ background: 'var(--gradient-primary)' }}>
        <h1 className="font-display font-black text-2xl text-white mb-2">Стани доставчик</h1>
        <p className="text-white/70 text-sm">Публикувай услуги и получавай резервации</p>

        {/* Steps progress */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {STEPS.map((_s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < step ? 'bg-green-400 text-white' : i === step ? 'bg-white text-navy-600' : 'bg-white/20 text-white/50'}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 rounded ${i < step ? 'bg-green-400' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" variants={slideFromBottom} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-display font-bold text-navy-500">Твоята специалност</h2>
                  <Input {...register('profession')} label="Специалност / Умение" placeholder="Масажист, Ски учител, Готвач..." error={errors.profession?.message} required />
                  <div>
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Кратко представяне <span className="text-error">*</span></label>
                    <textarea {...register('bio')} rows={4} placeholder="Разкажи за опита и уменията си (мин. 30 символа)..."
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors" />
                    {errors.bio && <p className="text-xs text-error mt-1">{errors.bio.message}</p>}
                  </div>
                </div>
                <Button fullWidth size="lg" rightIcon={<ArrowRight size={16} />} onClick={nextStep}>Напред</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" variants={slideFromBottom} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-display font-bold text-navy-500">Банкова сметка</h2>
                  <p className="text-sm text-surface-500">IBAN-ът ти е необходим за изплащане на приходите.</p>
                  <Input {...register('full_name')} label="Титуляр на сметката" placeholder="Иван Петров" error={errors.full_name?.message} required />
                  <Input {...register('iban')} label="IBAN" placeholder="BG12XXXX00001234567890" error={errors.iban?.message} required />
                  <p className="text-xs text-surface-400 flex items-center gap-1.5">
                    <Shield size={12} className="text-green-500" /> Данните са криптирани и защитени.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-none">Назад</Button>
                  <Button fullWidth rightIcon={<ArrowRight size={16} />} onClick={nextStep}>Напред</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideFromBottom} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-display font-bold text-navy-500">Потвърди заявката</h2>
                  <div className="space-y-2 text-sm">
                    {[
                      'Ще получиш имейл потвърждение в рамките на 1-2 работни дни',
                      'Таксата на платформата е 10% от всяка сделка',
                      'Можеш да публикуваш услуги само след одобрение',
                      'Изплащанията се извършват седмично',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-surface-600">{item}</span>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-surface-100">
                    <input type="checkbox" {...register('agree')} className="mt-0.5 h-4 w-4 rounded border-surface-300 text-navy-500 focus:ring-navy-400" />
                    <span className="text-sm text-surface-600">
                      Приемам <a href="/terms" className="text-navy-500 underline">Условията за ползване</a> и{' '}
                      <a href="/privacy" className="text-navy-500 underline">Политиката за поверителност</a>
                    </span>
                  </label>
                  {errors.agree && <p className="text-xs text-error">{errors.agree.message}</p>}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-none">Назад</Button>
                  <Button type="submit" fullWidth size="lg" loading={isSubmitting} leftIcon={<CheckCircle size={16} />}>
                    Изпрати заявката
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
