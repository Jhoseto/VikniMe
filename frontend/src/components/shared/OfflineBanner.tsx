import { WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

export function OfflineBanner() {
  return (
    <motion.div
      initial={{ y: -48 }}
      animate={{ y: 0 }}
      exit={{ y: -48 }}
      className="fixed top-0 left-0 right-0 z-50 safe-top bg-error text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
    >
      <WifiOff size={16} />
      <span>Няма интернет връзка</span>
    </motion.div>
  )
}
