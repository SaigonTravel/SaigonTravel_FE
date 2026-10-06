import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/api';
import { getErrorMessage } from '@/api/client';
import { Badge, Button, EmptyState, Pagination, Spinner } from '@/components/ui';
import { formatDate, formatPrice, populated } from '@/utils/format';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, BOOKING_TYPE_LABELS } from '@/utils/labels';
import type { BookingStatus, BookingType, PaymentMethod, PaymentStatus, Service, Tour, User } from '@/types';
import { Field, FormSection } from '../components/fields';

export function BookingsList() {
  const [params, setParams] = useSearchParams();
  const [kw, setKw] = useState(params.get('keyword') ?? '');
  const query = {
    status: (params.get('status') as BookingStatus) || undefined,
    type: (params.get('type') as BookingType) || undefined,
    keyword: params.get('keyword') || undefined,
    page: Number(params.get('page') || 1),
    limit: 20,
  };
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', query],
    queryFn: () => bookingsApi.list(query),
    placeholderData: keepPreviousData,
  });

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold">Booking & Yêu cầu tư vấn</h1>
        <div className="flex flex-wrap gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam('keyword', kw.trim() || undefined);
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input !w-60 pl-9" placeholder="Mã, tên, SĐT, email, công ty…" value={kw} onChange={(e) => setKw(e.target.value)} />
          </form>
          <select className="input !w-auto" value={query.status ?? ''} onChange={(e) => setParam('status', e.target.value || undefined)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(BOOKING_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select className="input !w-auto" value={query.type ?? ''} onChange={(e) => setParam('type', e.target.value || undefined)}>
            <option value="">Tất cả loại</option>
            {Object.entries(BOOKING_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : !data?.data.length ? (
          <EmptyState />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Tour / Dịch vụ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày gửi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((b) => {
                const target = populated<Pick<Tour, '_id' | 'title'>>(b.tour)?.title || populated<Pick<Service, '_id' | 'title'>>(b.service)?.title;
                return (
                  <tr key={b._id} className="hover:bg-brand-50/40">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link to={`/admin/bookings/${b._id}`} className="font-semibold text-brand-500 hover:underline">
                        {b.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{b.customer.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {b.customer.phone} · {b.customer.email}
                      </p>
                      {b.customer.companyName && <p className="text-xs text-gray-500">{b.customer.companyName}</p>}
                    </td>
                    <td className="px-4 py-3">{BOOKING_TYPE_LABELS[b.type]}</td>
                    <td className="max-w-xs truncate px-4 py-3">{target || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={BOOKING_STATUS_COLORS[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(b.createdAt, true)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={query.page} totalPages={data?.totalPages ?? 1} onChange={(p) => setParam('page', String(p))} />
    </div>
  );
}

const PAYMENT_STATUS: Record<PaymentStatus, string> = { pending: 'Chưa thanh toán', partial: 'Đã cọc', paid: 'Đã thanh toán', refunded: 'Đã hoàn tiền' };
const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  unspecified: 'Chưa xác định',
  bank_transfer: 'Chuyển khoản',
  cash: 'Tiền mặt',
  vnpay: 'VNPay',
  credit_card: 'Thẻ tín dụng',
};

export function BookingDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: b, isLoading } = useQuery({ queryKey: ['admin', 'booking', id], queryFn: () => bookingsApi.get(id!) });
  const [note, setNote] = useState('');

  const update = useMutation({
    mutationFn: (body: Parameters<typeof bookingsApi.update>[1]) => bookingsApi.update(id!, body),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      setNote('');
      qc.invalidateQueries({ queryKey: ['admin', 'booking', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return <Spinner />;
  if (!b) return <EmptyState message="Không tìm thấy yêu cầu" />;

  const tour = populated<Pick<Tour, '_id' | 'title' | 'slug'>>(b.tour);
  const service = populated<Pick<Service, '_id' | 'title' | 'slug'>>(b.service);
  const d = b.details ?? {};
  const rows: [string, React.ReactNode][] = [
    ['Họ tên', b.customer.fullName],
    ['Điện thoại', <a href={`tel:${b.customer.phone}`} className="text-brand-500">{b.customer.phone}</a>],
    ['Email', <a href={`mailto:${b.customer.email}`} className="text-brand-500">{b.customer.email}</a>],
    ['Công ty', b.customer.companyName],
    ['Địa chỉ', b.customer.address],
    ['Tour', tour && <a href={`/tour/${tour.slug}`} target="_blank" rel="noreferrer" className="text-brand-500">{tour.title}</a>],
    ['Dịch vụ', service && <a href={`/dich-vu/${service.slug}`} target="_blank" rel="noreferrer" className="text-brand-500">{service.title}</a>],
    ['Ngày khởi hành', formatDate(d.departureDate)],
    ['Ngày về', formatDate(d.returnDate)],
    ['Người lớn / Trẻ em / Em bé', d.adultsCount || d.childrenCount ? `${d.adultsCount ?? 0} / ${d.childrenCount ?? 0} / ${d.infantsCount ?? 0}` : ''],
    ['Số người (đoàn)', d.participantCount || ''],
    ['Điểm đến mong muốn', d.destinationPreference],
    ['Ngân sách', d.estimatedBudget],
    ['Yêu cầu / Ghi chú', d.specialRequests || b.customer.note],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/admin/bookings" className="rounded p-1.5 hover:bg-gray-200" aria-label="Quay lại">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-xl font-bold">{b.code}</h1>
        <Badge className={BOOKING_STATUS_COLORS[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
        <Badge className="bg-brand-100 text-brand-600">{BOOKING_TYPE_LABELS[b.type]}</Badge>
        <span className="text-sm text-gray-500">Gửi lúc {formatDate(b.createdAt, true)}</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <FormSection title="Thông tin yêu cầu">
            <dl className="divide-y divide-gray-100 text-sm">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2.5">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="whitespace-pre-line text-ink">{v}</dd>
                  </div>
                ))}
            </dl>
          </FormSection>

          <FormSection title="Lịch sử chăm sóc">
            <div className="space-y-3">
              {(b.staffNotes ?? []).length === 0 && <p className="text-sm text-gray-400">Chưa có ghi chú</p>}
              {[...(b.staffNotes ?? [])].reverse().map((n, i) => (
                <div key={i} className="rounded-md border-l-4 border-brand-300 bg-gray-50 p-3 text-sm">
                  <p className="whitespace-pre-line text-ink">{n.note}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {populated<Pick<User, '_id' | 'name'>>(n.staff)?.name ?? 'Nhân viên'} · {formatDate(n.createdAt, true)}
                  </p>
                </div>
              ))}
            </div>
            <textarea className="input" rows={3} placeholder="Thêm ghi chú tư vấn…" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex justify-end">
              <Button disabled={!note.trim()} loading={update.isPending} onClick={() => update.mutate({ note: note.trim() })}>
                Thêm ghi chú
              </Button>
            </div>
          </FormSection>
        </div>

        <div className="space-y-5">
          <FormSection title="Trạng thái xử lý">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
                <button
                  key={s}
                  disabled={update.isPending}
                  onClick={() => s !== b.status && update.mutate({ status: s })}
                  className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                    s === b.status ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-200 hover:border-brand-500'
                  }`}
                >
                  {BOOKING_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </FormSection>
          <PricingCard key={b.updatedAt} pricing={b.pricing} saving={update.isPending} onSave={(pricing) => update.mutate({ pricing })} />
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  pricing,
  saving,
  onSave,
}: {
  pricing?: NonNullable<Parameters<typeof bookingsApi.update>[1]>['pricing'];
  saving: boolean;
  onSave: (p: NonNullable<Parameters<typeof bookingsApi.update>[1]>['pricing']) => void;
}) {
  const [p, setP] = useState({ totalAmount: 0, depositAmount: 0, paymentStatus: 'pending', paymentMethod: 'unspecified', ...pricing });
  return (
    <FormSection title="Thanh toán">
      <Field label="Tổng tiền" hint={formatPrice(p.totalAmount)}>
        <input className="input" type="number" min={0} value={p.totalAmount} onChange={(e) => setP({ ...p, totalAmount: Number(e.target.value) })} />
      </Field>
      <Field label="Đặt cọc" hint={formatPrice(p.depositAmount)}>
        <input className="input" type="number" min={0} value={p.depositAmount} onChange={(e) => setP({ ...p, depositAmount: Number(e.target.value) })} />
      </Field>
      <Field label="Tình trạng">
        <select className="input" value={p.paymentStatus} onChange={(e) => setP({ ...p, paymentStatus: e.target.value as PaymentStatus })}>
          {Object.entries(PAYMENT_STATUS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Phương thức">
        <select className="input" value={p.paymentMethod} onChange={(e) => setP({ ...p, paymentMethod: e.target.value as PaymentMethod })}>
          {Object.entries(PAYMENT_METHOD).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Button className="w-full" loading={saving} onClick={() => onSave(p as typeof pricing)}>
        Lưu thanh toán
      </Button>
    </FormSection>
  );
}
