import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { Helmet } from 'react-helmet-async'

export default function TermsPage() {
  return (
    <AnimatedPage className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Условия за ползване – Vikni.me</title>
      </Helmet>
      <h1 className="font-display text-3xl font-bold text-navy-500 mb-6">Условия за ползване</h1>
      <div className="prose prose-slate max-w-none text-surface-700">
        <p className="text-surface-500">Последна актуализация: {new Date().toLocaleDateString('bg-BG')}</p>
        <p className="mt-4">
          С използването на Vikni.me приемате настоящите условия за ползване. Платформата свързва клиенти
          и доставчици на услуги. Vikni.me не носи отговорност за качеството на предоставените услуги.
        </p>
        <h2 className="font-display text-xl font-bold text-navy-500 mt-6 mb-3">1. Регистрация</h2>
        <p>За да използвате всички функции на платформата, е необходимо да се регистрирате с валиден имейл адрес.</p>
        <h2 className="font-display text-xl font-bold text-navy-500 mt-6 mb-3">2. Забранено съдържание</h2>
        <p>Забранено е публикуването на незаконно, подвеждащо или обидно съдържание.</p>
        <h2 className="font-display text-xl font-bold text-navy-500 mt-6 mb-3">3. Ограничаване на отговорността</h2>
        <p>Vikni.me предоставя платформата "такава, каквато е" без гаранции от какъвто и да е вид.</p>
      </div>
    </AnimatedPage>
  )
}
