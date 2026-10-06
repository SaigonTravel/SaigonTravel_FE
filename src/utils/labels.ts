import type { BookingStatus, BookingType, CategoryType, Region, ServiceType, TourStatus } from '@/types';

export const REGION_LABELS: Record<Region, string> = {
  'chau-a': 'Châu Á',
  'chau-au': 'Châu Âu',
  'chau-my': 'Châu Mỹ',
  'chau-uc': 'Châu Úc',
  'chau-phi': 'Châu Phi',
  'viet-nam': 'Việt Nam',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  teambuilding: 'Teambuilding',
  amazing_race: 'Amazing Race',
  gala_dinner: 'Gala Dinner',
  mice_conference: 'Hội nghị MICE',
  training_workshop: 'Training & Workshop',
  year_end_party: 'Year End Party',
  family_day: 'Family Day',
  other: 'Khác',
};

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  tour: 'Tour',
  teambuilding: 'Teambuilding',
  service: 'Dịch vụ',
  event: 'Sự kiện',
  article: 'Bài viết',
};

export const TOUR_STATUS_LABELS: Record<TourStatus, string> = {
  published: 'Đã đăng',
  draft: 'Nháp',
  archived: 'Lưu trữ',
};

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  tour_booking: 'Đặt tour',
  teambuilding_request: 'Teambuilding',
  custom_mice: 'MICE theo yêu cầu',
  consultation: 'Tư vấn',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  processing: 'Đang xử lý',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  new: 'bg-sky-100 text-sky-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
};
