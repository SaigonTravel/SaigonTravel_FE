import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Spinner } from '@/components/ui';
import { RequireRole } from '@/admin/RequireRole';
import { CONTENT_ROLES } from '@/store/auth';
import HomePage from '@/pages/HomePage';
import ToursPage from '@/pages/ToursPage';
import TourDetailPage from '@/pages/TourDetailPage';
import DestinationPage from '@/pages/DestinationPage';
import { ServiceDetailPage, ServicesPage } from '@/pages/ServicesPage';
import { EventDetailPage, EventsPage } from '@/pages/EventsPage';
import { GalleriesPage, GalleryDetailPage } from '@/pages/GalleryPage';
import { AboutPage, ContactPage, NotFoundPage } from '@/pages/StaticPages';

// Admin tách bundle riêng (lazy)
const AdminLayout = lazy(() => import('@/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const LoginPage = lazy(() => import('@/admin/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/admin/pages/DashboardPage'));
const ToursList = lazy(() => import('@/admin/pages/ToursAdmin').then((m) => ({ default: m.ToursList })));
const TourFormPage = lazy(() => import('@/admin/pages/ToursAdmin').then((m) => ({ default: m.TourFormPage })));
const BookingsList = lazy(() => import('@/admin/pages/BookingsAdmin').then((m) => ({ default: m.BookingsList })));
const BookingDetail = lazy(() => import('@/admin/pages/BookingsAdmin').then((m) => ({ default: m.BookingDetail })));
const SettingsAdmin = lazy(() => import('@/admin/pages/SettingsAdmin'));
const ResourceListPage = lazy(() => import('@/admin/ResourcePages').then((m) => ({ default: m.ResourceListPage })));
const ResourceFormPage = lazy(() => import('@/admin/ResourcePages').then((m) => ({ default: m.ResourceFormPage })));

const s = (el: ReactNode) => <Suspense fallback={<Spinner className="py-40" />}>{el}</Suspense>;
/** Trang nội dung: chỉ admin/manager (khớp authorize('admin','manager') bên BE) */
const content = (el: ReactNode) => s(<RequireRole roles={CONTENT_ROLES}>{el}</RequireRole>);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'gioi-thieu', element: <AboutPage /> },
      { path: 'tour', element: <ToursPage /> },
      { path: 'tour/:slug', element: <TourDetailPage /> },
      { path: 'diem-den/:slug', element: <DestinationPage /> },
      { path: 'dich-vu', element: <ServicesPage /> },
      { path: 'dich-vu/:slug', element: <ServiceDetailPage /> },
      { path: 'su-kien', element: <EventsPage /> },
      { path: 'su-kien/:slug', element: <EventDetailPage /> },
      { path: 'hinh-anh', element: <GalleriesPage /> },
      { path: 'hinh-anh/:slug', element: <GalleryDetailPage /> },
      { path: 'lien-he', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: s(<LoginPage />) },
  {
    path: '/admin',
    element: s(<AdminLayout />),
    children: [
      { index: true, element: s(<DashboardPage />) },
      { path: 'bookings', element: s(<BookingsList />) },
      { path: 'bookings/:id', element: s(<BookingDetail />) },
      { path: 'tours', element: content(<ToursList />) },
      { path: 'tours/:id', element: content(<TourFormPage />) },
      { path: 'settings', element: content(<SettingsAdmin />) },
      { path: ':resource', element: content(<ResourceListPage />) },
      { path: ':resource/:id', element: content(<ResourceFormPage />) },
    ],
  },
]);
