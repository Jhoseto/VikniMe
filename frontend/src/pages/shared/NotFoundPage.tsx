import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, SearchX } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

export function NotFoundPage() {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <SearchX size={40} className="text-white" />
      </div>
      <h1 className="font-display text-6xl font-black text-navy-500 mb-2">404</h1>
      <h2 className="font-display text-2xl font-bold text-surface-700 mb-3">Страницата не е намерена</h2>
      <p className="text-surface-500 mb-8 max-w-xs">
        Страницата, която търсиш, не съществува или е преместена.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <Home size={16} />
        Към началото
      </Link>
    </motion.div>
  )
}
