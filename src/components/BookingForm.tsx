import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/api';
import { getErrorMessage } from '@/api/client';
import { Button } from '@/components/ui';
import { cn } from '@/utils/format';
import type { BookingType } from '@/types';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên'),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s().-]{8,20}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().trim().email('Email không hợp lệ'),
  companyName: z.string().optional(),
  departureDate: z.string().optional(),
  adultsCount: z.coerce.number().min(0).optional(),
  childrenCount: z.coerce.number().min(0).optional(),
  participantCount: z.coerce.number().min(0).optional(),
  destinationPreference: z.string().optional(),
  estimatedBudget: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  type: BookingType;
  tourId?: string;
  serviceId?: string;
  title?: string;
  className?: string;
  /** Biến thể giao diện: card trắng hoặc trong suốt trên nền tối */
  dark?: boolean;
}

export function BookingForm({ type, tourId, serviceId, title, className, dark = false }: Props) {
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const isTour = type === 'tour_booking';
  const isCorporate = type === 'teambuilding_request' || type === 'custom_mice';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { adultsCount: isTour ? 1 : undefined, childrenCount: 0 },
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      bookingsApi.create({
        type,
        tour: tourId,
        service: serviceId,
        customer: {
          fullName: v.fullName,
          phone: v.phone,
          email: v.email,
          companyName: v.companyName,
          note: v.note,
        },
        details: {
          departureDate: v.departureDate || null,
          adultsCount: v.adultsCount,
          childrenCount: v.childrenCount,
          participantCount: v.participantCount,
          destinationPreference: v.destinationPreference,
          estimatedBudget: v.estimatedBudget,
          specialRequests: v.note,
        },
      }),
    onSuccess: (res) => {
      setBookingCode(res.data.bookingCode);
      toast.success(res.message || 'Gửi yêu cầu thành công');
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const inputCls = cn('input', dark && 'border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:bg-white/15');
  const labelCls = cn('label', dark && 'text-white/90');
  const err = (msg?: string) => msg && <p className="mt-1 text-xs text-red-500">{msg}</p>;

  if (bookingCode) {
    return (
      <div className={cn('rounded-lg p-6 text-center', dark ? 'bg-white/10 text-white' : 'card', className)}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="mt-3 font-heading text-lg font-bold">Gửi yêu cầu thành công!</p>
        <p className="mt-1 text-sm">
          Mã yêu cầu của bạn: <strong className="text-brand-500">{bookingCode}</strong>
        </p>
        <p className="mt-1 text-sm">Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setBookingCode(null)}>
          Gửi yêu cầu khác
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className={cn('space-y-4', !dark && 'card p-5', className)}
      noValidate
    >
      {title && <h3 className={cn('font-heading text-lg font-bold uppercase', dark && 'text-white')}>{title}</h3>}
      <div>
        <label className={labelCls}>Họ và tên *</label>
        <input className={inputCls} placeholder="Nguyễn Văn A" {...register('fullName')} />
        {err(errors.fullName?.message)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Số điện thoại *</label>
          <input className={inputCls} placeholder="09xx xxx xxx" {...register('phone')} />
          {err(errors.phone?.message)}
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input className={inputCls} type="email" placeholder="email@congty.com" {...register('email')} />
          {err(errors.email?.message)}
        </div>
      </div>

      {!isTour && (
        <div>
          <label className={labelCls}>Công ty / Tổ chức</label>
          <input className={inputCls} {...register('companyName')} />
        </div>
      )}

      {isTour && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <label className={labelCls}>Ngày khởi hành</label>
            <input className={inputCls} type="date" {...register('departureDate')} />
          </div>
          <div>
            <label className={labelCls}>Người lớn</label>
            <input className={inputCls} type="number" min={1} {...register('adultsCount')} />
          </div>
          <div>
            <label className={labelCls}>Trẻ em</label>
            <input className={inputCls} type="number" min={0} {...register('childrenCount')} />
          </div>
        </div>
      )}

      {(isCorporate || type === 'consultation') && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Số người</label>
            <input className={inputCls} type="number" min={0} {...register('participantCount')} />
          </div>
          <div>
            <label className={labelCls}>Điểm đến mong muốn</label>
            <input className={inputCls} {...register('destinationPreference')} />
          </div>
          <div>
            <label className={labelCls}>Ngân sách dự kiến</label>
            <input className={inputCls} placeholder="VD: 100 - 200 triệu" {...register('estimatedBudget')} />
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Ghi chú / Yêu cầu</label>
        <textarea className={cn(inputCls, 'min-h-[90px]')} {...register('note')} />
      </div>
      <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
        {isTour ? 'Đặt tour ngay' : 'Gửi yêu cầu tư vấn'}
      </Button>
    </form>
  );
}
