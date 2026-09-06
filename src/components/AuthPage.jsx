import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.jpeg';
import { authApi } from '../services/api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError('');
    try { onAuth(await authApi[mode](form)); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-showcase"><img src={logo} alt="FALCON LAPTOP"/><span>FALCON LAPTOP</span><h1>إدارة المخزون والأوردرات<br/>بشكل أذكى.</h1><p>نظام واحد لفريقك، بصلاحيات واضحة ومتابعة كاملة لكل طلب.</p></section>
    <section className="auth-panel"><form className="auth-card" onSubmit={submit}><div className="auth-heading"><span>{mode === 'login' ? <LogIn/> : <UserPlus/>}</span><div><h2>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2><p>{mode === 'login' ? 'أهلاً بعودتك إلى VOLTIO' : 'أنشئ حساب مستخدم وابدأ الطلب'}</p></div></div>
      <label><span>الاسم</span><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اكتب اسمك"/></label>
      {mode === 'register' && <label><span>رقم التليفون</span><input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01xxxxxxxxx"/></label>}
      <label><span>كلمة المرور</span><div className="password-input"><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="8 أحرف على الأقل"/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>
      {error && <div className="auth-error">{error}</div>}<button className="primary auth-submit" disabled={loading}>{loading ? 'جاري التحميل...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</button>
      <p className="auth-toggle">{mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}</button></p>
    </form></section></main>;
}
