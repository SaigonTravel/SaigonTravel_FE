import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/api/client';
import { Button, EmptyState, ErrorState, Img, Spinner } from '@/components/ui';
import { useAuth, CONTENT_ROLES } from '@/store/auth';
import { cn, refId, slugify, toDateInput } from '@/utils/format';
import { Field, FormSection, ImageInput, ImageListInput, LinesInput, Toggle } from './fields';

// ---------- path helpers cho field lồng nhau (vd: "seo.metaTitle") ----------
type AnyObj = Record<string, unknown>;
export function getPath(obj: AnyObj, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as AnyObj)[k] : undefined), obj);
}
export function setPath<T extends AnyObj>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.');
  if (!rest.length) return { ...obj, [head]: value };
  return { ...obj, [head]: setPath(((obj[head] as AnyObj) ?? {}) as AnyObj, rest.join('.'), value) };
}

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image' | 'images' | 'lines' | 'date' | 'slug';
  options?: Option[];
  /** select lấy option từ API */
  asyncOptions?: { key: unknown[]; fn: () => Promise<Option[]> };
  required?: boolean;
  wide?: boolean;
  hint?: string;
  section?: string;
  rows?: number;
  /** field nguồn để sinh slug */
  from?: string;
}

export interface ResourceApi<T> {
  list: () => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (body: Partial<T>) => Promise<unknown>;
  update: (id: string, body: Partial<T>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}

export interface ResourceConfig<T extends { _id: string }> {
  key: string;
  title: string;
  basePath: string;
  api: ResourceApi<T>;
  columns: { label: string; render: (row: T) => ReactNode; className?: string }[];
  searchText?: (row: T) => string;
  fields: FieldDef[];
  defaults: AnyObj;
  /** Phần form tuỳ biến (vd: danh sách ảnh album) */
  extra?: (form: AnyObj, setForm: (f: AnyObj) => void) => ReactNode;
  toPayload?: (form: AnyObj) => AnyObj;
}

// ================= LIST =================
export function ResourceList<T extends { _id: string }>({ config }: { config: ResourceConfig<T> }) {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const canEdit = hasRole(CONTENT_ROLES);
  const [q, setQ] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', config.key], queryFn: config.api.list });

  const del = useMutation({
    mutationFn: config.api.remove,
    onSuccess: () => {
      toast.success('Đã xoá');
      qc.invalidateQueries({ queryKey: ['admin', config.key] });
      qc.invalidateQueries({ queryKey: [config.key] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw || !data) return data ?? [];
    return data.filter((r) => (config.searchText?.(r) ?? JSON.stringify(r)).toLowerCase().includes(kw));
  }, [data, q, config]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold">{config.title}</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input !w-56 pl-9" placeholder="Tìm kiếm…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {canEdit && (
            <Link to={`${config.basePath}/new`}>
              <Button>
                <Plus className="h-4 w-4" /> Thêm mới
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !rows.length ? (
          <EmptyState />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                {config.columns.map((c) => (
                  <th key={c.label} className={cn('px-4 py-3 font-semibold', c.className)}>
                    {c.label}
                  </th>
                ))}
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-brand-50/40">
                  {config.columns.map((c) => (
                    <td key={c.label} className={cn('px-4 py-3 align-middle', c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {canEdit && (
                      <div className="flex justify-end gap-1">
                        <Link to={`${config.basePath}/${row._id}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-500" title="Sửa">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                          title="Xoá"
                          onClick={() => confirm('Xoá mục này? Không thể hoàn tác.') && del.mutate(row._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ================= FORM =================
function AsyncSelect({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const { data = [] } = useQuery({ queryKey: field.asyncOptions!.key, queryFn: field.asyncOptions!.fn });
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Chọn —</option>
      {data.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function renderField(f: FieldDef, form: AnyObj, set: (name: string, v: unknown) => void) {
  const v = getPath(form, f.name);
  switch (f.type) {
    case 'textarea':
      return <textarea className="input" rows={f.rows ?? 5} value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />;
    case 'number':
      return <input className="input" type="number" value={(v as number) ?? ''} onChange={(e) => set(f.name, e.target.value === '' ? undefined : Number(e.target.value))} />;
    case 'checkbox':
      return <Toggle checked={!!v} onChange={(x) => set(f.name, x)} />;
    case 'select':
      return f.asyncOptions ? (
        <AsyncSelect field={f} value={(v as string) ?? ''} onChange={(x) => set(f.name, x)} />
      ) : (
        <select className="input" value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)}>
          {!f.required && <option value="">— Chọn —</option>}
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'image':
      return <ImageInput value={v as string} onChange={(x) => set(f.name, x)} />;
    case 'images':
      return <ImageListInput value={(v as string[]) ?? []} onChange={(x) => set(f.name, x)} />;
    case 'lines':
      return <LinesInput value={(v as string[]) ?? []} rows={f.rows} onChange={(x) => set(f.name, x)} />;
    case 'date':
      return <input className="input" type="date" value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />;
    case 'slug':
      return (
        <div className="flex gap-2">
          <input className="input" value={(v as string) ?? ''} onChange={(e) => set(f.name, slugify(e.target.value))} />
          <Button type="button" variant="outline" size="sm" onClick={() => set(f.name, slugify(String(getPath(form, f.from ?? 'title') ?? '')))}>
            Tạo
          </Button>
        </div>
      );
    default:
      return <input className="input" value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />;
  }
}

/** Chuẩn hoá dữ liệu từ API vào form: ref đã populate → _id, Date → yyyy-mm-dd */
function normalize(config: ResourceConfig<{ _id: string }>, data: AnyObj): AnyObj {
  let out: AnyObj = { ...config.defaults, ...data };
  for (const f of config.fields) {
    const v = getPath(out, f.name);
    if (f.type === 'select' && v && typeof v === 'object') out = setPath(out, f.name, refId(v as { _id: string }));
    if (f.type === 'date') out = setPath(out, f.name, toDateInput(v as string));
  }
  return out;
}

export function ResourceForm<T extends { _id: string }>({ config }: { config: ResourceConfig<T> }) {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { data, isLoading } = useQuery({
    queryKey: ['admin', config.key, id],
    queryFn: () => config.api.get(id!),
    enabled: !isNew,
  });
  if (!isNew && isLoading) return <Spinner />;
  return <ResourceFormInner key={id} config={config} initial={isNew ? config.defaults : normalize(config as never, (data ?? {}) as AnyObj)} isNew={isNew} id={id} />;
}

function ResourceFormInner<T extends { _id: string }>({ config, initial, isNew, id }: { config: ResourceConfig<T>; initial: AnyObj; isNew: boolean; id?: string }) {
  const [form, setForm] = useState<AnyObj>(initial);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const set = (name: string, v: unknown) => setForm((f) => setPath(f, name, v));

  const save = useMutation({
    mutationFn: () => {
      let payload: AnyObj = { ...form };
      // Tự sinh slug nếu bỏ trống
      const slugField = config.fields.find((f) => f.type === 'slug');
      if (slugField && !getPath(payload, slugField.name)) {
        payload = setPath(payload, slugField.name, slugify(String(getPath(payload, slugField.from ?? 'title') ?? '')));
      }
      // Ref rỗng → null để Mongoose không lỗi cast ObjectId
      for (const f of config.fields) if (f.type === 'select' && getPath(payload, f.name) === '') payload = setPath(payload, f.name, null);
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      if (config.toPayload) payload = config.toPayload(payload);
      return isNew ? config.api.create(payload as Partial<T>) : config.api.update(id!, payload as Partial<T>);
    },
    onSuccess: () => {
      toast.success(isNew ? 'Đã tạo mới' : 'Đã lưu thay đổi');
      qc.invalidateQueries({ queryKey: ['admin', config.key] });
      qc.invalidateQueries({ queryKey: [config.key] });
      navigate(config.basePath);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const missing = config.fields.filter((f) => f.required && f.type !== 'slug' && !getPath(form, f.name));
  const sections = Array.from(new Set(config.fields.map((f) => f.section ?? 'Thông tin chung')));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (missing.length) return toast.error(`Vui lòng nhập: ${missing.map((m) => m.label).join(', ')}`);
        save.mutate();
      }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={config.basePath} className="rounded p-1.5 hover:bg-gray-200" aria-label="Quay lại">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-heading text-xl font-bold">
            {isNew ? 'Thêm mới' : 'Chỉnh sửa'} – {config.title}
          </h1>
        </div>
        <Button type="submit" loading={save.isPending}>
          Lưu
        </Button>
      </div>

      <div className="space-y-5">
        {sections.map((sec) => (
          <FormSection key={sec} title={sec}>
            <div className="grid gap-4 md:grid-cols-2">
              {config.fields
                .filter((f) => (f.section ?? 'Thông tin chung') === sec)
                .map((f) => (
                  <Field
                    key={f.name}
                    label={f.label + (f.required ? ' *' : '')}
                    hint={f.hint}
                    className={cn((f.wide || ['textarea', 'images', 'lines'].includes(f.type)) && 'md:col-span-2')}
                  >
                    {renderField(f, form, set)}
                  </Field>
                ))}
            </div>
          </FormSection>
        ))}
        {config.extra?.(form, setForm)}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" loading={save.isPending} size="lg">
          Lưu
        </Button>
      </div>
    </form>
  );
}

export function Thumb({ src }: { src?: string }) {
  return <Img src={src} alt="" className="h-12 w-16 rounded" />;
}
