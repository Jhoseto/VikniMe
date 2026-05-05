/**
 * ServiceMap – MapLibre карта с OpenStreetMap (детайл до улично ниво) и контур на България.
 */
import { useMemo, useState, useCallback, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, Source, Layer, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, X, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { ServiceWithRelations } from '@/api/services'
import { BG_ALL_BG_CITIES } from '@/lib/mock/bg-cities'
import { BG_CITY_COORDS } from '@/lib/mock/bg-city-coords'
import { BULGARIA_BASEMAP_STYLE, BULGARIA_MAX_BOUNDS, BULGARIA_OUTLINE } from '@/lib/map-bulgaria'

/** По-дълги имена първо, за да хване „Велико Търново“ пред „Търново“ и т.н. */
const CITIES_LONGEST_FIRST = [...BG_ALL_BG_CITIES].sort((a, b) => b.length - a.length)

function stableCoordOffset(seed: string): [number, number] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  const u = Math.abs(h)
  return [(u % 200 - 100) * 8e-6, (Math.floor(u / 200) % 200 - 100) * 8e-6]
}

function getCoords(location: string | null, serviceId: string): [number, number] | null {
  if (!location) return null
  for (const city of CITIES_LONGEST_FIRST) {
    if (!location.includes(city)) continue
    const base = BG_CITY_COORDS[city]
    if (!base) continue
    const [dlat, dlng] = stableCoordOffset(`${serviceId}:${city}`)
    return [base[0] + dlat, base[1] + dlng]
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
        <img src={service.images[0]} alt={service.title} className="w-full h-28 object-cover" loading="lazy" decoding="async" />
      )}
      <button type="button" onClick={onClose} aria-label="Затвори" className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
        <X size={12} aria-hidden />
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

  const mappable = useMemo(
    () =>
      services.flatMap(svc => {
        const coords = getCoords(svc.location, svc.id)
        return coords ? [{ svc, lat: coords[0], lng: coords[1] }] : []
      }),
    [services],
  )

  const handleMarkerClick = useCallback((svc: ServiceWithRelations, lat: number, lng: number) => {
    setSelected(svc)
    mapRef.current?.easeTo({ center: [lng, lat], duration: 400, zoom: Math.max(mapRef.current?.getZoom() ?? 0, 10) })
  }, [])

  const { avgLat, avgLng, initialZoom } = useMemo(() => {
    if (mappable.length === 0) return { avgLat: 42.73, avgLng: 25.48, initialZoom: 6.8 }
    const lat = mappable.reduce((s, m) => s + m.lat, 0) / mappable.length
    const lng = mappable.reduce((s, m) => s + m.lng, 0) / mappable.length
    const spread = Math.hypot(
      Math.max(...mappable.map(m => m.lat)) - Math.min(...mappable.map(m => m.lat)),
      Math.max(...mappable.map(m => m.lng)) - Math.min(...mappable.map(m => m.lng)),
    )
    const zoom = spread < 0.35 ? 9.2 : spread < 1.2 ? 7.4 : spread < 3 ? 6.4 : 5.8
    return { avgLat: lat, avgLng: lng, initialZoom: zoom }
  }, [mappable])

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

  return (
    <div className={clsx('rounded-2xl overflow-hidden relative bg-white', className)}>
      <Map
        ref={mapRef}
        initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: initialZoom }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={BULGARIA_BASEMAP_STYLE}
        maxBounds={BULGARIA_MAX_BOUNDS}
        minZoom={5}
        maxZoom={18}
        attributionControl={{ compact: true }}
        maplibreLogo={false}
        reuseMaps
      >
        <Source id="bulgaria-outline" type="geojson" data={BULGARIA_OUTLINE}>
          <Layer
            id="bg-country-fill"
            type="fill"
            paint={{ 'fill-color': '#64748b', 'fill-opacity': 0.02 }}
          />
          <Layer
            id="bg-country-line"
            type="line"
            paint={{
              'line-color': '#94a3b8',
              'line-opacity': 0.45,
              'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 1.4, 16, 2],
            }}
          />
        </Source>

        <NavigationControl position="top-right" showCompass={false} />

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
