/**
 * Haptic feedback via navigator.vibrate().
 * Works on Android; silently ignored on iOS and desktop.
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'select'

const PATTERNS: Record<HapticType, number | number[]> = {
  light:   10,
  medium:  25,
  heavy:   [30, 10, 30],
  success: [10, 50, 10],
  error:   [30, 20, 30, 20, 60],
  select:  8,
}

function vibrate(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch { /* ignore */ }
}

export function useHaptic() {
  function trigger(type: HapticType = 'light') {
    vibrate(PATTERNS[type])
  }

  return {
    trigger,
    light:   () => vibrate(PATTERNS.light),
    medium:  () => vibrate(PATTERNS.medium),
    heavy:   () => vibrate(PATTERNS.heavy),
    success: () => vibrate(PATTERNS.success),
    error:   () => vibrate(PATTERNS.error),
    select:  () => vibrate(PATTERNS.select),
  }
}
