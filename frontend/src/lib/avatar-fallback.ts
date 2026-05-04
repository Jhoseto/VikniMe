/**
 * Fallback аватар: инициали + стабилен „случаен“ цвят от seed (без мигане при ререндер).
 */

function hashString(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  return Math.abs(h)
}

/** HSL тонове, добър контраст с бял текст */
const FALLBACK_HUES = [210, 232, 258, 280, 305, 328, 352, 24, 48, 168, 142, 188]

export function avatarFallbackFromSeed(seed: string): { background: string; color: string } {
  const hue = FALLBACK_HUES[hashString(seed) % FALLBACK_HUES.length]!
  return {
    background: `hsl(${hue} 52% 40%)`,
    color: '#ffffff',
  }
}

function firstGrapheme(s: string): string {
  const g = [...s][0]
  return g ?? ''
}

/**
 * Две имена → първа буква от всяко; едно име → първите две букви (графеми).
 */
export function getAvatarInitials(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return '?'
  const parts = fullName
    .trim()
    .split(/[\s&]+/u)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  if (parts.length >= 2) {
    const a = firstGrapheme(parts[0]!)
    const b = firstGrapheme(parts[1]!)
    return `${a}${b}`.toLocaleUpperCase('bg-BG')
  }

  const word = parts[0] ?? ''
  const chars = [...word].slice(0, 2).join('')
  return chars ? chars.toLocaleUpperCase('bg-BG') : '?'
}

export function avatarFallbackSeed(name: string | null | undefined, userId?: string | null): string {
  return (userId?.trim() || name?.trim() || '?')
}
