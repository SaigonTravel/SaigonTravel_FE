import { useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { TourCard } from '@/components/cards';
import { EmptyState, PageBanner, RichText, Spinner } from '@/components/ui';
import { useDestinationDetail } from '@/hooks/queries';
import { REGION_LABELS } from '@/utils/labels';

export default function DestinationPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useDestinationDetail(slug);

  if (isLoading) return <Spinner className="py-32" />;
  if (isError || !data) return <EmptyState message="Không tìm thấy điểm đến" className="py-32" />;
  const { destination: d, tours } = data;

  return (
    <>
      <Seo title={d.seo?.metaTitle || `Du lịch ${d.name}`} description={d.seo?.metaDescription || d.description} image={d.banner || d.thumbnail} />
      <PageBanner
        title={`Du lịch ${d.name}`}
        image={d.banner || d.thumbnail}
        crumbs={[{ label: 'Tour du lịch', to: '/tour' }, { label: REGION_LABELS[d.region] }, { label: d.name }]}
      />
      <div className="container py-12">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-brand-500">
          <MapPin className="h-4 w-4" /> {[d.city, d.country].filter(Boolean).join(', ')}
        </p>
        <RichText content={d.description} />
        {!!d.highlights?.length && (
          <div className="mt-5 flex flex-wrap gap-2">
            {d.highlights.map((h) => (
              <span key={h} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                {h}
              </span>
            ))}
          </div>
        )}

        <h2 className="section-title mb-8 mt-12">
          Tour {d.name} <span className="text-base font-normal normal-case text-muted">({tours.length} tour)</span>
        </h2>
        {tours.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((t) => (
              <TourCard key={t._id} tour={{ ...t, destinations: [d] }} />
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có tour cho điểm đến này" />
        )}
      </div>
    </>
  );
}
