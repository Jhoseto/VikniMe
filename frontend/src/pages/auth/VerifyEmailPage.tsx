import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MailCheck, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { fadeUp } from '@/lib/motion'

export default function VerifyEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string })?.email
  const [resending, setResending] = useState(false)

  async function resendEmail() {
    if (!email) return
    setResending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Имейлът е изпратен отново!')
    }
  }

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mx-auto">
        <MailCheck size={36} className="text-navy-500" />
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-navy-500">Потвърди имейла си</h1>
        <p className="text-surface-500 text-sm mt-2 leading-relaxed">
          Изпратихме потвърдителен линк до{' '}
          <strong className="text-surface-700">{email ?? 'твоя имейл'}</strong>.
          Кликни линка в писмото, за да активираш профила си.
        </p>
      </div>

      <div className="bg-surface-50 rounded-xl p-4 text-sm text-surface-500 text-left space-y-1">
        <p className="font-medium text-surface-700">Не виждаш писмото?</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Провери папката „Спам" или „Промоции"</li>
          <li>Изчакай 1–2 минути</li>
          <li>Убеди се, че имейлът е правилен</li>
        </ul>
      </div>

      {email && (
        <Button
          variant="secondary"
          onClick={resendEmail}
          loading={resending}
          leftIcon={<RefreshCw size={16} />}
          fullWidth
        >
          Изпрати отново
        </Button>
      )}

      <Link to="/login" className="block text-sm text-navy-500 font-medium hover:text-navy-700">
        ← Назад към вход
      </Link>
    </motion.div>
  )
}
