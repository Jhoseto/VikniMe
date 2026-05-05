import { Helmet } from 'react-helmet-async'
import { AlertTriangle } from 'lucide-react'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { EmptyState } from '@/components/shared/EmptyState'

export default function AdminReportsPage() {
  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Доклади – Admin – Vikni.me</title></Helmet>
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-4xl mx-auto px-5 py-5">
          <h1 className="font-display text-xl font-bold text-navy-500">Доклади</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 py-12">
        <EmptyState
          icon={AlertTriangle}
          tone="brand"
          title="Няма подадени доклади"
          description="Тук ще виждаш сигнали от потребители."
        />
      </div>
    </AnimatedPage>
  )
}
