/**
 * ServiceMap – interactive MapLibre GL map with service markers.
 * Shows clusters when zoomed out, individual markers when zoomed in.
 * Clicking a marker shows a ServiceCard popup.
 */
import { useState, useCallback, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { clsx } from 'clsx'
import type { ServiceWithRelations } from '@/api/services'

/* ── Approximate coordinates per Bulgarian city ─────────── */
const CITY_COORDS: Record<string, [number, number]> = {
  'София':      [42.6977, 23.3219],
  'Варна':      [43.2141, 27.9147],
  'Пловдив':    [42.1354, 24.7453],
  'Банско':     [41.8370, 23.4880],
  'Бургас':     [42.5048, 27.4626],
  'Боровец':    [42.2676, 23.5949],
  'Несебър':    [42.6591, 27.7153],
  'Пампорово':  [41.6590, 24.6838],
}

function getCoords(location: string | null): [number, number] | null {
  if (!location) return null
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (location.includes(city)) {
      // Add slight jitter so overlapping markers are visible
      return [coords[0] + (Math.random() - 0.5) * 0.01, coords[1] + (Math.random() - 0.5) * 0.01]
    }
  }
  return null
}

/* ── Marker pin ──────────────────────────────────────────── */
interface PinProps { price: number; active: boolean; onClick: () => void }
function PricePin({ price, active, onClick }: PinProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-2.5 py-1 rounded-full text-xs font-bold shadow-md border-2 transition-all hover:scale-110',
        active ? 'bg-navy-500 text-white border-navy-500 scale-110' : 'bg-white text-navy-600 border-white hover:border-navy-300'
      )}
      style={active ? { boxShadow: 'var(--shadow-brand-glow)' } : { boxShadow: 'var(--shadow-card)' }}
    >
      {price} €
    </button>
  )
}

/* ── Popup card ──────────────────────────────────────────── */
function ServicePopup({ service, onClose }: { service: ServiceWithRelations; onClose: () => void }) {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden w-56" style={{ boxShadow: 'var(--shadow-card-hover)' }}>
      {service.images[0] && (
        <img src={service.images[0]} alt={service.title} className="w-full h-28 object-cover" />
      )}
      <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
        <X size={12} />
      </button>
      <div className="p-3">
        <p className="font-semibold text-sm text-surface-800 line-clamp-2 leading-snug">{service.title}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-orange-400 fill-orange-400" />
            <span className="text-xs text-surface-500">{service.avg_rating.toFixed(1)}</span>
          </div>
          <span className="font-bold text-sm text-navy-500">{service.price} €</span>
        </div>
        <Link to={`/service/${service.id}`}
          className="mt-2.5 block text-center py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--gradient-brand)' }}>
          Виж услугата
        </Link>
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────── */
interface ServiceMapProps {
  services: ServiceWithRelations[]
  className?: string
}

export function ServiceMap({ services, className }: ServiceMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [selected, setSelected] = useState<ServiceWithRelations | null>(null)

  // Filter services with mappable locations
  const mappable = services.flatMap(svc => {
    const coords = getCoords(svc.location)
    return coords ? [{ svc, lat: coords[0], lng: coords[1] }] : []
  })

  const handleMarkerClick = useCallback((svc: ServiceWithRelations, lat: number, lng: number) => {
    setSelected(svc)
    mapRef.current?.easeTo({ center: [lng, lat], duration: 400 })
  }, [])

  if (mappable.length === 0) {
    return (
      <div className={clsx('flex items-center justify-center bg-surface-100 rounded-2xl text-surface-400 text-sm', className)}>
        <div className="text-center p-8">
          <MapPin size={32} className="mx-auto mb-2 text-surface-300" />
          Няма услуги с позволена локация
        </div>
      </div>
    )
  }

  // Center on average of all coords
  const avgLat = mappable.reduce((s, m) => s + m.lat, 0) / mappable.length
  const avgLng = mappable.reduce((s, m) => s + m.lng, 0) / mappable.length

  return (
    <div className={clsx('rounded-2xl overflow-hidden relative', className)}>
      <Map
        ref={mapRef}
        initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: 7 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        {mappable.map(({ svc, lat, lng }) => (
          <Marker key={svc.id} latitude={lat} longitude={lng} anchor="bottom">
            <PricePin
              price={svc.price}
              active={selected?.id === svc.id}
              onClick={() => handleMarkerClick(svc, lat, lng)}
            />
          </Marker>
        ))}

        {selected && (
          <Popup
            latitude={mappable.find(m => m.svc.id === selected.id)?.lat ?? avgLat}
            longitude={mappable.find(m => m.svc.id === selected.id)?.lng ?? avgLng}
            anchor="bottom"
            offset={40}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setSelected(null)}
          >
            <ServicePopup service={selected} onClose={() => setSelected(null)} />
          </Popup>
        )}
      </Map>
    </div>
  )
}
