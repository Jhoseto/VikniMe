// ENV variables – will be provided by the backend in production.
// For local development, copy .env.example to .env and fill in the values.
// During mock/UI development phase, missing values are allowed.

export const env = {
  VITE_SUPABASE_URL:      import.meta.env.VITE_SUPABASE_URL      ?? '',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  VITE_APP_URL:           import.meta.env.VITE_APP_URL            ?? 'http://localhost:5173',
  VITE_VAPID_PUBLIC_KEY:  import.meta.env.VITE_VAPID_PUBLIC_KEY   ?? '',
}
