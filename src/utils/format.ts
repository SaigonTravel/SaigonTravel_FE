import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function formatPrice(value?: number, currency = 'VND') {
  if (!value) return 'Liên hệ';
  if (currency === 'VND') return `${value.toLocaleString('vi-VN')}đ`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatDate(value?: string | Date | null, withTime = false) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** yyyy-mm-dd cho input[type=date] */
export function toDateInput(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Chuyển tiêu đề tiếng Việt thành slug (BE chỉ tự sinh slug cho Tour) */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncate(text = '', length = 140) {
  const plain = stripHtml(text);
  return plain.length > length ? `${plain.slice(0, length).trimEnd()}…` : plain;
}

/** Nội dung từ BE có thể là HTML hoặc text thuần có xuống dòng */
export function isHtml(text = '') {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><rect width="400" height="260" fill="#e2d8d5"/><text x="200" y="138" font-family="Arial" font-size="18" fill="#8d5141" text-anchor="middle">Saigon Travel</text></svg>',
  );

/** Trả về object nếu field đã được populate, ngược lại null */
export function populated<T extends { _id: string }>(value: T | string | null | undefined): T | null {
  return value && typeof value === 'object' ? value : null;
}

/** Lấy _id dù field đã populate hay chưa */
export function refId(value: { _id: string } | string | null | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value._id;
}

/** Link Youtube thường → link nhúng */
export function toEmbed(url: string) {
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}

/** Logo Saigon Travel mặc định (dùng khi Cấu hình website chưa có logo/favicon) */
export const DEFAULT_LOGO = "https://saigon-travel.com/wp-content/uploads/2019/01/02.png";

/** Setting zalo có thể là URL hoặc chỉ là số điện thoại → luôn trả về link zalo.me */
export function zaloLink(raw?: string) {
  if (!raw) return "";
  if (/^https?:\/\//.test(raw)) return raw;
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+?84/, "0");
  return digits ? `https://zalo.me/${digits}` : "";
}
