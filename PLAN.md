# VikniMe Frontend — Пълен план по фази

> **Платформи:** PWA (мобилен + таблет) + пълноценен desktop уеб сайт — единна кодова база React 19.
> **Папка:** `frontend/` в главната директория на проекта.

---

## Какво е VikniMe?

Marketplace за услуги (масажисти, ски учители, гидове, кетъринг и др.), в който:
- **Клиентите** търсят, филтрират и резервират услуги
- **Доставчиците** (всеки клиент, който се е записал) публикуват и управляват услугите си
- **Администраторът** управлява платформата изцяло

---

## Технологичен стек

### Core
- **Framework:** React 19 + TypeScript, scaffolded с Vite
- **Routing:** React Router v7
- **Backend / БД / Auth:** Supabase (`@supabase/supabase-js`)
  - Автентикация: Supabase Auth (имейл + парола, Google OAuth, Facebook OAuth)
  - База данни: Supabase Postgres
  - Файлове/снимки: Supabase Storage
  - Realtime: Supabase Realtime (live чат, известия)

### PWA
- **`vite-plugin-pwa`** + **Workbox** — Service Worker, прекеширане, offline режим
- **Web App Manifest** — installable app, splash screen, standalone display
- **Push Notifications** — Web Push API чрез Supabase Edge Functions (VAPID)
- **Background Sync** — Workbox за съобщения изпратени offline
- **Safe Area Insets** — `env(safe-area-inset-*)` за notch, home bar, Dynamic Island
- **Apple PWA мета тагове** — `apple-mobile-web-app-capable`, touch icons, startup images
- **PWA иконки:** 72, 96, 128, 144, 152, 192, 384, 512px + maskable + apple-touch-icon (180px)

### UI / Стилизиране
- **Tailwind CSS v4** — utility-first, mobile-first
- **shadcn/ui** — headless компоненти (Dialog, Select, Tabs и др.)
- **Framer Motion v12** — анимации, page transitions, spring physics, gesture animations
- **Vaul** — native-like bottom drawer/sheet
- **Sonner** — toast известия (modern, animated)
- **CSS View Transitions API** — плавни преходи между страници

### Жестове и Mobile UX
- **`@use-gesture/react`** — swipe back, pull-to-refresh, drag, pinch
- **Haptic Feedback** — `navigator.vibrate()`
- **Momentum Scrolling** — `overscroll-behavior: contain`
- **Skeleton Loaders** — вместо спинери
- **Optimistic UI** — TanStack Query optimistic updates

### Форми и Данни
- **React Hook Form + Zod** — форми и валидация
- **TanStack Query v5** — сървърен стейт, кеширане, infinite scroll
- **TanStack Table** — таблици в Admin панела
- **Zustand** — глобален стейт (auth, notifications, UI)
- **date-fns** + **React DayPicker** — календар и date/time picker
- **Lucide React** — икони

### Допълнителни функции
- **`react-image-crop`** — кропване на профилна снимка
- **`react-dropzone`** — drag & drop / камера upload за снимки
- **Geolocation API** — "Моята локация"
- **Web Share API** — `navigator.share()` за native споделяне
- **MapLibre GL JS** (`maplibre-gl`) — интерактивна карта
- **`react-helmet-async`** — dynamic SEO meta / Open Graph тагове

---

## Маршрути на приложението

