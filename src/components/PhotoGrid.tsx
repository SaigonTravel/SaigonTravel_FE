import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Img } from '@/components/ui';
import { cn } from '@/utils/format';

export interface Photo {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
}

export function PhotoGrid({ photos, className }: { photos: Photo[]; className?: string }) {
  const [index, setIndex] = useState(-1);
  if (!photos.length) return null;
  return (
    <>
      <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4', className)}>
        {photos.map((p, i) => (
          <button
            key={p.url + i}
            onClick={() => setIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-md"
            aria-label={p.title || `Ảnh ${i + 1}`}
          >
            <Img src={p.thumbnailUrl || p.url} alt={p.title} className="h-full w-full transition duration-500 group-hover:scale-110" />
            {p.title && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-2 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
                {p.title}
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos.map((p) => ({ src: p.url, alt: p.title, description: p.caption }))}
      />
    </>
  );
}

export const toPhotos = (urls: string[] = []): Photo[] => urls.filter(Boolean).map((url) => ({ url }));
