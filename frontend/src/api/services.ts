/**
 * Services API
 * Currently backed by mock data. Replace function bodies with real fetch/axios calls when backend is ready.
 */
import {
  MOCK_SERVICES, MOCK_CATEGORIES,
  findService, findCategory, getServicesByCategory,
  getServicesBySupplier, searchServices,
} from '@/lib/mock/data'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export type ServiceWithRelations = typeof MOCK_SERVICES[0]

export async function apiGetFeaturedServices(): Promise<ServiceWithRelations[]> {
  await delay()
  return [...MOCK_SERVICES]
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 6)
}

export async function apiGetServiceById(id: string): Promise<ServiceWithRelations | null> {
  await delay(300)
  return findService(id)
}

export async function apiGetServicesBySupplier(supplierId: string): Promise<ServiceWithRelations[]> {
  await delay()
  return getServicesBySupplier(supplierId)
}

export async function apiGetServicesByCategory(slug: string): Promise<ServiceWithRelations[]> {
  await delay()
  return getServicesByCategory(slug)
}

export interface SearchFilters {
  query?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'newest'
}

export async function apiSearchServices(filters: SearchFilters): Promise<ServiceWithRelations[]> {
  await delay(350)
  let results = searchServices(filters.query ?? '', {
    categorySlug: filters.categorySlug,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    location: filters.location,
  })

  switch (filters.sortBy) {
    case 'price_asc':  results = results.sort((a, b) => a.price - b.price); break
    case 'price_desc': results = results.sort((a, b) => b.price - a.price); break
    case 'newest':     results = results.sort((a, b) => b.created_at.localeCompare(a.created_at)); break
    default:           results = results.sort((a, b) => b.avg_rating - a.avg_rating)
  }

  return results
}

export async function apiGetCategories() {
  await delay(200)
  return MOCK_CATEGORIES
}

export async function apiGetCategoryBySlug(slug: string) {
  await delay(200)
  return findCategory(slug)
}