```
── Публични ────────────────────────────────────────────
/                          → Начална страница
/search                    → Търсене + Филтри + Карта
/category/:slug            → Услуги по категория (filtered Search)
/service/:id               → Детайли + Резервиране на услуга
/supplier/:id              → Публичен профил на доставчик
/terms                     → Условия за ползване
/privacy                   → Политика за поверителност

── Auth ────────────────────────────────────────────────
/signin                    → Вход / Регистрация
/auth/callback             → OAuth callback (Supabase)
/forgot-password           → Забравена парола
/reset-password            → Нова парола (от email link)
/verify-email              → Верификация на имейл

── Защитени (изисква вход) ─────────────────────────────
/my-bookings               → Моите резервации
/my-bookings/:id           → Детайли на резервация
/my-services               → Моите услуги
/my-services/add           → Добавяне на нова услуга
/my-services/:id           → Преглед на услуга
/my-services/:id/edit      → Редактиране на услуга
/messages                  → Списък с съобщения
/messages/:threadId        → Чат
/notifications             → Всички известия
/profile                   → Профил
/profile/personal-info     → Лична информация
/profile/payments          → Плащания & Изплащания
/profile/payments/card     → Платежна карта
/profile/payments/payout   → Изплащане / IBAN
/profile/credits           → Кредити / Wallet
/profile/notification-settings → Настройки за известия

── Admin (само за admin роля) ───────────────────────────
/admin                     → Admin Dashboard
/admin/users               → Управление на потребители
/admin/services            → Управление на услуги
/admin/bookings            → Управление на резервации
/admin/reviews             → Управление на отзиви
/admin/categories          → Управление на категории
/admin/support             → Поддръжка
/admin/enrollments         → Pending enrollment requests

── System ───────────────────────────────────────────────
/404                       → Not Found
/offline                   → Offline fallback (Service Worker)
```

---

## Responsive стратегия

| Breakpoint | Навигация | Layout |
|---|---|---|
| `< 768px` | BottomNavBar fixed | Single column, full-width |
| `768–1023px` | BottomNavBar fixed | 2-col grid за cards |
| `≥ 1024px` | TopNav + Left Sidebar | Multi-column, max-width 1400px centered |

**Desktop-специфични layouts:**
- **Homepage:** Hero banner + 4-col grid за услуги, 6-col за категории
- **Search:** Left sidebar с филтри (постоянно видими) + right content + Map toggle
- **Service Detail:** 2-column (gallery + info/booking form side by side)
- **Messages:** Persistent split-view (thread list 360px + chat area)
- **Profile:** Left sidebar меню + right content area
- **My Bookings:** 3-col card grid
- **Admin:** Full sidebar + data-rich tables с TanStack Table

---

## Структура на папките

```
frontend/
  public/
    robots.txt
    sitemap.xml
    icons/          ← PWA иконки (всички размери)
    splash/         ← Apple startup images
  scripts/
    seed.ts         ← Тестови данни за Supabase
  src/
    components/
      ui/           ← shadcn/ui примитиви
      layout/       ← AppShell, BottomNavBar, TopNav, AnimatedPage, Footer
    features/       ← модули (auth, home, search, bookings, ...)
    hooks/          ← useHaptic, usePullToRefresh, useOnlineStatus, useBreakpoint...
    lib/
      supabase.ts   ← Supabase клиент
      env.ts        ← Zod env валидация
      motion.ts     ← Framer Motion page transition variants
      utils.ts
    store/          ← Zustand (authStore, notificationStore, uiStore)
    styles/
      theme.css     ← Tailwind v4 @theme токени
    types/
      supabase.ts   ← генерирани типове от Supabase CLI
    router.tsx
    main.tsx
  .env.example
  .env.local        ← (gitignored)
  index.html
  vite.config.ts
  tailwind.config.ts
```

---

## Фаза 1 — Настройка на проекта и основа

**Цел:** Работещ PWA скелет с routing, layout, анимации и Supabase Auth.

**Scaffold и инсталации**
- `npm create vite@latest frontend -- --template react-ts`
- Инсталиране: Tailwind v4, shadcn/ui, Framer Motion v12, Vaul, Sonner, React Router v7, Zustand, TanStack Query v5, TanStack Table, React Hook Form, Zod, date-fns, React DayPicker, Lucide React, @use-gesture/react, vite-plugin-pwa, @supabase/supabase-js, react-helmet-async, maplibre-gl, react-map-gl, react-image-crop, react-dropzone

**Environment конфигурация**
- `.env.example`:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_VAPID_PUBLIC_KEY=
  ```
- `src/lib/env.ts` — Zod валидация при стартиране (crash early ако липсва конфигурация)

**PWA конфигурация**
- `vite-plugin-pwa` + Workbox: `NetworkFirst` за API, `CacheFirst` за assets
- `manifest.webmanifest`: `display: standalone`, theme/background colors, пълен комплект иконки
- Apple PWA мета тагове в `index.html`
- `<meta viewport content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Safe area CSS: `padding: env(safe-area-inset-*)`

