import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="hidden lg:block border-t border-surface-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <span className="text-white font-black text-xs font-display">V</span>
            </div>
            <span className="font-display font-black text-lg text-navy-500">vikni<span className="text-orange-500">.me</span></span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-surface-500">
            <Link to="/terms" className="hover:text-navy-500 transition-colors">Условия</Link>
            <Link to="/privacy" className="hover:text-navy-500 transition-colors">Поверителност</Link>
            <a href="mailto:support@vikni.me" className="hover:text-navy-500 transition-colors">Контакти</a>
          </nav>
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Vikni.me. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  )
}
