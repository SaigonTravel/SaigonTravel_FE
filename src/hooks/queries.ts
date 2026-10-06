import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  categoriesApi,
  destinationsApi,
  eventProjectsApi,
  galleriesApi,
  servicesApi,
  settingsApi,
  toursApi,
  type TourQuery,
} from '@/api';
import type { CategoryType } from '@/types';

export const qk = {
  settings: ['settings'] as const,
  tours: (p?: TourQuery) => ['tours', p ?? {}] as const,
  tour: (id: string) => ['tour', id] as const,
  destinationsGrouped: ['destinations', 'grouped'] as const,
  destinations: ['destinations'] as const,
  destination: (id: string) => ['destination', id] as const,
  categories: (type?: CategoryType) => ['categories', type ?? 'all'] as const,
  services: (p?: object) => ['services', p ?? {}] as const,
  service: (id: string) => ['service', id] as const,
  eventProjects: (p?: object) => ['event-projects', p ?? {}] as const,
  eventProject: (id: string) => ['event-project', id] as const,
  galleries: (p?: object) => ['galleries', p ?? {}] as const,
  gallery: (id: string) => ['gallery', id] as const,
};

export const useSettings = () =>
  useQuery({ queryKey: qk.settings, queryFn: settingsApi.get, staleTime: 10 * 60 * 1000 });

export const useTours = (params?: TourQuery) =>
  useQuery({ queryKey: qk.tours(params), queryFn: () => toursApi.list(params), placeholderData: keepPreviousData });

export const useTour = (identifier?: string) =>
  useQuery({ queryKey: qk.tour(identifier ?? ''), queryFn: () => toursApi.get(identifier!), enabled: !!identifier });

export const useDestinationGroups = () =>
  useQuery({ queryKey: qk.destinationsGrouped, queryFn: destinationsApi.grouped, staleTime: 10 * 60 * 1000 });

export const useDestinations = () =>
  useQuery({ queryKey: qk.destinations, queryFn: () => destinationsApi.list().then((r) => r.data) });

export const useDestinationDetail = (identifier?: string) =>
  useQuery({
    queryKey: qk.destination(identifier ?? ''),
    queryFn: () => destinationsApi.detail(identifier!),
    enabled: !!identifier,
  });

export const useCategories = (type?: CategoryType) =>
  useQuery({ queryKey: qk.categories(type), queryFn: () => categoriesApi.list({ type }).then((r) => r.data) });

export const useServices = (params?: { isFeatured?: boolean }) =>
  useQuery({ queryKey: qk.services(params), queryFn: () => servicesApi.list(params).then((r) => r.data) });

export const useService = (identifier?: string) =>
  useQuery({ queryKey: qk.service(identifier ?? ''), queryFn: () => servicesApi.get(identifier!), enabled: !!identifier });

export const useEventProjects = (params?: { isFeatured?: boolean; page?: number; limit?: number; status?: string }) =>
  useQuery({
    queryKey: qk.eventProjects(params),
    queryFn: () => eventProjectsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useEventProject = (identifier?: string) =>
  useQuery({
    queryKey: qk.eventProject(identifier ?? ''),
    queryFn: () => eventProjectsApi.get(identifier!),
    enabled: !!identifier,
  });

export const useGalleries = (params?: { isFeatured?: boolean }) =>
  useQuery({ queryKey: qk.galleries(params), queryFn: () => galleriesApi.list(params).then((r) => r.data) });

export const useGallery = (identifier?: string) =>
  useQuery({ queryKey: qk.gallery(identifier ?? ''), queryFn: () => galleriesApi.get(identifier!), enabled: !!identifier });
