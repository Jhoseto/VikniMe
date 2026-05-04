import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useSwipeBack } from '@/hooks/useSwipeBack'
import { useAppBadge } from '@/hooks/useAppBadge'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { SplashScreen } from '@/components/shared/SplashScreen'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { UpdateBanner } from '@/components/pwa/UpdateBanner'
import { SupportWidget } from '@/components/shared/SupportWidget'
import { ReviewPrompt } from '@/components/shared/ReviewPrompt'

export function AppShell() {
  useAuth()
  useSwipeBack()
  useAppBadge()

  const isOnline            = useOnlineStatus()
  const { isSplashVisible } = useUiStore()
  const { isInitialized }   = useAuthStore()
  const location            = useLocation()

  if (!isInitialized) {
    return (
      <AnimatePresence>
        <SplashScreen key="splash-init" />
      </AnimatePresence>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isSplashVisible && <SplashScreen key="splash-ui" />}
      </AnimatePresence>
      <UpdateBanner />
      {!isOnline && <OfflineBanner />}
      <AnimatePresence mode="wait" initial={false}>
        <Outlet key={location.pathname} />
      </AnimatePresence>
      <InstallBanner />
      <SupportWidget />
      <ReviewPrompt />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: '12px' } }}
      />
    </>
  )
}
