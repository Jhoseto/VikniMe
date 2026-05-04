import { Star } from 'lucide-react'
import { clsx } from 'clsx'

interface StarRatingProps {
  value: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

export function StarRating({ value, max = 5, size = 16, interactive, onChange, className }: StarRatingProps) {
  return (
    <div className={clsx('flex items-center gap-0.5', className)} role={interactive ? 'group' : undefined}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value)
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={clsx(
              'transition-transform',
              interactive && 'hover:scale-110 cursor-pointer',
              !interactive && 'cursor-default pointer-events-none'
            )}
            aria-label={interactive ? `Оценка ${i + 1}` : undefined}
          >
            <Star
              size={size}
              className={filled ? 'text-orange-400 fill-orange-400' : 'text-surface-300 fill-surface-300'}
            />
          </button>
        )
      })}
    </div>
  )
}
