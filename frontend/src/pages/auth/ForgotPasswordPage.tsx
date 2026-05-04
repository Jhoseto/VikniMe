import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { apiResetPassword } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fadeUp } from '@/lib/motion'

const schema = z.object({ email: z.string().email('Невалиден имейл') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ email }: FormData) {
    try {
      await apiResetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Грешка')
    }
  }

  if (sent) {
    return (
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-navy-500">Провери имейла си</h2>
        <p className="text-surface-500 text-sm">
          Изпратихме линк за нулиране до{' '}
          <strong className="text-surface-700">{getValues('email')}</strong>.
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 text-navy-500 text-sm font-medium hover:text-navy-700">
          <ArrowLeft size={16} /> Назад към вход
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="space-y-5">
      <div>
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-navy-500 mb-4">
          <ArrowLeft size={16} /> Назад
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy-500">Забравена парола</h1>
        <p className="text-surface-500 text-sm mt-1">Въведи имейла си и ще изпратим линк за нулиране.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input {...register('email')} label="Имейл" type="email" autoComplete="email"
          placeholder="ime@example.com" leftElement={<Mail size={16} />} error={errors.email?.message} required />
        <Button type="submit" fullWidth loading={isSubmitting} size="lg">Изпрати линк</Button>
      </form>
    </motion.div>
  )
}
