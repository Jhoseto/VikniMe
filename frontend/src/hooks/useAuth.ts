import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { apiGetSessionProfile } from '@/api/auth'

/**
 * Initializes auth state from the persisted mock session.
 * Call once in AppShell. Replace with real auth listener when backend is ready.
 */
export function useAuth() {
  const { setProfile, setLoading, setInitialized, isInitialized } = useAuthStore()

  useEffect(() => {
    if (isInitialized) return

    setLoading(true)
    apiGetSessionProfile()
      .then(profile => {
        setProfile(profile)
        setLoading(false)
        setInitialized(true)
      })
      .catch(() => {
        setProfile(null)
        setLoading(false)
        setInitialized(true)
      })
  }, [isInitialized, setProfile, setLoading, setInitialized])

  return useAuthStore()
}
