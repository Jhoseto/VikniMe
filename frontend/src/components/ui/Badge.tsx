import { type ReactNode } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'navy' | 'orange' | 'violet' | 'teal' | 'success' | 'warning' | 'error' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  navy:    'bg-navy-50 text-navy-600',
  orange:  'bg-orange-50 text-orange-600',
  violet:  'bg-violet-50 text-violet-600',
  teal:    'bg-teal-50 text-teal-600',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  error:   'bg-red-50 text-red-700',
  neutral: 'bg-surface-100 text-surface-600',
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
