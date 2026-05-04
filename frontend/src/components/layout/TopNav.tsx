import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

export function TopNav() {
  const { profile } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-200 safe-top" style={{ boxShadow: 'var(--shadow-top)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0" aria-label="vikni.me – начало">
          <img src="/logo.png" alt="vikni.me" className="h-9 w-auto object-contain" />
        </Link>

        <button onClick={() => navigate('/search')}
          className="flex-1 max-w-md flex items-center gap-2 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 rounded-full text-surface-400 text-sm transition-colors" aria-label="Търсене">
          <Search size={16} />
          <span>Търси услуга...</span>
        </button>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-surface-100 transition-colors"
                aria-label={`Известия${unreadCount > 0 ? ` (${unreadCount})` : ''}`}>
                <Bell size={20} className="text-surface-600" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />}
              </Link>
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-navy-100 ring-2 ring-transparent group-hover:ring-navy-200 transition-all">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name ?? 'Профил'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy-500 font-bold text-sm">
                      {profile.full_name?.[0]?.toUpperCase() ?? profile.email[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90"
              style={{ background: 'var(--gradient-brand)' }}>
              <LogIn size={16} /> Вход
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
