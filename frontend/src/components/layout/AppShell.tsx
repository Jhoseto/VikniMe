import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useSwipeBack } from '@/hooks/useSwipeBack'
import { useAppBadge } from '@/hooks/useAppBadge'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useIsStandaloneApp } from '@/lib/pwa'
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
  const { isSplashVisible, hideSplash } = useUiStore()
  const { isInitialized }   = useAuthStore()
  const location            = useLocation()
  const isStandalone        = useIsStandaloneApp()

  // Outside the installed PWA we never want the splash overlay.
  useEffect(() => {
    if (!isStandalone && isSplashVisible) hideSplash()
  }, [isStandalone, isSplashVisible, hideSplash])

  if (!isInitialized && isStandalone) {
    return (
      <AnimatePresence>
        <SplashScreen key="splash-init" />
      </AnimatePresence>
    )
  }

  if (!isInitialized) return null

  return (
    <>
      <AnimatePresence>
        {isSplashVisible && isStandalone && <SplashScreen key="splash-ui" />}
      </AnimatePresence>
      <UpdateBanner />
      {!isOnline && <OfflineBanner />}
      <AnimatePresence mode="wait">
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
