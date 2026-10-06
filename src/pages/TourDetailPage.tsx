import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bed, Calendar, Check, ChevronDown, Clock, Globe, MapPin, Users, Utensils, X } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { BookingForm } from '@/components/BookingForm';
import { PhotoGrid, toPhotos } from '@/components/PhotoGrid';
import { TourCard } from '@/components/cards';
import { EmptyState, Img, PageBanner, RichText, Spinner } from '@/components/ui';
import { useTour, useTours } from '@/hooks/queries';
import { cn, formatDate, formatPrice, populated, toEmbed } from '@/utils/format';
import type { Destination } from '@/types';

function Accordion({ title, children, defaultOpen = false }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 py-4 text-left">
        <span className="font-heading font-semibold text-ink">{title}</span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-brand-500 transition', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'itinerary', label: 'Lịch trình' },
  { id: 'price', label: 'Giá & Dịch vụ' },
  { id: 'policy', label: 'Điều khoản' },
  { id: 'faq', label: 'Hỏi đáp' },
];

export default function TourDetailPage() {
  const { slug } = useParams();
  const { data: tour, isLoading, isError } = useTour(slug);
  const firstDest = populated<Destination>(tour?.destinations?.[0]);
  const { data: related } = useTours(firstDest ? { destination: firstDest._id, limit: 4 } : { limit: 4 });

  if (isLoading) return <Spinner className="py-32" />;
  if (isError || !tour) return <EmptyState message="Không tìm thấy tour" className="py-32" />;

  const dests = (tour.destinations || []).map((d) => populated<Destination>(d)).filter(Boolean) as Destination[];
  const photos = toPhotos([tour.thumbnail || '', ...(tour.gallery ?? [])]);
  const cur = tour.price.currency;
  const policies = (
    [
      ['Chính sách hoàn huỷ', tour.policies?.cancellation],
      ['Điều kiện & điều khoản', tour.policies?.terms],
      ['Chính sách trẻ em', tour.policies?.children],
      ['Lưu ý', tour.policies?.notes],
    ] as [string, string | undefined][]
  ).filter(([, v]) => v);
  const tabs = TABS.filter(
    (t) => (t.id !== 'policy' || policies.length) && (t.id !== 'faq' || tour.faqs?.length),
  );

  return (
    <>
      <Seo title={tour.seo?.metaTitle || tour.title} description={tour.seo?.metaDescription} image={tour.seo?.ogImage || tour.thumbnail} />
      <PageBanner
        title={tour.title}
        image={tour.thumbnail}
        crumbs={[{ label: 'Tour du lịch', to: '/tour' }, ...(firstDest ? [{ label: firstDest.name, to: `/diem-den/${firstDest.slug}` }] : [])]}
      />

      <div className="container grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {/* Thông tin nhanh */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-brand-50 p-5 text-sm md:grid-cols-4">
            <Info icon={Clock} label="Thời gian" value={tour.duration?.text || `${tour.duration?.days ?? 1} ngày`} />
            <Info icon={MapPin} label="Khởi hành" value={tour.departureLocation} />
            <Info icon={Users} label="Số khách" value={tour.groupSize ? `${tour.groupSize.min} - ${tour.groupSize.max} khách` : ''} />
            <Info icon={Globe} label="Mã tour" value={tour.code} />
          </div>

          <nav className="sticky top-[116px] z-10 mt-8 flex gap-1 overflow-x-auto border-b border-gray-200 bg-white">
            {tabs.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-semibold uppercase text-ink hover:border-brand-500 hover:text-brand-500"
              >
                {t.label}
              </a>
            ))}
          </nav>

          <section id="overview" className="scroll-mt-40 pt-8">
            <h2 className="yan-heading">Tổng quan</h2>
            {dests.length > 0 && (
              <p className="mb-3 text-sm">
                <strong className="text-ink">Điểm đến:</strong> {dests.map((d) => d.name).join(' – ')}
              </p>
            )}
            {tour.departureSchedule && (
              <p className="mb-3 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-brand-500" /> {tour.departureSchedule}
              </p>
            )}
            <RichText content={tour.overview} />
            {!!tour.highlights?.length && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {h}
                  </li>
                ))}
              </ul>
            )}
            {photos.length > 1 && <PhotoGrid photos={photos} className="mt-6" />}
            {tour.videoUrl && (
              <div className="mt-6 aspect-video overflow-hidden rounded-lg">
                <iframe src={toEmbed(tour.videoUrl)} title={tour.title} className="h-full w-full" allowFullScreen />
              </div>
            )}
          </section>

          <section id="itinerary" className="scroll-mt-40 pt-10">
            <h2 className="yan-heading">Lịch trình</h2>
            {tour.itinerary?.length ? (
              <div>
                {tour.itinerary.map((d, i) => (
                  <Accordion
                    key={d.day}
                    defaultOpen={i === 0}
                    title={
                      <span className="flex items-center gap-3">
                        <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">NGÀY {d.day}</span>
                        {d.title}
                      </span>
                    }
                  >
                    {d.image && <Img src={d.image} alt={d.title} className="mb-4 max-h-80 w-full rounded-md" />}
                    <RichText content={d.content} />
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                      {!!d.meals?.length && (
                        <span className="flex items-center gap-1">
                          <Utensils className="h-3.5 w-3.5" /> {d.meals.join(', ')}
                        </span>
                      )}
                      {d.accommodation && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" /> {d.accommodation}
                        </span>
                      )}
                    </div>
                  </Accordion>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Lịch trình đang được cập nhật.</p>
            )}
          </section>

          <section id="price" className="scroll-mt-40 pt-10">
            <h2 className="yan-heading">Giá & Dịch vụ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  <PriceRow label="Người lớn" value={formatPrice(tour.price.adult, cur)} strong />
                  {!!tour.price.child && <PriceRow label="Trẻ em" value={formatPrice(tour.price.child, cur)} />}
                  {!!tour.price.singleSupplement && <PriceRow label="Phụ thu phòng đơn" value={formatPrice(tour.price.singleSupplement, cur)} />}
                </tbody>
              </table>
            </div>
            {!!tour.departureDates?.length && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tour.departureDates.map((d) => (
                  <span key={d} className="rounded border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                    {formatDate(d)}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ListBlock title="Giá tour bao gồm" items={tour.inclusions} icon="check" />
              <ListBlock title="Không bao gồm" items={tour.exclusions} icon="x" />
            </div>
          </section>

          {!!policies.length && (
            <section id="policy" className="scroll-mt-40 pt-10">
              <h2 className="yan-heading">Điều khoản</h2>
              {policies.map(([k, v]) => (
                <Accordion key={k} title={k}>
                  <RichText content={v} />
                </Accordion>
              ))}
            </section>
          )}

          {!!tour.faqs?.length && (
            <section id="faq" className="scroll-mt-40 pt-10">
              <h2 className="yan-heading">Hỏi đáp</h2>
              {tour.faqs.map((f) => (
                <Accordion key={f.question} title={f.question}>
                  <RichText content={f.answer} />
                </Accordion>
              ))}
            </section>
          )}
        </div>

        <aside>
          <div className="sticky top-[128px] space-y-4">
            <div className="rounded-lg bg-brand-500 p-5 text-white">
              <p className="text-sm text-white/80">Giá chỉ từ</p>
              {!!tour.price.originalPrice && tour.price.originalPrice > tour.price.adult && (
                <p className="text-sm text-white/70 line-through">{formatPrice(tour.price.originalPrice, cur)}</p>
              )}
              <p className="font-heading text-3xl font-extrabold text-white">{formatPrice(tour.price.adult, cur)}</p>
              <p className="text-xs text-white/70">/ khách</p>
            </div>
            <BookingForm type="tour_booking" tourId={tour._id} title="Đặt tour / Giữ chỗ" />
          </div>
        </aside>
      </div>

      {!!related?.data.filter((t) => t._id !== tour._id).length && (
        <section className="bg-gray-50 py-14">
          <div className="container">
            <h2 className="section-title mb-8">Tour liên quan</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.data
                .filter((t) => t._id !== tour._id)
                .slice(0, 3)
                .map((t) => (
                  <TourCard key={t._id} tour={t} />
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

function PriceRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr>
      <td className="py-3">{label}</td>
      <td className={cn('py-3 text-right font-semibold', strong ? 'text-lg text-red-600' : 'text-ink')}>{value}</td>
    </tr>
  );
}

function ListBlock({ title, items, icon }: { title: string; items?: string[]; icon: 'check' | 'x' }) {
  if (!items?.length) return null;
  const Icon = icon === 'check' ? Check : X;
  return (
    <div>
      <h3 className="mb-3 font-heading text-sm font-bold uppercase">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon === 'check' ? 'text-emerald-600' : 'text-red-500')} /> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

