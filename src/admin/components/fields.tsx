import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Img } from '@/components/ui';
import { cn } from '@/utils/format';

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-brand-500' : 'bg-gray-300')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
      {label}
    </label>
  );
}

/** Ảnh nhập bằng URL (BE chưa có API upload) kèm xem trước */
export function ImageInput({ value, onChange, placeholder = 'https://…' }: { value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex gap-3">
      <input className="input" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <div className="h-10 w-16 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
        {value && <Img src={value} alt="" className="h-full w-full" />}
      </div>
    </div>
  );
}

export function ImageListInput({ value = [], onChange }: { value?: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const urls = draft
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (urls.length) onChange([...value, ...urls]);
    setDraft('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Dán 1 hoặc nhiều URL ảnh (cách nhau bởi khoảng trắng)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="rounded-md bg-brand-500 px-3 text-white hover:bg-brand-600" aria-label="Thêm ảnh">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {!!value.length && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((url, i) => (
            <div key={url + i} className="group relative aspect-[4/3] overflow-hidden rounded border border-gray-200">
              <Img src={url} alt="" className="h-full w-full" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Xoá ảnh"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Mảng chuỗi ↔ textarea, mỗi dòng 1 phần tử */
export function LinesInput({ value = [], onChange, rows = 4, placeholder }: { value?: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string }) {
  const [text, setText] = useState(value.join('\n'));
  return (
    <textarea
      className="input"
      rows={rows}
      placeholder={placeholder ?? 'Mỗi dòng một mục'}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

/** Trình sửa mảng object chung (lịch trình, FAQ, slider, item album…) */
export function ArrayEditor<T>({
  items,
  onChange,
  createItem,
  renderItem,
  itemLabel,
  addLabel = 'Thêm mục',
}: {
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  itemLabel: (item: T, index: number) => string;
  addLabel?: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-gray-200 bg-gray-50/60">
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
            <span className="text-sm font-semibold text-ink">{itemLabel(item, i)}</span>
            <div className="flex gap-1">
              <IconBtn onClick={() => move(i, -1)} label="Lên">
                <ArrowUp className="h-4 w-4" />
              </IconBtn>
              <IconBtn onClick={() => move(i, 1)} label="Xuống">
                <ArrowDown className="h-4 w-4" />
              </IconBtn>
              <IconBtn onClick={() => onChange(items.filter((_, j) => j !== i))} label="Xoá" danger>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>
          <div className="space-y-3 p-3">
            {renderItem(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-brand-300 py-2 text-sm font-semibold text-brand-500 hover:bg-brand-50"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

function IconBtn({ children, onClick, label, danger }: { children: ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn('rounded p-1 text-gray-500 hover:bg-white', danger ? 'hover:text-red-600' : 'hover:text-brand-500')}
    >
      {children}
    </button>
  );
}

export function FormSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('card p-5', className)}>
      <h3 className="mb-4 font-heading text-sm font-bold uppercase text-ink">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