**Supabase интеграция**
- `src/lib/supabase.ts` — клиент
- `AuthStore` (Zustand): `supabase.auth.onAuthStateChange` → `user`, `session`, `isLoggedIn`, `isSupplier`, `isAdmin`, `logout()`
- `ProtectedRoute` — проверява сесията, redirect към `/signin`
- `AdminRoute` — проверява `isAdmin`, redirect към `/`

**Code splitting**
- `React.lazy()` + `Suspense` за всяка route-level страница
- `<Suspense fallback={<PageSkeleton />}>` обвива router outlet
- Vite `manualChunks` за vendor chunks

**Layouts и навигация**
- `AppShell` — мобилно: max-width 430px; десктоп: full-width 1400px max
- `PublicLayout` — `ResponsiveHeader` + `Footer` (десктоп)
- `AuthLayout` — `useBreakpoint()` → `BottomNavBar` (< 1024px) или `TopNav + LeftSidebar` (≥ 1024px)
- `AdminLayout` — постоянен sidebar + breadcrumbs
- `BottomNavBar` — fixed, `bottom: env(safe-area-inset-bottom)`, backdrop-blur, badge (Framer Motion pop), haptic
- `TopNav` — лого, nav links, notifications bell, avatar dropdown
- `LeftSidebar` — collapsible, icons + labels
- `AnimatedPage` — Framer Motion `AnimatePresence` slide/fade transitions
- `Footer` — лого, links (Terms, Privacy, Contact), copyright (десктоп only)

**Глобални UX системи**
- `useHaptic()` — `navigator.vibrate()` light/medium/error
- `Sonner` Toaster — bottom-center мобилно / top-right десктоп
- `SplashScreen` — лого + pulse анимация докато auth зарежда
- `ErrorBoundary` — глобален fallback UI
- `/404` — анимирана страница
- `/offline` — Service Worker fallback
- `useOnlineStatus()` → offline banner (Framer Motion slide-down)
- `HelmetProvider` в root
- `robots.txt` + `sitemap.xml` в `/public`

**Accessibility (a11y)**
- ARIA labels на всички icon-only бутони
- Focus management при modals/sheets (`focus-trap`)
- Keyboard навигация (Tab, Enter, Space)
- Color contrast ≥ 4.5:1 (WCAG AA)
- `prefers-reduced-motion` — деактивира анимации

**Seed данни за тестване**
- `scripts/seed.ts` — 5 категории, 3 тест акаунта, 10 услуги, 5 резервации
- Тест акаунти: `customer@test.com` / `supplier@test.com` / `admin@test.com`

---

## Фаза 2 — Начална страница, Търсене, Карта и Discovery

**Начална страница (`/`)**
- Мобилно: SearchBar pill, хоризонтален category snap scroll, вертикален ServiceCard списък
- Десктоп: Hero section + голям SearchBar, 6-col categories, 4-col services grid
- `ServiceCard` — снимка (4:3), наименование, описание, цена, рейтинг (звезди), `whileTap` / `whileHover`
- Stagger entrance анимация, Skeleton loaders, Pull-to-refresh (мобилно)
- Web Share API, SEO Helmet

**Търсене (`/search`)**
- Мобилно: sticky header + filter chips (snap scroll) + списък + "Карта" бутон
- Десктоп: постоянен left sidebar с филтри + main grid + Map toggle
- **Разширени филтри:** Локация, Ценови диапазон (range slider), Рейтинг (≥ X★), Категория, Тип услуга, Дата
- Filter chips: брой активни, layout animation, "Изчисти всички"
- Infinite scroll (мобилно) / pagination (десктоп)
- 300ms debounce на search input

**Карта (toggle в `/search`)**
- MapLibre GL с маркери по локация, cluster при zoom out
- Tap/click на маркер → ServiceCard popup

**Категории (`/category/:slug`)**
- Pre-filtered Search с category филтър
- SEO Helmet с category title/description

**Location Picker**
- Мобилно: Vaul bottom sheet + autocomplete + Geolocation API
- Десктоп: inline popover в sidebar

