/**
 * Favorites store — persisted set of saved service IDs.
 * Used by ServiceCard heart, ServiceDetailPage hero heart, and FavoritesPage.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  ids: string[]
  has: (id: string) => boolean
  toggle: (id: string) => void
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) =>
        set(s => s.ids.includes(id)
          ? { ids: s.ids.filter(x => x !== id) }
          : { ids: [...s.ids, id] }),
      add:    (id) => set(s => s.ids.includes(id) ? s : { ids: [...s.ids, id] }),
      remove: (id) => set(s => ({ ids: s.ids.filter(x => x !== id) })),
      clear:  () => set({ ids: [] }),
    }),
    { name: 'vikni_favorites' }
  )
)
