import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { EventCard } from '@/components/cards';
import { PhotoGrid, toPhotos } from '@/components/PhotoGrid';
import { CardSkeletons, EmptyState, ErrorState, Img, PageBanner, Pagination, RichText, Spinner } from '@/components/ui';
import { useEventProject, useEventProjects } from '@/hooks/queries';
import { formatDate, populated, toEmbed } from '@/utils/format';
import type { Service } from '@/types';

export function EventsPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const { data, isLoading, isError, refetch } = useEventProjects({ page, limit: 9 });

  return (
    <>
      <Seo title="Dự án tiêu biểu" description="Các sự kiện, team building, gala dinner tiêu biểu đã tổ chức cho doanh nghiệp." />
      <PageBanner title="Dự án tiêu biểu" crumbs={[{ label: 'Dự án tiêu biểu' }]} />
      <div className="container py-14">
        {isLoading ? (
          <CardSkeletons count={6} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data.length ? (
          <EmptyState />
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((p) => (
              <EventCard key={p._id} project={p} />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={(p) => setParams({ page: String(p) })} />
      </div>
    </>
  );
}

export function EventDetailPage() {
  const { slug } = useParams();
  const { data: p, isLoading, isError } = useEventProject(slug);
  const { data: more } = useEventProjects({ limit: 4 });

  if (isLoading) return <Spinner className="py-32" />;
  if (isError || !p) return <EmptyState message="Không tìm thấy dự án" className="py-32" />;
  const service = populated<Pick<Service, '_id' | 'title' | 'slug'>>(p.service);

  return (
    <>
      <Seo title={p.title} description={p.overview} image={p.thumbnail} />
      <PageBanner title={p.title} image={p.thumbnail} crumbs={[{ label: 'Dự án tiêu biểu', to: '/su-kien' }, { label: p.clientName }]} />
      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-200 pb-5 text-sm">
            {p.clientLogo && <Img src={p.clientLogo} alt={p.clientName} className="h-12 w-auto object-contain" />}
            <span>
              Khách hàng: <strong className="text-ink">{p.clientName}</strong>
            </span>
            {p.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-500" /> {p.location}
              </span>
            )}
            {!!p.participantsCount && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-brand-500" /> {p.participantsCount.toLocaleString('vi-VN')} khách
              </span>
            )}
            {p.eventDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-brand-500" /> {formatDate(p.eventDate)}
              </span>
            )}
            {service && (
              <Link to={`/dich-vu/${service.slug}`} className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">
                {service.title}
              </Link>
            )}
          </div>
          {p.overview && <p className="mt-6 text-lg font-medium text-ink">{p.overview}</p>}
          <RichText content={p.content} className="mt-6" />
          {p.videoUrl && (
            <div className="mt-8 aspect-video overflow-hidden rounded-lg">
              <iframe src={toEmbed(p.videoUrl)} title={p.title} className="h-full w-full" allowFullScreen />
            </div>
          )}
          {!!p.gallery?.length && (
            <>
              <h2 className="yan-heading mt-10">Hình ảnh sự kiện</h2>
              <PhotoGrid photos={toPhotos(p.gallery)} className="lg:grid-cols-3" />
            </>
          )}
        </article>
        <aside>
          <h3 className="yan-heading">Dự án khác</h3>
          <div className="space-y-8">
            {(more?.data ?? [])
              .filter((x) => x._id !== p._id)
              .slice(0, 3)
              .map((x) => (
                <EventCard key={x._id} project={x} compact />
              ))}
          </div>
        </aside>
      </div>
    </>
  );
}