**Публичен профил на доставчик (`/supplier/:id`)**
- Аватар, bio, среден рейтинг, брой изпълнени услуги
- Grid с всички активни услуги
- Всички отзиви
- SEO Helmet с dynamic OG image

**Gallery / Lightbox**
- Тап/клик → full-screen overlay (Framer Motion zoom-in)
- Swipe между снимките (use-gesture) на мобилно, arrows на десктоп
- Thumbnail strip

---

## Фаза 3 — Автентикация, Onboarding и Правни страници

**Onboarding (overlay при първо посещение)**
- 3–4 fullscreen слайда с анимирани илюстрации
- Framer Motion drag между слайдове, dot indicators
- "Пропусни" бутон, статус в `localStorage`

**Вход/Регистрация (`/signin`)**
- Мобилно: fullscreen centered с лого и tagline
- Десктоп: split layout (brand илюстрация + форма)
- Google OAuth, Facebook OAuth, имейл + парола (React Hook Form + Zod)
- Checkbox "Приемам Условията и Политиката за поверителност"
- `/auth/callback` → `supabase.auth.exchangeCodeForSession()`
- При първи вход: DB trigger → `profiles` запис
- Loading states с Framer Motion

**Забравена парола (`/forgot-password`)**
- `supabase.auth.resetPasswordForEmail()`
- Success state с анимирана envelope икона

**Нова парола (`/reset-password`)**
- Форма + потвърждение (Zod) → `supabase.auth.updateUser({ password })`

**Верификация на имейл (`/verify-email`)**
- "Изпрати отново" → `supabase.auth.resend()`

**Правни страници**
- `/terms` — Условия за ползване
- `/privacy` — Политика за поверителност (GDPR)

---

## Фаза 4 — Профил и Настройки

**Профил (`/profile`)**
- Мобилно: fullscreen меню | Десктоп: left sidebar + right content
- Аватар → `react-image-crop` + upload в Supabase Storage
- Meню: Лична информация, Плащания, Кредити, Настройки за известия, Моите услуги, Моите резервации, Поддръжка, Изход, Изтриване
- Destructive actions — Vaul sheet (мобилно) / Dialog (десктоп)

**Лична информация (`/profile/personal-info`)**
- Inline tap-to-edit: Иmе, Телефон, Имейл, Адрес, Град
- Framer Motion field transition, checkmark анимация при запазване

**Плащания & Изплащания (`/profile/payments`)**
- Карта: Add card (external) / последни 4 цифри + Delete
- IBAN/Payout: само за доставчици — форма IBAN + Притежател

**Кредити / Wallet (`/profile/credits`)**
- Баланс (анимиран при зареждане), история на транзакции
- При резервация: избор "Плати с кредити" ако има баланс

**Настройки за известия (`/profile/notification-settings`)**
- Toggles за push известия (резервации, съобщения)
- `PushManager.subscribe()` при включване

---

## Фаза 5 — Моите услуги (Доставчик)

**Моите услуги (`/my-services`)**
- Клиент: CTA за записване → IBAN + детайли → "Запиши се" → pending state card
- При одобрение: Realtime → toast + `isSupplier = true`
- Доставчик: списък с услуги + "Добави нова услуга"

**Добавяне / Редактиране**
- Полета: Наименование, Детайли, Тип услуга, Снимки (react-dropzone, max 5MB, progress bar)
- Зона: "Наличен в моя регион" (LocationPicker + Radius slider) | "Наличен в градове" (multi-select)
- Ценообразуване: На час | Фиксирана цена
- Линк към Wizard за наличност
- `useBeforeUnload` при незапазени промени

**Wizard за наличност — Дата**
- Radio: всеки ден / конкретни дни от седмицата / конкретни дни от месеца / по месеци
- Advanced options: calendar интерфейс за конкретни дни
- СЛЕДВАЩ → стъпка Час

**Wizard за наличност — Час**
- Radio: целия ден / от–до диапазон
- Clock picker за времеви диапазон
- Advanced: изключване на времеви периоди
- ЗАПАЗИ → връща към формата

**Преглед на услуга (`/my-services/:id`)**
- Read-only, РЕДАКТИРАЙ / ИЗТРИЙ (с потвърждение)

