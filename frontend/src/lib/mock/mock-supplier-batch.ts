/**
 * Генерирани ~45 допълнителни доставчици (supplier-6 … supplier-50) + по 1 услуга всеки,
 * разпределени във всички категории и по градове от BG_ALL_BG_CITIES.
 */
import type { ProfileRow, CategoryRow, ServiceRow } from '@/types/database'
import { BG_ALL_BG_CITIES } from './bg-cities'

export type MockServiceWithJoin = ServiceRow & {
  profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>
  categories: Pick<CategoryRow, 'id' | 'name' | 'slug' | 'icon'>
}

const CAT: Pick<CategoryRow, 'id' | 'name' | 'slug' | 'icon'>[] = [
  { id: 'cat-1',  name: 'Масаж',          slug: 'massage',     icon: '💆' },
  { id: 'cat-2',  name: 'Ски & Сноуборд', slug: 'sports',      icon: '⛷️' },
  { id: 'cat-3',  name: 'Почистване',     slug: 'cleaning',    icon: '🧹' },
  { id: 'cat-4',  name: 'Красота',        slug: 'beauty',      icon: '💅' },
  { id: 'cat-5',  name: 'Готвач',         slug: 'cooking',     icon: '🍳' },
  { id: 'cat-6',  name: 'Фотография',     slug: 'photography', icon: '📷' },
  { id: 'cat-7',  name: 'Музика',         slug: 'music',       icon: '🎵' },
  { id: 'cat-8',  name: 'Обучение',       slug: 'tutoring',    icon: '📚' },
  { id: 'cat-9',  name: 'Фитнес',         slug: 'fitness',     icon: '🏋️' },
  { id: 'cat-10', name: 'Животни',        slug: 'pets',        icon: '🐾' },
  { id: 'cat-11', name: 'Ремонти',        slug: 'repairs',     icon: '🔧' },
  { id: 'cat-12', name: 'Транспорт',      slug: 'transport',   icon: '🚗' },
]

/* Уникални Unsplash снимки по категория (различни за всяка услуга чрез seed) */
const IMAGES_BY_SLUG: Record<string, string[]> = {
  massage: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
    'https://images.unsplash.com/photo-1515377900963-a1f306189be9?w=600&q=80',
    'https://images.unsplash.com/photo-1506126614070-7e77852bea3d?w=600&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
    'https://images.unsplash.com/photo-1565992441121-4367a2aaaefe?w=600&q=80',
    'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=600&q=80',
    'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=600&q=80',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&q=80',
    'https://images.unsplash.com/photo-1478700485868-972b69dc3fc4?w=600&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    'https://images.unsplash.com/photo-1453695750324-073c9368f549?w=600&q=80',
  ],
  cleaning: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
    'https://images.unsplash.com/photo-1628177148941-934f6321e9e7?w=600&q=80',
    'https://images.unsplash.com/photo-1563453398552-8669630aa027?w=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426c89a8?w=600&q=80',
    'https://images.unsplash.com/photo-1585421514738-01798e327b74?w=600&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee6a37e?w=600&q=80',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
  ],
  cooking: [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
    'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&q=80',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    'https://images.unsplash.com/photo-1495521821757-a1fb6721e2c8?w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
  ],
  photography: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    'https://images.unsplash.com/photo-1471341971476-c15e5121a34c?w=600&q=80',
    'https://images.unsplash.com/photo-1452587925148-ce544f98ac4c?w=600&q=80',
    'https://images.unsplash.com/photo-1493863641943-9b68992a2e6b?w=600&q=80',
  ],
  music: [
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
    'https://images.unsplash.com/photo-1493225457124-aae18c08d998?w=600&q=80',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a378?w=600&q=80',
    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80',
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80',
  ],
  tutoring: [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    'https://images.unsplash.com/photo-1534438327276-14f69011718e?w=600&q=80',
    'https://images.unsplash.com/photo-1576678927484-cc907957fbb8?w=600&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=80',
  ],
  pets: [
    'https://images.unsplash.com/photo-1583337130417-171a1b3d8ecb?w=600&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7d54d?w=600&q=80',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80',
    'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
  ],
  repairs: [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80',
  ],
  transport: [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80',
    'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=600&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692761b70?w=600&q=80',
  ],
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1521791136064-7986c2920218?w=600&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
]

function imagesForCategory(slug: string, uniqueSeed: number): string[] {
  const pool = IMAGES_BY_SLUG[slug] ?? FALLBACK_IMAGES
  const i = Math.abs(uniqueSeed) % pool.length
  const primary = pool[i]!
  const secondary = pool.length > 1 ? pool[(i + 1) % pool.length]! : primary
  /* Втора снимка само ако е различна от първата */
  return secondary !== primary ? [primary, secondary] : [primary]
}

