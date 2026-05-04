/**
 * Admin Support page – /admin/support
 * Shows all support threads (from SupportWidget) with status.
 * Admin can view the thread and mark as "Решен" (Resolved).
 */
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { CheckCircle, MessageCircle, Clock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { Avatar } from '@/components/ui/Avatar'
import { MOCK_PROFILES } from '@/lib/mock/data'

/* ── Mock support threads ─────────────────────────────────── */
interface SupportThread {
  id:         string
  user:       { id: string; full_name: string | null; avatar_url: string | null; email: string }
  subject:    string
  lastMsg:    string
  status:     'open' | 'resolved'
  created_at: string
  messages:   { from: 'user' | 'admin'; text: string; time: string }[]
}

const MOCK_THREADS: SupportThread[] = [
  {
    id: 'sup-1',
    user: MOCK_PROFILES[0],
    subject: 'Проблем с плащане',
    lastMsg: 'Плащането ми не премина, но парите са задържани.',
    status: 'open',
    created_at: '2025-05-04T14:00:00Z',
    messages: [
      { from: 'user',  text: 'Здравейте, имам проблем с плащане за резервация booking-1.', time: '2025-05-04T14:00:00Z' },
      { from: 'admin', text: 'Здравейте! Разглеждаме ситуацията. Ще получите отговор до 1 ч.', time: '2025-05-04T14:10:00Z' },
      { from: 'user',  text: 'Плащането ми не премина, но парите са задържани.', time: '2025-05-04T14:30:00Z' },
    ],
  },
  {
    id: 'sup-2',
    user: MOCK_PROFILES[1],
    subject: 'Как да добавя услуга?',
    lastMsg: 'Намерих го! Благодаря.',
    status: 'resolved',
    created_at: '2025-05-03T10:00:00Z',
    messages: [
      { from: 'user',  text: 'Как мога да добавя нова услуга в профила ми като доставчик?', time: '2025-05-03T10:00:00Z' },
      { from: 'admin', text: 'Отиди в Профил → Доставчик → Моите услуги → Добави нова.', time: '2025-05-03T10:05:00Z' },
      { from: 'user',  text: 'Намерих го! Благодаря.', time: '2025-05-03T10:08:00Z' },
    ],
  },
  {
    id: 'sup-3',
    user: MOCK_PROFILES[2],
    subject: 'Искам да блокирам потребител',
    lastMsg: 'Подадох сигнал от чата.',
    status: 'open',
    created_at: '2025-05-04T16:20:00Z',
    messages: [
      { from: 'user',  text: 'Получавам нежелани съобщения. Как мога да блокирам потребителя?', time: '2025-05-04T16:20:00Z' },
      { from: 'user',  text: 'Подадох сигнал от чата.', time: '2025-05-04T16:21:00Z' },
    ],
  },
]

/* ── Thread list item ─────────────────────────────────────── */
function ThreadItem({ thread, active, onClick }: { thread: SupportThread; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={clsx('w-full flex items-start gap-3 px-4 py-4 text-left transition-colors border-b border-surface-100 hover:bg-surface-50',
        active && 'bg-navy-50 hover:bg-navy-50')}>
      <Avatar src={thread.user.avatar_url} name={thread.user.full_name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-surface-800 truncate">{thread.user.full_name}</p>
          <span className="text-[10px] text-surface-400 shrink-0">
            {format(new Date(thread.created_at), 'dd MMM', { locale: bg })}
          </span>
        </div>
        <p className="text-xs font-medium text-surface-600 truncate">{thread.subject}</p>
        <p className="text-xs text-surface-400 truncate mt-0.5">{thread.lastMsg}</p>
      </div>
      <div className="shrink-0 mt-1">
        {thread.status === 'open'
          ? <Clock size={14} className="text-orange-500" />
          : <CheckCircle size={14} className="text-teal-500" />}
      </div>
    </button>
  )
}

/* ── Chat panel ───────────────────────────────────────────── */
function ThreadChat({ thread, onResolve }: { thread: SupportThread; onResolve: (id: string) => void }) {
  const [reply, setReply] = useState('')
  const [msgs, setMsgs]   = useState(thread.messages)

  function sendReply() {
    if (!reply.trim()) return
    setMsgs(prev => [...prev, { from: 'admin', text: reply.trim(), time: new Date().toISOString() }])
    setReply('')
    toast.success('Отговорът е изпратен')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Avatar src={thread.user.avatar_url} name={thread.user.full_name} size="sm" />
          <div>
            <p className="font-semibold text-sm text-surface-800">{thread.user.full_name}</p>
            <p className="text-xs text-surface-400">{thread.subject}</p>
          </div>
        </div>
        {thread.status === 'open' && (
          <button onClick={() => onResolve(thread.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors">
            <CheckCircle size={13} /> Маркирай Решен
          </button>
        )}
        {thread.status === 'resolved' && (
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200">
            ✓ Решен
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-surface-50">
        {msgs.map((msg, i) => (
          <div key={i} className={clsx('flex', msg.from === 'admin' ? 'justify-end' : 'justify-start')}>
            <div className={clsx('max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
              msg.from === 'admin'
                ? 'text-white rounded-br-sm'
                : 'bg-white text-surface-700 rounded-bl-sm shadow-sm')}
              style={msg.from === 'admin' ? { background: 'var(--gradient-brand)' } : {}}>
              <p>{msg.text}</p>
              <p className={clsx('text-[10px] mt-1', msg.from === 'admin' ? 'text-white/60 text-right' : 'text-surface-400')}>
                {format(new Date(msg.time), 'HH:mm dd MMM', { locale: bg })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      {thread.status === 'open' && (
        <div className="shrink-0 px-4 py-3 border-t border-surface-100 bg-white flex items-end gap-2">
          <textarea value={reply} onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
            placeholder="Напиши отговор..." rows={2}
            className="flex-1 resize-none py-2.5 px-3.5 rounded-2xl border border-surface-200 text-sm outline-none focus:border-navy-400 transition-colors leading-relaxed" />
          <button onClick={sendReply} disabled={!reply.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity shrink-0"
            style={{ background: 'var(--gradient-brand)' }} aria-label="Изпрати">
            <Send size={17} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────── */
export default function AdminSupportPage() {
  const [threads, setThreads] = useState<SupportThread[]>(MOCK_THREADS)
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.id ?? null)

  const selected = threads.find(t => t.id === selectedId)
  const openCount = threads.filter(t => t.status === 'open').length

  function resolveThread(id: string) {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t))
    toast.success('Тикетът е маркиран като решен')
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Поддръжка – Admin – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-navy-500">Поддръжка</h1>
            <p className="text-sm text-surface-400 mt-0.5">{threads.length} тикета · {openCount} отворени</p>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="max-w-7xl mx-auto px-5 py-5">
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card-hover)' }}>

          {/* Left: thread list */}
          <div className="w-72 xl:w-80 border-r border-surface-100 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Тикети</p>
              {openCount > 0 && <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{openCount}</span>}
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads.map(t => (
                <ThreadItem key={t.id} thread={t} active={selectedId === t.id} onClick={() => setSelectedId(t.id)} />
              ))}
            </div>
          </div>

          {/* Right: chat */}
          {selected ? (
            <ThreadChat key={selected.id} thread={selected} onResolve={resolveThread} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-surface-400">
              <div className="text-center">
                <MessageCircle size={40} className="mx-auto mb-2 text-surface-200" />
                <p className="text-sm">Избери тикет</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}
