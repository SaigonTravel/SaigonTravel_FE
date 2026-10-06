import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsApi } from '@/api';
import { getErrorMessage } from '@/api/client';
import { Button, Spinner } from '@/components/ui';
import { qk } from '@/hooks/queries';
import type { Setting, Slider } from '@/types';
import { ArrayEditor, Field, FormSection, ImageInput, Toggle } from '../components/fields';

export default function SettingsAdmin() {
  const { data, isLoading } = useQuery({ queryKey: qk.settings, queryFn: settingsApi.get });
  if (isLoading || !data) return <Spinner />;
  return <SettingsForm initial={data} />;
}

function SettingsForm({ initial }: { initial: Setting }) {
  const [s, setS] = useState<Setting>(initial);
  const qc = useQueryClient();
  const up = <K extends keyof Setting>(k: K, v: Setting[K]) => setS((x) => ({ ...x, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const { _id, createdAt, updatedAt, ...rest } = s as Setting & { __v?: number };
      void _id;
      void createdAt;
      void updatedAt;
      delete (rest as Record<string, unknown>).__v;
      return settingsApi.update(rest);
    },
    onSuccess: (res) => {
      toast.success('Đã lưu cấu hình');
      qc.setQueryData(qk.settings, res.data);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const text = (k: 'companyName' | 'slogan' | 'hotline' | 'phone' | 'email' | 'address' | 'workingHours', label: string) => (
    <Field label={label}>
      <input className="input" value={(s[k] as string) ?? ''} onChange={(e) => up(k, e.target.value)} />
    </Field>
  );
  const stats = s.aboutIntro?.highlightStats ?? [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Cấu hình website</h1>
        <Button type="submit" loading={save.isPending}>
          Lưu cấu hình
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FormSection title="Thông tin công ty">
          <div className="grid gap-4 md:grid-cols-2">
            {text('companyName', 'Tên công ty')}
            {text('slogan', 'Slogan')}
            {text('hotline', 'Hotline')}
            {text('phone', 'Điện thoại khác')}
            {text('email', 'Email')}
            {text('workingHours', 'Giờ làm việc')}
          </div>
          {text('address', 'Địa chỉ')}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Logo (URL)">
              <ImageInput value={s.logo} onChange={(v) => up('logo', v)} />
            </Field>
            <Field label="Favicon (URL)">
              <ImageInput value={s.favicon} onChange={(v) => up('favicon', v)} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Mạng xã hội">
          {(['facebook', 'youtube', 'zalo', 'instagram', 'tiktok'] as const).map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)} hint={k === 'zalo' ? 'VD: https://zalo.me/0898988687 (bỏ trống sẽ dùng hotline)' : undefined}>
              <input className="input" value={s.socialLinks?.[k] ?? ''} onChange={(e) => up('socialLinks', { ...s.socialLinks, [k]: e.target.value })} />
            </Field>
          ))}
        </FormSection>

        <FormSection title="Giới thiệu & Số liệu" className="xl:col-span-2">
          <Field label="Tiêu đề">
            <input className="input" value={s.aboutIntro?.title ?? ''} onChange={(e) => up('aboutIntro', { ...s.aboutIntro, title: e.target.value })} />
          </Field>
          <Field label="Mô tả ngắn (hiện ở trang chủ, footer, trang giới thiệu)">
            <textarea className="input" rows={4} value={s.aboutIntro?.shortDescription ?? ''} onChange={(e) => up('aboutIntro', { ...s.aboutIntro, shortDescription: e.target.value })} />
          </Field>
          <ArrayEditor
            items={stats}
            onChange={(v) => up('aboutIntro', { ...s.aboutIntro, highlightStats: v })}
            createItem={() => ({ number: '', label: '' })}
            itemLabel={(st, i) => `Số liệu #${i + 1}: ${st.number} ${st.label}`}
            addLabel="Thêm số liệu"
            renderItem={(st, update) => (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Con số">
                  <input className="input" value={st.number} onChange={(e) => update({ number: e.target.value })} />
                </Field>
                <Field label="Nhãn">
                  <input className="input" value={st.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
              </div>
            )}
          />
        </FormSection>

        <FormSection title={`Banner trang chủ (${s.sliders?.length ?? 0})`} className="xl:col-span-2">
          <ArrayEditor<Slider>
            items={s.sliders ?? []}
            onChange={(v) => up('sliders', v.map((x, i) => ({ ...x, order: i })))}
            createItem={() => ({ image: '', title: '', subtitle: '', link: '', buttonText: '', isActive: true })}
            itemLabel={(sl, i) => `Slide ${i + 1}${sl.title ? ': ' + sl.title : ''}${sl.isActive === false ? ' (ẩn)' : ''}`}
            addLabel="Thêm slide"
            renderItem={(sl, update) => (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Ảnh (URL) *" className="md:col-span-2">
                  <ImageInput value={sl.image} onChange={(image) => update({ image })} />
                </Field>
                <Field label="Tiêu đề">
                  <input className="input" value={sl.title ?? ''} onChange={(e) => update({ title: e.target.value })} />
                </Field>
                <Field label="Mô tả">
                  <input className="input" value={sl.subtitle ?? ''} onChange={(e) => update({ subtitle: e.target.value })} />
                </Field>
                <Field label="Đường dẫn" hint="VD: /tour hoặc /dich-vu/team-building">
                  <input className="input" value={sl.link ?? ''} onChange={(e) => update({ link: e.target.value })} />
                </Field>
                <Field label="Chữ trên nút">
                  <input className="input" value={sl.buttonText ?? ''} onChange={(e) => update({ buttonText: e.target.value })} />
                </Field>
                <Toggle checked={sl.isActive !== false} onChange={(isActive) => update({ isActive })} label="Hiển thị" />
              </div>
            )}
          />
        </FormSection>

        <FormSection title="Footer">
          <Field label="Copyright">
            <input className="input" value={s.footerInfo?.copyrightText ?? ''} onChange={(e) => up('footerInfo', { ...s.footerInfo, copyrightText: e.target.value })} />
          </Field>
          <Field label="Số giấy phép">
            <input className="input" value={s.footerInfo?.licenseNumber ?? ''} onChange={(e) => up('footerInfo', { ...s.footerInfo, licenseNumber: e.target.value })} />
          </Field>
        </FormSection>

        <FormSection title="SEO mặc định">
          <Field label="Meta title">
            <input className="input" value={s.seoDefault?.metaTitle ?? ''} onChange={(e) => up('seoDefault', { ...s.seoDefault, metaTitle: e.target.value })} />
          </Field>
          <Field label="Meta description">
            <textarea className="input" rows={3} value={s.seoDefault?.metaDescription ?? ''} onChange={(e) => up('seoDefault', { ...s.seoDefault, metaDescription: e.target.value })} />
          </Field>
          <Field label="OG image (URL)">
            <ImageInput value={s.seoDefault?.ogImage} onChange={(v) => up('seoDefault', { ...s.seoDefault, ogImage: v })} />
          </Field>
        </FormSection>
      </div>
    </form>
  );
}
