/**
 * Stripe client initialization.
 *
 * The publishable key comes from VITE_STRIPE_PUBLISHABLE_KEY.
 * In dev/mock mode (key absent) we return null — all Stripe UI
 * shows a "test mode" placeholder instead of crashing.
 *
 * The SECRET key lives exclusively on the backend (never here).
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js'

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!PUBLISHABLE_KEY) {
    console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not set – running in mock mode')
    return Promise.resolve(null)
  }
  if (!stripePromise) {
    stripePromise = loadStripe(PUBLISHABLE_KEY)
  }
  return stripePromise
}

export const isMockStripe = !PUBLISHABLE_KEY
