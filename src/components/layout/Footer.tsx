import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useServices, useSettings } from '@/hooks/queries';
import { cn, zaloLink } from '@/utils/format';
import { Logo, NAV_ITEMS } from './Header';

export function Footer() {
  const { data: s } = useSettings();
  const { data: services } = useServices();

  return (
    <footer className="bg-brand-900 text-sm text-white/70">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo light />
          <p className="mt-4 leading-relaxed">
            {s?.aboutIntro?.shortDescription ||
              'Đơn vị tổ chức tour du lịch, teambuilding, sự kiện và MICE uy tín với nhiều năm kinh nghiệm.'}
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-white">Liên hệ</h4>
          <ul className="space-y-3">
            {s?.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> {s.address}
              </li>
            )}
            {s?.hotline && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <a href={`tel:${s.hotline.replace(/[^\d+]/g, '')}`} className="hover:text-white">
                  {s.hotline}
                </a>
              </li>
            )}
            {s?.email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <a href={`mailto:${s.email}`} className="hover:text-white">
                  {s.email}
                </a>
              </li>
            )}
            {s?.workingHours && (
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> {s.workingHours}
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-white">Dịch vụ</h4>
          <ul className="space-y-2">
            {(services ?? []).slice(0, 6).map((sv) => (
              <li key={sv._id}>
                <Link to={`/dich-vu/${sv.slug}`} className="hover:text-white">
                  {sv.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/tour" className="hover:text-white">
                Tour du lịch trong & ngoài nước
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-white">Liên kết</h4>
          <ul className="space-y-2">
            {NAV_ITEMS.slice(1).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 pb-16 pt-5 text-center text-xs md:flex-row md:text-left lg:pb-5">
          <p>{s?.footerInfo?.copyrightText || `Copyright © ${new Date().getFullYear()} Saigon Travel.`}</p>
          {s?.footerInfo?.licenseNumber && <p>{s.footerInfo.licenseNumber}</p>}
        </div>
      </div>
    </footer>
  );
}

/** Nút liên hệ nổi (hotline, Zalo, Messenger) + nút lên đầu trang */
export function FloatingContact() {
  const { data: s } = useSettings();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const phone = (s?.hotline || '').replace(/[^\d+]/g, '');
  const zalo = zaloLink(s?.socialLinks?.zalo || phone);
  const messenger = s?.socialLinks?.facebook?.includes('facebook.com')
    ? s.socialLinks.facebook.replace(/https?:\/\/(www\.)?facebook\.com/, 'https://m.me')
    : '';

  return (
    <>
      {/* Desktop: các nút tròn nhỏ nằm trong lề trái, không đè lên nội dung */}
      <div className="fixed bottom-5 left-4 z-40 hidden flex-col gap-3 lg:flex">
        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label={`Gọi ${s?.hotline}`}
            className="group flex h-12 items-center overflow-hidden rounded-full bg-red-600 text-sm font-bold text-white shadow-lg"
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <span className="absolute inset-1.5 animate-ping rounded-full bg-white/25" />
              <Phone className="h-5 w-5" />
            </span>
            <span className="max-w-0 whitespace-nowrap pr-0 transition-all duration-300 group-hover:max-w-[200px] group-hover:pr-4">
              {s?.hotline}
            </span>
          </a>
        )}
        {zalo && (
          <a
            href={zalo}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068ff] text-xs font-extrabold text-white shadow-lg"
            aria-label="Zalo"
          >
            Zalo
          </a>
        )}
        {messenger && (
          <a
            href={messenger}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00b2ff] to-[#a033ff] text-white shadow-lg"
            aria-label="Messenger"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        )}
      </div>

      {/* Mobile/tablet: thanh liên hệ cố định dưới đáy (PublicLayout chừa pb tương ứng) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-14 auto-cols-fr grid-flow-col border-t border-white/10 bg-brand-900 text-xs font-semibold text-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)] lg:hidden">
        {phone && (
          <a href={`tel:${phone}`} className="flex flex-col items-center justify-center gap-0.5 bg-red-600">
            <Phone className="h-5 w-5" /> Gọi ngay
          </a>
        )}
        {zalo && (
          <a href={zalo} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-0.5 bg-[#0068ff]">
            <span className="text-sm font-extrabold leading-5">Zalo</span> Chat Zalo
          </a>
        )}
        {messenger && (
          <a href={messenger} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-0.5">
            <MessageCircle className="h-5 w-5" /> Messenger
          </a>
        )}
      </nav>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          'fixed bottom-[72px] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition lg:bottom-5',
          showTop ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-label="Lên đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
