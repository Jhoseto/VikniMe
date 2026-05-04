/**
 * Lightbox – fullscreen image overlay with:
 * - Swipe gestures (use-gesture)
 * - Keyboard navigation (← →, Esc)
 * - Thumbnail strip
 * - Framer Motion transitions
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface LightboxProps {
  images: string[]
  initialIndex?: number
  onClose: () => void
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex)
  const [direction, setDirection] = useState(0)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0.3, 1, 0.3])

  function go(dir: number) {
    setDirection(dir)
    setIdx(i => Math.max(0, Math.min(images.length - 1, i + dir)))
  }

  /* ── Keyboard ─────────────────────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /* ── Swipe ────────────────────────────────────────── */
  const bind = useDrag(({ active, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
    if (active && Math.abs(mx) > 80) {
      go(xDir > 0 ? -1 : 1)
      cancel()
    }
    if (!active) {
      if (Math.abs(vx) > 0.5) go(vx < 0 ? 1 : -1)
      x.set(0)
    } else {
      x.set(mx)
    }
  }, { axis: 'x', filterTaps: true })

  /* ── Variants ─────────────────────────────────────── */
  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      role="dialog"
      aria-modal
      aria-label="Галерия"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <p className="text-white/60 text-sm">{idx + 1} / {images.length}</p>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Затвори">
          <X size={20} />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden" {...bind()}>
        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <motion.img
            key={idx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            style={{ x, opacity }}
            src={images[idx]}
            alt={`Снимка ${idx + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
        </AnimatePresence>

        {/* Arrows – desktop */}
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} disabled={idx === 0}
              className="absolute left-3 w-10 h-10 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-colors"
              aria-label="Предишна">
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => go(1)} disabled={idx === images.length - 1}
              className="absolute right-3 w-10 h-10 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-colors"
              aria-label="Следваща">
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none safe-bottom justify-center">
          {images.map((img, i) => (
            <button key={i} onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i) }}
              className={clsx('w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                i === idx ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-75')}
              aria-label={`Снимка ${i + 1}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  )
}
