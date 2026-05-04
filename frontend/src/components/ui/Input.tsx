import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-surface-700">
            {label}
            {props.required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3.5 text-surface-400 pointer-events-none">{leftElement}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-12 bg-surface-50 border rounded-xl text-surface-800 placeholder:text-surface-400',
              'text-sm transition-colors outline-none',
              'focus:border-navy-400 focus:ring-2 focus:ring-navy-100',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-surface-200',
              leftElement  && 'pl-10',
              rightElement && 'pr-10',
              !leftElement  && 'pl-4',
              !rightElement && 'pr-4',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3.5 text-surface-400">{rightElement}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-surface-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
