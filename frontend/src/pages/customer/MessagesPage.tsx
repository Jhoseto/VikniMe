/**
 * MessagesPage – desktop split-view for messages.
 * On desktop (lg+): left panel = thread list, right panel = chat detail.
 * On mobile: this page is just the thread list; ChatDetailPage is a separate route.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { apiGetChatList, type ChatThread } from '@/api/messages'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { clsx } from 'clsx'

/* ── Inlined desktop chat detail panel ─────────────────────── */
import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGetMessages, apiSendMessage, type ChatMessage } from '@/api/messages'
import { apiGetProfile } from '@/api/profiles'
import type { ProfileRow } from '@/types/database'

function DesktopChatPanel({ otherUserId }: { otherUserId: string }) {
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: other } = useQuery<ProfileRow | null>({
    queryKey: ['profile', otherUserId],
    queryFn:  () => apiGetProfile(otherUserId),
    enabled:  !!otherUserId,
  })

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['messages', profile?.id, otherUserId],
    queryFn:  () => apiGetMessages(profile!.id, otherUserId),
    enabled:  !!profile && !!otherUserId,
    refetchInterval: 5_000,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useMutation({
    mutationFn: (body: string) => apiSendMessage(profile!.id, otherUserId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] })
      qc.invalidateQueries({ queryKey: ['chat-list'] })
      setInput('')
    },
    onError: () => toast.error('Съобщението не беше изпратено.'),
  })

  const handleSend = () => {
    if (input.trim()) send.mutate(input.trim())
  }

  if (!otherUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' }}>
          <MessageCircle size={28} strokeWidth={1.75} className="text-white" />
        </div>
        <p className="font-semibold text-surface-700 text-base">Избери разговор</p>
        <p className="text-surface-400 text-sm max-w-xs">Започни нов чат след резервация на услуга.</p>
        <Link to="/search"
          className="mt-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow-md hover:opacity-90"
          style={{ background: 'var(--gradient-brand)' }}>
          Намери услуга
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      {other && (
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-100 bg-white shrink-0">
          <Avatar src={other.avatar_url} name={other.full_name} size="sm" />
          <p className="font-semibold text-surface-800 text-sm">{other.full_name}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-surface-50">
        {messages.map(msg => {
          const mine = msg.sender_id === profile?.id
          return (
            <div key={msg.id} className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={clsx('max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                mine ? 'text-white rounded-br-sm' : 'bg-white text-surface-700 rounded-bl-sm')}
                style={mine ? { background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-brand-glow)' } : { boxShadow: 'var(--shadow-card)' }}>
                {msg.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-surface-100 bg-white flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Напиши съобщение..."
          rows={1}
          aria-label="Съобщение"
          className="flex-1 resize-none py-2.5 px-3.5 rounded-2xl border border-surface-200 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors max-h-28 leading-relaxed"
        />
        <button onClick={handleSend} disabled={!input.trim() || send.isPending}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity shrink-0"
          style={{ background: 'var(--gradient-brand)' }} aria-label="Изпрати">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

/* ── Thread list item ────────────────────────────────────────── */
function ThreadItem({ thread, active, onSelect }: { thread: ChatThread; active: boolean; onSelect: () => void }) {
  const { profile } = useAuthStore()

  return (
    <button onClick={onSelect}
      className={clsx('w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-50 transition-colors text-left',
        active && 'bg-navy-50 hover:bg-navy-50')}
    >
      <div className="relative shrink-0">
        <Avatar src={thread.otherUser.avatar_url} name={thread.otherUser.full_name} size="sm" />
        {thread.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">{thread.unreadCount}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx('text-xs font-semibold truncate', thread.unreadCount > 0 ? 'text-navy-600' : 'text-surface-800')}>
            {thread.otherUser.full_name}
          </p>
          <span className="text-[10px] text-surface-400 shrink-0">
            {format(new Date(thread.lastMessage.created_at), 'dd MMM', { locale: bg })}
          </span>
        </div>
        <p className={clsx('text-[11px] mt-0.5 truncate', thread.unreadCount > 0 ? 'text-surface-700 font-medium' : 'text-surface-400')}>
          {thread.lastMessage.sender_id === profile?.id ? 'Ти: ' : ''}
          {thread.lastMessage.body}
        </p>
      </div>
    </button>
  )
}

/* ── Page ───────────────────────────────────────────────────── */
export default function MessagesPage() {
  const { profile } = useAuthStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: threads = [], isLoading } = useQuery<ChatThread[]>({
    queryKey: ['chats', profile?.id],
    queryFn:  () => apiGetChatList(profile!.id),
    enabled:  !!profile,
    refetchInterval: 10_000,
  })

  const totalUnread = threads.reduce((s, t) => s + t.unreadCount, 0)

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Съобщения – Vikni.me</title></Helmet>

      {/* ── Mobile header ─────────────────────────────────────── */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-surface-100 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' }}>
            <MessageCircle size={17} strokeWidth={2} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-navy-600 text-lg leading-none">Съобщения</h1>
          {totalUnread > 0 && (
            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </div>
      </div>

      {/* ── Mobile thread list ─────────────────────────────────── */}
      <div className="lg:hidden max-w-2xl mx-auto px-4 py-4">
        <MobileThreadList threads={threads} isLoading={isLoading} />
      </div>

      {/* ── Desktop split view ─────────────────────────────────── */}
      <div className="hidden lg:flex h-[calc(100vh-64px)] bg-white rounded-2xl overflow-hidden max-w-5xl mx-auto mt-6" style={{ boxShadow: 'var(--shadow-card-hover)' }}>
        {/* Left panel */}
        <div className="w-72 xl:w-80 border-r border-surface-100 flex flex-col">
          <div className="px-4 py-4 border-b border-surface-100">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-navy-500 text-sm">Съобщения</h2>
              {totalUnread > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <Skeleton className="w-9 h-9 shrink-0" rounded="full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2.5 w-3/4" />
                  </div>
                </div>
              ))
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <MessageCircle size={28} className="text-surface-300 mb-2" />
                <p className="text-xs text-surface-400">Няма съобщения</p>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                {threads.map(t => (
                  <motion.div key={t.otherUser.id} variants={staggerItem}>
                    <ThreadItem thread={t} active={selectedId === t.otherUser.id} onSelect={() => setSelectedId(t.otherUser.id)} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <DesktopChatPanel otherUserId={selectedId ?? ''} />
      </div>
      </AnimatedPage>
  )
}

/* ── Mobile thread list ──────────────────────────────────────── */
function MobileThreadList({ threads, isLoading }: { threads: ChatThread[]; isLoading: boolean }) {
  const { profile } = useAuthStore()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 bg-white rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <Skeleton className="w-12 h-12 shrink-0" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)' }}>
          <MessageCircle size={34} strokeWidth={1.75} className="text-white" />
        </div>
        <h3 className="font-display font-bold text-surface-800 text-lg mb-2">Няма съобщения</h3>
        <p className="text-surface-400 text-sm max-w-[240px]">Резервирай услуга и пиши на доставчика директно.</p>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
      {threads.map(t => (
        <motion.div key={t.otherUser.id} variants={staggerItem}>
          <Link to={`/chat/${t.otherUser.id}`}
            className={clsx('flex items-center gap-3.5 bg-white rounded-2xl p-4 hover:shadow-md transition-all',
              t.unreadCount > 0 && 'ring-1 ring-navy-200')}
            style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="relative shrink-0">
              <Avatar src={t.otherUser.avatar_url} name={t.otherUser.full_name} size="md" />
              {t.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded-full">{t.unreadCount}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={clsx('text-sm font-semibold truncate', t.unreadCount > 0 ? 'text-navy-600' : 'text-surface-800')}>
                  {t.otherUser.full_name}
                </p>
                <span className="text-xs text-surface-400 shrink-0">
                  {format(new Date(t.lastMessage.created_at), 'dd MMM', { locale: bg })}
                </span>
              </div>
              <p className={clsx('text-xs mt-0.5 truncate', t.unreadCount > 0 ? 'text-surface-700 font-medium' : 'text-surface-400')}>
                {t.lastMessage.sender_id === profile?.id ? 'Ти: ' : ''}
                {t.lastMessage.body}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
