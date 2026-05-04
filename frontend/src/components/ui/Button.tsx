import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none'

const variants: Record<Variant, string> = {
  primary:   'text-white hover:opacity-90 active:scale-[0.98]',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 active:scale-[0.98]',
  ghost:     'text-surface-600 hover:bg-surface-100 active:scale-[0.98]',
  outline:   'border border-surface-300 text-surface-700 hover:bg-surface-50 active:scale-[0.98]',
  danger:    'bg-error text-white hover:opacity-90 active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, children, className, style, ...props },
    ref
  ) => {
    const isPrimary = variant === 'primary'
    return (
      <button
        ref={ref}
        disabled={loading || props.disabled}
        className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        style={isPrimary ? { background: 'var(--gradient-brand)', ...style } : style}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
