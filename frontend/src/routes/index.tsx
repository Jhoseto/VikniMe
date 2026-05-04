import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { SupplierRoute } from './SupplierRoute'
import { PageSpinner } from '@/components/shared/PageSpinner'
import { NotFoundPage } from '@/pages/shared/NotFoundPage'
import { OfflinePage } from '@/pages/shared/OfflinePage'

function Lazy(Component: ReturnType<typeof lazy>) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  )
}

/* ── Public Pages ─────────────────────────────────────── */
const HomePage          = lazy(() => import('@/pages/customer/HomePage'))
const SearchPage        = lazy(() => import('@/pages/customer/SearchPage'))
const CategoryPage      = lazy(() => import('@/pages/customer/CategoryPage'))
const ServiceDetailPage = lazy(() => import('@/pages/customer/ServiceDetailPage'))
const SupplierProfilePage = lazy(() => import('@/pages/customer/SupplierProfilePage'))
const TermsPage         = lazy(() => import('@/pages/shared/TermsPage'))
const PrivacyPage       = lazy(() => import('@/pages/shared/PrivacyPage'))

/* ── Auth Pages ───────────────────────────────────────── */
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const AuthCallbackPage   = lazy(() => import('@/pages/auth/AuthCallbackPage'))
const OnboardingPage     = lazy(() => import('@/pages/auth/OnboardingPage'))

/* ── Customer (Protected) ─────────────────────────────── */
const BookingsPage       = lazy(() => import('@/pages/customer/BookingsPage'))
const BookingDetailPage  = lazy(() => import('@/pages/customer/BookingDetailPage'))
const ChatListPage       = lazy(() => import('@/pages/customer/MessagesPage'))
const ChatDetailPage     = lazy(() => import('@/pages/customer/ChatDetailPage'))
const FavoritesPage      = lazy(() => import('@/pages/customer/FavoritesPage'))
const ProfilePage        = lazy(() => import('@/pages/customer/ProfilePage'))
const EditProfilePage    = lazy(() => import('@/pages/customer/EditProfilePage'))
const CreditsPage        = lazy(() => import('@/pages/customer/CreditsPage'))
const NotificationsPage  = lazy(() => import('@/pages/customer/NotificationsPage'))
const NotificationSettingsPage = lazy(() => import('@/pages/customer/NotificationSettingsPage'))
const ReviewPage              = lazy(() => import('@/pages/customer/ReviewPage'))
const PaymentsPage            = lazy(() => import('@/pages/customer/PaymentsPage'))
const BookingConfirmPage      = lazy(() => import('@/pages/customer/BookingConfirmPage'))

/* ── Supplier (Protected + Role) ─────────────────────── */
const SupplierDashboardPage  = lazy(() => import('@/pages/supplier/DashboardPage'))
const SupplierServicesPage   = lazy(() => import('@/pages/supplier/ServicesPage'))
const ServiceFormPage        = lazy(() => import('@/pages/supplier/ServiceFormPage'))
const SupplierBookingsPage   = lazy(() => import('@/pages/supplier/BookingsPage'))
const SupplierEarningsPage   = lazy(() => import('@/pages/supplier/EarningsPage'))
const SupplierProfileEditPage = lazy(() => import('@/pages/supplier/ProfileEditPage'))
const EnrollPage               = lazy(() => import('@/pages/supplier/EnrollPage'))
const AvailabilityWizardPage   = lazy(() => import('@/pages/supplier/AvailabilityWizard'))

