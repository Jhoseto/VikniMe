import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Heart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOCK_SERVICES } from '@/lib/mock/data'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'

const MOCK_FAVORITES = MOCK_SERVICES.slice(0, 3)

export default function FavoritesPage() {
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
          {MOCK_FAVORITES.length > 0 && (
            <span className="ml-auto text-sm text-surface-400 font-medium">{MOCK_FAVORITES.length} запазени</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {MOCK_FAVORITES.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#E8581F 0%,#F59E0B 100%)' }}>
              <Heart size={34} strokeWidth={1.75} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-surface-800 text-lg mb-2">Нямаш запазени услуги</h3>
            <p className="text-surface-400 text-sm mb-6 max-w-[240px]">Натисни ❤ на услуга, за да я запазиш тук.</p>
            <Link to="/search"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm hover:opacity-90 shadow-md"
              style={{ background: 'var(--gradient-brand)' }}>
              <Search size={15} /> Разгледай услуги
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_FAVORITES.map(svc => (
              <motion.div key={svc.id} variants={staggerItem}>
                <ServiceCard service={svc} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="h-24 lg:hidden" />
    </AnimatedPage>
  )
}
