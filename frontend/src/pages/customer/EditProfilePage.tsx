import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Phone, MapPin, Save, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { apiUpdateProfile } from '@/api/profiles'
import { useAuthStore } from '@/stores/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { AvatarCropDialog } from '@/components/shared/AvatarCropDialog'
import { fadeUp } from '@/lib/motion'

const schema = z.object({
  full_name: z.string().min(2, 'Поне 2 символа'),
  phone:     z.string().regex(/^\+?\d{8,15}$/, 'Невалиден телефон').optional().or(z.literal('')),
  location:  z.string().max(100).optional().or(z.literal('')),
  bio:       z.string().max(300, 'Максимум 300 символа').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { profile, setProfile } = useAuthStore()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone:     profile?.phone ?? '',
      location:  profile?.location ?? '',
      bio:       profile?.bio ?? '',
    },
  })

  /* True if either the form or the avatar was modified */
  const dirty = isDirty || avatarUrl !== null

  async function onSubmit({ full_name, phone, location, bio }: FormData) {
    if (!profile) return
    try {
      const updated = await apiUpdateProfile(profile.id, {
        full_name,
        phone:    phone || null,
        location: location || null,
        bio:      bio || null,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      setProfile(updated)
      toast.success('Профилът е обновен!')
      navigate('/profile')
    } catch {
      toast.error('Грешка при запис. Опитай отново.')
    }
  }

  if (!profile) return null

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Редактирай профил – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors" aria-label="Назад">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500 flex-1">Редактирай профил</h1>
          {dirty && (
            <Button size="sm" form="edit-form" type="submit" loading={isSubmitting} leftIcon={<Save size={14} />}>
              Запази
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Avatar with crop */}
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex justify-center mb-6">
          <AvatarCropDialog
            currentAvatar={avatarUrl ?? profile.avatar_url}
            name={profile.full_name}
            userId={profile.id}
            onSave={dataUrl => {
              setAvatarUrl(dataUrl)
              toast.success('Снимката е готова – ще се запише заедно с профила')
            }}
          />
        </motion.div>

        {/* Form */}
        <form id="edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-semibold text-navy-500">Основна информация</h2>
            <Input {...register('full_name')} label="Пълно име" leftElement={<User size={16} />}
              placeholder="Иван Иванов" error={errors.full_name?.message} required />
            <Input {...register('phone')} label="Телефон" type="tel" leftElement={<Phone size={16} />}
              placeholder="+359 88 888 8888" error={errors.phone?.message} />
            <Input {...register('location')} label="Град" leftElement={<MapPin size={16} />}
              placeholder="София" error={errors.location?.message} />
          </div>

          <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-semibold text-navy-500">За мен</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-surface-700">Кратко представяне</label>
              <textarea {...register('bio')} rows={4} placeholder="Разкажи нещо за себе си..."
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm placeholder:text-surface-400 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 resize-none transition-colors" />
              {errors.bio && <p className="text-xs text-error">{errors.bio.message}</p>}
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} leftIcon={<Save size={16} />}>
            Запази промените
          </Button>
        </form>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
