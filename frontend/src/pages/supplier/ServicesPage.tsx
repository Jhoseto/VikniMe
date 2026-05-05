import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Star, MoreVertical, Edit3, Trash2, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { apiGetServicesBySupplier, type ServiceWithRelations } from '@/api/services'
import { MOCK_SERVICES } from '@/lib/mock/data'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { staggerContainer, staggerItem } from '@/lib/motion'

function ServiceRow({ service }: { service: ServiceWithRelations }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const qc = useQueryClient()

  function handleDelete() {
    setMenuOpen(false)
    const idx = MOCK_SERVICES.findIndex(s => s.id === service.id)
    if (idx !== -1) MOCK_SERVICES.splice(idx, 1)
    qc.invalidateQueries({ queryKey: ['services', 'supplier'] })
    toast.success('Услугата е изтрита.')
  }

  return (
    <motion.div variants={staggerItem}
      className="bg-white rounded-2xl overflow-hidden flex" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Thumbnail */}
      <div className="w-24 h-24 shrink-0 bg-surface-100">
        {service.images[0] ? (
          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full" style={{ background: 'var(--gradient-brand)' }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-sm text-surface-800 leading-snug line-clamp-2">{service.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-orange-400 fill-orange-400" />
              <span className="text-xs text-surface-500">{service.avg_rating.toFixed(1)} ({service.review_count})</span>
            </div>
            <span className="text-xs font-bold text-navy-500">{service.price} €</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="success" className="text-xs">Активна</Badge>
          {service.categories && <Badge variant="neutral" className="text-xs">{service.categories.name}</Badge>}
        </div>
      </div>

      {/* Actions */}
      <div className="relative flex flex-col items-center justify-center px-3 gap-2 border-l border-surface-100">
        <Link to={`/service/${service.id}`} className="p-2 rounded-full hover:bg-surface-100 transition-colors text-surface-500" aria-label="Преглед">
          <Eye size={16} />
        </Link>
        <Link to={`/supplier/services/${service.id}/edit`} className="p-2 rounded-full hover:bg-surface-100 transition-colors text-surface-500" aria-label="Редактирай">
          <Edit3 size={16} />
        </Link>
        <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-full hover:bg-surface-100 transition-colors text-surface-500 relative" aria-label="Повече">
          <MoreVertical size={16} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-full top-0 mr-2 bg-white rounded-xl shadow-lg border border-surface-100 overflow-hidden z-20 w-36">
              <button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Изтрий
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function SupplierServicesPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  const { data: services = [], isLoading } = useQuery<ServiceWithRelations[]>({
    queryKey: ['services', 'supplier', profile?.id],
    queryFn:  () => apiGetServicesBySupplier(profile!.id),
    enabled:  !!profile,
  })

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Моите услуги – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-display font-bold text-navy-500">Моите услуги</h1>
          <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => navigate('/supplier/services/new')}>
            Добави
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Plus}
            tone="brand"
            title="Нямаш добавени услуги"
            description="Добави първата си услуга и започни да получаваш резервации!"
          >
            <Button onClick={() => navigate('/supplier/services/new')} leftIcon={<Plus size={16} />}>
              Добави услуга
            </Button>
          </EmptyState>
        ) : (
          <>
            <p className="text-sm text-surface-500 mb-4">{services.length} {services.length === 1 ? 'услуга' : 'услуги'}</p>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {services.map(svc => <ServiceRow key={svc.id} service={svc} />)}
            </motion.div>
          </>
        )}
      </div>
      </AnimatedPage>
  )
}
