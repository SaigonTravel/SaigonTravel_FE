import { Link, useParams } from 'react-router-dom';
import { Check, MapPin, Users } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { BookingForm } from '@/components/BookingForm';
import { EventCard, ServiceCard } from '@/components/cards';
import { PhotoGrid, toPhotos } from '@/components/PhotoGrid';
import { CardSkeletons, EmptyState, ErrorState, Img, PageBanner, RichText, SectionTitle, Spinner } from '@/components/ui';
import { useEventProjects, useService, useServices } from '@/hooks/queries';
import { refId, toEmbed } from '@/utils/format';
import { SERVICE_TYPE_LABELS } from '@/utils/labels';

export function ServicesPage() {
  const { data, isLoading, isError, refetch } = useServices();
  return (
    <>
      <Seo title="Teambuilding & Sự kiện" description="Dịch vụ team building, gala dinner, hội nghị MICE, year end party cho doanh nghiệp." />
      <PageBanner title="Teambuilding & Sự kiện" crumbs={[{ label: 'Dịch vụ' }]} />
      <div className="container py-14">
        <SectionTitle
          title="Dịch vụ của chúng tôi"
          subtitle="Mỗi chương trình được thiết kế riêng theo mục tiêu, văn hoá và ngân sách của doanh nghiệp."
        />
        {isLoading ? (
          <CardSkeletons count={8} className="lg:grid-cols-4" />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.length ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function ServiceDetailPage() {
  const { slug } = useParams();
  const { data: s, isLoading, isError } = useService(slug);
  const { data: others } = useServices();
  const { data: projects } = useEventProjects({ limit: 12 });

  if (isLoading) return <Spinner className="py-32" />;
  if (isError || !s) return <EmptyState message="Không tìm thấy dịch vụ" className="py-32" />;

  const relatedProjects = (projects?.data ?? []).filter((p) => refId(p.service) === s._id).slice(0, 3);

  return (
    <>
      <Seo title={s.seo?.metaTitle || s.title} description={s.seo?.metaDescription || s.shortDescription} image={s.thumbnail} />
      <PageBanner title={s.title} image={s.thumbnail} crumbs={[{ label: 'Dịch vụ', to: '/dich-vu' }, { label: s.title }]} />

      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-semibold uppercase text-white">
            {SERVICE_TYPE_LABELS[s.serviceType]}
          </span>
          {s.shortDescription && <p className="mt-4 text-lg font-medium text-ink">{s.shortDescription}</p>}

          <div className="mt-6 grid gap-4 rounded-lg bg-brand-50 p-5 text-sm sm:grid-cols-2">
            {s.targetAudience && (
              <p className="flex gap-2">
                <Users className="h-5 w-5 shrink-0 text-brand-500" />
                <span>
                  <strong className="block text-ink">Đối tượng</strong>
                  {s.targetAudience}
                </span>
              </p>
            )}
            {!!s.suggestedLocations?.length && (
              <p className="flex gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
                <span>
                  <strong className="block text-ink">Địa điểm gợi ý</strong>
                  {s.suggestedLocations.join(', ')}
                </span>
              </p>
            )}
          </div>

          {!!s.highlights?.length && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {s.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {h}
                </li>
              ))}
            </ul>
          )}

          <RichText content={s.content} className="mt-8" />
          {s.videoUrl && (
            <div className="mt-8 aspect-video overflow-hidden rounded-lg">
              <iframe src={toEmbed(s.videoUrl)} title={s.title} className="h-full w-full" allowFullScreen />
            </div>
          )}
          {!!s.gallery?.length && (
            <>
              <h2 className="yan-heading mt-10">Hình ảnh</h2>
              <PhotoGrid photos={toPhotos(s.gallery)} />
            </>
          )}
          {!!relatedProjects.length && (
            <>
              <h2 className="yan-heading mt-10">Dự án đã thực hiện</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((p) => (
                  <EventCard key={p._id} project={p} />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-6">
          <div className="sticky top-[128px] space-y-6">
            <BookingForm
              type={s.serviceType === 'mice_conference' ? 'custom_mice' : 'teambuilding_request'}
              serviceId={s._id}
              title="Nhận tư vấn & báo giá"
            />
            <div className="card p-5">
              <h3 className="yan-heading !text-sm">Dịch vụ khác</h3>
              <ul className="space-y-3">
                {(others ?? [])
                  .filter((o) => o._id !== s._id)
                  .slice(0, 5)
                  .map((o) => (
                    <li key={o._id}>
                      <Link to={`/dich-vu/${o.slug}`} className="flex items-center gap-3 hover:text-brand-500">
                        <Img src={o.thumbnail} alt={o.title} className="h-12 w-16 shrink-0 rounded" />
                        <span className="text-sm font-semibold">{o.title}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
