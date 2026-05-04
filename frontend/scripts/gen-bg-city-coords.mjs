/**
 * Еднократно генериране на приблизителни координати за градове (Photon → OSM).
 * Изпълни: node scripts/gen-bg-city-coords.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = readFileSync(join(root, 'src/lib/mock/bg-cities.ts'), 'utf8')
const raw = [...src.matchAll(/'([^']+)'/g)].map(m => m[1])
const unique = [...new Set(raw)].filter(
  name => name.length >= 2 && /[\u0400-\u04FF]/.test(name) && !/^(readonly|string|const)$/u.test(name),
)

const BG_BOUNDS = { minLat: 41.15, maxLat: 44.75, minLng: 22.15, maxLng: 29.35 }

function inBulgaria(lat, lng) {
  return lat >= BG_BOUNDS.minLat && lat <= BG_BOUNDS.maxLat && lng >= BG_BOUNDS.minLng && lng <= BG_BOUNDS.maxLng
}

const out = {}
for (const city of unique) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(`${city}, Bulgaria`)}&limit=5`
  let coords = null
  try {
    const r = await fetch(url)
    const j = await r.json()
    for (const f of j.features || []) {
      const [lng, lat] = f.geometry.coordinates
      if (inBulgaria(lat, lng)) {
        coords = [lat, lng]
        break
      }
    }
  } catch {
    /* ignore */
  }
  out[city] = coords ?? [42.7339, 25.4858]
  process.stderr.write(`${city}\t${out[city][0].toFixed(4)},${out[city][1].toFixed(4)}\n`)
  await new Promise(res => setTimeout(res, 120))
}

const body = Object.entries(out)
  .sort(([a], [b]) => a.localeCompare(b, 'bg'))
  .map(([k, [la, lo]]) => `  '${k.replace(/'/g, "\\'")}': [${la}, ${lo}],`)
  .join('\n')

writeFileSync(
  join(root, 'src/lib/mock/bg-city-coords.ts'),
  `/**\n * Приблизителни координати за градове (Photon/OSM). Генерирано с scripts/gen-bg-city-coords.mjs\n */\nexport const BG_CITY_COORDS: Record<string, [number, number]> = {\n${body}\n}\n`,
)
console.error('Wrote src/lib/mock/bg-city-coords.ts')
