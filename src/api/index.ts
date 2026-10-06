import { api, cleanParams } from './client';
import { createResource } from './resource';
import type {
  ApiResponse,
  AuthPayload,
  Booking,
  BookingStatus,
  BookingType,
  Category,
  CategoryType,
  CreateBookingInput,
  CreateBookingResult,
  Destination,
  DestinationDetail,
  DestinationGroup,
  EventProject,
  Gallery,
  Id,
  PaginatedResponse,
  Region,
  Service,
  ServiceType,
  Setting,
  Tour,
  TourStatus,
  User,
} from '@/types';

export interface TourQuery {
  keyword?: string;
  destination?: Id;
  category?: Id;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isHot?: boolean;
  status?: TourStatus | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BookingQuery {
  status?: BookingStatus;
  type?: BookingType;
  keyword?: string;
  page?: number;
  limit?: number;
}

export const authApi = {
  login: (account: string, password: string) =>
    api.post<ApiResponse<AuthPayload>>('/auth/login', { account, password }).then((r) => r.data.data),
  me: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
};

export const settingsApi = {
  get: () => api.get<ApiResponse<Setting>>('/settings').then((r) => r.data.data),
  update: (body: Partial<Setting>) => api.put<ApiResponse<Setting>>('/settings', body).then((r) => r.data),
};

export const toursApi = {
  ...createResource<Tour, TourQuery, PaginatedResponse<Tour>>('/tours'),
  updateStatus: (id: Id, body: { status?: TourStatus; isFeatured?: boolean; isHot?: boolean }) =>
    api.patch<ApiResponse<Tour>>(`/tours/${id}/status`, body).then((r) => r.data),
  duplicate: (id: Id) => api.post<ApiResponse<Tour>>(`/tours/${id}/duplicate`).then((r) => r.data),
};

export const destinationsApi = {
  ...createResource<Destination, { region?: Region; isPopular?: boolean; keyword?: string }>('/destinations'),
  grouped: () => api.get<ApiResponse<DestinationGroup[]>>('/destinations/grouped').then((r) => r.data.data),
  detail: (identifier: string) =>
    api.get<ApiResponse<DestinationDetail>>(`/destinations/${identifier}`).then((r) => r.data.data),
};

export const categoriesApi = createResource<Category, { type?: CategoryType }>('/categories');

export const servicesApi = createResource<Service, { serviceType?: ServiceType; isFeatured?: boolean; keyword?: string }>(
  '/services',
);

export const eventProjectsApi = createResource<
  EventProject,
  { isFeatured?: boolean; keyword?: string; status?: string; page?: number; limit?: number },
  PaginatedResponse<EventProject>
>('/event-projects');

export const galleriesApi = createResource<Gallery, { category?: Id; isFeatured?: boolean }>('/galleries');

export const bookingsApi = {
  create: (body: CreateBookingInput) =>
    api.post<ApiResponse<CreateBookingResult>>('/bookings', body).then((r) => r.data),
  list: (params?: BookingQuery) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: Id) => api.get<ApiResponse<Booking>>(`/bookings/${id}`).then((r) => r.data.data),
  update: (id: Id, body: { status?: BookingStatus; note?: string; pricing?: Booking['pricing'] }) =>
    api.patch<ApiResponse<Booking>>(`/bookings/${id}`, body).then((r) => r.data),
  remove: (id: Id) => api.delete(`/bookings/${id}`).then((r) => r.data),
};
