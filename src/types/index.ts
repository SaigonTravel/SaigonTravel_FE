// Kiểu dữ liệu khớp với các model Mongoose bên SaigonTravel_BE/src/models

export type Id = string;

export interface Timestamps {
  createdAt?: string;
  updatedAt?: string;
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
}

// ---- API envelopes ----
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  count: number;
}

export interface PaginatedResponse<T> extends ListResponse<T> {
  total: number;
  totalPages: number;
  currentPage: number;
}

// ---- User / Auth ----
export type Role = 'admin' | 'manager' | 'editor' | 'sales' | 'customer';

export interface User extends Timestamps {
  _id: Id;
  username: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface AuthPayload {
  user: User;
  token: string;
}

// ---- Category ----
export type CategoryType = 'tour' | 'teambuilding' | 'service' | 'event' | 'article';

export interface Category extends Timestamps {
  _id: Id;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  icon?: string;
  image?: string;
  parent?: Id | null;
  order?: number;
  isActive?: boolean;
}

// ---- Destination ----
export type Region = 'chau-a' | 'chau-au' | 'chau-my' | 'chau-uc' | 'chau-phi' | 'viet-nam';

export interface Destination extends Timestamps {
  _id: Id;
  name: string;
  slug: string;
  region: Region;
  country: string;
  city?: string;
  thumbnail?: string;
  banner?: string;
  description?: string;
  highlights?: string[];
  isPopular?: boolean;
  order?: number;
  isActive?: boolean;
  seo?: Seo;
}

export interface DestinationGroup {
  regionKey: Region;
  regionName: string;
  items: Destination[];
}

export interface DestinationDetail {
  destination: Destination;
  tours: Tour[];
  totalTours: number;
}

// ---- Tour ----
export type TourStatus = 'draft' | 'published' | 'archived';

export interface ItineraryDay {
  day: number;
  title: string;
  content: string;
  meals?: string[];
  accommodation?: string;
  image?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Tour extends Timestamps {
  _id: Id;
  title: string;
  slug: string;
  code?: string;
  destinations: (Destination | Id)[];
  categories?: (Category | Id)[];
  duration?: { days?: number; nights?: number; text?: string };
  departureLocation?: string;
  departureSchedule?: string;
  departureDates?: string[];
  price: {
    adult: number;
    child?: number;
    singleSupplement?: number;
    originalPrice?: number;
    currency?: string;
  };
  groupSize?: { min?: number; max?: number };
  languages?: string[];
  overview?: string;
  highlights?: string[];
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  policies?: { cancellation?: string; terms?: string; children?: string; notes?: string };
  faqs?: Faq[];
  thumbnail?: string;
  gallery?: string[];
  videoUrl?: string;
  isFeatured?: boolean;
  isHot?: boolean;
  status?: TourStatus;
  viewCount?: number;
  rating?: { average: number; count: number };
  seo?: Seo;
}

// ---- Service ----
export type ServiceType =
  | 'teambuilding'
  | 'amazing_race'
  | 'gala_dinner'
  | 'mice_conference'
  | 'training_workshop'
  | 'year_end_party'
  | 'family_day'
  | 'other';

export interface Service extends Timestamps {
  _id: Id;
  title: string;
  slug: string;
  category?: Category | Id | null;
  serviceType: ServiceType;
  shortDescription?: string;
  content?: string;
  targetAudience?: string;
  suggestedLocations?: string[];
  highlights?: string[];
  thumbnail?: string;
  gallery?: string[];
  videoUrl?: string;
  order?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  seo?: Seo;
}

// ---- Event project ----
export interface EventProject extends Timestamps {
  _id: Id;
  title: string;
  slug: string;
  clientName: string;
  clientLogo?: string;
  service?: Pick<Service, '_id' | 'title' | 'slug' | 'serviceType'> | Id | null;
  location?: string;
  participantsCount?: number;
  eventDate?: string;
  overview?: string;
  content?: string;
  thumbnail?: string;
  gallery?: string[];
  videoUrl?: string;
  isFeatured?: boolean;
  order?: number;
  status?: 'draft' | 'published';
}

// ---- Gallery ----
export interface GalleryItem {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
}

export interface Gallery extends Timestamps {
  _id: Id;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  category?: Category | Id | null;
  eventProject?: Pick<EventProject, '_id' | 'title' | 'slug' | 'clientName'> | Id | null;
  items: GalleryItem[];
  isFeatured?: boolean;
  order?: number;
  isActive?: boolean;
}

// ---- Booking ----
export type BookingType = 'tour_booking' | 'teambuilding_request' | 'custom_mice' | 'consultation';
export type BookingStatus = 'new' | 'contacted' | 'processing' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'unspecified' | 'bank_transfer' | 'cash' | 'vnpay' | 'credit_card';

export interface BookingCustomer {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  address?: string;
  note?: string;
}

export interface BookingDetails {
  departureDate?: string | null;
  returnDate?: string | null;
  durationDays?: number;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  participantCount?: number;
  destinationPreference?: string;
  estimatedBudget?: string;
  specialRequests?: string;
}

export interface Booking extends Timestamps {
  _id: Id;
  code: string;
  type: BookingType;
  tour?: Pick<Tour, '_id' | 'title' | 'slug' | 'code'> | Id | null;
  service?: Pick<Service, '_id' | 'title' | 'slug'> | Id | null;
  customer: BookingCustomer;
  details?: BookingDetails;
  pricing?: {
    totalAmount?: number;
    depositAmount?: number;
    currency?: string;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
  };
  status: BookingStatus;
  assignedTo?: Pick<User, '_id' | 'name' | 'email'> | Id | null;
  staffNotes?: { staff?: Pick<User, '_id' | 'name'> | Id; note: string; createdAt: string }[];
}

export interface CreateBookingInput {
  type: BookingType;
  tour?: Id;
  service?: Id;
  customer: BookingCustomer;
  details?: BookingDetails;
}

export interface CreateBookingResult {
  bookingCode: string;
  id: Id;
  createdAt: string;
}

// ---- Settings ----
export interface Slider {
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  order?: number;
  isActive?: boolean;
}

export interface Setting extends Timestamps {
  _id?: Id;
  companyName: string;
  slogan?: string;
  hotline: string;
  phone?: string;
  email: string;
  address: string;
  workingHours?: string;
  socialLinks?: { facebook?: string; youtube?: string; zalo?: string; instagram?: string; tiktok?: string };
  logo?: string;
  favicon?: string;
  sliders: Slider[];
  aboutIntro?: {
    title?: string;
    shortDescription?: string;
    highlightStats?: { number: string; label: string }[];
  };
  footerInfo?: { copyrightText?: string; licenseNumber?: string };
  seoDefault?: Seo;
}
