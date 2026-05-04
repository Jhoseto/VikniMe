import { Helmet } from 'react-helmet-async'
import { AlertTriangle } from 'lucide-react'
import { AnimatedPage } from '@/components/shared/AnimatedPage'

export default function AdminReportsPage() {
  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Доклади – Admin – Vikni.me</title></Helmet>
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-4xl mx-auto px-5 py-5">
          <h1 className="font-display text-xl font-bold text-navy-500">Доклади</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 py-16 text-center">
        <AlertTriangle size={40} className="mx-auto text-surface-200 mb-3" />
        <p className="text-surface-500 font-medium">Няма подадени доклади</p>
        <p className="text-surface-400 text-sm mt-1">Тук ще виждаш сигнали от потребители.</p>
      </div>
    </AnimatedPage>
  )
}
