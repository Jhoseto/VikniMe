import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { clsx } from 'clsx'

const TONE_STYLE: Record<'brand' | 'warm' | 'teal' | 'danger', string> = {
  brand:  'var(--gradient-brand)',
  warm:   'linear-gradient(135deg,#E8581F 0%,#F59E0B 100%)',
  teal:   'linear-gradient(135deg,#7C4DCC 0%,#2DD4BF 100%)',
  danger: 'linear-gradient(135deg,#dc2626 0%,#f97316 100%)',
}

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  /** Extra row: primary CTA, links, etc. */
  children?: ReactNode
  tone?: keyof typeof TONE_STYLE
  /** Override gradient (e.g. Search ME_GRADIENT) */
  iconBackground?: string
  /** Full-page empty vs tight sidebar / inline */
  size?: 'hero' | 'compact'
  className?: string
}

/**
 * Unified empty / informational block — same rhythm as Search & Messages.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  tone = 'brand',
  iconBackground,
  size = 'hero',
  className,
}: EmptyStateProps) {
  const compact = size === 'compact'
  const bg = iconBackground ?? TONE_STYLE[tone]

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center gap-2',
        compact ? 'py-16 px-4' : 'py-20 px-4',
        className
      )}
    >
      <div
        className={clsx(
          'rounded-3xl flex items-center justify-center shadow-lg shrink-0',
          compact ? 'w-14 h-14' : 'w-20 h-20'
        )}
        style={{ background: bg }}
      >
        <Icon
          size={compact ? 22 : 34}
          strokeWidth={1.75}
          className="text-white"
          aria-hidden
        />
      </div>
      <h3
        className={clsx(
          'font-display font-bold text-surface-800',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </h3>
      {description != null && description !== '' && (
        <p
          className={clsx(
            'text-surface-400 max-w-[280px]',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      )}
      {children != null && <div className="mt-4 flex flex-col items-center gap-3">{children}</div>}
    </div>
  )
}