**Supplier Dashboard**
- Stat cards: Общи приходи, Резервации, Среден рейтинг, Активни услуги
- Прости charts (CSS-based или Recharts)

---

## Фаза 6 — Поток за резервация

**Детайли на услуга (`/service/:id`)**
- Мобилно: gallery swipe + детайли + sticky CTA
- Десктоп: 2-col (gallery + детайли вляво, sticky booking card вдясно)
- Date picker (React DayPicker, блокира заети слотове)
- Time slot chips (server-side проверка за конфликти, debounced)
- Банер за минимален брой часове
- SEO Helmet с dynamic OG

**Booking flow:**
```
/service/:id → "Резервирай" → [signin ако не е влязъл] →
POST bookings (статус "pending") →
/my-bookings/:id/confirm → "Плати" → [add card ако няма] →
payment → "payment_pending" → доставчик потвърждава → "confirmed"
```

**Потвърждение (`/my-bookings/:id/confirm`)**
- Резюме: услуга, дата/час, цена breakdown (такса, ДДС, кредити)
- Опция "Плати с кредити" ако има баланс
- Success: confetti/checkmark + Sonner toast + navigator.share()

**Детайли на резервация (`/my-bookings/:id`)**
- Статус timeline, "Съобщение", "Откажи резервация"
- Refund статус при отказана

**Отказване**
- Vaul sheet / Dialog, причина dropdown, refund политика

**Моите резервации (`/my-bookings`)**
- Мобилно: tabs Текущи/Минали, вертикален списък
- Десктоп: 3-col grid
- Клиент: BookingCard + "Съобщение" + "Откажи"
- Доставчик: sub-tabs "За изпълнение" / "Резервирани" + badge count

---

## Фаза 7 — Рейтинги и Отзиви

**Post-service prompt**
- След датата на услугата → Vaul sheet / Modal
- 1–5 звезди (анимирани), коментар (незадължителен)
- "Напомни ми по-късно" → отлага с 24h

**ServiceCard и Search**
- Средна оценка видима навсякъде
- Filter: "Рейтинг ≥ X"

**Service Detail — отзиви секция**
- Средна оценка с breakdown (5★ X%, 4★ Y%...)
- Списък: аватар, име, дата, оценка, коментар
- Пагинация

**Supplier Profile**
- Агрегирани отзиви по всички услуги

**Supplier Dashboard**
- Среден рейтинг per услуга
- "Отзиви" секция с всички получени

---

## Фаза 8 — Съобщения, Известия и Поддръжка

**Съобщения (`/messages`)**
- Мобилно: thread list (аватар, preview, timestamp, unread badge)
- Десктоп: split-view (360px list + fluid chat)
- Supabase Realtime → live unread count

**Чат (`/messages/:threadId`)**
- Балончета (собствените вдясно), timestamps, ✓✓ прочетено
- Typing indicator (Supabase Realtime Presence)
- Optimistic UI, Enter за изпращане
- Снимка attachment (react-dropzone + Storage + progress bar)
- "⋯" → Report/Block потребителя

**Support Chat Widget**
- Floating button (десктоп: долен десен ъгъл; мобилно: над BottomNavBar)
- Vaul sheet / Popover panel

**Известия (`/notifications`)**
- Tabs: Всички | Резервации | Съобщения | Системни
- Иконка по тип, timestamp, прочетено/непрочетено стил
- "Маркирай всички като прочетени"
- Supabase Realtime за live update

---

## Фаза 9 — PWA финализиране

**Custom PWA Install Banner**
- `beforeinstallprompt` event (Android/Chrome)
- Custom UI: "Добави vikni.me към началния екран" + "Инсталирай"
- iOS: отделен banner с инструкции (Share → Add to Home Screen)

**PWA Update Banner**
- `useRegisterSW` → `needRefresh` → "Налична е нова версия" + "Обнови"

**PWA Badges API**
- `navigator.setAppBadge(count)` / `clearAppBadge()`

**Push Notifications**
- Service Worker `push` event listener
- `PushManager.subscribe()` при разрешение
- Supabase Edge Function (VAPID) за изпращане
- Типове: нова резервация, потвърждение, ново съобщение

