import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Paperclip, MoreVertical, Flag, Ban, X, Image, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { apiGetMessages, apiSendMessage, type ChatMessage } from '@/api/messages'
import { apiGetProfile } from '@/api/profiles'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { clsx } from 'clsx'
import type { ProfileRow } from '@/types/database'

/* ── Typing indicator animation ───────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-6 h-6 rounded-full bg-surface-200 shrink-0" />
      <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-md" style={{ boxShadow: 'var(--shadow-card)' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-surface-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }} />
        ))}
      </div>
    </div>
  )
}

/* ── Report/Block menu ────────────────────────────────────── */
function ReportMenu({ name, onClose }: { name: string; onClose: () => void }) {
  function handleReport() { toast.success(`Сигналът срещу ${name} е подаден`); onClose() }
  function handleBlock()  { toast.success(`${name} е блокиран`); onClose() }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -8 }}
      className="absolute top-14 right-4 z-50 bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card-hover)', minWidth: 200 }}>
      <button onClick={handleReport}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 transition-colors">
        <Flag size={16} /> Подай сигнал
      </button>
      <div className="h-px bg-surface-100" />
      <button onClick={handleBlock}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Ban size={16} /> Блокирай потребителя
      </button>
      <div className="h-px bg-surface-100" />
      <button onClick={onClose}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-surface-500 hover:bg-surface-50 transition-colors">
        <X size={16} /> Откажи
      </button>
    </motion.div>
  )
}

/* ── Image preview before send ────────────────────────────── */
function ImagePreview({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative inline-block">
      <img src={src} alt="Прикачена снимка" className="h-24 w-24 rounded-xl object-cover border-2 border-navy-200" />
      <button onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
        aria-label="Премахни снимка">
        <X size={11} />
      </button>
    </div>
  )
}

export default function ChatDetailPage() {
  const { id: otherUserId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const endRef  = useRef<HTMLDivElement>(null)
  const [text, setText]             = useState('')
  const [showMenu, setShowMenu]     = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [typingVisible, setTypingVisible] = useState(false)

  /* ── Simulate typing indicator ─────────────────────────── */
  useEffect(() => {
    const show = setTimeout(() => setTypingVisible(true), 3000)
    const hide = setTimeout(() => setTypingVisible(false), 5500)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  const { data: otherUser } = useQuery<ProfileRow | null>({
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

  const { mutate: send, isPending } = useMutation({
    mutationFn: (body: string) => apiSendMessage(profile!.id, otherUserId, body),
    onSuccess:  () => {
      setText('')
      setImagePreview(null)
      qc.invalidateQueries({ queryKey: ['messages', profile?.id, otherUserId] })
      qc.invalidateQueries({ queryKey: ['chat-list'] })
    },
    onError: () => toast.error('Съобщението не беше изпратено. Опитай отново.'),
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingVisible])

  /* ── Dropzone for image attachment ────────────────────── */
  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const { getInputProps, open: openFilePicker } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxSize: 5 * 1024 * 1024, maxFiles: 1, noClick: true, noKeyboard: true,
  })

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = imagePreview
      ? `[снимка]${text.trim() ? ` ${text.trim()}` : ''}`
      : text.trim()
    if (!body || isPending) return
    send(body)
  }

  return (
    <AnimatedPage className="min-h-screen bg-surface-50 flex flex-col">
      <Helmet><title>{otherUser?.full_name ?? 'Чат'} – Vikni.me</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20 safe-top shrink-0">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3 relative">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-100 transition-colors" aria-label="Назад">
            <ArrowLeft size={20} className="text-surface-600" />
          </button>
          <Avatar src={otherUser?.avatar_url} name={otherUser?.full_name ?? '?'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-surface-800 truncate">{otherUser?.full_name}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs text-green-500 font-medium">Онлайн</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(m => !m)}
            className="w-9 h-9 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors"
            aria-label="Опции">
            <MoreVertical size={18} className="text-surface-500" />
          </button>

          <AnimatePresence>
            {showMenu && <ReportMenu name={otherUser?.full_name ?? 'потребителя'} onClose={() => setShowMenu(false)} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full space-y-2">
        {/* Close menu overlay */}
        {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMine   = msg.sender_id === profile?.id
            const showDate = i === 0 || format(new Date(messages[i - 1].created_at), 'dd/MM') !== format(new Date(msg.created_at), 'dd/MM')
            const isImage  = msg.body.startsWith('[снимка]')
            const bodyText = isImage ? msg.body.replace('[снимка]', '').trim() : msg.body

            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {showDate && (
                  <p className="text-center text-xs text-surface-400 my-3">
                    {format(new Date(msg.created_at), 'd MMMM yyyy', { locale: bg })}
                  </p>
                )}
                <div className={clsx('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
                  {!isMine && <Avatar src={otherUser?.avatar_url} name={otherUser?.full_name ?? '?'} size="xs" className="mb-0.5 shrink-0" />}
                  <div className="max-w-[75%] space-y-0.5">
                    {isImage && (
                      <div className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}>
                        <div className={clsx('flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs',
                          isMine ? 'bg-navy-500 text-white rounded-br-md' : 'bg-white text-surface-500 rounded-bl-md')}
                          style={!isMine ? { boxShadow: 'var(--shadow-card)' } : {}}>
                          <Image size={14} /> Снимка
                          {bodyText && <span className="ml-1 text-white/80">{bodyText}</span>}
                        </div>
                      </div>
                    )}
                    {!isImage && (
                      <div className={clsx('px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                        isMine ? 'bg-navy-500 text-white rounded-br-md' : 'bg-white text-surface-800 rounded-bl-md',
                      )} style={!isMine ? { boxShadow: 'var(--shadow-card)' } : {}}>
                        {msg.body}
                      </div>
                    )}
                    <p className={clsx('text-xs text-surface-400 flex items-center gap-1', isMine ? 'justify-end' : 'justify-start')}>
                      <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                      {isMine && <CheckCheck size={13} className="text-teal-500" aria-label="Прочетено" />}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingVisible && (
            <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* Image preview bar */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-surface-100 overflow-hidden">
            <div className="max-w-2xl mx-auto px-4 py-2">
              <ImagePreview src={imagePreview} onRemove={() => setImagePreview(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white border-t border-surface-100 safe-bottom shrink-0">
        <input {...getInputProps()} />
        <form onSubmit={handleSend} className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <button type="button" onClick={openFilePicker}
            className="w-10 h-10 rounded-full flex items-center justify-center text-surface-400 hover:text-navy-500 hover:bg-surface-100 transition-colors shrink-0"
            aria-label="Прикачи снимка">
            <Paperclip size={20} />
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={imagePreview ? 'Добави коментар...' : 'Напиши съобщение...'}
            className="flex-1 h-11 px-4 bg-surface-50 border border-surface-200 rounded-full text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors"
            aria-label="Съобщение"
          />
          <button
            type="submit"
            disabled={(!text.trim() && !imagePreview) || isPending}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-40 shrink-0"
            style={{ background: 'var(--gradient-brand)' }}
            aria-label="Изпрати"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </AnimatedPage>
  )
}
