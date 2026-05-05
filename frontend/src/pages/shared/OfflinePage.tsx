import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { fadeUp } from '@/lib/motion'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'

export function OfflinePage() {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface-50"
    >
      <EmptyState
        icon={WifiOff}
        tone="danger"
        title="Офлайн режим"
        description="Нямаш интернет връзка. Провери мрежата си и опитай отново."
        size="compact"
        className="py-8"
      >
        <Button
          type="button"
          variant="primary"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} aria-hidden />}
        >
          Опитай отново
        </Button>
      </EmptyState>
    </motion.div>
  )
}
