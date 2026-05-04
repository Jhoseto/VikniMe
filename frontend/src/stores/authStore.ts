import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileRow } from '@/types/database'

interface AuthState {
  profile:       ProfileRow | null
  isLoading:     boolean
  isInitialized: boolean
  setProfile:      (profile: ProfileRow | null) => void
  setLoading:      (loading: boolean) => void
  setInitialized:  (initialized: boolean) => void
  reset:           () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile:       null,
      isLoading:     true,
      isInitialized: false,
      setProfile:     (profile)      => set({ profile }),
      setLoading:     (isLoading)    => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      reset:          ()             => set({ profile: null, isLoading: false, isInitialized: true }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
