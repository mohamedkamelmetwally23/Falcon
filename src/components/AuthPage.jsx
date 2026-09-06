import { ArrowRight, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import heroImage from '../assets/hero.png';
import { authApi } from '../services/api';

export default function AuthPage({ onAuth, onBack }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError('');
    try { onAuth(await authApi[mode](form)); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  return (
    <main className="flex min-h-screen w-full flex-col bg-base-100 md:flex-row" dir="rtl">
      <section className="relative flex h-56 shrink-0 items-end overflow-hidden md:h-auto md:min-h-screen md:flex-1 md:items-center">
        <img src={heroImage} alt="FALCON LAPTOP" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 md:bg-gradient-to-l" />
        <div className="relative z-10 flex w-full flex-col gap-4 p-6 md:gap-8 md:p-16">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-wide text-white">FALCON LAPTOP</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
              إدارة المخزون والأوردرات<br />بشكل أذكى.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/70">
              نظام واحد لفريقك، بصلاحيات واضحة ومتابعة كاملة لكل طلب.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 md:min-h-screen md:flex-none md:w-[27rem] lg:w-[32rem]">
        <form onSubmit={submit} className="card w-full max-w-sm bg-base-100 shadow-none md:bg-base-200 md:shadow-xl">
          <div className="card-body gap-5">
            <button type="button" onClick={onBack} className="btn btn-ghost btn-sm w-fit gap-2 px-0 text-base-content/60 hover:text-primary">
              <ArrowRight size={17} /> رجوع للصفحة الرئيسية
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              </span>
              <div>
                <h2 className="text-xl font-bold text-base-content">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
                <p className="text-sm text-base-content/60">{mode === 'login' ? 'أهلاً بعودتك إلى FALCON' : 'أنشئ حساب مستخدم وابدأ الطلب'}</p>
              </div>
            </div>

            <label className="form-control w-full">
              <span className="label-text mb-1.5">الاسم</span>
              <input
                required
                className="input w-full"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="اكتب اسمك"
              />
            </label>

            {mode === 'register' && (
              <label className="form-control w-full">
                <span className="label-text mb-1.5">رقم التليفون</span>
                <input
                  required
                  type="tel"
                  className="input w-full"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                />
              </label>
            )}

            <label className="form-control w-full">
              <span className="label-text mb-1.5">كلمة المرور</span>
              <div className="relative">
                <input
                  required
                  minLength="8"
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pe-11"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="8 أحرف على الأقل"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost btn-sm btn-circle absolute end-1 top-1/2 -translate-y-1/2 text-base-content/60"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <div className="alert alert-error py-2 text-sm">{error}</div>}

            <button className="btn btn-primary w-full" disabled={loading}>
              {loading && <span className="loading loading-spinner loading-sm" />}
              {loading ? 'جاري التحميل...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
            </button>

            <p className="text-center text-sm text-base-content/60">
              {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
              <button
                type="button"
                className="link link-primary font-semibold no-underline"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              >
                {mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
