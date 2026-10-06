import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { TourCard } from '@/components/cards';
import { Button, CardSkeletons, EmptyState, ErrorState, PageBanner, Pagination } from '@/components/ui';
import { useCategories, useDestinationGroups, useTours } from '@/hooks/queries';
import { cn } from '@/utils/format';

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 10 triệu', min: '', max: '10000000' },
  { label: '10 - 20 triệu', min: '10000000', max: '20000000' },
  { label: '20 - 40 triệu', min: '20000000', max: '40000000' },
  { label: 'Trên 40 triệu', min: '40000000', max: '' },
];

const SORTS = [
  { label: 'Mới nhất', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Giá tăng dần', sortBy: 'price.adult', sortOrder: 'asc' },
  { label: 'Giá giảm dần', sortBy: 'price.adult', sortOrder: 'desc' },
  { label: 'Xem nhiều', sortBy: 'viewCount', sortOrder: 'desc' },
] as const;

export default function ToursPage() {
  const [params, setParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(params.get('keyword') ?? '');
  const [showFilter, setShowFilter] = useState(false);

  const page = Number(params.get('page') || 1);
  const sortIdx = Number(params.get('sort') || 0);
  const priceIdx = Number(params.get('price') || 0);
  const price = PRICE_RANGES[priceIdx] ?? PRICE_RANGES[0];
  const sort = SORTS[sortIdx] ?? SORTS[0];

  const query = {
    keyword: params.get('keyword') || undefined,
    destination: params.get('destination') || undefined,
    category: params.get('category') || undefined,
    minPrice: price.min ? Number(price.min) : undefined,
    maxPrice: price.max ? Number(price.max) : undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page,
    limit: 12,
  };

  const { data, isLoading, isError, refetch, isFetching } = useTours(query);
  const { data: groups } = useDestinationGroups();
  const { data: categories } = useCategories('tour');

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    update({ keyword: keywordInput.trim() || undefined });
  };

  return (
    <>
      <Seo title="Tour du lịch" description="Tour du lịch trong nước và quốc tế trọn gói, khởi hành hàng tuần." />
      <PageBanner title="Tour du lịch" crumbs={[{ label: 'Tour du lịch' }]} />

      <div className="container grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <aside className={cn('space-y-6 lg:block', showFilter ? 'block' : 'hidden')}>
          <form onSubmit={onSearch} className="card p-4">
            <h3 className="yan-heading !mb-3 !text-sm">Tìm kiếm</h3>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Tên tour, mã tour…"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
              <Button type="submit" aria-label="Tìm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="card p-4">
            <h3 className="yan-heading !mb-3 !text-sm">Điểm đến</h3>
            <select
              className="input"
              value={params.get('destination') ?? ''}
              onChange={(e) => update({ destination: e.target.value || undefined })}
            >
              <option value="">Tất cả điểm đến</option>
              {groups?.map((g) => (
                <optgroup key={g.regionKey} label={g.regionName}>
                  {g.items.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {!!categories?.length && (
            <div className="card p-4">
              <h3 className="yan-heading !mb-3 !text-sm">Loại tour</h3>
              <div className="space-y-2 text-sm">
                {[{ _id: '', name: 'Tất cả' }, ...categories].map((c) => (
                  <label key={c._id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      className="accent-brand-500"
                      checked={(params.get('category') ?? '') === c._id}
                      onChange={() => update({ category: c._id || undefined })}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="card p-4">
            <h3 className="yan-heading !mb-3 !text-sm">Mức giá</h3>
            <div className="space-y-2 text-sm">
              {PRICE_RANGES.map((p, i) => (
                <label key={p.label} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    className="accent-brand-500"
                    checked={priceIdx === i}
                    onChange={() => update({ price: i ? String(i) : undefined })}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              Tìm thấy <strong className="text-ink">{data?.total ?? 0}</strong> tour
              {isFetching && !isLoading && <span className="ml-2 text-gray-400">(đang tải…)</span>}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilter((v) => !v)}>
                <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
              </Button>
              <select
                className="input !w-auto"
                value={sortIdx}
                onChange={(e) => update({ sort: e.target.value === '0' ? undefined : e.target.value })}
              >
                {SORTS.map((s, i) => (
                  <option key={s.label} value={i}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <CardSkeletons count={6} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : !data?.data.length ? (
            <EmptyState message="Không tìm thấy tour phù hợp" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.data.map((t) => (
                <TourCard key={t._id} tour={t} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            onChange={(p) => {
              update({ page: String(p) });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </>
  );
}
