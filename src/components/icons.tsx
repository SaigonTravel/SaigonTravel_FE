// lucide-react đã bỏ icon thương hiệu → tự định nghĩa SVG đơn giản
type P = { className?: string };

export const FacebookIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z" />
  </svg>
);

export const YoutubeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.8 31 31 0 0 0-.4-4.8ZM9.8 15V9l5.7 3-5.7 3Z" />
  </svg>
);

export const ZaloIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <rect width="24" height="24" rx="6" fill="currentColor" />
    <text x="12" y="15.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="Arial, sans-serif" fill="#393324">
      Zalo
    </text>
  </svg>
);
