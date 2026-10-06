import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/api/client';
import { Logo } from '@/components/layout/Header';
import { Button } from '@/components/ui';
import { STAFF_ROLES, useAuth } from '@/store/auth';

export default function LoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || '/admin';

  if (user && STAFF_ROLES.includes(user.role)) return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(account, password);
      if (!STAFF_ROLES.includes(u.role)) {
        logout();
        toast.error('Tài khoản không có quyền truy cập trang quản trị');
        return;
      }
      toast.success(`Xin chào ${u.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-6 text-center font-heading text-lg font-bold uppercase">Đăng nhập quản trị</h1>
        <div className="space-y-4">
          <div>
            <label className="label">Username hoặc Email</label>
            <input className="input" autoFocus value={account} onChange={(e) => setAccount(e.target.value)} required />
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Đăng nhập
          </Button>
        </div>
      </form>
    </div>
  );
}
