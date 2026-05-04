/**
 * Messages API – thread-based, backed by mock data.
 */
import { MOCK_MESSAGES, MOCK_BOOKINGS, MOCK_PROFILES } from '@/lib/mock/data'
import type { ProfileRow } from '@/types/database'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export interface ChatMessage {
  id:         string
  booking_id: string
  sender_id:  string
  body:       string
  is_read:    boolean
  created_at: string
}

export interface ChatThread {
  otherUser:   ProfileRow
  lastMessage: ChatMessage
  unreadCount: number
}

/* ── List of chat threads ──────────────────────────────── */
export async function apiGetChatList(userId: string): Promise<ChatThread[]> {
  await delay()
  const myBookings = MOCK_BOOKINGS.filter(
    b => b.customer_id === userId || b.supplier_id === userId
  )

  const threads: ChatThread[] = []
  const seen = new Set<string>()

  for (const booking of myBookings) {
    const msgs = MOCK_MESSAGES.filter(m => m.booking_id === booking.id)
    if (!msgs.length) continue

    const otherId = booking.customer_id === userId ? booking.supplier_id : booking.customer_id
    if (seen.has(otherId)) continue
    seen.add(otherId)

    const otherProfile = MOCK_PROFILES.find(p => p.id === otherId)
    if (!otherProfile) continue

    const lastRaw = msgs[msgs.length - 1]
    const unread  = msgs.filter(m => m.sender_id !== userId && !m.is_read).length

    threads.push({
      otherUser:   otherProfile,
      lastMessage: lastRaw as ChatMessage,
      unreadCount: unread,
    })
  }

  return threads
}

/* ── Messages between two users ────────────────────────── */
/* Aggregates messages across ALL shared bookings between the pair */
export async function apiGetMessages(userId: string, otherUserId: string): Promise<ChatMessage[]> {
  await delay()
  const sharedBookingIds = MOCK_BOOKINGS
    .filter(
      b => (b.customer_id === userId && b.supplier_id === otherUserId) ||
           (b.supplier_id === userId && b.customer_id === otherUserId),
    )
    .map(b => b.id)

  if (sharedBookingIds.length === 0) return []

  return MOCK_MESSAGES
    .filter(m => sharedBookingIds.includes(m.booking_id))
    .sort((a, b) => a.created_at.localeCompare(b.created_at)) as ChatMessage[]
}

/* ── Send a message ─────────────────────────────────────── */
/* Picks the most recent shared booking as the thread context */
export async function apiSendMessage(senderId: string, receiverId: string, body: string): Promise<ChatMessage> {
  await delay(250)
  const sharedBookings = MOCK_BOOKINGS
    .filter(
      b => (b.customer_id === senderId && b.supplier_id === receiverId) ||
           (b.supplier_id === senderId && b.customer_id === receiverId),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const booking = sharedBookings[0]
  const msg: ChatMessage = {
    id:         `msg-${Date.now()}`,
    booking_id: booking?.id ?? 'no-booking',
    sender_id:  senderId,
    body,
    is_read:    false,
    created_at: new Date().toISOString(),
  }
  MOCK_MESSAGES.push(msg)
  return msg
}
