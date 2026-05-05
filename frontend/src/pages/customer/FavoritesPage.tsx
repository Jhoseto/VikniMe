import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Heart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOCK_SERVICES } from '@/lib/mock/data'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { useFavoritesStore } from '@/stores/favoritesStore'

export default function FavoritesPage() {
  const ids = useFavoritesStore(s => s.ids)
  const favorites = MOCK_SERVICES.filter(s => ids.includes(s.id))

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Запазени услуги – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#E8581F 0%,#F59E0B 100%)' }}>
            <Heart size={17} strokeWidth={2} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-navy-600 text-lg leading-none">Запазени услуги</h1>
          {favorites.length > 0 && (
            <span className="ml-auto text-sm text-surface-400 font-medium">
              {favorites.length} {favorites.length === 1 ? 'запазена' : 'запазени'}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {favorites.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <EmptyState
              icon={Heart}
              tone="warm"
              title="Нямаш запазени услуги"
              description={
                <span>
                  Натисни <Heart size={13} className="inline -mt-0.5 text-orange-400 fill-orange-400" aria-hidden /> на услуга, за да я запазиш тук.
                </span>
              }
            >
              <Link to="/search"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm hover:opacity-90 shadow-md"
                style={{ background: 'var(--gradient-brand)' }}>
                <Search size={15} aria-hidden /> Разгледай услуги
              </Link>
            </EmptyState>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map(svc => (
              <motion.div key={svc.id} variants={staggerItem}>
                <ServiceCard service={svc} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      </AnimatedPage>
  )
}
