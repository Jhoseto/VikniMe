import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function SupplierRoute() {
  const { profile, isInitialized } = useAuthStore()

  if (!isInitialized) return null

  if (profile?.role !== 'supplier' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
