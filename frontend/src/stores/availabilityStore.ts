/**
 * Zustand store for the Availability Wizard.
 * Persists wizard state between the two steps (Date → Hour).
 */
import { create } from 'zustand'

export type DayPattern = 'every_day' | 'weekdays' | 'weekends' | 'specific_days' | 'specific_dates'
export type TimePattern = 'all_day' | 'range'

export interface AvailabilityConfig {
  dayPattern:    DayPattern
  weekDays:      number[]       // 0=Sun, 1=Mon, ... 6=Sat (for 'specific_days')
  specificDates: Date[]         // for 'specific_dates'
  timePattern:   TimePattern
  timeFrom:      string         // 'HH:mm'
  timeTo:        string         // 'HH:mm'
  excludedSlots: { from: string; to: string }[]
}

interface AvailabilityStore {
  config: AvailabilityConfig
  setConfig: (partial: Partial<AvailabilityConfig>) => void
  reset: () => void
}

const DEFAULT: AvailabilityConfig = {
  dayPattern:    'every_day',
  weekDays:      [1, 2, 3, 4, 5],
  specificDates: [],
  timePattern:   'range',
  timeFrom:      '09:00',
  timeTo:        '18:00',
  excludedSlots: [],
}

export const useAvailabilityStore = create<AvailabilityStore>((set) => ({
  config: { ...DEFAULT },
  setConfig: (partial) => set(s => ({ config: { ...s.config, ...partial } })),
  reset: () => set({ config: { ...DEFAULT } }),
}))
