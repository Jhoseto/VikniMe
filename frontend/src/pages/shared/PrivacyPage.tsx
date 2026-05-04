import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { Helmet } from 'react-helmet-async'

export default function PrivacyPage() {
  return (
    <AnimatedPage className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Политика за поверителност – Vikni.me</title>
      </Helmet>
      <h1 className="font-display text-3xl font-bold text-navy-500 mb-6">Политика за поверителност</h1>
      <div className="prose prose-slate max-w-none text-surface-700">
        <p className="text-surface-500">Последна актуализация: {new Date().toLocaleDateString('bg-BG')}</p>
        <p className="mt-4">
          Vikni.me събира само необходимите лични данни за функционирането на платформата.
          Данните не се продават на трети страни.
        </p>
        <h2 className="font-display text-xl font-bold text-navy-500 mt-6 mb-3">Какви данни събираме</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Имейл адрес и парола (или OAuth токен)</li>
          <li>Профилна информация (имена, снимка, телефон)</li>
          <li>Данни за резервации и съобщения</li>
        </ul>
        <h2 className="font-display text-xl font-bold text-navy-500 mt-6 mb-3">Как използваме данните</h2>
        <p>Данните се използват единствено за предоставяне на услугите на платформата.</p>
        <h2 className="font-display text-xl font-bold text-navy-500 mt-6 mb-3">Вашите права (GDPR)</h2>
        <p>Имате право да поискате изтриване, корекция или копие на вашите данни на support@vikni.me.</p>
      </div>
    </AnimatedPage>
  )
}