/* ── Admin ────────────────────────────────────────────── */
const AdminDashboardPage  = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminUsersPage      = lazy(() => import('@/pages/admin/UsersPage'))
const AdminServicesPage   = lazy(() => import('@/pages/admin/ServicesPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'))
const AdminEnrollmentsPage = lazy(() => import('@/pages/admin/EnrollmentsPage'))
const AdminReportsPage     = lazy(() => import('@/pages/admin/ReportsPage'))
const AdminBookingsPage    = lazy(() => import('@/pages/admin/BookingsPage'))
const AdminReviewsPage     = lazy(() => import('@/pages/admin/ReviewsPage'))
const AdminSupportPage     = lazy(() => import('@/pages/admin/SupportPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      /* ── Auth ────────────────────────────────────────── */
      {
        element: <AuthLayout />,
        children: [
          { path: 'login',            element: Lazy(LoginPage) },
          { path: 'register',         element: Lazy(RegisterPage) },
          { path: 'forgot-password',  element: Lazy(ForgotPasswordPage) },
          { path: 'reset-password',   element: Lazy(ResetPasswordPage) },
          { path: 'verify-email',     element: Lazy(VerifyEmailPage) },
          { path: 'auth/callback',    element: Lazy(AuthCallbackPage) },
        ],
      },

      /* ── Onboarding: full-screen, no nav ─────────────── */
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'onboarding', element: Lazy(OnboardingPage) },
        ],
      },

      /* ── Main app layout (nav always visible) ─────────── */
      {
        element: <PublicLayout />,
        children: [
          /* Public */
          { index: true,             element: Lazy(HomePage) },
          { path: 'search',          element: Lazy(SearchPage) },
          { path: 'category/:slug',  element: Lazy(CategoryPage) },
          { path: 'service/:id',     element: Lazy(ServiceDetailPage) },
          { path: 'supplier/:id',    element: Lazy(SupplierProfilePage) },
          { path: 'terms',           element: Lazy(TermsPage) },
          { path: 'privacy',         element: Lazy(PrivacyPage) },

          /* Protected: requires auth */
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'bookings',                         element: Lazy(BookingsPage) },
              { path: 'bookings/:id',                     element: Lazy(BookingDetailPage) },
              { path: 'bookings/:id/review',              element: Lazy(ReviewPage) },
              { path: 'bookings/:id/confirm',             element: Lazy(BookingConfirmPage) },
              { path: 'chat',                             element: Lazy(ChatListPage) },
              { path: 'chat/:id',                         element: Lazy(ChatDetailPage) },
              { path: 'favorites',                        element: Lazy(FavoritesPage) },
              { path: 'notifications',                    element: Lazy(NotificationsPage) },
              { path: 'profile',                          element: Lazy(ProfilePage) },
              { path: 'profile/edit',                     element: Lazy(EditProfilePage) },
              { path: 'profile/credits',                  element: Lazy(CreditsPage) },
              { path: 'profile/payments',                 element: Lazy(PaymentsPage) },
              { path: 'profile/notification-settings',    element: Lazy(NotificationSettingsPage) },

              /* Supplier ───────────────────────────────── */
              {
                element: <SupplierRoute />,
                children: [
                  { path: 'supplier/dashboard',             element: Lazy(SupplierDashboardPage) },
                  { path: 'supplier/services',              element: Lazy(SupplierServicesPage) },
                  { path: 'supplier/services/new',          element: Lazy(ServiceFormPage) },
                  { path: 'supplier/services/:id/edit',     element: Lazy(ServiceFormPage) },
                  { path: 'supplier/services/availability', element: Lazy(AvailabilityWizardPage) },
                  { path: 'supplier/bookings',              element: Lazy(SupplierBookingsPage) },
                  { path: 'supplier/earnings',              element: Lazy(SupplierEarningsPage) },
                  { path: 'supplier/profile/edit',          element: Lazy(SupplierProfileEditPage) },
                ],
              },

              /* Admin ─────────────────────────────────── */
              {
                element: <AdminRoute />,
                children: [
                  { path: 'admin',              element: Lazy(AdminDashboardPage) },
                  { path: 'admin/users',        element: Lazy(AdminUsersPage) },
                  { path: 'admin/services',     element: Lazy(AdminServicesPage) },
                  { path: 'admin/categories',   element: Lazy(AdminCategoriesPage) },
                  { path: 'admin/enrollments',  element: Lazy(AdminEnrollmentsPage) },
                  { path: 'admin/bookings',     element: Lazy(AdminBookingsPage) },
                  { path: 'admin/reviews',      element: Lazy(AdminReviewsPage) },
                  { path: 'admin/reports',      element: Lazy(AdminReportsPage) },
                  { path: 'admin/support',      element: Lazy(AdminSupportPage) },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  /* ── Outside AppShell ─────────────────────────────────── */
  { path: 'enroll',   element: Lazy(EnrollPage) },
  { path: 'offline',  element: <OfflinePage /> },
  { path: '*',        element: <NotFoundPage /> },
])
