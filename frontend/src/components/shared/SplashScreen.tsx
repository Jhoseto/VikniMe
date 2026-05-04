/**
 * SplashScreen – premium PWA loading screen.
 *
 * Animation sequence:
 *  0.00s  Screen fades in (white)
 *  0.15s  Logo materialises: scale 0.7 → 1, blur 16px → 0, opacity 0 → 1  (spring)
 *  0.80s  Shimmer sweep left → right across the logo
 *  1.00s  Sound-wave ripple: logo pulses once (scale 1 → 1.03 → 1)
 *  1.10s  Tagline slides up + fades in
 *  1.30s  Gradient progress bar animates 0 → 100% width
 *  2.40s  hideSplash() is called
 *  Exit:  Screen scales down + fades (controlled by AppShell AnimatePresence)
 */
import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useUiStore } from '@/stores/uiStore'

const SPLASH_DURATION         = 2400
const SPLASH_DURATION_REDUCED = 600

export function SplashScreen() {
  const { hideSplash } = useUiStore()
  const reduced = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(hideSplash, reduced ? SPLASH_DURATION_REDUCED : SPLASH_DURATION)
    return () => clearTimeout(t)
  }, [hideSplash, reduced])

  /* Reduced-motion: instant logo, no shimmer/pulse/progress bar */
  if (reduced) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.15 } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        <img src="/logo.png" alt="vikni.me" className="w-60 sm:w-72 object-contain" draggable={false} />
        <p className="mt-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-surface-400">
          Намери специалист
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.38, ease: [0.4, 0, 1, 1] } }}
    >
      {/* ── Subtle background gradient wash ───────────────────── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(124,92,191,0.07) 0%, transparent 70%),' +
            'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(255,107,53,0.05) 0%, transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />

      {/* ── Logo container ─────────────────────────────────────── */}
      <motion.div
        className="relative select-none"
        initial={{ scale: 0.7, opacity: 0, filter: 'blur(16px)', y: 24 }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{
          scale:   { type: 'spring', stiffness: 220, damping: 22, delay: 0.15 },
          opacity: { duration: 0.55, delay: 0.15, ease: 'easeOut' },
          filter:  { duration: 0.55, delay: 0.15, ease: 'easeOut' },
          y:       { type: 'spring', stiffness: 260, damping: 24, delay: 0.15 },
        }}
      >
        <img
          src="/logo.png"
          alt="vikni.me"
          className="w-60 sm:w-72 object-contain drop-shadow-sm"
          draggable={false}
        />

        {/* Shimmer sweep ─────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 -skew-x-12 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
          }}
          initial={{ x: '-130%' }}
          animate={{ x: '230%' }}
          transition={{ delay: 0.82, duration: 0.52, ease: [0.25, 0, 0.25, 1] }}
        />
      </motion.div>

      {/* Sound-wave pulse ring ─────────────────────────────── */}
      <motion.div
        className="absolute rounded-full border border-orange-400/20 pointer-events-none"
        style={{ width: 180, height: 180 }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1.35, 1.7] }}
        transition={{ delay: 0.95, duration: 0.9, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute rounded-full border border-navy-400/10 pointer-events-none"
        style={{ width: 180, height: 180 }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.6, 1.55, 2.0] }}
        transition={{ delay: 1.05, duration: 1.0, ease: 'easeOut' }}
      />

      {/* ── Tagline ────────────────────────────────────────────── */}
      <motion.p
        className="mt-6 text-[11px] font-semibold tracking-[0.28em] uppercase text-surface-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Намери специалист
      </motion.p>

      {/* ── Bottom gradient progress bar ───────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-surface-100 overflow-hidden">
        <motion.div
          className="h-full w-full"
          style={{
            background:
              'linear-gradient(90deg, #1e3a8a 0%, #7c5cbf 40%, #ff6b35 70%, #00bfa5 100%)',
          }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  )
}
