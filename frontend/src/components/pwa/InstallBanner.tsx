/**
 * PWA Install Banner
 * – Android/Chrome: uses beforeinstallprompt event
 * – iOS: detects standalone mode absence + Safari, shows manual instructions
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, Download, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isInStandaloneMode() {
  return (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}

export function InstallBanner() {
  const reducedMotion = useReducedMotion()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS,        setShowIOS]        = useState(false)
  const [dismissed,      setDismissed]      = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (sessionStorage.getItem('pwa-banner-dismissed')) return

    if (isIOS()) {
      setTimeout(() => setShowIOS(true), 3000)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    setDeferredPrompt(null)
    setShowIOS(false)
    sessionStorage.setItem('pwa-banner-dismissed', '1')
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') handleDismiss()
  }

  const visible = !dismissed && (!!deferredPrompt || showIOS)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Инсталация на приложението"
          initial={reducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={
            reducedMotion
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 400, damping: 30 }
          }
          className="fixed inset-x-0 z-50 max-lg:pad-x-safe lg:inset-x-auto lg:right-6 lg:left-auto lg:w-96"
          style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3" style={{ boxShadow: 'var(--shadow-card-hover)' }}>
            {/* App icon */}
            <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white font-display font-black text-xl"
              style={{ background: 'var(--gradient-brand)' }}>
              V
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-surface-800">Инсталирай Vikni.me</p>
              {showIOS ? (
                <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                  Натисни <Share size={12} className="inline" aria-hidden /> и след това „Добави на начален екран"
                </p>
              ) : (
                <p className="text-xs text-surface-500 mt-0.5">Инсталирай на мобилното си устройство.</p>
              )}

              {!showIOS && (
                <button onClick={handleInstall}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--gradient-brand)' }}>
                  <Download size={12} aria-hidden /> Инсталирай
                </button>
              )}
            </div>

            <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-surface-100 transition-colors shrink-0 text-surface-400" aria-label="Затвори">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
