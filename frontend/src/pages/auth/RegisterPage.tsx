import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { apiSignUp } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { staggerContainer, staggerItem } from '@/lib/motion'

const schema = z.object({
  full_name: z.string().min(2, 'Въведи поне 2 символа'),
  email:     z.string().email('Невалиден имейл'),
  password:  z.string().min(8, 'Паролата трябва да е поне 8 символа'),
  role:      z.enum(['customer', 'supplier']),
})
type FormData = z.infer<typeof schema>

const ROLES = [
  { value: 'customer' as const, label: 'Клиент',     desc: 'Търся и резервирам услуги',   Icon: User },
  { value: 'supplier' as const, label: 'Доставчик',  desc: 'Предлагам собствени услуги',  Icon: Briefcase },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  })

  const selectedRole = watch('role')

  async function onSubmit({ full_name, email, password, role }: FormData) {
    try {
      await apiSignUp({ email, password, full_name, role })
      toast.success('Провери имейла си за потвърдителен линк!')
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Грешка при регистрация')
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={staggerItem} className="text-center">
        <h1 className="font-display text-2xl font-bold text-navy-500">Създай профил</h1>
        <p className="text-surface-500 text-sm mt-1">Безплатно и бързо</p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <p className="text-sm font-medium text-surface-700 mb-2">Регистрирам се като:</p>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value, { shouldValidate: true })}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center transition-all',
                selectedRole === value
                  ? 'border-navy-400 bg-navy-50 text-navy-600'
                  : 'border-surface-200 text-surface-600 hover:border-surface-300'
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-surface-400 leading-tight">{desc}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.form variants={staggerItem} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input {...register('full_name')} label="Пълно име" type="text" autoComplete="name"
          placeholder="Иван Иванов" leftElement={<User size={16} />} error={errors.full_name?.message} required />
        <Input {...register('email')} label="Имейл" type="email" autoComplete="email"
          placeholder="ime@example.com" leftElement={<Mail size={16} />} error={errors.email?.message} required />
        <Input {...register('password')} label="Парола" type={showPassword ? 'text' : 'password'}
          autoComplete="new-password" placeholder="Поне 8 символа" leftElement={<Lock size={16} />}
          rightElement={
            <button type="button" onClick={() => setShowPassword(p => !p)}
              className="text-surface-400 hover:text-surface-600" aria-label="Покажи/Скрий паролата">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          hint="Поне 8 символа" error={errors.password?.message} required />
        <Button type="submit" fullWidth loading={isSubmitting} size="lg">Регистрирай се</Button>
      </motion.form>

      <motion.p variants={staggerItem} className="text-center text-sm text-surface-500">
        Имаш профил?{' '}
        <Link to="/login" className="text-navy-500 font-semibold hover:text-navy-700">Влез</Link>
      </motion.p>

      <motion.p variants={staggerItem} className="text-center text-xs text-surface-400">
        С регистрацията приемаш нашите{' '}
        <Link to="/terms" className="underline hover:text-surface-600">Условия</Link>{' '}и{' '}
        <Link to="/privacy" className="underline hover:text-surface-600">Поверителност</Link>.
      </motion.p>
    </motion.div>
  )
}
