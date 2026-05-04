/**
 * Support Chat Widget
 * – Floating button (bottom-right, above BottomNavBar on mobile)
 * – Vaul bottom drawer on mobile / popover on desktop
 * – Mock chat with automated "support" response
 */
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Headphones } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer } from 'vaul'
import { clsx } from 'clsx'
import { useAuthStore } from '@/stores/authStore'

interface Message {
  id:        string
  from:      'user' | 'support'
  text:      string
  time:      Date
}

const GREETINGS = [
  'Здравей! Как мога да ти помогна? 👋',
  'Работното ни време е 9:00 – 21:00 ч. Ще отговорим при първа възможност.',
]

const AUTOREPLY_MAP: Record<string, string> = {
  'резервац': 'Мога да помогна с резервациите! Опиши ситуацията и ще те насоча.',
  'плащан':   'За въпроси относно плащане пиши ни тук – разглеждаме в рамките на 1 ч.',
  'отказ':    'За отказване на резервация – виж страницата на резервацията и натисни "Откажи".',
  'доставчик': 'Ако искаш да станеш доставчик, отиди в Профил → Стани доставчик.',
}

function getAutoReply(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, reply] of Object.entries(AUTOREPLY_MAP)) {
    if (lower.includes(key)) return reply
  }
  return 'Благодарим за съобщението! Колега ще се свърже с теб скоро. ⏱'
}

/* ── Chat UI ──────────────────────────────────────────────── */
function ChatContent() {
  const { profile } = useAuthStore()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm0', from: 'support', text: GREETINGS[0], time: new Date() },
    { id: 'm1', from: 'support', text: GREETINGS[1], time: new Date() },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const reply: Message = { id: `s-${Date.now()}`, from: 'support', text: getAutoReply(text), time: new Date() }
      setMessages(prev => [...prev, reply])
    }, 900)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-100" style={{ background: 'var(--gradient-brand)' }}>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Headphones size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">Поддръжка – Vikni.me</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
            <p className="text-white/70 text-xs">Онлайн</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 bg-surface-50">
        {messages.map(msg => (
          <div key={msg.id} className={clsx('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.from === 'support' && (
              <div className="w-6 h-6 rounded-full bg-navy-500 flex items-center justify-center text-white text-[9px] font-bold mr-2 mt-auto shrink-0">V</div>
            )}
            <div className={clsx('max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
              msg.from === 'user'
                ? 'text-white rounded-br-sm'
                : 'bg-white text-surface-700 rounded-bl-sm shadow-sm')}
              style={msg.from === 'user' ? { background: 'var(--gradient-brand)' } : {}}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-surface-100 bg-white flex items-end gap-2 safe-bottom">
        {profile ? (
          <>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Напиши въпрос..." rows={1}
              aria-label="Въпрос към поддръжката"
              className="flex-1 resize-none py-2.5 px-3 rounded-2xl border border-surface-200 text-sm outline-none focus:border-navy-400 transition-colors max-h-24 leading-relaxed" />
            <button onClick={send} disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity shrink-0"
              style={{ background: 'var(--gradient-brand)' }} aria-label="Изпрати">
              <Send size={17} />
            </button>
          </>
        ) : (
          <p className="text-xs text-surface-400 py-2 text-center w-full">
            <a href="/login" className="text-navy-500 font-medium hover:underline">Влез</a>, за да пишеш на поддръжката.
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Widget ───────────────────────────────────────────────── */
export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl"
            style={{
              background: 'var(--gradient-brand)',
              boxShadow: 'var(--shadow-brand-glow)',
              bottom: isDesktop ? '2rem' : 'calc(env(safe-area-inset-bottom) + 5rem)',
              right: '1.25rem',
            }}
            aria-label="Поддръжка"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile: Vaul drawer */}
      {!isDesktop && (
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
            <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl overflow-hidden bg-white" style={{ height: '75vh' }}>
              <div className="w-10 h-1 bg-surface-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
              <button onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center text-surface-500 hover:bg-surface-200 transition-colors z-10"
                aria-label="Затвори">
                <X size={16} />
              </button>
              <div className="flex-1 flex flex-col min-h-0">
                <ChatContent />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}

      {/* Desktop: popover panel */}
      {isDesktop && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed z-50 flex flex-col overflow-hidden rounded-3xl bg-white"
              style={{
                width: 340,
                height: 480,
                bottom: '2rem',
                right: '1.25rem',
                boxShadow: 'var(--shadow-card-hover)',
              }}
            >
              <button onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
                aria-label="Затвори">
                <X size={14} />
              </button>
              <ChatContent />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}
