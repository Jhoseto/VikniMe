import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const r: Record<string, string> = { sm: 'rounded', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full' }
  return <div className={clsx('skeleton', r[rounded], className)} aria-hidden="true" />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
      <Skeleton className="h-40" rounded="lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-24" rounded="full" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}
