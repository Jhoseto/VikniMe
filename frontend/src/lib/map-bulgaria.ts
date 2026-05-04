import type { StyleSpecification } from 'maplibre-gl'
import type { FeatureCollection, Polygon } from 'geojson'

/**
 * Опростена граница на България (адм. ниво 0), за лек контур върху базовата карта.
 * Източник: johan/world.geo.json (CC-BY-SA / OSM-derived полигони, опростени).
 */
export const BULGARIA_OUTLINE: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'BGR',
      properties: { name: 'Bulgaria' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [22.65715, 44.234923],
            [22.944832, 43.823785],
            [23.332302, 43.897011],
            [24.100679, 43.741051],
            [25.569272, 43.688445],
            [26.065159, 43.943494],
            [27.2424, 44.175986],
            [27.970107, 43.812468],
            [28.558081, 43.707462],
            [28.039095, 43.293172],
            [27.673898, 42.577892],
            [27.99672, 42.007359],
            [27.135739, 42.141485],
            [26.117042, 41.826905],
            [26.106138, 41.328899],
            [25.197201, 41.234486],
            [24.492645, 41.583896],
            [23.692074, 41.309081],
            [22.952377, 41.337994],
            [22.881374, 41.999297],
            [22.380526, 42.32026],
            [22.545012, 42.461362],
            [22.436595, 42.580321],
            [22.604801, 42.898519],
            [22.986019, 43.211161],
            [22.500157, 43.642814],
            [22.410446, 44.008063],
            [22.65715, 44.234923],
          ],
        ],
      },
    },
  ],
}

/**
 * Официални OSM плочки — надписите следват полето `name` в базата (за България
 * обикновено кирилица). CARTO Positron ползва латиница за много надписи, затова
 * тук е отново OSM + леко приглушаване на цветовете през raster paint.
 * @see https://operations.osmfoundation.org/policies/tiles/
 */
export const BULGARIA_BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'vikni-bg-osm-soft',
  sources: {
    'osm-standard': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [
    {
      id: 'osm-standard',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        /* По-изчист изглед: по-малко „крещящо“ зелено, без да се пипа самият шрифт на надписите */
        'raster-saturation': -0.48,
        'raster-contrast': -0.06,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
      },
    },
  ],
}

/** Ограничава панорамата около България (запад, юг, изток, север) — lng/lat */
export const BULGARIA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [22.15, 41.05],
  [29.35, 44.85],
]
