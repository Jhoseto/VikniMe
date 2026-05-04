import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

export function OfflinePage() {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-surface-50"
    >
      <div className="w-24 h-24 rounded-3xl bg-surface-200 flex items-center justify-center mb-6">
        <WifiOff size={40} className="text-surface-400" />
      </div>
      <h1 className="font-display text-2xl font-bold text-surface-800 mb-2">Офлайн режим</h1>
      <p className="text-surface-500 mb-8 max-w-xs">
        Нямаш интернет връзка. Провери мрежата си и опитай отново.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-navy-500 text-white font-semibold text-sm hover:bg-navy-600 transition-colors"
      >
        <RefreshCw size={16} />
        Опитай отново
      </button>
    </motion.div>
  )
}
