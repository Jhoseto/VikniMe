export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'customer' | 'supplier' | 'admin'

/* ── Row types ──────────────────────────────────────────── */
export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  bio: string | null
  location: string | null
  credits: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface ServiceRow {
  id: string
  supplier_id: string
  category_id: string
  title: string
  description: string
  price: number
  price_type: 'fixed' | 'hourly' | 'negotiable'
  images: string[]
  location: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  avg_rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface CategoryRow {
  id: string
  name: string
  slug: string
  icon: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
}

export interface BookingRow {
  id: string
  service_id: string
  customer_id: string
  supplier_id: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_at: string | null
  notes: string | null
  price: number
  created_at: string
  updated_at: string
}

export interface MessageRow {
  id: string
  booking_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface ReviewRow {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  service_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: Json | null
  is_read: boolean
  created_at: string
}

export interface CreditTransactionRow {
  id: string
  user_id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  created_at: string
}

/* ── Database ───────────────────────────────────────────── */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>
      }
      services: {
        Row: ServiceRow
        Insert: Omit<ServiceRow, 'created_at' | 'updated_at' | 'avg_rating' | 'review_count'>
        Update: Partial<Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>>
      }
      categories: {
        Row: CategoryRow
        Insert: Omit<CategoryRow, 'created_at'>
        Update: Partial<Omit<CategoryRow, 'id' | 'created_at'>>
      }
      bookings: {
        Row: BookingRow
        Insert: Omit<BookingRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<BookingRow, 'id' | 'created_at' | 'updated_at'>>
      }
      messages: {
        Row: MessageRow
        Insert: Omit<MessageRow, 'created_at'>
        Update: Partial<Omit<MessageRow, 'id' | 'created_at'>>
      }
      reviews: {
        Row: ReviewRow
        Insert: Omit<ReviewRow, 'created_at'>
        Update: Partial<Omit<ReviewRow, 'id' | 'created_at'>>
      }
      notifications: {
        Row: NotificationRow
        Insert: Omit<NotificationRow, 'created_at'>
        Update: Partial<Omit<NotificationRow, 'id' | 'created_at'>>
      }
      credits_transactions: {
        Row: CreditTransactionRow
        Insert: Omit<CreditTransactionRow, 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: { user_role: UserRole }
  }
}
