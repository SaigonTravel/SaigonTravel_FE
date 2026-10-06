import {
  FacebookIcon as Facebook,
  ZaloIcon as Zalo,
} from "@/components/icons";
import { useDestinationGroups, useSettings } from "@/hooks/queries";
import { cn, DEFAULT_LOGO, zaloLink } from "@/utils/format";
import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export const NAV_ITEMS = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/tour", label: "Tour du lịch", mega: true },
  { to: "/dich-vu", label: "Teambuilding & Sự kiện" },
  { to: "/su-kien", label: "Dự án tiêu biểu" },
  { to: "/hinh-anh", label: "Hình ảnh" },
  { to: "/lien-he", label: "Liên hệ" },
];

/** Logo Saigon Travel: lấy từ Cấu hình website, chưa có thì dùng logo mặc định */
export function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  const { data: settings } = useSettings();
  return (
    <img
      src={settings?.logo || DEFAULT_LOGO}
      alt={settings?.companyName || "Saigon Travel"}
      className={cn(
        "h-12 w-auto object-contain",
        light && "rounded-md bg-white p-1",
        className,
      )}
    />
  );
}

function TopBar() {
  const { data: s } = useSettings();
  const zalo = zaloLink(s?.socialLinks?.zalo || s?.hotline);
  return (
    <div className="bg-brand-900 text-xs text-white/80">
      <div className="container flex h-9 items-center justify-between gap-4">
        <span className="hidden truncate sm:block">
          {s?.slogan || "Sounds Great!"} — {s?.workingHours}
        </span>
        <div className="ml-auto flex items-center gap-4">
          {s?.socialLinks?.facebook && (
            <a
              href={s.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {zalo && (
            <a
              href={zalo}
              target="_blank"
              rel="noreferrer"
              aria-label="Zalo"
              className="hover:text-white"
            >
              <Zalo className="h-5 w-5" />
            </a>
          )}
          {s?.email && (
            <a
              href={`mailto:${s.email}`}
              className="flex items-center gap-1 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">{s.email}</span>
            </a>
          )}
          {s?.hotline && (
            <a
              href={`tel:${s.hotline.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-1 font-semibold text-white"
            >
              <Phone className="h-4 w-4" />
              {s.hotline}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function MegaMenu() {
  const { data: groups } = useDestinationGroups();
  if (!groups?.length) return null;
  return (
    <div className="invisible absolute left-1/2 top-full z-40 w-[min(900px,90vw)] -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
      <div className="grid grid-cols-2 gap-6 rounded-lg border-t-[3px] border-brand-500 bg-white p-6 shadow-xl md:grid-cols-3 lg:grid-cols-4">
        {groups.map((g) => (
          <div key={g.regionKey}>
            <p className="mb-2 font-heading text-sm font-bold uppercase text-brand-600">
              {g.regionName}
            </p>
            <ul className="space-y-1.5">
              {g.items.map((d) => (
                <li key={d._id}>
                  <Link
                    to={`/diem-den/${d.slug}`}
                    className="text-sm text-muted hover:text-brand-500"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { data: groups } = useDestinationGroups();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative flex h-full items-center px-3 text-[13px] font-semibold uppercase tracking-wide transition hover:text-brand-500",
      isActive ? "text-brand-500" : "text-ink",
    );

  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <div
        className={cn(
          "border-b border-gray-200 bg-white transition-shadow",
          scrolled && "shadow-md",
        )}
      >
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" aria-label="Trang chủ">
            <Logo className="h-[68px]" />
          </Link>

          <nav className="hidden h-full items-stretch lg:flex">
            {NAV_ITEMS.map((item) =>
              item.mega ? (
                <div key={item.to} className="group relative flex">
                  <NavLink to={item.to} className={linkCls}>
                    {item.label} <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </NavLink>
                  <MegaMenu />
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={linkCls}
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <button
            className="p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-6 w-6 text-ink" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "visible" : "invisible",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl transition-transform",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Đóng menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col divide-y divide-gray-100">
            {NAV_ITEMS.map((item) => (
              <div key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "block py-3 text-sm font-semibold uppercase",
                      isActive ? "text-brand-500" : "text-ink",
                    )
                  }
                >
                  {item.label}
                </NavLink>
                {item.mega && groups && (
                  <div className="space-y-2 pb-3 pl-3">
                    {groups.map((g) => (
                      <div key={g.regionKey}>
                        <p className="text-xs font-bold uppercase text-brand-600">
                          {g.regionName}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          {g.items.map((d) => (
                            <Link
                              key={d._id}
                              to={`/diem-den/${d.slug}`}
                              className="text-sm text-muted"
                            >
                              {d.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}
