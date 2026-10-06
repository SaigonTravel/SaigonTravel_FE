import { categoriesApi, destinationsApi, eventProjectsApi, galleriesApi, servicesApi } from '@/api';
import { Badge } from '@/components/ui';
import { formatDate, populated } from '@/utils/format';
import { CATEGORY_TYPE_LABELS, REGION_LABELS, SERVICE_TYPE_LABELS } from '@/utils/labels';
import type { Category, Destination, EventProject, Gallery, GalleryItem, Service } from '@/types';
import { ArrayEditor, Field, FormSection, ImageInput } from './components/fields';
import { Thumb, type FieldDef, type Option, type ResourceConfig } from './components/ResourceAdmin';

const toOptions = <K extends string>(labels: Record<K, string>): Option[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label: label as string }));

const active = (v?: boolean) =>
  v === false ? <Badge className="bg-gray-200 text-gray-600">Ẩn</Badge> : <Badge className="bg-emerald-100 text-emerald-700">Hiện</Badge>;

const seoFields: FieldDef[] = [
  { name: 'seo.metaTitle', label: 'Meta title', type: 'text', section: 'SEO' },
  { name: 'seo.metaDescription', label: 'Meta description', type: 'textarea', rows: 2, section: 'SEO' },
];

const categoryOptions = (type?: Category['type']) => ({
  key: ['admin-options', 'categories', type ?? 'all'],
  fn: () => categoriesApi.list({ type }).then((r) => r.data.map((c) => ({ value: c._id, label: c.name }))),
});

// ---------- Điểm đến ----------
export const destinationConfig: ResourceConfig<Destination> = {
  key: 'destinations',
  title: 'Điểm đến',
  basePath: '/admin/destinations',
  api: { ...destinationsApi, list: () => destinationsApi.list().then((r) => r.data) },
  searchText: (r) => `${r.name} ${r.country} ${r.city}`,
  columns: [
    { label: 'Ảnh', render: (r) => <Thumb src={r.thumbnail} />, className: 'w-20' },
    { label: 'Tên', render: (r) => <strong className="text-ink">{r.name}</strong> },
    { label: 'Khu vực', render: (r) => REGION_LABELS[r.region] },
    { label: 'Quốc gia', render: (r) => r.country },
    { label: 'Phổ biến', render: (r) => (r.isPopular ? '★' : '') },
    { label: 'Thứ tự', render: (r) => r.order ?? 0 },
  ],
  defaults: { region: 'chau-a', isActive: true, isPopular: false, order: 0, highlights: [] },
  fields: [
    { name: 'name', label: 'Tên điểm đến', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'slug', from: 'name', hint: 'Bỏ trống để tự tạo' },
    { name: 'region', label: 'Khu vực', type: 'select', options: toOptions(REGION_LABELS), required: true },
    { name: 'country', label: 'Quốc gia', type: 'text', required: true },
    { name: 'city', label: 'Thành phố', type: 'text' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'thumbnail', label: 'Ảnh đại diện (URL)', type: 'image' },
    { name: 'banner', label: 'Ảnh banner (URL)', type: 'image' },
    { name: 'description', label: 'Mô tả', type: 'textarea' },
    { name: 'highlights', label: 'Điểm nổi bật (mỗi dòng 1 mục)', type: 'lines' },
    { name: 'isPopular', label: 'Điểm đến phổ biến', type: 'checkbox' },
    { name: 'isActive', label: 'Hiển thị', type: 'checkbox' },
    ...seoFields,
  ],
};

// ---------- Danh mục ----------
export const categoryConfig: ResourceConfig<Category> = {
  key: 'categories',
  title: 'Danh mục',
  basePath: '/admin/categories',
  api: { ...categoriesApi, list: () => categoriesApi.list().then((r) => r.data) },
  searchText: (r) => r.name,
  columns: [
    { label: 'Tên', render: (r) => <strong className="text-ink">{r.name}</strong> },
    { label: 'Slug', render: (r) => <code className="text-xs">{r.slug}</code> },
    { label: 'Loại', render: (r) => CATEGORY_TYPE_LABELS[r.type] },
    { label: 'Thứ tự', render: (r) => r.order ?? 0 },
    { label: 'Trạng thái', render: (r) => active(r.isActive) },
  ],
  defaults: { type: 'tour', isActive: true, order: 0 },
  fields: [
    { name: 'name', label: 'Tên danh mục', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'slug', from: 'name', hint: 'Bỏ trống để tự tạo' },
    { name: 'type', label: 'Loại', type: 'select', options: toOptions(CATEGORY_TYPE_LABELS), required: true },
    { name: 'parent', label: 'Danh mục cha', type: 'select', asyncOptions: categoryOptions() },
    { name: 'image', label: 'Ảnh (URL)', type: 'image' },
    { name: 'icon', label: 'Icon', type: 'text' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'isActive', label: 'Hiển thị', type: 'checkbox' },
    { name: 'description', label: 'Mô tả', type: 'textarea', rows: 3 },
  ],
};

