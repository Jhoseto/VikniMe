import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { apiUpdatePassword } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fadeUp } from '@/lib/motion'

const schema = z.object({
  password:        z.string().min(8, 'Поне 8 символа'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Паролите не съвпадат', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit({ password }: FormData) {
    try {
      await apiUpdatePassword(password)
      toast.success('Паролата е сменена успешно!')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Грешка')
    }
  }

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-500">Нова парола</h1>
        <p className="text-surface-500 text-sm mt-1">Въведи своята нова парола по-долу.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input {...register('password')} label="Нова парола" type={showPw ? 'text' : 'password'}
          autoComplete="new-password" placeholder="Поне 8 символа" leftElement={<Lock size={16} />}
          rightElement={<button type="button" onClick={() => setShowPw(p => !p)} className="text-surface-400 hover:text-surface-600" aria-label="Покажи/Скрий паролата">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
          error={errors.password?.message} required />
        <Input {...register('confirmPassword')} label="Потвърди паролата" type={showPw ? 'text' : 'password'}
          autoComplete="new-password" placeholder="Повтори паролата" leftElement={<Lock size={16} />}
          error={errors.confirmPassword?.message} required />
        <Button type="submit" fullWidth loading={isSubmitting} size="lg">Запази паролата</Button>
      </form>
    </motion.div>
  )
}