const NAMES: [string, string][] = [
  ['Виктория', 'Тодорова'], ['Николай', 'Георгиев'], ['Славена', 'Петрова'], ['Димитър', 'Ангелов'],
  ['Радослава', 'Маринова'], ['Калоян', 'Стефанов'], ['Михаела', 'Иванова'], ['Стоян', 'Николов'],
  ['Гергана', 'Димитрова'], ['Владимир', 'Колев'], ['Десислава', 'Георгиева'], ['Борис', 'Тодоров'],
  ['Пламена', 'Стоянова'], ['Александър', 'Василев'], ['Ивайла', 'Попова'], ['Кристиян', 'Митев'],
  ['Симона', 'Христова'], ['Мартин', 'Дончев'], ['Теодора', 'Захариева'], ['Йордан', 'Павлов'],
  ['Лилия', 'Кръстева'], ['Румен', 'Огнянов'], ['Павлина', 'Симеонова'], ['Георги', 'Младенов'],
  ['Невена', 'Борисова'], ['Цветан', 'Лазаров'], ['Марина', 'Асенова'], ['Христо', 'Генов'],
  ['Ваня', 'Цветкова'], ['Петко', 'Радев'], ['Емилия', 'Найденова'], ['Асен', 'Киров'],
  ['Даниела', 'Филипова'], ['Иво', 'Станков'], ['Ралица', 'Михайлова'], ['Тодор', 'Жеков'],
  ['Силвия', 'Атанасова'], ['Кирил', 'Димов'], ['Яна', 'Любомирова'], ['Златко', 'Пенев'],
  ['Моника', 'Славчева'], ['Веселин', 'Григоров'], ['Анелия', 'Карагьозова'], ['Огнян', 'Тошев'],
  ['Катерина', 'Манолова'], ['Любомир', 'Чакъров'], ['Николета', 'Велчева'],
]

function titleFor(cat: Pick<CategoryRow, 'name' | 'slug'>, city: string): string {
  const c = city
  switch (cat.slug) {
    case 'massage':     return `Професионален масаж в ${c} (60 мин.)`
    case 'sports':      return `Индивидуален спортен урок – ${c}`
    case 'cleaning':    return `Почистване на жилище – ${c}`
    case 'beauty':      return `Козметични услуги у дома – ${c}`
    case 'cooking':     return `Личен готвач / кетъринг – ${c}`
    case 'photography': return `Фотосесия и обработка – ${c}`
    case 'music':       return `Музикални уроци – ${c}`
    case 'tutoring':    return `Репетиторство и обучение – ${c}`
    case 'fitness':     return `Персонален фитнес треньор – ${c}`
    case 'pets':        return `Гледане и разходка на домашни любимци – ${c}`
    case 'repairs':     return `Майстор за битови ремонти – ${c}`
    case 'transport':   return `Трансфер и превоз – ${c}`
    default:            return `Услуга – ${c}`
  }
}

function descFor(cat: Pick<CategoryRow, 'name' | 'slug'>, city: string, name: string): string {
  return `Опитен доставчик в категория „${cat.name}“ в град ${city}. ${name} работи с клиенти лично или у дома, по предварителна уговорка. Можете да резервирате час през Vikni.me.`
}

function build(): { profiles: ProfileRow[]; services: MockServiceWithJoin[] } {
  const profiles: ProfileRow[] = []
  const services: MockServiceWithJoin[] = []
  const base = new Date('2024-08-01T10:00:00Z').toISOString()

  for (let n = 6; n <= 50; n++) {
    const idx = n - 6
    const [fn, ln] = NAMES[idx]!
    const fullName = `${fn} ${ln}`
    const id = `supplier-${n}`
    const city = BG_ALL_BG_CITIES[(idx * 13 + n) % BG_ALL_BG_CITIES.length]!
    const cat = CAT[idx % CAT.length]!
    const email = `supplier${n}@demo.vikni.me`
    const phone = `+359 8${8 + (n % 2)} ${String(200 + n).padStart(3, '0')} ${String(100 + (n * 7) % 900).padStart(3, '0')} ${String(50 + (n * 3) % 900).padStart(3, '0')}`

    profiles.push({
      id,
      email,
      full_name: fullName,
      avatar_url: null,
      phone,
      role: 'supplier',
      bio: `Професионалист в областта „${cat.name}“. Базиран в ${city}. Работя с физически лица и малки фирми.`,
      location: city,
      credits: 0,
      is_verified: idx % 4 !== 1,
      created_at: base,
      updated_at: new Date(2025, 3, 1 + (idx % 20), 12, 0).toISOString(),
    })

    const price = 35 + (idx * 17) % 200
    const priceType = idx % 11 === 0 ? 'negotiable' : idx % 5 === 0 ? 'hourly' : 'fixed'

    services.push({
      id: `svc-gen-${n}`,
      supplier_id: id,
      category_id: cat.id,
      title: titleFor(cat, city),
      description: descFor(cat, city, fullName),
      price: priceType === 'negotiable' ? 0 : price,
      price_type: priceType,
      images: imagesForCategory(cat.slug, idx * 31 + n * 7),
      location: city,
      lat: null,
      lng: null,
      is_active: true,
      avg_rating: Math.round((4.2 + (idx % 8) / 10) * 10) / 10,
      review_count: idx % 40,
      created_at: base,
      updated_at: new Date(2025, 4, 1 + (idx % 15), 10, 0).toISOString(),
      profiles: { id, full_name: fullName, avatar_url: null },
      categories: cat,
    })
  }

  return { profiles, services }
}

export const { profiles: MOCK_GENERATED_SUPPLIERS, services: MOCK_GENERATED_SERVICES } = build()
