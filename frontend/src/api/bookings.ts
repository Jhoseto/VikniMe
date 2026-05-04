/**
 * Bookings API
 * Currently backed by mock data.
 */
import { MOCK_BOOKINGS, MOCK_SERVICES, MOCK_PROFILES } from '@/lib/mock/data'
import type { BookingRow } from '@/types/database'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export type BookingWithRelations = typeof MOCK_BOOKINGS[0]

export async function apiGetMyBookings(userId: string, role: 'customer' | 'supplier' = 'customer'): Promise<BookingWithRelations[]> {
  await delay()
  const filter = role === 'supplier'
    ? (b: BookingWithRelations) => b.supplier_id === userId
    : (b: BookingWithRelations) => b.customer_id === userId
  return MOCK_BOOKINGS.filter(filter)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function apiGetSupplierBookings(supplierId: string): Promise<BookingWithRelations[]> {
  await delay()
  return MOCK_BOOKINGS.filter(b => b.supplier_id === supplierId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function apiGetBookingById(id: string): Promise<BookingWithRelations | null> {
  await delay(300)
  return MOCK_BOOKINGS.find(b => b.id === id) ?? null
}

export interface CreateBookingInput {
  service_id: string
  customer_id: string
  supplier_id: string
  scheduled_at: string
  notes?: string
  price: number
}

export async function apiCreateBooking(input: CreateBookingInput): Promise<BookingWithRelations> {
  await delay(700)
  const service  = MOCK_SERVICES.find(s => s.id === input.service_id)
  const supplier = MOCK_PROFILES.find(p => p.id === input.supplier_id)
  const customer = MOCK_PROFILES.find(p => p.id === input.customer_id)

  if (!service || !supplier || !customer) throw new Error('Invalid booking data')

  const newBooking: BookingWithRelations = {
    id: `booking-${Date.now()}`,
    service_id:   input.service_id,
    customer_id:  input.customer_id,
    supplier_id:  input.supplier_id,
    status:       'pending',
    scheduled_at: input.scheduled_at,
    notes:        input.notes ?? null,
    price:        input.price,
    created_at:   new Date().toISOString(),
    updated_at:   new Date().toISOString(),
    service:  { id: service.id, title: service.title, images: service.images, price_type: service.price_type },
    supplier: { id: supplier.id, full_name: supplier.full_name, avatar_url: supplier.avatar_url },
    customer: { id: customer.id, full_name: customer.full_name, avatar_url: customer.avatar_url },
  }

  MOCK_BOOKINGS.push(newBooking)
  return newBooking
}

export async function apiUpdateBookingStatus(id: string, status: BookingRow['status']): Promise<BookingWithRelations> {
  await delay(500)
  const booking = MOCK_BOOKINGS.find(b => b.id === id)
  if (!booking) throw new Error('Booking not found')
  booking.status = status
  booking.updated_at = new Date().toISOString()
  return booking
}
