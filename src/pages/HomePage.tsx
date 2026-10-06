import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination as SwiperPagination } from 'swiper/modules';
import Lightbox from 'yet-another-react-lightbox';
import { Award, Headphones, Quote, ShieldCheck, Star } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'yet-another-react-lightbox/styles.css';

import { Seo } from '@/components/Seo';
import { BookingForm } from '@/components/BookingForm';
import { EventCard, ServiceCard, TourCard } from '@/components/cards';
import { CardSkeletons, Img, MoreLink, SectionTitle, Skeleton } from '@/components/ui';
import { useEventProjects, useGalleries, useServices, useSettings, useTours } from '@/hooks/queries';
import { populated, truncate } from '@/utils/format';
import type { EventProject, Service } from '@/types';

function HeroSlider() {
  const { data: s, isLoading } = useSettings();
  const slides = (s?.sliders ?? []).filter((x) => x.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (isLoading) return <Skeleton className="h-[52vh] rounded-none md:h-[70vh]" />;
  if (!slides.length) {
    return (
      <section className="flex h-[52vh] items-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 md:h-[70vh]">
        <div className="container text-white">
          <h1 className="max-w-3xl font-heading text-3xl font-extrabold uppercase text-white md:text-5xl">
            {s?.companyName || 'Saigon Travel'}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">Du lịch · Teambuilding · Sự kiện & MICE</p>
        </div>
      </section>
    );
  }

  return (
    <Swiper
      className="hero-swiper h-[52vh] md:h-[70vh]"
      modules={[Autoplay, EffectFade, Navigation, SwiperPagination]}
      effect="fade"
      loop={slides.length > 1}
      autoplay={{ delay: 5500, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i} className="relative">
          <Img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
          <div className="container relative flex h-full items-center">
            <div className="max-w-2xl text-white">
              {slide.title && (
                <h2 className="font-heading text-3xl font-extrabold uppercase leading-tight text-white md:text-5xl">{slide.title}</h2>
              )}
              {slide.subtitle && <p className="mt-4 text-base text-white/90 md:text-lg">{slide.subtitle}</p>}
              {slide.link && (
                <Link
                  to={slide.link}
                  className="mt-7 inline-block rounded bg-brand-500 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
                >
                  {slide.buttonText || 'Khám phá ngay'}
                </Link>
              )}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

/** Khối 4 cột đặc trưng của yanteambuilding: Giới thiệu | Sự kiện tiêu biểu | Training & Workshop | Hình ảnh */
function YanColumns() {
  const { data: s } = useSettings();
  const { data: projectsRes, isLoading: loadingProjects } = useEventProjects({ isFeatured: true, limit: 12 });
  const { data: services } = useServices();
  const { data: galleries } = useGalleries();
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const projects = projectsRes?.data ?? [];
  const isTraining = (p: EventProject) => populated<Pick<Service, '_id' | 'serviceType'>>(p.service)?.serviceType === 'training_workshop';
  const trainingProjects = projects.filter(isTraining);
  const featuredEvents = projects.filter((p) => !isTraining(p)).slice(0, 2);
  const trainingServices = (services ?? []).filter((sv) => sv.serviceType === 'training_workshop');

  const photos = useMemo(
    () => (galleries ?? []).flatMap((g) => g.items ?? []).slice(0, 6),
    [galleries],
  );

  return (
    <section className="py-14">
      <div className="container grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Giới thiệu */}
        <div>
          <h3 className="yan-heading">Giới thiệu</h3>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong className="text-ink">{s?.companyName || 'Saigon Travel'}</strong>{' '}
              {s?.aboutIntro?.shortDescription ||
                'với nhiều năm kinh nghiệm, là đơn vị được các doanh nghiệp trong nước và tập đoàn nước ngoài tin chọn cho các chương trình du lịch, team building, gala dinner và hội nghị MICE.'}
            </p>
          </div>
          <div className="mt-4">
            <MoreLink to="/gioi-thieu" />
          </div>
        </div>

        {/* Sự kiện tiêu biểu */}
        <div>
          <h3 className="yan-heading">Sự kiện tiêu biểu</h3>
          {loadingProjects ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="space-y-6">
              {featuredEvents.map((p) => (
                <EventCard key={p._id} project={p} compact />
              ))}
              {!featuredEvents.length && <p className="text-sm text-gray-400">Đang cập nhật…</p>}
            </div>
          )}
          <div className="mt-4">
            <MoreLink to="/su-kien" />
          </div>
        </div>

        {/* Training & Workshop */}
        <div>
          <h3 className="yan-heading">Training &amp; Workshop</h3>
          {trainingProjects[0] ? (
            <EventCard project={trainingProjects[0]} compact />
          ) : trainingServices[0] ? (
            <article className="group">
              <Link to={`/dich-vu/${trainingServices[0].slug}`} className="block aspect-video overflow-hidden rounded-md">
                <Img src={trainingServices[0].thumbnail} alt={trainingServices[0].title} className="h-full w-full" />
              </Link>
              <h4 className="mt-3 font-heading text-[15px] font-bold uppercase">{trainingServices[0].title}</h4>
              <p className="mt-2 text-sm">{truncate(trainingServices[0].shortDescription, 150)}</p>
            </article>
          ) : (
            <p className="text-sm text-gray-400">Đang cập nhật…</p>
          )}
          <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm">
            {[...trainingProjects.slice(1, 4), ...trainingServices.slice(trainingProjects[0] ? 0 : 1, 3)].map((x) => (
              <li key={x._id} className="before:mr-2 before:text-brand-500 before:content-['›']">
                <Link
                  to={'clientName' in x ? `/su-kien/${x.slug}` : `/dich-vu/${x.slug}`}
                  className="hover:text-brand-500"
                >
                  {'clientName' in x ? x.clientName : x.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <MoreLink to="/dich-vu" />
          </div>
        </div>

        {/* Hình ảnh */}
        <div>
          <h3 className="yan-heading">Hình ảnh</h3>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((ph, i) => (
              <button
                key={ph.url + i}
                onClick={() => setLightboxIndex(i)}
                className="aspect-[4/3] overflow-hidden rounded"
                aria-label={ph.title || 'Xem ảnh'}
              >
                <Img src={ph.thumbnailUrl || ph.url} alt={ph.title} className="h-full w-full transition hover:scale-110" />
              </button>
            ))}
            {!photos.length && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}
          </div>
          <div className="mt-4">
            <MoreLink to="/hinh-anh" />
          </div>
          <Lightbox
            open={lightboxIndex >= 0}
            index={lightboxIndex}
            close={() => setLightboxIndex(-1)}
            slides={photos.map((p) => ({ src: p.url, alt: p.title, description: p.caption }))}
          />
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const { data: s } = useSettings();
  const stats = s?.aboutIntro?.highlightStats ?? [];
  if (!stats.length) return null;
  return (
    <section className="bg-brand-500 py-12 text-white">
      <div className="container grid grid-cols-2 gap-8 text-center md:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label}>
            <p className="font-heading text-4xl font-extrabold text-white">{st.number}</p>
            <p className="mt-1 text-sm uppercase tracking-wide text-white/85">{st.label}</p>
          </div>
        ))}
        <div>
          <p className="font-heading text-4xl font-extrabold text-white">24/7</p>
          <p className="mt-1 text-sm uppercase tracking-wide text-white/85">Hỗ trợ khách hàng</p>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { data: services, isLoading } = useServices();
  if (!isLoading && !services?.length) return null;
  return (
    <section className="bg-brand-50 py-16">
      <div className="container">
        <SectionTitle
          title="Teambuilding & Sự kiện"
          subtitle="Thiết kế chương trình riêng cho doanh nghiệp: team building, gala dinner, hội nghị MICE, year end party, family day."
        />
        {isLoading ? (
          <CardSkeletons count={4} className="lg:grid-cols-4" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services!.slice(0, 8).map((sv) => (
              <ServiceCard key={sv._id} service={sv} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <MoreLink to="/dich-vu">Xem tất cả dịch vụ</MoreLink>
        </div>
      </div>
    </section>
  );
}

function FeaturedTours() {
  const { data: featured, isLoading } = useTours({ isFeatured: true, limit: 8 });
  const { data: latest } = useTours({ limit: 8 });
  const tours = featured?.data.length ? featured.data : latest?.data ?? [];
  return (
    <section className="py-16">
      <div className="container">
        <SectionTitle title="Tour du lịch nổi bật" subtitle="Hành trình trong và ngoài nước được tuyển chọn với dịch vụ tiêu chuẩn cao." />
        {isLoading ? (
          <CardSkeletons count={4} className="lg:grid-cols-4" />
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 6000 }}
            spaceBetween={20}
            slidesPerView={1.15}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }}
            className="!pb-2"
          >
            {tours.map((t) => (
              <SwiperSlide key={t._id} className="!h-auto">
                <TourCard tour={t} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div className="mt-8 text-center">
          <MoreLink to="/tour">Xem tất cả tour</MoreLink>
        </div>
      </div>
    </section>
  );
}

const WHY_US = [
  { icon: Award, title: 'Dịch vụ tiêu chuẩn', text: 'Đối tác khách sạn, nhà hàng, vận chuyển chất lượng, kiểm soát chặt chẽ từng chi tiết.' },
  { icon: Headphones, title: 'Tư vấn chuyên nghiệp 24/7', text: 'Đội ngũ giàu kinh nghiệm, đồng hành cùng bạn từ lúc lên ý tưởng đến khi kết thúc.' },
  { icon: ShieldCheck, title: 'Chăm sóc tận tâm', text: 'Chính sách rõ ràng, minh bạch chi phí, hỗ trợ khách hàng nhanh chóng.' },
];

const TESTIMONIALS = [
  { name: 'Chị Ngọc Anh', company: 'Phòng Nhân sự – Tập đoàn đa quốc gia', text: 'Chương trình team building được thiết kế rất sáng tạo, nhân viên ai cũng hào hứng. Gala dinner tổ chức chuyên nghiệp.' },
  { name: 'Anh Minh Tuấn', company: 'Khách lẻ – Tour Châu Âu', text: 'Lịch trình hợp lý, hướng dẫn viên nhiệt tình, khách sạn tốt. Chắc chắn sẽ quay lại với Saigon Travel.' },
  { name: 'Chị Thu Hà', company: 'Công ty CP Dược phẩm', text: 'Hội nghị khách hàng 500 người diễn ra suôn sẻ. Đội ngũ hỗ trợ xuyên suốt, xử lý tình huống rất nhanh.' },
];

function WhyUs() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <SectionTitle title="Vì sao chọn chúng tôi" />
        <div className="grid gap-6 md:grid-cols-3">
          {WHY_US.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-7 text-center transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-500">
                <Icon className="h-8 w-8" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold uppercase">{title}</h3>
              <p className="mt-2 text-sm">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card relative p-6">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-100" />
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm italic">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <strong className="text-ink">{t.name}</strong>
                <span className="block text-xs text-gray-500">{t.company}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsultCTA() {
  const { data: s } = useSettings();
  return (
    <section className="relative overflow-hidden bg-brand-900 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(141,81,65,0.6),transparent_55%)]" />
      <div className="container relative grid items-center gap-10 lg:grid-cols-2">
        <div className="text-white">
          <h2 className="font-heading text-2xl font-extrabold uppercase text-white md:text-4xl">
            Bạn cần tổ chức chương trình cho doanh nghiệp?
          </h2>
          <p className="mt-4 text-white/80">
            Để lại thông tin, chuyên viên tư vấn sẽ liên hệ trong vòng 30 phút (giờ hành chính) và gửi đề xuất chương trình
            phù hợp ngân sách.
          </p>
          {s?.hotline && (
            <a href={`tel:${s.hotline.replace(/[^\d+]/g, '')}`} className="mt-6 inline-block font-heading text-3xl font-extrabold text-brand-300">
              {s.hotline}
            </a>
          )}
        </div>
        <BookingForm type="consultation" dark className="rounded-lg bg-white/5 p-6 backdrop-blur" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Seo />
      <HeroSlider />
      <YanColumns />
      <StatsStrip />
      <ServicesSection />
      <FeaturedTours />
      <WhyUs />
      <ConsultCTA />
    </>
  );
}
