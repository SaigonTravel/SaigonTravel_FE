import { useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { GalleryCard } from '@/components/cards';
import { PhotoGrid } from '@/components/PhotoGrid';
import { CardSkeletons, EmptyState, ErrorState, PageBanner, Spinner } from '@/components/ui';
import { useGalleries, useGallery } from '@/hooks/queries';

export function GalleriesPage() {
  const { data, isLoading, isError, refetch } = useGalleries();
  return (
    <>
      <Seo title="Hình ảnh" description="Thư viện hình ảnh các chương trình du lịch, team building và sự kiện." />
      <PageBanner title="Hình ảnh" crumbs={[{ label: 'Hình ảnh' }]} />
      <div className="container py-14">
        {isLoading ? (
          <CardSkeletons count={6} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.length ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((g) => (
              <GalleryCard key={g._id} gallery={g} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function GalleryDetailPage() {
  const { slug } = useParams();
  const { data: g, isLoading, isError } = useGallery(slug);

  if (isLoading) return <Spinner className="py-32" />;
  if (isError || !g) return <EmptyState message="Không tìm thấy album" className="py-32" />;
  const items = [...(g.items ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <>
      <Seo title={g.title} description={g.description} image={g.coverImage} />
      <PageBanner title={g.title} image={g.coverImage} crumbs={[{ label: 'Hình ảnh', to: '/hinh-anh' }, { label: g.title }]} />
      <div className="container py-12">
        {g.description && <p className="mb-8 max-w-3xl">{g.description}</p>}
        {items.length ? <PhotoGrid photos={items} /> : <EmptyState message="Album chưa có ảnh" />}
      </div>
    </>
  );
}
