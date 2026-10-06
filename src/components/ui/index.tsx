import { forwardRef, useState, type ButtonHTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronRight as Arrow, Inbox, Loader2 } from 'lucide-react';
import { cn, isHtml, PLACEHOLDER_IMG } from '@/utils/format';

// ---------- Button ----------
type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'light';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  outline: 'border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white',
  ghost: 'text-ink hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  light: 'bg-white text-brand-600 hover:bg-brand-50',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

// ---------- Image with fallback ----------
export function Img({ src, alt = '', className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={!src || failed ? PLACEHOLDER_IMG : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
      {...rest}
    />
  );
}

// ---------- Headings ----------
export function SectionTitle({
  title,
  subtitle,
  align = 'center',
  className,
}: {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cn('mb-10', align === 'center' && 'text-center', className)}>
      <h2 className="section-title">{title}</h2>
      <span className={cn('mt-3 block h-[3px] w-16 bg-brand-500', align === 'center' && 'mx-auto')} />
      {subtitle && <p className={cn('mt-4 text-muted', align === 'center' && 'mx-auto max-w-2xl')}>{subtitle}</p>}
    </div>
  );
}

export function MoreLink({ to, children = 'Tham khảo thêm' }: { to: string; children?: ReactNode }) {
  return (
    <Link to={to} className="link-more">
      {children} <Arrow className="h-4 w-4" />
    </Link>
  );
}

// ---------- Page banner (giống header ảnh của các trang con yanteambuilding) ----------
export function PageBanner({
  title,
  image,
  crumbs = [],
}: {
  title: string;
  image?: string;
  crumbs?: { label: string; to?: string }[];
}) {
  return (
    <section className="relative flex h-56 items-center overflow-hidden bg-brand-900 md:h-72">
      {image && <Img src={image} alt={title} className="absolute inset-0 h-full w-full opacity-50" />}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 to-brand-700/30" />
      <div className="container relative">
        <h1 className="font-heading text-2xl font-bold uppercase text-white md:text-4xl">{title}</h1>
        <nav className="mt-3 flex flex-wrap items-center gap-1 text-sm text-white/80">
          <Link to="/" className="hover:text-white">
            Trang chủ
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              {c.to ? (
                <Link to={c.to} className="hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}

// ---------- States ----------
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-16', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />;
}

export function CardSkeletons({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="h-48 rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message = 'Chưa có dữ liệu', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-16 text-gray-400', className)}>
      <Inbox className="h-10 w-10" />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Không tải được dữ liệu', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

// ---------- Pagination ----------
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const btn = 'flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition';
  return (
    <nav className="mt-10 flex items-center justify-center gap-1">
      <button className={cn(btn, 'border-gray-300 disabled:opacity-40')} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            className={cn(btn, p === page ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300 hover:border-brand-500')}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        className={cn(btn, 'border-gray-300 disabled:opacity-40')}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

// ---------- Rich text (HTML hoặc text có xuống dòng) ----------
export function RichText({ content, className }: { content?: string; className?: string }) {
  if (!content) return null;
  if (isHtml(content)) {
    return <div className={cn('prose-content', className)} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <div className={cn('prose-content whitespace-pre-line', className)}>{content}</div>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold', className)}>{children}</span>
  );
}
