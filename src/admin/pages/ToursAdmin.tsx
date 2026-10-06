import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, ExternalLink, Flame, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi, destinationsApi, toursApi } from '@/api';
import { getErrorMessage } from '@/api/client';
import { Badge, Button, EmptyState, Pagination, Spinner } from '@/components/ui';
import { cn, formatPrice, populated, refId, slugify, toDateInput } from '@/utils/format';
import { REGION_LABELS, TOUR_STATUS_LABELS } from '@/utils/labels';
import type { Destination, Faq, ItineraryDay, Tour, TourStatus } from '@/types';
import { ArrayEditor, Field, FormSection, ImageInput, ImageListInput, LinesInput, Toggle } from '../components/fields';
import { Thumb } from '../components/ResourceAdmin';

const STATUS_COLORS: Record<TourStatus, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-200 text-gray-600',
};

// ===================== LIST =====================
export function ToursList() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [kw, setKw] = useState(params.get('keyword') ?? '');
  const page = Number(params.get('page') || 1);
  const status = (params.get('status') as TourStatus | 'all' | null) ?? 'all';
  const query = { status, keyword: params.get('keyword') || undefined, page, limit: 15 };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'tours', query],
    queryFn: () => toursApi.list(query),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'tours'] });
    qc.invalidateQueries({ queryKey: ['tours'] });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof toursApi.updateStatus>[1] }) => toursApi.updateStatus(id, body),
    onSuccess: invalidate,
    onError,
  });
  const dup = useMutation({
    mutationFn: toursApi.duplicate,
    onSuccess: () => {
      toast.success('Đã nhân bản thành bản nháp');
      invalidate();
    },
    onError,
  });
  const del = useMutation({
    mutationFn: toursApi.remove,
    onSuccess: () => {
      toast.success('Đã xoá tour');
      invalidate();
    },
    onError,
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
        <h1 className="font-heading text-xl font-bold">Tour du lịch {isFetching && <span className="text-sm font-normal text-gray-400">…</span>}</h1>
        <div className="flex flex-wrap gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam('keyword', kw.trim() || undefined);
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input !w-56 pl-9" placeholder="Tên, mã tour…" value={kw} onChange={(e) => setKw(e.target.value)} />
          </form>
          <select className="input !w-auto" value={status} onChange={(e) => setParam('status', e.target.value === 'all' ? undefined : e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(TOUR_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <Link to="/admin/tours/new">
            <Button>
              <Plus className="h-4 w-4" /> Thêm tour
            </Button>
          </Link>
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
                <th className="w-20 px-4 py-3" />
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Nổi bật / Hot</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((t) => (
                <tr key={t._id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <Thumb src={t.thumbnail} />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/tours/${t._id}`} className="font-semibold text-ink hover:text-brand-500">
                      {t.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {t.code} · {t.duration?.text} ·{' '}
                      {(t.destinations || []).map((d) => populated<Destination>(d)?.name).filter(Boolean).join(', ')}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-red-600">{formatPrice(t.price?.adult, t.price?.currency)}</td>
                  <td className="px-4 py-3">
                    <select
                      className={cn('rounded px-2 py-1 text-xs font-semibold outline-none', STATUS_COLORS[t.status ?? 'draft'])}
                      value={t.status}
                      onChange={(e) => patch.mutate({ id: t._id, body: { status: e.target.value as TourStatus } })}
                    >
                      {Object.entries(TOUR_STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        title="Nổi bật"
                        onClick={() => patch.mutate({ id: t._id, body: { isFeatured: !t.isFeatured } })}
                        className={cn('rounded p-1.5', t.isFeatured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500')}
                      >
                        <Star className={cn('h-5 w-5', t.isFeatured && 'fill-current')} />
                      </button>
                      <button
                        title="Hot"
                        onClick={() => patch.mutate({ id: t._id, body: { isHot: !t.isHot } })}
                        className={cn('rounded p-1.5', t.isHot ? 'text-red-500' : 'text-gray-300 hover:text-red-500')}
                      >
                        <Flame className={cn('h-5 w-5', t.isHot && 'fill-current')} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1 text-gray-500">
                      <a href={`/tour/${t.slug}`} target="_blank" rel="noreferrer" className="rounded p-1.5 hover:bg-gray-100 hover:text-brand-500" title="Xem">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Link to={`/admin/tours/${t._id}`} className="rounded p-1.5 hover:bg-gray-100 hover:text-brand-500" title="Sửa">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => dup.mutate(t._id)} className="rounded p-1.5 hover:bg-gray-100 hover:text-brand-500" title="Nhân bản">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirm(`Xoá tour "${t.title}"?`) && del.mutate(t._id)}
                        className="rounded p-1.5 hover:bg-gray-100 hover:text-red-600"
                        title="Xoá"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={(p) => setParam('page', String(p))} />
    </div>
  );
}

// ===================== FORM =====================
type TourForm = Omit<Tour, '_id' | 'destinations' | 'categories'> & { destinations: string[]; categories: string[] };

const EMPTY_TOUR: TourForm = {
  title: '',
  slug: '',
  code: '',
  destinations: [],
  categories: [],
  duration: { days: 1, nights: 0, text: '' },
  departureLocation: 'TP. Hồ Chí Minh',
  departureSchedule: '',
  departureDates: [],
  price: { adult: 0, child: 0, singleSupplement: 0, originalPrice: 0, currency: 'VND' },
  groupSize: { min: 1, max: 50 },
  languages: ['Tiếng Việt'],
  overview: '',
  highlights: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
  policies: { cancellation: '', terms: '', children: '', notes: '' },
  faqs: [],
  thumbnail: '',
  gallery: [],
  videoUrl: '',
  isFeatured: false,
  isHot: false,
  status: 'draft',
  seo: { metaTitle: '', metaDescription: '' },
};

export function TourFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'tour', id], queryFn: () => toursApi.get(id!), enabled: !isNew });
  if (!isNew && isLoading) return <Spinner />;

  let initial = EMPTY_TOUR;
  if (data) {
    initial = {
      ...EMPTY_TOUR,
      ...data,
      destinations: (data.destinations || []).map(refId),
      categories: (data.categories || []).map(refId),
      departureDates: (data.departureDates || []).map((d) => toDateInput(d)),
      price: { ...EMPTY_TOUR.price, ...data.price },
      duration: { ...EMPTY_TOUR.duration, ...data.duration },
      policies: { ...EMPTY_TOUR.policies, ...data.policies },
      seo: { ...EMPTY_TOUR.seo, ...data.seo },
    };
  }
  return <TourFormInner key={id} initial={initial} id={isNew ? undefined : id} />;
}

function TourFormInner({ initial, id }: { initial: TourForm; id?: string }) {
  const [f, setF] = useState<TourForm>(initial);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const up = <K extends keyof TourForm>(k: K, v: TourForm[K]) => setF((s) => ({ ...s, [k]: v }));

  const { data: destinations = [] } = useQuery({ queryKey: ['admin-options', 'destinations'], queryFn: () => destinationsApi.list().then((r) => r.data) });
  const { data: categories = [] } = useQuery({ queryKey: ['admin-options', 'categories', 'tour'], queryFn: () => categoriesApi.list({ type: 'tour' }).then((r) => r.data) });

  const save = useMutation({
    mutationFn: () => {
      const { createdAt: _c, updatedAt: _u, viewCount: _v, rating: _r, ...rest } = f as TourForm & { __v?: number };
      const payload = {
        ...rest,
        slug: f.slug || slugify(f.title),
        code: f.code || undefined,
        departureDates: (f.departureDates ?? []).filter(Boolean),
        itinerary: (f.itinerary ?? []).map((d, i) => ({ ...d, day: i + 1 })),
        faqs: (f.faqs ?? []).filter((q) => q.question && q.answer),
      } as unknown as Partial<Tour>;
      delete (payload as Record<string, unknown>).__v;
      delete (payload as Record<string, unknown>)._id;
      return id ? toursApi.update(id, payload) : toursApi.create(payload);
    },
    onSuccess: () => {
      toast.success(id ? 'Đã lưu tour' : 'Đã tạo tour');
      qc.invalidateQueries({ queryKey: ['admin', 'tours'] });
      qc.invalidateQueries({ queryKey: ['tours'] });
      qc.invalidateQueries({ queryKey: ['tour'] });
      navigate('/admin/tours');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return toast.error('Vui lòng nhập tên tour');
    if (!f.destinations.length) return toast.error('Vui lòng chọn ít nhất một điểm đến');
    save.mutate();
  };

  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <form onSubmit={submit}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/tours" className="rounded p-1.5 hover:bg-gray-200" aria-label="Quay lại">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-heading text-xl font-bold">{id ? 'Chỉnh sửa tour' : 'Thêm tour mới'}</h1>
          {f.code && <Badge className="bg-brand-100 text-brand-600">{f.code}</Badge>}
        </div>
        <Button type="submit" loading={save.isPending}>
          Lưu tour
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <FormSection title="Thông tin chung">
            <Field label="Tên tour *">
              <input className="input" value={f.title} onChange={(e) => up('title', e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Slug" hint="Bỏ trống để tự tạo từ tên tour">
                <input className="input" value={f.slug} onChange={(e) => up('slug', slugify(e.target.value))} />
              </Field>
              <Field label="Mã tour" hint="Bỏ trống để hệ thống tự sinh SGT-XXXX">
                <input className="input" value={f.code ?? ''} onChange={(e) => up('code', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Số ngày">
                <input className="input" type="number" min={1} value={f.duration?.days ?? 1} onChange={(e) => up('duration', { ...f.duration, days: num(e.target.value) })} />
              </Field>
              <Field label="Số đêm">
                <input className="input" type="number" min={0} value={f.duration?.nights ?? 0} onChange={(e) => up('duration', { ...f.duration, nights: num(e.target.value) })} />
              </Field>
              <Field label="Hiển thị thời gian" hint={'VD: "8 Ngày 7 Đêm"'}>
                <input className="input" value={f.duration?.text ?? ''} onChange={(e) => up('duration', { ...f.duration, text: e.target.value })} />
              </Field>
              <Field label="Nơi khởi hành">
                <input className="input" value={f.departureLocation ?? ''} onChange={(e) => up('departureLocation', e.target.value)} />
              </Field>
              <Field label="Lịch khởi hành" className="md:col-span-2" hint={'VD: "Khởi hành thứ 5 hàng tuần"'}>
                <input className="input" value={f.departureSchedule ?? ''} onChange={(e) => up('departureSchedule', e.target.value)} />
              </Field>
              <Field label="Số khách tối thiểu">
                <input className="input" type="number" value={f.groupSize?.min ?? 1} onChange={(e) => up('groupSize', { ...f.groupSize, min: num(e.target.value) })} />
              </Field>
              <Field label="Số khách tối đa">
                <input className="input" type="number" value={f.groupSize?.max ?? 50} onChange={(e) => up('groupSize', { ...f.groupSize, max: num(e.target.value) })} />
              </Field>
            </div>
            <Field label="Ngày khởi hành cụ thể">
              <div className="flex flex-wrap gap-2">
                {(f.departureDates ?? []).map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="date"
                      className="input !w-auto"
                      value={d}
                      onChange={(e) => up('departureDates', (f.departureDates ?? []).map((x, j) => (j === i ? e.target.value : x)))}
                    />
                    <button type="button" className="p-1 text-gray-400 hover:text-red-600" onClick={() => up('departureDates', (f.departureDates ?? []).filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => up('departureDates', [...(f.departureDates ?? []), ''])}>
                  <Plus className="h-4 w-4" /> Thêm ngày
                </Button>
              </div>
            </Field>
            <Field label="Tổng quan (HTML hoặc văn bản)">
              <textarea className="input" rows={6} value={f.overview ?? ''} onChange={(e) => up('overview', e.target.value)} />
            </Field>
            <Field label="Điểm nổi bật (mỗi dòng 1 mục)">
              <LinesInput value={f.highlights} onChange={(v) => up('highlights', v)} />
            </Field>
          </FormSection>

          <FormSection title={`Lịch trình (${f.itinerary?.length ?? 0} ngày)`}>
            <ArrayEditor<ItineraryDay>
              items={f.itinerary ?? []}
              onChange={(v) => up('itinerary', v)}
              createItem={() => ({ day: (f.itinerary?.length ?? 0) + 1, title: '', content: '', meals: [], accommodation: '', image: '' })}
              itemLabel={(d, i) => `Ngày ${i + 1}${d.title ? ': ' + d.title : ''}`}
              addLabel="Thêm ngày"
              renderItem={(d, update) => (
                <>
                  <Field label="Tiêu đề">
                    <input className="input" value={d.title} onChange={(e) => update({ title: e.target.value })} />
                  </Field>
                  <Field label="Nội dung">
                    <textarea className="input" rows={5} value={d.content} onChange={(e) => update({ content: e.target.value })} />
                  </Field>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Bữa ăn" hint="Cách nhau bởi dấu phẩy, VD: Sáng, Trưa, Tối">
                      <input
                        className="input"
                        value={(d.meals ?? []).join(', ')}
                        onChange={(e) => update({ meals: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                      />
                    </Field>
                    <Field label="Lưu trú">
                      <input className="input" value={d.accommodation ?? ''} onChange={(e) => update({ accommodation: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Ảnh (URL)">
                    <ImageInput value={d.image} onChange={(image) => update({ image })} />
                  </Field>
                </>
              )}
            />
          </FormSection>

          <FormSection title="Dịch vụ bao gồm / không bao gồm">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bao gồm (mỗi dòng 1 mục)">
                <LinesInput value={f.inclusions} rows={6} onChange={(v) => up('inclusions', v)} />
              </Field>
              <Field label="Không bao gồm (mỗi dòng 1 mục)">
                <LinesInput value={f.exclusions} rows={6} onChange={(v) => up('exclusions', v)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Chính sách">
            {(
              [
                ['cancellation', 'Chính sách hoàn huỷ'],
                ['terms', 'Điều khoản'],
                ['children', 'Chính sách trẻ em'],
                ['notes', 'Lưu ý'],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={label}>
                <textarea className="input" rows={3} value={f.policies?.[k] ?? ''} onChange={(e) => up('policies', { ...f.policies, [k]: e.target.value })} />
              </Field>
            ))}
          </FormSection>

          <FormSection title={`Hỏi đáp (${f.faqs?.length ?? 0})`}>
            <ArrayEditor<Faq>
              items={f.faqs ?? []}
              onChange={(v) => up('faqs', v)}
              createItem={() => ({ question: '', answer: '' })}
              itemLabel={(q, i) => `#${i + 1} ${q.question}`}
              addLabel="Thêm câu hỏi"
              renderItem={(q, update) => (
                <>
                  <Field label="Câu hỏi">
                    <input className="input" value={q.question} onChange={(e) => update({ question: e.target.value })} />
                  </Field>
                  <Field label="Trả lời">
                    <textarea className="input" rows={3} value={q.answer} onChange={(e) => update({ answer: e.target.value })} />
                  </Field>
                </>
              )}
            />
          </FormSection>

          <FormSection title="Hình ảnh & Video">
            <Field label="Ảnh đại diện (URL)">
              <ImageInput value={f.thumbnail} onChange={(v) => up('thumbnail', v)} />
            </Field>
            <Field label="Thư viện ảnh">
              <ImageListInput value={f.gallery} onChange={(v) => up('gallery', v)} />
            </Field>
            <Field label="Video (Youtube URL)">
              <input className="input" value={f.videoUrl ?? ''} onChange={(e) => up('videoUrl', e.target.value)} />
            </Field>
          </FormSection>

          <FormSection title="SEO">
            <Field label="Meta title">
              <input className="input" value={f.seo?.metaTitle ?? ''} onChange={(e) => up('seo', { ...f.seo, metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta description">
              <textarea className="input" rows={2} value={f.seo?.metaDescription ?? ''} onChange={(e) => up('seo', { ...f.seo, metaDescription: e.target.value })} />
            </Field>
            <Field label="OG image (URL)">
              <ImageInput value={f.seo?.ogImage} onChange={(v) => up('seo', { ...f.seo, ogImage: v })} />
            </Field>
          </FormSection>
        </div>

        <div className="space-y-5">
          <FormSection title="Xuất bản">
            <Field label="Trạng thái">
              <select className="input" value={f.status} onChange={(e) => up('status', e.target.value as TourStatus)}>
                {Object.entries(TOUR_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Toggle checked={!!f.isFeatured} onChange={(v) => up('isFeatured', v)} label="Tour nổi bật (trang chủ)" />
            <Toggle checked={!!f.isHot} onChange={(v) => up('isHot', v)} label="Tour HOT" />
          </FormSection>

          <FormSection title="Giá tour">
            {(
              [
                ['adult', 'Giá người lớn'],
                ['child', 'Giá trẻ em'],
                ['singleSupplement', 'Phụ thu phòng đơn'],
                ['originalPrice', 'Giá gốc (để hiện giảm giá)'],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={label} hint={f.price[k] ? formatPrice(f.price[k], f.price.currency) : undefined}>
                <input className="input" type="number" min={0} value={f.price[k] ?? 0} onChange={(e) => up('price', { ...f.price, [k]: num(e.target.value) })} />
              </Field>
            ))}
            <Field label="Tiền tệ">
              <select className="input" value={f.price.currency} onChange={(e) => up('price', { ...f.price, currency: e.target.value })}>
                {['VND', 'USD', 'EUR'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </FormSection>

          <FormSection title={`Điểm đến * (${f.destinations.length})`}>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {destinations.map((d) => (
                <label key={d._id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-brand-500" checked={f.destinations.includes(d._id)} onChange={() => up('destinations', toggleIn(f.destinations, d._id))} />
                  {d.name} <span className="text-xs text-gray-400">({REGION_LABELS[d.region]})</span>
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection title="Danh mục">
            {categories.length ? (
              categories.map((c) => (
                <label key={c._id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-brand-500" checked={f.categories.includes(c._id)} onChange={() => up('categories', toggleIn(f.categories, c._id))} />
                  {c.name}
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400">Chưa có danh mục loại "tour"</p>
            )}
          </FormSection>
        </div>
      </div>
    </form>
  );
}
