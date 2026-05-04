import { clsx } from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { avatarFallbackFromSeed, avatarFallbackSeed, getAvatarInitials } from '@/lib/avatar-fallback'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  name?: string | null
  /** За стабилен цвят на fallback; ако липсва, се ползва името */
  userId?: string | null
  size?: AvatarSize
  className?: string
}

const sizes: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ src, name, userId, size = 'md', className }: AvatarProps) {
  const [imgBroken, setImgBroken] = useState(false)

  useEffect(() => {
    setImgBroken(false)
  }, [src])

  const onImgError = useCallback(() => {
    setImgBroken(true)
  }, [])

  const showPhoto = Boolean(src) && !imgBroken
  const seed = avatarFallbackSeed(name, userId)
  const initials = getAvatarInitials(name)
  const fallbackStyle = avatarFallbackFromSeed(seed)

  return (
    <div
      className={clsx(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold',
        showPhoto ? 'bg-surface-100 text-navy-500' : 'ring-0',
        sizes[size],
        className
      )}
      style={showPhoto ? undefined : { background: fallbackStyle.background, color: fallbackStyle.color }}
    >
      {showPhoto ? (
        <img src={src!} alt={name ?? 'Avatar'} className="w-full h-full object-cover" onError={onImgError} />
      ) : (
        <span className="select-none leading-none">{initials}</span>
      )}
    </div>
  )
}