**Background Sync**
- Workbox Background Sync за offline съобщения

**Swipe назад**
- use-gesture drag от ляв ръб (< 30px) → Framer Motion x → `navigate(-1)` при > 40%
- Само мобилно (< 1024px)

**App Shortcuts (manifest)**
- "Търси" → `/search`
- "Моите резервации" → `/my-bookings`
- "Съобщения" → `/messages`

---

## Фаза 10 — Админ панел

**Layout:** постоянен left sidebar, breadcrumbs, TanStack Table за всички таблици

**Dashboard (`/admin`)**
- Stat cards: Потребители, Услуги, Резервации днес, Приходи
- Pending enrollments (Одобри/Откажи), Recent bookings

**Потребители (`/admin/users`)**
- Таблица + Бан/Unban + Изтриване + Кредити + "Върни пари"

**Услуги (`/admin/services`)**
- Таблица + Преглед + Изтриване

**Резервации (`/admin/bookings`)**
- Таблица + filter по статус + Изтриване + "Върни пари"

**Отзиви (`/admin/reviews`)**
- Таблица + Изтриване на неподходящи

**Категории (`/admin/categories`)**
- Таблица + CRUD (Добавяне, Редактиране, Изтриване)

**Enrollment Requests (`/admin/enrollments`)**
- Таблица + Одобри → `is_supplier = true` | Откажи → notification

**Поддръжка (`/admin/support`)**
- Support threads + Chat interface + Маркиране като "Решен"

---

## Система за известия (cross-cutting)

- `NotificationStore` (Zustand): `unreadMessages`, `pendingBookings`
- `BottomNavBar` / `TopNav` — badge с Framer Motion scale pop
- Web Push + Service Worker + Supabase Edge Function (VAPID)
- Sonner toasts за всички key events
- Supabase Realtime subscriptions за `messages`, `bookings`, `notifications`

---

## Supabase схема

| Таблица | Основни полета |
|---|---|
| `profiles` | `id`, `full_name`, `phone`, `address`, `city`, `is_supplier`, `is_admin`, `avatar_url`, `credits_balance`, `notification_prefs` |
| `categories` | `id`, `name`, `slug`, `icon` |
| `services` | `id`, `supplier_id`, `category_id`, `name`, `description`, `service_type`, `price_type`, `price`, `area_type`, `location (point)`, `radius`, `cities[]`, `photos[]`, `availability_config (jsonb)` |
| `bookings` | `id`, `service_id`, `customer_id`, `supplier_id`, `date`, `time_from`, `time_to`, `total_price`, `status`, `cancellation_reason`, `refund_status` |
| `reviews` | `id`, `booking_id`, `service_id`, `reviewer_id`, `supplier_id`, `rating`, `comment`, `created_at` |
| `messages` | `id`, `thread_id`, `sender_id`, `content`, `read_at`, `created_at` |
| `threads` | `id`, `booking_id`, `participant_ids[]`, `last_message`, `last_message_at` |
| `notifications` | `id`, `user_id`, `type`, `title`, `body`, `resource_id`, `resource_type`, `read_at`, `created_at` |
| `payout_details` | `id`, `user_id`, `iban`, `holder_name` |
| `payment_methods` | `id`, `user_id`, `card_last4`, `external_token` |
| `enrollment_requests` | `id`, `user_id`, `status`, `iban` |
| `credits_transactions` | `id`, `user_id`, `amount`, `type`, `note`, `created_at` |
| `reports` | `id`, `reporter_id`, `reported_user_id`, `reason`, `created_at` |
| `push_subscriptions` | `id`, `user_id`, `endpoint`, `keys (jsonb)` |

**Row Level Security (RLS)** на всички таблици.
**Supabase Storage:** buckets `service-photos`, `avatars`, `message-attachments`.
**Supabase Realtime:** `messages`, `notifications`, `bookings` таблици.

Генериране на TypeScript типове:
```bash
supabase gen types typescript --project-id <id> > src/types/supabase.ts
```

---

## Стратегия за тестване

