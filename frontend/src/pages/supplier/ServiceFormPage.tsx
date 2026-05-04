import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, MapPin, DollarSign, CalendarDays } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { apiGetServiceById } from '@/api/services'
import { MOCK_SERVICES, MOCK_CATEGORIES } from '@/lib/mock/data'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { ImageUploadZone } from '@/components/shared/ImageUploadZone'
import { clsx } from 'clsx'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAvailabilityStore } from '@/stores/availabilityStore'

const schema = z.object({
  title:       z.string().min(5, 'Поне 5 символа').max(100),
  description: z.string().min(20, 'Поне 20 символа').max(1000),
  category_id: z.string().min(1, 'Избери категория'),
  price:       z.string(),
  price_type:  z.enum(['fixed', 'hourly', 'negotiable']),
  location:    z.string().min(2, 'Въведи локация'),
}).superRefine((data, ctx) => {
  if (data.price_type !== 'negotiable') {
    if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price'], message: 'Въведи валидна цена' })
    }
  }
})
type FormData = z.infer<typeof schema>

const PRICE_TYPES = [
  { value: 'fixed',      label: 'Фиксирана' },
  { value: 'hourly',     label: 'На час' },
  { value: 'negotiable', label: 'По договаряне' },
]

export default function ServiceFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [images, setImages] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const { config: availConfig } = useAvailabilityStore()

  // useBeforeUnload – warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const qc = useQueryClient()
  const { data: existing } = useQuery({
    queryKey: ['service', id],
    queryFn:  () => apiGetServiceById(id!),
    enabled:  isEdit,
  })

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', category_id: '',
      price: '', price_type: 'fixed', location: '',
    },
  })

  /* Hydrate form when existing service finishes loading */
  useEffect(() => {
    if (existing) {
      reset({
        title:       existing.title       ?? '',
        description: existing.description ?? '',
        category_id: existing.category_id ?? '',
        price:       String(existing.price ?? ''),
        price_type:  (existing.price_type as FormData['price_type']) ?? 'fixed',
        location:    existing.location    ?? '',
      })
    }
  }, [existing, reset])

  const priceType = watch('price_type')

  /* ── Submit ──────────────────────────────────────── */
  async function onSubmit(data: FormData & { price: string }) {
    if (!profile) return
    setIsDirty(false)
    await new Promise(r => setTimeout(r, 600))
    const category = MOCK_CATEGORIES.find(c => c.id === data.category_id)

    const priceNum = data.price_type === 'negotiable' ? 0 : Number(data.price)

    if (isEdit && existing) {
      const idx = MOCK_SERVICES.findIndex(s => s.id === existing.id)
      if (idx >= 0) {
        MOCK_SERVICES[idx] = {
          ...MOCK_SERVICES[idx],
          title:       data.title,
          description: data.description,
          category_id: data.category_id,
          price:       priceNum,
          price_type:  data.price_type,
          location:    data.location,
          images:      images.length ? images : MOCK_SERVICES[idx].images,
          updated_at:  new Date().toISOString(),
          categories:  category ?? MOCK_SERVICES[idx].categories,
        }
        qc.invalidateQueries({ queryKey: ['service', existing.id] })
        qc.invalidateQueries({ queryKey: ['services'] })
      }
      toast.success('Услугата е обновена!')
    } else {
      const newService = {
        id:            `svc-${Date.now()}`,
        supplier_id:   profile.id,
        category_id:   data.category_id,
        title:         data.title,
        description:   data.description,
        price:         priceNum,
        price_type:    data.price_type,
        location:      data.location,
        images:        images.length ? images : ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400'],
        avg_rating:    0,
        review_count:  0,
        created_at:    new Date().toISOString(),
        updated_at:    new Date().toISOString(),
        categories:    category ?? null,
        profiles:      { id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url },
      } as unknown as typeof MOCK_SERVICES[number]
      MOCK_SERVICES.push(newService)
      qc.invalidateQueries({ queryKey: ['services'] })
      toast.success('Услугата е публикувана!')
    }
    navigate('/supplier/services')
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>{isEdit ? 'Редактирай услуга' : 'Нова услуга'} – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-navy-500 flex-1">
            {isEdit ? 'Редактирай услуга' : 'Нова услуга'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

          {/* Images */}
          <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-semibold text-navy-500">Снимки <span className="text-surface-400 font-normal text-sm">(до 5)</span></h2>
            <ImageUploadZone
              initialImages={existing?.images ?? []}
              onImagesChange={urls => { setImages(urls); setIsDirty(true) }}
            />
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-semibold text-navy-500">Основна информация</h2>
            <Input {...register('title')} label="Наименование на услугата" placeholder="Релаксиращ масаж 60 мин." error={errors.title?.message} required />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-surface-700">Описание <span className="text-error">*</span></label>
              <textarea {...register('description')} rows={5}
                placeholder="Опиши подробно услугата, какво е включено, какво да очакват клиентите..."
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors placeholder:text-surface-400" />
              {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-surface-700">Категория <span className="text-error">*</span></label>
              <select {...register('category_id')}
                className="w-full h-11 px-4 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors cursor-pointer">
                <option value="">Избери категория</option>
                {MOCK_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-error">{errors.category_id.message}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-semibold text-navy-500">Ценообразуване</h2>

            <div>
              <label className="text-sm font-medium text-surface-700 mb-2 block">Тип цена</label>
              <Controller name="price_type" control={control} render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_TYPES.map(opt => (
                    <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                      className={clsx('py-2 rounded-xl text-sm font-medium border-2 transition-all',
                        field.value === opt.value ? 'border-navy-400 bg-navy-50 text-navy-600' : 'border-surface-200 text-surface-500 hover:border-surface-300')}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )} />
            </div>

            {priceType !== 'negotiable' && (
              <Input {...register('price')} type="number" label={`Цена ${priceType === 'hourly' ? '(на час)' : ''}`}
                placeholder="50" leftElement={<DollarSign size={16} />} error={errors.price?.message} required />
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-semibold text-navy-500">Локация</h2>
            <Input {...register('location')} label="Град / Район" placeholder="София" leftElement={<MapPin size={16} />} error={errors.location?.message} required />
          </div>

          {/* Availability Wizard link */}
          <div className="bg-white rounded-2xl p-5 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div>
              <h2 className="font-display font-semibold text-navy-500 text-sm">Наличност</h2>
              <p className="text-xs text-surface-400 mt-0.5">
                {availConfig.dayPattern === 'every_day' ? 'Всеки ден' : availConfig.dayPattern === 'weekdays' ? 'Работни дни' : 'Персонализиран график'}
                {' · '}
                {availConfig.timePattern === 'all_day' ? 'Целия ден' : `${availConfig.timeFrom} – ${availConfig.timeTo}`}
              </p>
            </div>
            <Link to="/supplier/services/availability"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-navy-500 hover:bg-navy-50 transition-colors border border-navy-200">
              <CalendarDays size={15} /> Настрой
            </Link>
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} leftIcon={<Upload size={16} />}>
            {isEdit ? 'Запази промените' : 'Публикувай услугата'}
          </Button>
        </form>
      </div>

      <div className="h-8" />
    </AnimatedPage>
  )
}
