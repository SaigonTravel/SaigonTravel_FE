import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { BookingForm } from '@/components/BookingForm';
import { EventCard } from '@/components/cards';
import { MoreLink, PageBanner, SectionTitle } from '@/components/ui';
import { useEventProjects, useSettings } from '@/hooks/queries';

const VALUES = [
  { title: 'Sáng tạo', text: 'Mỗi chương trình là một concept riêng, phù hợp văn hoá và mục tiêu của doanh nghiệp.' },
  { title: 'Chuyên nghiệp', text: 'Quy trình chuẩn, đội ngũ điều phối giàu kinh nghiệm, năng lực tổ chức đến hàng nghìn khách.' },
  { title: 'Tận tâm', text: 'Đồng hành từ khâu tư vấn, khảo sát, triển khai đến hậu sự kiện.' },
  { title: 'Minh bạch', text: 'Báo giá rõ ràng, hợp đồng chặt chẽ, cam kết chất lượng dịch vụ.' },
];

export function AboutPage() {
  const { data: s } = useSettings();
  const { data: projects } = useEventProjects({ isFeatured: true, limit: 3 });
  const stats = s?.aboutIntro?.highlightStats ?? [];

  return (
    <>
      <Seo title="Giới thiệu" description={s?.aboutIntro?.shortDescription} />
      <PageBanner title={s?.aboutIntro?.title || 'Giới thiệu'} crumbs={[{ label: 'Giới thiệu' }]} />
      <section className="container grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          <h2 className="yan-heading">{s?.companyName || 'Saigon Travel'}</h2>
          <p className="text-base leading-relaxed">
            <strong className="text-ink">{s?.companyName}</strong>{' '}
            {s?.aboutIntro?.shortDescription ||
              'là đơn vị lữ hành và tổ chức sự kiện với nhiều năm kinh nghiệm, chuyên tour du lịch trong và ngoài nước, team building, gala dinner và hội nghị MICE cho doanh nghiệp.'}
          </p>
          <p className="mt-4 italic text-brand-500">“{s?.slogan || 'Sounds Great!'}”</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-lg bg-brand-50 p-6 text-center">
              <p className="font-heading text-3xl font-extrabold text-brand-500">{st.number}</p>
              <p className="mt-1 text-sm">{st.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="container">
          <SectionTitle title="Giá trị cốt lõi" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <div key={v.title} className="card p-6">
                <span className="font-heading text-4xl font-extrabold text-brand-200">0{i + 1}</span>
                <h3 className="mt-2 font-heading font-bold uppercase">{v.title}</h3>
                <p className="mt-2 text-sm">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!!projects?.data.length && (
        <section className="container py-14">
          <SectionTitle title="Dự án tiêu biểu" />
          <div className="grid gap-8 md:grid-cols-3">
            {projects.data.map((p) => (
              <EventCard key={p._id} project={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <MoreLink to="/su-kien" />
          </div>
        </section>
      )}
    </>
  );
}

export function ContactPage() {
  const { data: s } = useSettings();
  const rows = [
    { icon: MapPin, label: 'Địa chỉ', value: s?.address },
    { icon: Phone, label: 'Hotline', value: s?.hotline, href: s?.hotline && `tel:${s.hotline.replace(/[^\d+]/g, '')}` },
    { icon: Mail, label: 'Email', value: s?.email, href: s?.email && `mailto:${s.email}` },
    { icon: Clock, label: 'Giờ làm việc', value: s?.workingHours },
  ];
  return (
    <>
      <Seo title="Liên hệ" />
      <PageBanner title="Liên hệ" crumbs={[{ label: 'Liên hệ' }]} />
      <div className="container grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <h2 className="yan-heading">{s?.companyName || 'Saigon Travel'}</h2>
          <ul className="space-y-5">
            {rows
              .filter((r) => r.value)
              .map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase text-gray-500">{label}</span>
                    {href ? (
                      <a href={href} className="font-semibold text-ink hover:text-brand-500">
                        {value}
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{value}</span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
          {s?.address && (
            <iframe
              title="Bản đồ"
              className="mt-8 h-72 w-full rounded-lg border-0"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
            />
          )}
        </div>
        <BookingForm type="consultation" title="Gửi yêu cầu tư vấn" />
      </div>
    </>
  );
}

export function NotFoundPage() {
  return (
    <div className="container flex flex-col items-center py-32 text-center">
      <Seo title="Không tìm thấy trang" />
      <p className="font-heading text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2">Trang bạn tìm có thể đã bị xoá hoặc đổi địa chỉ.</p>
      <Link to="/" className="mt-6 rounded bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600">
        Về trang chủ
      </Link>
    </div>
  );
}
