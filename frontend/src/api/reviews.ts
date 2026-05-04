/**
 * Reviews API
 * Currently backed by mock data.
 */
import { MOCK_REVIEWS, MOCK_PROFILES, getReviewsForService, getReviewsForSupplier } from '@/lib/mock/data'

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms))

export type ReviewWithReviewer = typeof MOCK_REVIEWS[0]

export async function apiGetReviewsForService(serviceId: string): Promise<ReviewWithReviewer[]> {
  await delay()
  return getReviewsForService(serviceId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function apiGetReviewsForSupplier(supplierId: string): Promise<ReviewWithReviewer[]> {
  await delay()
  return getReviewsForSupplier(supplierId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export interface CreateReviewInput {
  service_id:  string
  reviewer_id: string
  rating:      number
  comment?:    string | null
  booking_id?: string
  reviewee_id?: string
}

export async function apiCreateReview(input: CreateReviewInput): Promise<ReviewWithReviewer> {
  await delay(600)
  const reviewer = MOCK_PROFILES.find(p => p.id === input.reviewer_id)
  const newReview: ReviewWithReviewer = {
    id:          `rev-${Date.now()}`,
    booking_id:  input.booking_id ?? `bk-${Date.now()}`,
    reviewer_id: input.reviewer_id,
    reviewee_id: input.reviewee_id ?? `rv-${Date.now()}`,
    service_id:  input.service_id,
    rating:      input.rating,
    comment:     input.comment ?? null,
    created_at:  new Date().toISOString(),
    reviewer: {
      id:         input.reviewer_id,
      full_name:  reviewer?.full_name ?? null,
      avatar_url: reviewer?.avatar_url ?? null,
    },
  }
  MOCK_REVIEWS.push(newReview)
  return newReview
}
