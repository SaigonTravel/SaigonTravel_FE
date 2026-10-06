import { Link } from 'react-router-dom';
import { Calendar, Clock, Flame, Images, MapPin, Users } from 'lucide-react';
import { Img } from '@/components/ui';
import { formatDate, formatPrice, populated, truncate } from '@/utils/format';
import { SERVICE_TYPE_LABELS } from '@/utils/labels';
import type { Destination, EventProject, Gallery, Service, Tour } from '@/types';

export function TourCard({ tour }: { tour: Tour }) {
  const dests = (tour.destinations || []).map((d) => populated<Destination>(d)).filter(Boolean) as Destination[];
  const hasDiscount = !!tour.price.originalPrice && tour.price.originalPrice > tour.price.adult;
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/tour/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Img src={tour.thumbnail} alt={tour.title} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          {tour.isHot && (
            <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              <Flame className="h-3 w-3" /> HOT
            </span>
          )}
          {hasDiscount && (
            <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              -{Math.round((1 - tour.price.adult / tour.price.originalPrice!) * 100)}%
            </span>
          )}
        </div>
        {tour.code && (
          <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{tour.code}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {dests.length > 0 && (
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-brand-500">
            <MapPin className="h-3.5 w-3.5" /> {dests.map((d) => d.name).join(' - ')}
          </p>
        )}
        <h3 className="mb-3 line-clamp-2 font-heading text-base font-bold leading-snug">
          <Link to={`/tour/${tour.slug}`} className="hover:text-brand-500">
            {tour.title}
          </Link>
        </h3>
        <div className="mb-4 space-y-1 text-sm">
          {tour.duration?.text && (
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-400" /> {tour.duration.text}
            </p>
          )}
          {tour.departureSchedule && (
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-400" /> <span className="line-clamp-1">{tour.departureSchedule}</span>
            </p>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(tour.price.originalPrice, tour.price.currency)}</p>
            )}
            <p className="font-heading text-lg font-bold text-red-600">{formatPrice(tour.price.adult, tour.price.currency)}</p>
          </div>
          <Link to={`/tour/${tour.slug}`} className="rounded bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link to={`/dich-vu/${service.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-lg">
      <Img src={service.thumbnail} alt={service.title} className="h-full w-full transition duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="mb-2 inline-block rounded bg-brand-500 px-2 py-0.5 text-[11px] font-semibold uppercase">
          {SERVICE_TYPE_LABELS[service.serviceType] ?? service.serviceType}
        </span>
        <h3 className="font-heading text-lg font-bold uppercase leading-snug text-white">{service.title}</h3>
        <p className="mt-2 line-clamp-2 max-h-0 text-sm text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
          {truncate(service.shortDescription, 120)}
        </p>
      </div>
    </Link>
  );
}

/** Card sự kiện tiêu biểu, giống block "SỰ KIỆN TIÊU BIỂU" của yanteambuilding */
export function EventCard({ project, compact = false }: { project: EventProject; compact?: boolean }) {
  return (
    <article className="group">
      <Link to={`/su-kien/${project.slug}`} className="relative block aspect-video overflow-hidden rounded-md">
        <Img src={project.thumbnail} alt={project.title} className="h-full w-full transition duration-500 group-hover:scale-105" />
        {project.clientLogo && (
          <span className="absolute bottom-2 left-2 rounded bg-white/95 p-1 shadow">
            <Img src={project.clientLogo} alt={project.clientName} className="h-8 w-auto object-contain" />
          </span>
        )}
      </Link>
      <h4 className="mt-3 font-heading text-[15px] font-bold uppercase">
        <Link to={`/su-kien/${project.slug}`} className="hover:text-brand-500">
          {project.clientName || project.title}
        </Link>
      </h4>
      {!compact && (
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {project.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {project.location}
            </span>
          )}
          {!!project.participantsCount && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {project.participantsCount.toLocaleString('vi-VN')} khách
            </span>
          )}
          {project.eventDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(project.eventDate)}
            </span>
          )}
        </div>
      )}
      <p className="mt-2 text-sm leading-relaxed">{truncate(project.overview || project.content, compact ? 150 : 180)}</p>
    </article>
  );
}

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  return (
    <Link to={`/hinh-anh/${gallery.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg">
      <Img
        src={gallery.coverImage || gallery.items?.[0]?.url}
        alt={gallery.title}
        className="h-full w-full transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
        <h3 className="font-heading text-base font-bold uppercase text-white">{gallery.title}</h3>
        <span className="flex shrink-0 items-center gap-1 text-xs">
          <Images className="h-4 w-4" /> {gallery.items?.length ?? 0}
        </span>
      </div>
    </Link>
  );
}
