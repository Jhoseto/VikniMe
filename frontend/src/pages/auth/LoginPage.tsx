import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { apiSignIn, apiSignInWithOAuth } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { staggerContainer, staggerItem } from '@/lib/motion'

const schema = z.object({
  email:    z.string().email('Невалиден имейл'),
  password: z.string().min(1, 'Въведи парола'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const { setProfile, setInitialized } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ email, password }: FormData) {
    try {
      const profile = await apiSignIn(email, password)
      setProfile(profile)
      setInitialized(true)
      toast.success(`Добре дошъл, ${profile.full_name?.split(' ')[0] ?? ''}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Грешка при вход')
    }
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setOauthLoading(provider)
    try {
      const profile = await apiSignInWithOAuth(provider)
      setProfile(profile)
      setInitialized(true)
      toast.success('Добре дошъл!')
      navigate('/', { replace: true })
    } catch {
      toast.error('Грешка при вход с ' + provider)
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={staggerItem} className="text-center">
        <h1 className="font-display text-2xl font-bold text-navy-500">Добре дошъл!</h1>
        <p className="text-surface-500 text-sm mt-1">Влез в своя профил</p>
      </motion.div>

      {/* Demo hint */}
      <motion.div variants={staggerItem} className="bg-navy-50 rounded-xl p-3 flex gap-2 text-xs text-navy-600">
        <Info size={14} className="shrink-0 mt-0.5" />
        <div>
          <strong>Demo:</strong> demo@vikni.me · supplier@vikni.me · admin@vikni.me
          <br />Парола: <strong>demo1234</strong>
        </div>
      </motion.div>

      {/* OAuth */}
      <motion.div variants={staggerItem} className="space-y-3">
        <button
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading}
          className="w-full h-11 flex items-center justify-center gap-3 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors disabled:opacity-60"
        >
          {oauthLoading === 'google'
            ? <span className="w-4 h-4 rounded-full border-2 border-navy-400 border-t-transparent animate-spin" />
            : <GoogleIcon />}
          Продължи с Google
        </button>
        <button
          onClick={() => handleOAuth('facebook')}
          disabled={!!oauthLoading}
          className="w-full h-11 flex items-center justify-center gap-3 bg-[#1877F2] rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {oauthLoading === 'facebook'
            ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <FacebookIcon />}
          Продължи с Facebook
        </button>
      </motion.div>

      <motion.div variants={staggerItem} className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-200" />
        <span className="text-xs text-surface-400 font-medium">или с имейл</span>
        <div className="flex-1 h-px bg-surface-200" />
      </motion.div>

      <motion.form variants={staggerItem} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('email')}
          label="Имейл"
          type="email"
          autoComplete="email"
          placeholder="demo@vikni.me"
          leftElement={<Mail size={16} />}
          error={errors.email?.message}
          required
        />
        <Input
          {...register('password')}
          label="Парола"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          leftElement={<Lock size={16} />}
          rightElement={
            <button type="button" onClick={() => setShowPassword(p => !p)}
              className="text-surface-400 hover:text-surface-600 transition-colors"
              aria-label={showPassword ? 'Скрий паролата' : 'Покажи паролата'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          required
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-navy-500 hover:text-navy-700 font-medium">
            Забравена парола?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          Влез
        </Button>
      </motion.form>

      <motion.p variants={staggerItem} className="text-center text-sm text-surface-500">
        Нямаш профил?{' '}
        <Link to="/register" className="text-navy-500 font-semibold hover:text-navy-700 transition-colors">
          Регистрирай се
        </Link>
      </motion.p>
    </motion.div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}
