import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Inbox, Plane, Trophy, Briefcase } from 'lucide-react';
import { bookingsApi, eventProjectsApi, servicesApi, toursApi } from '@/api';
import { Badge, Spinner } from '@/components/ui';
import { CONTENT_ROLES, useAuth } from '@/store/auth';
import { formatDate } from '@/utils/format';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, BOOKING_TYPE_LABELS } from '@/utils/labels';

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const isContent = hasRole(CONTENT_ROLES);

  const newBookings = useQuery({ queryKey: ['admin', 'bookings', 'new-count'], queryFn: () => bookingsApi.list({ status: 'new', limit: 1 }) });
  const latest = useQuery({ queryKey: ['admin', 'bookings', 'latest'], queryFn: () => bookingsApi.list({ limit: 8 }) });
  const tours = useQuery({ queryKey: ['admin', 'tours', 'count'], queryFn: () => toursApi.list({ status: 'all', limit: 1 }), enabled: isContent });
  const projects = useQuery({ queryKey: ['admin', 'projects', 'count'], queryFn: () => eventProjectsApi.list({ status: 'all', limit: 1 }), enabled: isContent });
  const services = useQuery({ queryKey: ['admin', 'services', 'count'], queryFn: () => servicesApi.list(), enabled: isContent });

  const stats = [
    { label: 'Yêu cầu mới', value: newBookings.data?.total, icon: Inbox, to: '/admin/bookings?status=new', color: 'bg-sky-500' },
    ...(isContent
      ? [
          { label: 'Tour', value: tours.data?.total, icon: Plane, to: '/admin/tours', color: 'bg-brand-500' },
          { label: 'Dịch vụ', value: services.data?.count, icon: Briefcase, to: '/admin/services', color: 'bg-amber-500' },
          { label: 'Dự án tiêu biểu', value: projects.data?.total, icon: Trophy, to: '/admin/event-projects', color: 'bg-emerald-500' },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-bold">Tổng quan</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to} className="card flex items-center gap-4 p-5 transition hover:shadow-md">
            <span className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${color}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-bold text-ink">{value ?? '–'}</p>
              <p className="text-sm">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-heading font-bold">Yêu cầu gần đây</h2>
          <Link to="/admin/bookings" className="text-sm text-brand-500 hover:underline">
            Xem tất cả
          </Link>
        </div>
        {latest.isLoading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {latest.data?.data.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link to={`/admin/bookings/${b._id}`} className="font-semibold text-brand-500 hover:underline">
                        {b.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink">{b.customer.fullName}</td>
                    <td className="px-5 py-3">{BOOKING_TYPE_LABELS[b.type]}</td>
                    <td className="px-5 py-3">
                      <Badge className={BOOKING_STATUS_COLORS[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(b.createdAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