// ---------- Dịch vụ ----------
export const serviceConfig: ResourceConfig<Service> = {
  key: 'services',
  title: 'Dịch vụ Teambuilding & Sự kiện',
  basePath: '/admin/services',
  api: { ...servicesApi, list: () => servicesApi.list().then((r) => r.data) },
  searchText: (r) => r.title,
  columns: [
    { label: 'Ảnh', render: (r) => <Thumb src={r.thumbnail} />, className: 'w-20' },
    { label: 'Tên dịch vụ', render: (r) => <strong className="text-ink">{r.title}</strong> },
    { label: 'Loại', render: (r) => SERVICE_TYPE_LABELS[r.serviceType] },
    { label: 'Nổi bật', render: (r) => (r.isFeatured ? '★' : '') },
    { label: 'Thứ tự', render: (r) => r.order ?? 0 },
  ],
  defaults: { serviceType: 'teambuilding', isActive: true, isFeatured: false, order: 0, gallery: [], highlights: [], suggestedLocations: [] },
  fields: [
    { name: 'title', label: 'Tên dịch vụ', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'slug', hint: 'Bỏ trống để tự tạo' },
    { name: 'serviceType', label: 'Loại dịch vụ', type: 'select', options: toOptions(SERVICE_TYPE_LABELS), required: true },
    { name: 'category', label: 'Danh mục', type: 'select', asyncOptions: categoryOptions() },
    { name: 'targetAudience', label: 'Đối tượng', type: 'text', hint: 'VD: Doanh nghiệp 20 - 1000 người' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'shortDescription', label: 'Mô tả ngắn', type: 'textarea', rows: 3 },
    { name: 'content', label: 'Nội dung chi tiết (HTML hoặc văn bản)', type: 'textarea', rows: 10 },
    { name: 'highlights', label: 'Điểm nổi bật (mỗi dòng 1 mục)', type: 'lines' },
    { name: 'suggestedLocations', label: 'Địa điểm gợi ý (mỗi dòng 1 mục)', type: 'lines', rows: 3 },
    { name: 'isFeatured', label: 'Nổi bật', type: 'checkbox' },
    { name: 'isActive', label: 'Hiển thị', type: 'checkbox' },
    { name: 'thumbnail', label: 'Ảnh đại diện (URL)', type: 'image', section: 'Hình ảnh & Video' },
    { name: 'videoUrl', label: 'Video (Youtube URL)', type: 'text', section: 'Hình ảnh & Video' },
    { name: 'gallery', label: 'Thư viện ảnh', type: 'images', section: 'Hình ảnh & Video' },
    ...seoFields,
  ],
};

// ---------- Dự án / Sự kiện tiêu biểu ----------
export const eventProjectConfig: ResourceConfig<EventProject> = {
  key: 'event-projects',
  title: 'Dự án tiêu biểu',
  basePath: '/admin/event-projects',
  api: { ...eventProjectsApi, list: () => eventProjectsApi.list({ status: 'all', limit: 500 }).then((r) => r.data) },
  searchText: (r) => `${r.title} ${r.clientName} ${r.location}`,
  columns: [
    { label: 'Ảnh', render: (r) => <Thumb src={r.thumbnail} />, className: 'w-20' },
    {
      label: 'Dự án',
      render: (r) => (
        <div>
          <strong className="text-ink">{r.title}</strong>
          <p className="text-xs text-gray-500">{r.clientName}</p>
        </div>
      ),
    },
    { label: 'Dịch vụ', render: (r) => populated<Pick<Service, '_id' | 'title'>>(r.service)?.title ?? '' },
    { label: 'Ngày', render: (r) => formatDate(r.eventDate) },
    {
      label: 'Trạng thái',
      render: (r) =>
        r.status === 'published' ? (
          <Badge className="bg-emerald-100 text-emerald-700">Đã đăng</Badge>
        ) : (
          <Badge className="bg-gray-200 text-gray-600">Nháp</Badge>
        ),
    },
    { label: 'Nổi bật', render: (r) => (r.isFeatured ? '★' : '') },
  ],
  defaults: { status: 'draft', isFeatured: false, order: 0, gallery: [] },
  fields: [
    { name: 'title', label: 'Tên dự án / sự kiện', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'slug', hint: 'Bỏ trống để tự tạo' },
    { name: 'clientName', label: 'Khách hàng', type: 'text', required: true },
    { name: 'clientLogo', label: 'Logo khách hàng (URL)', type: 'image' },
    {
      name: 'service',
      label: 'Dịch vụ',
      type: 'select',
      asyncOptions: {
        key: ['admin-options', 'services'],
        fn: () => servicesApi.list().then((r) => r.data.map((s) => ({ value: s._id, label: s.title }))),
      },
    },
    { name: 'location', label: 'Địa điểm', type: 'text' },
    { name: 'participantsCount', label: 'Số người tham gia', type: 'number' },
    { name: 'eventDate', label: 'Ngày tổ chức', type: 'date' },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Nháp' },
        { value: 'published', label: 'Đã đăng' },
      ],
    },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'isFeatured', label: 'Nổi bật (hiện ở trang chủ)', type: 'checkbox', wide: true },
    { name: 'overview', label: 'Tóm tắt', type: 'textarea', rows: 3 },
    { name: 'content', label: 'Nội dung chi tiết (HTML hoặc văn bản)', type: 'textarea', rows: 10 },
    { name: 'thumbnail', label: 'Ảnh đại diện (URL)', type: 'image', section: 'Hình ảnh & Video' },
    { name: 'videoUrl', label: 'Video (Youtube URL)', type: 'text', section: 'Hình ảnh & Video' },
    { name: 'gallery', label: 'Thư viện ảnh', type: 'images', section: 'Hình ảnh & Video' },
  ],
};

