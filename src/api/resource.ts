import { api, cleanParams } from './client';
import type { ApiResponse, Id, ListResponse } from '@/types';

/** CRUD chuẩn: đọc theo /:identifier (slug hoặc id), ghi theo /:id */
export function createResource<T, P extends object = Record<string, unknown>, L = ListResponse<T>>(path: string) {
  return {
    list: (params?: P) => api.get<L>(path, { params: cleanParams(params) }).then((r) => r.data),
    get: (identifier: string) => api.get<ApiResponse<T>>(`${path}/${identifier}`).then((r) => r.data.data),
    create: (body: Partial<T>) => api.post<ApiResponse<T>>(path, body).then((r) => r.data),
    update: (id: Id, body: Partial<T>) => api.put<ApiResponse<T>>(`${path}/${id}`, body).then((r) => r.data),
    remove: (id: Id) => api.delete<ApiResponse<null>>(`${path}/${id}`).then((r) => r.data),
  };
}
