import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute() {
  const { profile, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) return null

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