// ---------- Album ảnh ----------
export const galleryConfig: ResourceConfig<Gallery> = {
  key: 'galleries',
  title: 'Album ảnh',
  basePath: '/admin/galleries',
  api: { ...galleriesApi, list: () => galleriesApi.list().then((r) => r.data) },
  searchText: (r) => r.title,
  columns: [
    { label: 'Ảnh bìa', render: (r) => <Thumb src={r.coverImage || r.items?.[0]?.url} />, className: 'w-20' },
    { label: 'Tên album', render: (r) => <strong className="text-ink">{r.title}</strong> },
    { label: 'Số ảnh', render: (r) => r.items?.length ?? 0 },
    { label: 'Sự kiện', render: (r) => populated<Pick<EventProject, '_id' | 'title'>>(r.eventProject)?.title ?? '' },
    { label: 'Nổi bật', render: (r) => (r.isFeatured ? '★' : '') },
  ],
  defaults: { isActive: true, isFeatured: false, order: 0, items: [] },
  fields: [
    { name: 'title', label: 'Tên album', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'slug', hint: 'Bỏ trống để tự tạo' },
    { name: 'coverImage', label: 'Ảnh bìa (URL)', type: 'image' },
    { name: 'category', label: 'Danh mục', type: 'select', asyncOptions: categoryOptions() },
    {
      name: 'eventProject',
      label: 'Thuộc dự án',
      type: 'select',
      asyncOptions: {
        key: ['admin-options', 'event-projects'],
        fn: () => eventProjectsApi.list({ status: 'all', limit: 500 }).then((r) => r.data.map((p) => ({ value: p._id, label: p.title }))),
      },
    },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'description', label: 'Mô tả', type: 'textarea', rows: 3 },
    { name: 'isFeatured', label: 'Nổi bật', type: 'checkbox' },
    { name: 'isActive', label: 'Hiển thị', type: 'checkbox' },
  ],
  extra: (form, setForm) => {
    const items = (form.items as GalleryItem[]) ?? [];
    return (
      <FormSection title={`Ảnh trong album (${items.length})`}>
        <BulkAdd onAdd={(urls) => setForm({ ...form, items: [...items, ...urls.map((url, i) => ({ url, sortOrder: items.length + i }))] })} />
        <ArrayEditor<GalleryItem>
          items={items}
          onChange={(next) => setForm({ ...form, items: next.map((it, i) => ({ ...it, sortOrder: i })) })}
          createItem={() => ({ url: '', title: '', caption: '' })}
          itemLabel={(it, i) => `#${i + 1} ${it.title || ''}`}
          addLabel="Thêm 1 ảnh"
          renderItem={(it, update) => (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="URL ảnh *" className="md:col-span-2">
                <ImageInput value={it.url} onChange={(url) => update({ url })} />
              </Field>
              <Field label="Tiêu đề">
                <input className="input" value={it.title ?? ''} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <Field label="Chú thích">
                <input className="input" value={it.caption ?? ''} onChange={(e) => update({ caption: e.target.value })} />
              </Field>
            </div>
          )}
        />
      </FormSection>
    );
  },
  toPayload: (p) => ({ ...p, items: ((p.items as GalleryItem[]) ?? []).filter((i) => i.url) }),
};

function BulkAdd({ onAdd }: { onAdd: (urls: string[]) => void }) {
  return (
    <Field label="Thêm nhanh nhiều ảnh" hint="Dán danh sách URL (mỗi dòng 1 ảnh) rồi bấm ra ngoài ô">
      <textarea
        className="input"
        rows={2}
        onBlur={(e) => {
          const urls = e.target.value
            .split(/\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
          if (urls.length) onAdd(urls);
          e.target.value = '';
        }}
      />
    </Field>
  );
}
