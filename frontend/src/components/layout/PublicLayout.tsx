import { Outlet } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useBottomNavVisible } from '@/hooks/useBottomNavVisible'
import { BottomNavBar } from './BottomNavBar'
import { LeftSidebar } from './LeftSidebar'

export function PublicLayout() {
  const { isDesktop } = useBreakpoint()
  const navVisible = useBottomNavVisible()

  if (isDesktop) {
    return (
      /* Fixed-height shell: sidebar stays fixed, only main content scrolls */
      <div className="flex h-screen overflow-hidden bg-surface-50">
        <LeftSidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    )
  }

  /* Mobile: BottomNavBar is fixed (~64px + safe-area) when visible.
     <main> only gets bottom padding when nav is visible — focused pages
     (chat detail, booking confirm, etc.) get full vertical space. */
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <main
        className="flex-1"
        style={{ paddingBottom: navVisible ? 'calc(72px + env(safe-area-inset-bottom, 0px))' : 0 }}
      >
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  )
}
