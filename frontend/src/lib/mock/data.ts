import type { ProfileRow, CategoryRow, ServiceRow, BookingRow, ReviewRow, NotificationRow } from '@/types/database'

/* ─────────────────────────────────────────────────────────────
   PROFILES / USERS
───────────────────────────────────────────────────────────── */
export const MOCK_PROFILES: ProfileRow[] = [
  {
    id: 'user-customer-1',
    email: 'demo@vikni.me',
    full_name: 'Иван Петров',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ivan',
    phone: '+359 88 123 4567',
    role: 'customer',
    bio: 'Обичам да пробвам нови услуги и да срещам интересни хора.',
    location: 'София',
    credits: 250,
    is_verified: true,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-03-15T14:30:00Z',
  },
  {
    id: 'supplier-1',
    email: 'maria@vikni.me',
    full_name: 'Мария Николова',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria',
    phone: '+359 87 234 5678',
    role: 'supplier',
    bio: 'Сертифициран масажист с над 8 години опит в спортния и релаксиращ масаж. Работя с индивидуален подход към всеки клиент.',
    location: 'София, кв. Лозенец',
    credits: 0,
    is_verified: true,
    created_at: '2024-11-05T09:00:00Z',
    updated_at: '2025-04-01T11:00:00Z',
  },
  {
    id: 'supplier-2',
    email: 'georgi@vikni.me',
    full_name: 'Георги Стоянов',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Georgi',
    phone: '+359 89 345 6789',
    role: 'supplier',
    bio: 'Ски инструктор с 12+ години опит в Банско и Боровец. Работя с деца от 4 г. и с напреднали скиори.',
    location: 'Банско',
    credits: 0,
    is_verified: true,
    created_at: '2024-10-20T08:00:00Z',
    updated_at: '2025-02-10T16:00:00Z',
  },
  {
    id: 'supplier-3',
    email: 'elena@vikni.me',
    full_name: 'Елена Димитрова',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena',
    phone: '+359 88 456 7890',
    role: 'supplier',
    bio: 'Фотограф с 6 г. опит — сватби, портрети, корпоративни снимки. Работя с естествена светлина и разказвам истории.',
    location: 'Пловдив',
    credits: 0,
    is_verified: true,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2025-03-20T12:00:00Z',
  },
  {
    id: 'supplier-4',
    email: 'petar@vikni.me',
    full_name: 'Петър Иванов',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Petar',
    phone: '+359 87 567 8901',
    role: 'supplier',
    bio: 'Личен готвач — готвя у вас за специални поводи, семейни вечери или корпоративни събития. Спец. в средиземноморска кухня.',
    location: 'Варна',
    credits: 0,
    is_verified: true,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-04-10T09:00:00Z',
  },
  {
    id: 'supplier-5',
    email: 'ana@vikni.me',
    full_name: 'Ана Костова',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana',
    phone: '+359 89 678 9012',
    role: 'supplier',
    bio: 'Персонален треньор, сертифициран по NASM. Тренировки у дома или в залата — изграждам програма специално за теб.',
    location: 'София, кв. Витоша',
    credits: 0,
    is_verified: true,
    created_at: '2025-02-01T11:00:00Z',
    updated_at: '2025-04-15T10:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@vikni.me',
    full_name: 'Администратор',
    avatar_url: null,
    phone: null,
    role: 'admin',
    bio: null,
    location: null,
    credits: 0,
    is_verified: true,
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
]

export const MOCK_CUSTOMER = MOCK_PROFILES[0]

/* ─────────────────────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────────────────────── */
export const MOCK_CATEGORIES: CategoryRow[] = [
  { id: 'cat-1', name: 'Масаж',          slug: 'massage',     icon: '💆', parent_id: null, sort_order: 1,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-2', name: 'Ски & Сноуборд', slug: 'sports',      icon: '⛷️', parent_id: null, sort_order: 2,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-3', name: 'Почистване',     slug: 'cleaning',    icon: '🧹', parent_id: null, sort_order: 3,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-4', name: 'Красота',        slug: 'beauty',      icon: '💅', parent_id: null, sort_order: 4,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-5', name: 'Готвач',         slug: 'cooking',     icon: '🍳', parent_id: null, sort_order: 5,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-6', name: 'Фотография',     slug: 'photography', icon: '📷', parent_id: null, sort_order: 6,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-7', name: 'Музика',         slug: 'music',       icon: '🎵', parent_id: null, sort_order: 7,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-8', name: 'Обучение',       slug: 'tutoring',    icon: '📚', parent_id: null, sort_order: 8,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-9', name: 'Фитнес',         slug: 'fitness',     icon: '🏋️', parent_id: null, sort_order: 9,  created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-10', name: 'Животни',       slug: 'pets',        icon: '🐾', parent_id: null, sort_order: 10, created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-11', name: 'Ремонти',       slug: 'repairs',     icon: '🔧', parent_id: null, sort_order: 11, created_at: '2024-09-01T00:00:00Z' },
  { id: 'cat-12', name: 'Транспорт',     slug: 'transport',   icon: '🚗', parent_id: null, sort_order: 12, created_at: '2024-09-01T00:00:00Z' },
]

/* ─────────────────────────────────────────────────────────────
   SERVICES
───────────────────────────────────────────────────────────── */
export const MOCK_SERVICES: (ServiceRow & {
  profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>
  categories: Pick<CategoryRow, 'id' | 'name' | 'slug' | 'icon'>
})[] = [
  {
    id: 'svc-1',
    supplier_id: 'supplier-1',
    category_id: 'cat-1',
    title: 'Релаксиращ масаж у дома (60 мин.)',
    description: 'Пълно отпускане на тялото с ароматерапия и топло масажно масло. Идвам при вас с масажна маса. Подходящ след дълга работна седмица или като подарък за любим човек.',
    price: 80,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
    ],
    location: 'София (цяла)',
    lat: 42.6977,
    lng: 23.3219,
    is_active: true,
    avg_rating: 4.9,
    review_count: 47,
    created_at: '2024-11-10T10:00:00Z',
    updated_at: '2025-04-01T11:00:00Z',
    profiles:   { id: 'supplier-1', full_name: 'Мария Николова',  avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria' },
    categories: { id: 'cat-1', name: 'Масаж', slug: 'massage', icon: '💆' },
  },
  {
    id: 'svc-2',
    supplier_id: 'supplier-1',
    category_id: 'cat-1',
    title: 'Спортен масаж (90 мин.) – преди/след тренировка',
    description: 'Дълбок тъканен масаж за спортисти. Работя върху мускулни напрежения, лошо кръвообращение и болки. Нося необходимите маслА и оборудване.',
    price: 110,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
    ],
    location: 'София, Лозенец',
    lat: 42.678,
    lng: 23.328,
    is_active: true,
    avg_rating: 4.8,
    review_count: 23,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2025-03-20T09:00:00Z',
    profiles:   { id: 'supplier-1', full_name: 'Мария Николова',  avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria' },
    categories: { id: 'cat-1', name: 'Масаж', slug: 'massage', icon: '💆' },
  },
  {
    id: 'svc-3',
    supplier_id: 'supplier-2',
    category_id: 'cat-2',
    title: 'Ски урок за начинаещи – Банско (2 часа)',
    description: 'Научи се да скиираш от нулата! Индивидуален или групов урок (до 3 души). Включва: оборудване, ски лифт карта за учебната зона. Работя с деца от 4 г. и възрастни.',
    price: 120,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
      'https://images.unsplash.com/photo-1565992441121-4367a2aaaefe?w=600&q=80',
    ],
    location: 'Банско',
    lat: 41.836,
    lng: 23.486,
    is_active: true,
    avg_rating: 5.0,
    review_count: 61,
    created_at: '2024-10-25T10:00:00Z',
    updated_at: '2025-02-15T09:00:00Z',
    profiles:   { id: 'supplier-2', full_name: 'Георги Стоянов', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Georgi' },
    categories: { id: 'cat-2', name: 'Ски & Сноуборд', slug: 'sports', icon: '⛷️' },
  },
  {
    id: 'svc-4',
    supplier_id: 'supplier-2',
    category_id: 'cat-2',
    title: 'Ски урок напреднали – фрийрайд & слалом',
    description: 'За скиори с опит, искащи да подобрят техниката. Работим в зони извън писти, фрийрайд линии или на специализирани пистови секции.',
    price: 150,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=600&q=80',
    ],
    location: 'Банско / Боровец',
    lat: 41.836,
    lng: 23.486,
    is_active: true,
    avg_rating: 4.9,
    review_count: 38,
    created_at: '2024-10-28T10:00:00Z',
    updated_at: '2025-03-01T10:00:00Z',
    profiles:   { id: 'supplier-2', full_name: 'Георги Стоянов', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Georgi' },
    categories: { id: 'cat-2', name: 'Ски & Сноуборд', slug: 'sports', icon: '⛷️' },
  },
  {
    id: 'svc-5',
    supplier_id: 'supplier-3',
    category_id: 'cat-6',
    title: 'Сватбена фотография – пълен ден',
    description: 'Пълно покритие на вашия специален ден – от подготовка сутринта до края на вечерта. Получавате 400+ обработени снимки в онлайн галерия в рамките на 3 седмици.',
    price: 1200,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80',
    ],
    location: 'Пловдив и региона',
    lat: 42.135,
    lng: 24.745,
    is_active: true,
    avg_rating: 5.0,
    review_count: 19,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2025-04-05T11:00:00Z',
    profiles:   { id: 'supplier-3', full_name: 'Елена Димитрова', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena' },
    categories: { id: 'cat-6', name: 'Фотография', slug: 'photography', icon: '📷' },
  },
  {
    id: 'svc-6',
    supplier_id: 'supplier-3',
    category_id: 'cat-6',
    title: 'Портретна фотосесия – 2 часа',
    description: 'Индивидуална или семейна фотосесия на открито или в студио. Включва 30 обработени снимки в цифров формат с право на печат.',
    price: 250,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    ],
    location: 'Пловдив',
    lat: 42.135,
    lng: 24.745,
    is_active: true,
    avg_rating: 4.7,
    review_count: 31,
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2025-03-15T12:00:00Z',
    profiles:   { id: 'supplier-3', full_name: 'Елена Димитрова', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena' },
    categories: { id: 'cat-6', name: 'Фотография', slug: 'photography', icon: '📷' },
  },
  {
    id: 'svc-7',
    supplier_id: 'supplier-4',
    category_id: 'cat-5',
    title: 'Личен готвач за вечеря (до 8 души)',
    description: 'Приготвям изискана 3-курсова вечеря у вас. Пазарувам продуктите, готвя, сервирам и почиствам. Менюто се договаря предварително. Средиземноморска, азиатска или традиционна кухня.',
    price: 350,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
      'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&q=80',
    ],
    location: 'Варна',
    lat: 43.204,
    lng: 27.910,
    is_active: true,
    avg_rating: 4.8,
    review_count: 14,
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-04-12T09:00:00Z',
    profiles:   { id: 'supplier-4', full_name: 'Петър Иванов',    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Petar' },
    categories: { id: 'cat-5', name: 'Готвач', slug: 'cooking', icon: '🍳' },
  },
  {
    id: 'svc-8',
    supplier_id: 'supplier-4',
    category_id: 'cat-5',
    title: 'Кулинарен урок у вас (2 часа)',
    description: 'Научи се да готвиш с личен готвач! Избираш кухня (италианска, японска, гръцка...) и правим заедно 2–3 ястия, след което ги хапваме заедно.',
    price: 120,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
    ],
    location: 'Варна',
    lat: 43.204,
    lng: 27.910,
    is_active: true,
    avg_rating: 4.6,
    review_count: 9,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-04-01T10:00:00Z',
    profiles:   { id: 'supplier-4', full_name: 'Петър Иванов',    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Petar' },
    categories: { id: 'cat-5', name: 'Готвач', slug: 'cooking', icon: '🍳' },
  },
  {
    id: 'svc-9',
    supplier_id: 'supplier-5',
    category_id: 'cat-9',
    title: 'Персонална тренировка у вас (60 мин.)',
    description: 'Изготвям индивидуална програма съобразена с твоите цели – отслабване, мускулна маса или издръжливост. Идвам с оборудване (гири, ластици, мат).',
    price: 70,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    ],
    location: 'София',
    lat: 42.6977,
    lng: 23.3219,
    is_active: true,
    avg_rating: 4.9,
    review_count: 52,
    created_at: '2025-02-05T10:00:00Z',
    updated_at: '2025-04-15T10:00:00Z',
    profiles:   { id: 'supplier-5', full_name: 'Ана Костова',     avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana' },
    categories: { id: 'cat-9', name: 'Фитнес', slug: 'fitness', icon: '🏋️' },
  },
  {
    id: 'svc-10',
    supplier_id: 'supplier-5',
    category_id: 'cat-9',
    title: 'Онлайн фитнес програма + консултация',
    description: '4-седмична тренировъчна програма + хранителен план, изготвени специално за теб. Включва 2 видео разговора за проследяване на прогреса.',
    price: 200,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    ],
    location: 'Онлайн',
    lat: null,
    lng: null,
    is_active: true,
    avg_rating: 4.7,
    review_count: 28,
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2025-04-10T10:00:00Z',
    profiles:   { id: 'supplier-5', full_name: 'Ана Костова',     avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana' },
    categories: { id: 'cat-9', name: 'Фитнес', slug: 'fitness', icon: '🏋️' },
  },
  {
    id: 'svc-11',
    supplier_id: 'supplier-1',
    category_id: 'cat-4',
    title: 'Маникюр + педикюр у дома',
    description: 'Класически маникюр и педикюр с OPI лакове. Идвам при вас с пълен комплект инструменти. Включва масаж на ходилата.',
    price: 65,
    price_type: 'fixed',
    images: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    ],
    location: 'София',
    lat: 42.6977,
    lng: 23.3219,
    is_active: true,
    avg_rating: 4.6,
    review_count: 18,
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-04-01T11:00:00Z',
    profiles:   { id: 'supplier-1', full_name: 'Мария Николова',  avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria' },
    categories: { id: 'cat-4', name: 'Красота', slug: 'beauty', icon: '💅' },
  },
  {
    id: 'svc-12',
    supplier_id: 'supplier-3',
    category_id: 'cat-6',
    title: 'Корпоративна фотография (продуктова/офис)',
    description: 'Снимки за уеб сайт, социални мрежи или рекламни материали. Обработка в рамките на 5 работни дни. Включва 50 снимки.',
    price: 400,
    price_type: 'negotiable',
    images: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    ],
    location: 'Пловдив / По договаряне',
    lat: 42.135,
    lng: 24.745,
    is_active: true,
    avg_rating: 4.5,
    review_count: 7,
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2025-04-08T10:00:00Z',
    profiles:   { id: 'supplier-3', full_name: 'Елена Димитрова', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena' },
    categories: { id: 'cat-6', name: 'Фотография', slug: 'photography', icon: '📷' },
  },
]

/* ─────────────────────────────────────────────────────────────
   BOOKINGS
───────────────────────────────────────────────────────────── */
export const MOCK_BOOKINGS: (BookingRow & {
  service: Pick<ServiceRow, 'id' | 'title' | 'images' | 'price_type'>
  supplier: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>
  customer: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>
})[] = [
  {
    id: 'booking-1',
    service_id: 'svc-1',
    customer_id: 'user-customer-1',
    supplier_id: 'supplier-1',
    status: 'confirmed',
    scheduled_at: '2025-05-10T11:00:00Z',
    notes: 'Моля донесете масажна маса. Имам алергия към лавандулово масло.',
    price: 80,
    created_at: '2025-05-02T09:00:00Z',
    updated_at: '2025-05-02T10:00:00Z',
    service:  { id: 'svc-1', title: 'Релаксиращ масаж у дома (60 мин.)', images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80'], price_type: 'fixed' },
    supplier: { id: 'supplier-1', full_name: 'Мария Николова',  avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria' },
    customer: { id: 'user-customer-1', full_name: 'Иван Петров', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ivan' },
  },
  {
    id: 'booking-2',
    service_id: 'svc-3',
    customer_id: 'user-customer-1',
    supplier_id: 'supplier-2',
    status: 'completed',
    scheduled_at: '2025-04-15T09:00:00Z',
    notes: null,
    price: 120,
    created_at: '2025-04-10T08:00:00Z',
    updated_at: '2025-04-15T14:00:00Z',
    service:  { id: 'svc-3', title: 'Ски урок за начинаещи – Банско (2 часа)', images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80'], price_type: 'fixed' },
    supplier: { id: 'supplier-2', full_name: 'Георги Стоянов', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Georgi' },
    customer: { id: 'user-customer-1', full_name: 'Иван Петров', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ivan' },
  },
  {
    id: 'booking-3',
    service_id: 'svc-9',
    customer_id: 'user-customer-1',
    supplier_id: 'supplier-5',
    status: 'pending',
    scheduled_at: '2025-05-15T08:00:00Z',
    notes: 'Предпочитам тренировка за горна половина на тялото.',
    price: 70,
    created_at: '2025-05-04T07:00:00Z',
    updated_at: '2025-05-04T07:00:00Z',
    service:  { id: 'svc-9', title: 'Персонална тренировка у вас (60 мин.)', images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'], price_type: 'fixed' },
    supplier: { id: 'supplier-5', full_name: 'Ана Костова', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana' },
    customer: { id: 'user-customer-1', full_name: 'Иван Петров', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ivan' },
  },
  {
    id: 'booking-4',
    service_id: 'svc-7',
    customer_id: 'user-customer-1',
    supplier_id: 'supplier-4',
    status: 'cancelled',
    scheduled_at: '2025-04-20T19:00:00Z',
    notes: null,
    price: 350,
    created_at: '2025-04-08T14:00:00Z',
    updated_at: '2025-04-12T09:00:00Z',
    service:  { id: 'svc-7', title: 'Личен готвач за вечеря (до 8 души)', images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80'], price_type: 'fixed' },
    supplier: { id: 'supplier-4', full_name: 'Петър Иванов',    avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Petar' },
    customer: { id: 'user-customer-1', full_name: 'Иван Петров', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ivan' },
  },
]

/* ─────────────────────────────────────────────────────────────
   REVIEWS
───────────────────────────────────────────────────────────── */
export const MOCK_REVIEWS: (ReviewRow & {
  reviewer: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>
})[] = [
  {
    id: 'rev-1', booking_id: 'booking-2', reviewer_id: 'user-customer-1',
    reviewee_id: 'supplier-2', service_id: 'svc-3', rating: 5,
    comment: 'Георги е невероятен инструктор! За 2 часа се научих да каравам. Много търпелив и мотивиращ. Определено ще се запиша пак!',
    created_at: '2025-04-16T10:00:00Z',
    reviewer: { id: 'user-customer-1', full_name: 'Иван Петров', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ivan' },
  },
  {
    id: 'rev-2', booking_id: 'b-ext-1', reviewer_id: 'u-ext-1',
    reviewee_id: 'supplier-1', service_id: 'svc-1', rating: 5,
    comment: 'Мария е изключително професионална! Масажът беше перфектен – точно толкова силен, колкото исках. Ще я препоръчам на всички приятели.',
    created_at: '2025-04-20T14:00:00Z',
    reviewer: { id: 'u-ext-1', full_name: 'Стела Петрова', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Stela' },
  },
  {
    id: 'rev-3', booking_id: 'b-ext-2', reviewer_id: 'u-ext-2',
    reviewee_id: 'supplier-1', service_id: 'svc-1', rating: 5,
    comment: 'Фантастично изживяване! Много релаксиращо и доставчикът е изключително приятен и професионален.',
    created_at: '2025-04-10T11:00:00Z',
    reviewer: { id: 'u-ext-2', full_name: 'Никола Ангелов', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nikola' },
  },
  {
    id: 'rev-4', booking_id: 'b-ext-3', reviewer_id: 'u-ext-3',
    reviewee_id: 'supplier-3', service_id: 'svc-5', rating: 5,
    comment: 'Елена е невероятен фотограф! Снимките от сватбата ни са магически. Всеки детайл е уловен перфектно.',
    created_at: '2025-03-28T15:00:00Z',
    reviewer: { id: 'u-ext-3', full_name: 'Диана & Христо', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Diana' },
  },
  {
    id: 'rev-5', booking_id: 'b-ext-4', reviewer_id: 'u-ext-4',
    reviewee_id: 'supplier-5', service_id: 'svc-9', rating: 5,
    comment: 'Ана е невероятен треньор! Много мотивираща, вижда слабостите ти и ги работи умело. За 2 месеца с нея резултатите са видими!',
    created_at: '2025-04-30T09:00:00Z',
    reviewer: { id: 'u-ext-4', full_name: 'Борислав Тодоров', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Borislav' },
  },
  {
    id: 'rev-6', booking_id: 'b-ext-5', reviewer_id: 'u-ext-5',
    reviewee_id: 'supplier-4', service_id: 'svc-7', rating: 5,
    comment: 'Петър приготви невероятна вечеря за рождения ден на жена ми. Гостите бяха впечатлени. Меню, атмосфера, вкус – всичко беше перфектно!',
    created_at: '2025-04-18T20:00:00Z',
    reviewer: { id: 'u-ext-5', full_name: 'Красимир Йорданов', avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Krasimir' },
  },
]

/* ─────────────────────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────────────────────── */
export const MOCK_NOTIFICATIONS: NotificationRow[] = [
  {
    id: 'notif-1',
    user_id: 'user-customer-1',
    type: 'booking_confirmed',
    title: 'Резервацията е потвърдена ✓',
    body: 'Мария Николова потвърди вашата резервация за 10 май в 11:00 ч.',
    data: { booking_id: 'booking-1' },
    is_read: false,
    created_at: '2025-05-02T10:05:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-customer-1',
    type: 'new_message',
    title: 'Ново съобщение от Мария Николова',
    body: 'Здравейте! Потвърждавам часа. Имате ли предпочитания за масажно масло?',
    data: { booking_id: 'booking-1', sender_id: 'supplier-1' },
    is_read: false,
    created_at: '2025-05-02T10:30:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-customer-1',
    type: 'promo',
    title: '🎉 Специална оферта',
    body: 'Получи 15% отстъпка при следваща резервация с промокод VIKNI15.',
    data: null,
    is_read: true,
    created_at: '2025-05-01T12:00:00Z',
  },
  {
    id: 'notif-4',
    user_id: 'user-customer-1',
    type: 'booking_reminder',
    title: 'Напомняне за резервация ⏰',
    body: 'Утре в 11:00 ч. имате резервиран масаж при Мария Николова.',
    data: { booking_id: 'booking-1' },
    is_read: true,
    created_at: '2025-05-09T09:00:00Z',
  },
  {
    id: 'notif-5',
    user_id: 'user-customer-1',
    type: 'review_request',
    title: 'Оцени услугата',
    body: 'Как беше ски урокът при Георги Стоянов? Остави отзив!',
    data: { booking_id: 'booking-2', service_id: 'svc-3' },
    is_read: true,
    created_at: '2025-04-15T16:00:00Z',
  },
]

/* ─────────────────────────────────────────────────────────────
   MESSAGES (for chat)
───────────────────────────────────────────────────────────── */
export const MOCK_MESSAGES: Array<{
  id: string; booking_id: string; sender_id: string;
  body: string; is_read: boolean; created_at: string;
}> = [
  {
    id: 'msg-1',
    booking_id: 'booking-1',
    sender_id: 'user-customer-1',
    body: 'Здравейте! Исках да потвърдя резервацията за 10 май. Имам алергия към лавандулово масло – може ли да ползвате друго?',
    is_read: true,
    created_at: '2025-05-02T09:15:00Z',
  },
  {
    id: 'msg-2',
    booking_id: 'booking-1',
    sender_id: 'supplier-1',
    body: 'Здравейте! Разбира се, ще ползваме масло от жожоба или кокос – кое предпочитате?',
    is_read: true,
    created_at: '2025-05-02T09:45:00Z',
  },
  {
    id: 'msg-3',
    booking_id: 'booking-1',
    sender_id: 'user-customer-1',
    body: 'Кокосово ще е чудесно, благодаря! До 10-ти 🙂',
    is_read: true,
    created_at: '2025-05-02T10:00:00Z',
  },
  {
    id: 'msg-4',
    booking_id: 'booking-1',
    sender_id: 'supplier-1',
    body: 'Здравейте! Потвърждавам часа. Имате ли предпочитания за масажно масло?',
    is_read: false,
    created_at: '2025-05-02T10:30:00Z',
  },
]

/* ─────────────────────────────────────────────────────────────
   HELPER FINDERS
───────────────────────────────────────────────────────────── */
export function findService(id: string)   { return MOCK_SERVICES.find(s => s.id === id) ?? null }
export function findProfile(id: string)   { return MOCK_PROFILES.find(p => p.id === id) ?? null }
export function findCategory(slug: string){ return MOCK_CATEGORIES.find(c => c.slug === slug) ?? null }

export function getServicesByCategory(slug: string) {
  const cat = findCategory(slug)
  if (!cat) return []
  return MOCK_SERVICES.filter(s => s.category_id === cat.id)
}

export function getServicesBySupplier(supplierId: string) {
  return MOCK_SERVICES.filter(s => s.supplier_id === supplierId)
}

export function getReviewsForService(serviceId: string) {
  return MOCK_REVIEWS.filter(r => r.service_id === serviceId)
}

export function getReviewsForSupplier(supplierId: string) {
  return MOCK_REVIEWS.filter(r => r.reviewee_id === supplierId)
}

export function searchServices(query: string, filters?: { categorySlug?: string; minPrice?: number; maxPrice?: number; location?: string }) {
  const q = query.toLowerCase()
  return MOCK_SERVICES.filter(s => {
    if (!s.is_active) return false
    if (q && !s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false
    if (filters?.categorySlug) {
      const cat = findCategory(filters.categorySlug)
      if (cat && s.category_id !== cat.id) return false
    }
    if (filters?.minPrice !== undefined && s.price < filters.minPrice) return false
    if (filters?.maxPrice !== undefined && s.price > filters.maxPrice) return false
    if (filters?.location && s.location && !s.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    return true
  })
}