- **Vitest + React Testing Library** — unit/component тестове, mock на Supabase с `vi.mock`
- **Playwright** (опционално) — E2E за critical paths (signin, search, booking)
- **Seed скрипт** — `scripts/seed.ts` за тестови данни
- **Тест акаунти:** `customer@test.com`, `supplier@test.com`, `admin@test.com`

---

## UX детайли за качество

- **Форми:** `useBeforeUnload` при незапазени данни; Availability Wizard запазва стейт в Zustand
- **Image Upload:** max 5MB, jpeg/png/webp, progress bar, lazy loading, responsive srcset
- **Debounce:** 300ms на search; disabled бутони при submit (предотвратява double-submit)
- **Enrollment pending:** "Заявката ви се разглежда" card + Realtime одобрение/отказ
- **Booking conflicts:** server-side проверка на слотове при избор

---

## Дизайн система

### Цветове — извлечени от логото

```
"vikni"  →  Navy      #1B2A5E  (главен)
Вълни    →  Orange    #E5541B → #F97316 → #F5A623
"."      →  Violet    #8B5CF6  (gradient start)
"me"     →  Teal      #2DD4BF  (gradient end)
```

**Градиенти:**
```css
--gradient-brand:   linear-gradient(135deg, #8B5CF6, #2DD4BF);   /* CTA бутони */
--gradient-energy:  linear-gradient(135deg, #E5541B, #F5A623);   /* badges, notifications */
--gradient-primary: linear-gradient(135deg, #1B2A5E, #8B5CF6);   /* hero, splash */
--gradient-hero:    linear-gradient(135deg, #1B2A5E, #8B5CF6 60%, #2DD4BF); /* onboarding */
--gradient-sunset:  linear-gradient(135deg, #E5541B, #F97316 50%, #F5A623); /* accents */
```

### Типография

| Роля | Шрифт | Weights |
|---|---|---|
| Заглавия / Display | **Nunito** | 600, 700, 800, 900 |
| UI / Body | **Inter** | 400, 500, 600 |

**Type Scale:**
```
Display XL  48px / Nunito 900   H1  32px / Nunito 800
Display L   40px / Nunito 800   H2  24px / Nunito 700
Body L      18px / Inter 400    H3  20px / Nunito 700
Body        16px / Inter 400    H4  18px / Nunito 600
Body S      14px / Inter 400    Caption 12px / Inter 400
```

### Tokens

**Border Radius:** 6px | 8px | 12px | 16px | 20px | 24px | 32px | 9999px
**Spacing:** 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128)
**Shadows:** navy-tinted `rgba(27, 42, 94, ...)` — sm / md / lg / xl / brand-glow / orange-glow

---

## Резюме — 10 фази

| Фаза | Обхват | Ключови резултати |
|---|---|---|
| 1 | Основа | Vite + PWA (Apple meta, всички иконки), Supabase Auth, AdminRoute, code splitting, layouts, Splash, Offline, 404, ErrorBoundary, Footer, a11y, env config, seed |
| 2 | Discovery | Homepage (мобилно + десктоп), Search + разширени филтри, Category pages, Карта, Gallery/Lightbox, Supplier Profile |
| 3 | Auth | Signin (split-layout), Onboarding, Forgot/Reset парола, Email верификация, Terms/Privacy |
| 4 | Профил | Профил меню, Лична информация, Плащания, Payout, Кредити/Wallet, Notification settings |
| 5 | Доставчик | Моите услуги (enrollment pending state), Add/Edit + image progress, Availability Wizard, Supplier Dashboard |
| 6 | Резервация | Service Detail, Booking flow (ясен ред), Confirmation, Booking detail, Отказване, My Bookings |
| 7 | Отзиви | Post-service prompt, Ratings на ServiceCard, Review секции, Supplier reviews |
| 8 | Съобщения | Split-view Messages, Live Chat (typing indicator, image upload), Notifications page, Support widget, Report/Block |
| 9 | PWA Polish | Install Banner, Update Banner, Badges API, Push Notifications, Swipe back, App Shortcuts |
| 10 | Админ | Dashboard, Users, Services, Bookings, Reviews, Categories, Enrollments, Support — TanStack Table |
