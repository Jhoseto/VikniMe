import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageSpinner } from '@/components/shared/PageSpinner'
import { useAuthStore } from '@/stores/authStore'

// In mock mode this page just redirects home if already authenticated
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  useEffect(() => {
    if (profile) {
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [profile, navigate])

  return <PageSpinner />
}
