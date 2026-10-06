import { useParams } from 'react-router-dom';
import { NotFoundPage } from '@/pages/StaticPages';
import { ResourceForm, ResourceList, type ResourceConfig } from './components/ResourceAdmin';
import { categoryConfig, destinationConfig, eventProjectConfig, galleryConfig, serviceConfig } from './resources';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CONFIGS: Record<string, ResourceConfig<any>> = {
  destinations: destinationConfig,
  categories: categoryConfig,
  services: serviceConfig,
  'event-projects': eventProjectConfig,
  galleries: galleryConfig,
};

/** /admin/:resource và /admin/:resource/:id dùng chung cấu hình CRUD */
export function ResourceListPage() {
  const { resource = '' } = useParams();
  const config = CONFIGS[resource];
  return config ? <ResourceList key={resource} config={config} /> : <NotFoundPage />;
}

export function ResourceFormPage() {
  const { resource = '' } = useParams();
  const config = CONFIGS[resource];
  return config ? <ResourceForm key={resource} config={config} /> : <NotFoundPage />;
}
