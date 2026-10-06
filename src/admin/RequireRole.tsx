import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/store/auth';
import type { Role } from '@/types';

/** Chặn route theo role; chưa đăng nhập → /admin/login */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner className="py-40" />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (!hasRole(roles)) {
    return (
      <div className="py-24 text-center">
        <p className="font-heading text-xl font-bold text-ink">Không có quyền truy cập</p>
        <p className="mt-2 text-sm">Tài khoản của bạn ({user.role}) không được phép xem trang này.</p>
      </div>
    );
  }
  return <>{children}</>;
}
