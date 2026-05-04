/**
 * PWA Update Banner – detects new service worker available and offers reload.
 * Uses virtual:pwa-register/react provided by vite-plugin-pwa.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
// @ts-expect-error – virtual module injected by vite-plugin-pwa at build time
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) setInterval(() => r.update(), 60 * 60 * 1000)
    },
  })

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] safe-top"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white text-sm"
            style={{ background: 'var(--gradient-primary)' }}>
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="shrink-0" />
              <span className="font-medium">Налична е нова версия на Vikni.me</span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => updateServiceWorker(true)}>Обнови</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
