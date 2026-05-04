/**
 * Payments API – mock layer.
 *
 * In production these functions will call the backend which:
 *  1. Creates a PaymentIntent via Stripe (secret key stays on server)
 *  2. Returns the clientSecret to the frontend
 *  3. Frontend confirms with stripe.confirmCardPayment(clientSecret)
 *
 * For now we return mock responses so the UI works without a backend.
 */

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

/* ── Types ──────────────────────────────────────────────── */
export interface SavedCard {
  id:          string
  last4:       string
  brand:       string   // 'visa' | 'mastercard' | 'amex' | ...
  exp_month:   number
  exp_year:    number
  is_default:  boolean
}

export interface PaymentIntent {
  id:            string
  clientSecret:  string
  amount:        number   // in smallest currency unit (stotinki)
  currency:      string
  status:        'requires_payment_method' | 'requires_confirmation' | 'succeeded'
}

export interface PayoutDetails {
  iban:         string
  holder_name:  string
}

/* ── Mock saved cards ────────────────────────────────────── */
const MOCK_CARDS: SavedCard[] = [
  { id: 'card-1', last4: '4242', brand: 'visa',       exp_month: 12, exp_year: 2027, is_default: true },
  { id: 'card-2', last4: '0005', brand: 'mastercard', exp_month: 6,  exp_year: 2026, is_default: false },
]

/* ── Saved payment methods ────────────────────────────────── */
export async function apiGetSavedCards(): Promise<SavedCard[]> {
  await delay()
  return [...MOCK_CARDS]
}

export async function apiDeleteCard(id: string): Promise<void> {
  await delay(300)
  const idx = MOCK_CARDS.findIndex(c => c.id === id)
  if (idx !== -1) MOCK_CARDS.splice(idx, 1)
}

export async function apiSetDefaultCard(id: string): Promise<void> {
  await delay(300)
  MOCK_CARDS.forEach(c => { c.is_default = c.id === id })
}

/**
 * In production: POST /api/setup-intent → returns { clientSecret }
 * Frontend then: stripe.confirmCardSetup(clientSecret, { payment_method: { card } })
 * This saves the card in Stripe without charging.
 */
export async function apiCreateSetupIntent(): Promise<{ clientSecret: string }> {
  await delay(400)
  return { clientSecret: 'seti_mock_' + Date.now() + '_secret_mock' }
}

/* ── PaymentIntent for booking ───────────────────────────── */
/**
 * In production: POST /api/payment-intent { bookingId, amount }
 * Backend creates Stripe PaymentIntent, returns clientSecret.
 * Frontend: stripe.confirmCardPayment(clientSecret, { payment_method: cardId })
 */
export async function apiCreatePaymentIntent(amountLv: number): Promise<PaymentIntent> {
  await delay(600)
  return {
    id:           'pi_mock_' + Date.now(),
    clientSecret: 'pi_mock_' + Date.now() + '_secret_mock',
    amount:       Math.round(amountLv * 100),
    currency:     'bgn',
    status:       'requires_payment_method',
  }
}

/** Mock payment confirmation (no real Stripe call in mock mode) */
export async function apiConfirmMockPayment(intentId: string): Promise<{ status: 'succeeded' }> {
  await delay(1200)
  console.log('[Mock Stripe] Confirming payment intent:', intentId)
  return { status: 'succeeded' }
}

/* ── Payout (supplier IBAN) ──────────────────────────────── */
let MOCK_PAYOUT: PayoutDetails | null = { iban: 'BG80 BNBG 9661 1020 3456 78', holder_name: 'Мария Николова' }

export async function apiGetPayoutDetails(): Promise<PayoutDetails | null> {
  await delay(300)
  return MOCK_PAYOUT ? { ...MOCK_PAYOUT } : null
}

export async function apiSavePayoutDetails(details: PayoutDetails): Promise<void> {
  await delay(500)
  MOCK_PAYOUT = { ...details }
}
