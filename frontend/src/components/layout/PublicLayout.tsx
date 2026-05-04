import { Outlet } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { BottomNavBar } from './BottomNavBar'
import { LeftSidebar } from './LeftSidebar'

export function PublicLayout() {
  const { isDesktop } = useBreakpoint()

  if (isDesktop) {
    return (
      /* Fixed-height shell: sidebar stays fixed, only main content scrolls */
      <div className="flex h-screen overflow-hidden bg-surface-50">
        <LeftSidebar />
        {/* Scroll container — sticky headers inside pages stick within here */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  )
}
