import { WifiOff } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

export function OfflineBanner() {
  const reduced = useReducedMotion()

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduced ? { opacity: 0 } : { y: -48 }}
      animate={reduced ? { opacity: 1 } : { y: 0 }}
      transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 32 }}
      className="fixed top-0 left-0 right-0 z-50 safe-top pad-x-safe bg-error text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
      style={{ boxShadow: 'var(--shadow-top)' }}
    >
      <WifiOff size={16} aria-hidden />
      <span>Няма интернет връзка</span>
    </motion.div>
  )
}
