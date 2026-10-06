import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Briefcase,
  ExternalLink,
  FolderTree,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Plane,
  Settings,
  Trophy,
  X,
} from 'lucide-react';
import { RequireRole } from './RequireRole';
import { CONTENT_ROLES, STAFF_ROLES, useAuth } from '@/store/auth';
import { cn } from '@/utils/format';
import type { Role } from '@/types';

const MENU: { to: string; label: string; icon: typeof Plane; roles: Role[]; end?: boolean }[] = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, roles: STAFF_ROLES, end: true },
  { to: '/admin/bookings', label: 'Booking & Tư vấn', icon: Inbox, roles: STAFF_ROLES },
  { to: '/admin/tours', label: 'Tour du lịch', icon: Plane, roles: CONTENT_ROLES },
  { to: '/admin/destinations', label: 'Điểm đến', icon: MapPinned, roles: CONTENT_ROLES },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree, roles: CONTENT_ROLES },
  { to: '/admin/services', label: 'Dịch vụ', icon: Briefcase, roles: CONTENT_ROLES },
  { to: '/admin/event-projects', label: 'Dự án tiêu biểu', icon: Trophy, roles: CONTENT_ROLES },
  { to: '/admin/galleries', label: 'Album ảnh', icon: Images, roles: CONTENT_ROLES },
  { to: '/admin/settings', label: 'Cấu hình website', icon: Settings, roles: CONTENT_ROLES },
];

export function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <RequireRole roles={STAFF_ROLES}>
      <div className="flex min-h-screen bg-gray-100">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 bg-brand-900 text-white/80 transition-transform lg:static lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <Link to="/admin" className="font-heading text-lg font-extrabold uppercase text-white">
              Saigon Travel <span className="text-xs font-semibold text-brand-300">CMS</span>
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-0.5 px-3 py-2">
            {MENU.filter((m) => hasRole(m.roles)).map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-brand-500 text-white' : 'hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
              <Menu className="h-6 w-6" />
            </button>
            <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-sm text-brand-500 hover:underline lg:flex">
              <ExternalLink className="h-4 w-4" /> Xem website
            </a>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-semibold text-ink">{user?.name}</p>
                <p className="text-xs uppercase text-gray-500">{user?.role}</p>
              </div>
              <button onClick={logout} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600" title="Đăng xuất">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>
          <main key={pathname} className="flex-1 p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
