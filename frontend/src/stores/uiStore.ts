import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  isSplashVisible: boolean
  isBottomSheetOpen: boolean
  activeBottomSheet: string | null
  sidebarCollapsed: boolean
  hideSplash: () => void
  openBottomSheet: (id: string) => void
  closeBottomSheet: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSplashVisible: true,
      isBottomSheetOpen: false,
      activeBottomSheet: null,
      sidebarCollapsed: false,
      hideSplash: () => set({ isSplashVisible: false }),
      openBottomSheet: (id) => set({ isBottomSheetOpen: true, activeBottomSheet: id }),
      closeBottomSheet: () => set({ isBottomSheetOpen: false, activeBottomSheet: null }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    {
      name: 'vikni-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
