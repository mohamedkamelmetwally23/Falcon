import { Building2, Check, ChevronDown, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/voltio-logo.png';
import { authApi } from '../services/api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', branchId: '' });
  const [branches, setBranches] = useState([]);
  const [branchOpen, setBranchOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    authApi.branches().then(items => {
      setBranches(items);
      setForm(current => ({ ...current, branchId: current.branchId || items[0]?.id || '' }));
    }).catch(requestError => setError(requestError.message));
  }, []);
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError('');
    try { onAuth(await authApi[mode](form)); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-showcase"><img src={logo} alt="VOLTIO"/><span>VOLTIO INVENTORY</span><h1>إدارة المخزون والأوردرات<br/>بشكل أذكى.</h1><p>نظام واحد لفريقك، بصلاحيات واضحة ومتابعة كاملة لكل طلب.</p></section>
    <section className="auth-panel"><form className="auth-card" onSubmit={submit}><div className="auth-heading"><span>{mode === 'login' ? <LogIn/> : <UserPlus/>}</span><div><h2>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2><p>{mode === 'login' ? 'أهلاً بعودتك إلى VOLTIO' : 'أنشئ حساب مستخدم وابدأ الطلب'}</p></div></div>
      <label><span>الاسم</span><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اكتب اسمك"/></label>
      {mode === 'register' && <label className="auth-branch-field"><span>الفرع</span><div className={branchOpen ? 'auth-branch-picker open' : 'auth-branch-picker'}><button type="button" className="auth-branch-trigger" onClick={() => setBranchOpen(open => !open)} aria-expanded={branchOpen}><Building2/><b>{branches.find(branch => branch.id === form.branchId)?.name || 'اختر الفرع'}</b><ChevronDown className="branch-chevron"/></button>{branchOpen && <div className="auth-branch-options">{branches.map(branch => <button type="button" key={branch.id} className={branch.id === form.branchId ? 'selected' : ''} onClick={() => { setForm({...form, branchId: branch.id}); setBranchOpen(false); }}><span><Building2/>{branch.name}</span>{branch.id === form.branchId && <Check/>}</button>)}</div>}</div></label>}
      <label><span>كلمة المرور</span><div className="password-input"><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="8 أحرف على الأقل"/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>
      {error && <div className="auth-error">{error}</div>}<button className="primary auth-submit" disabled={loading}>{loading ? 'جاري التحميل...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</button>
      <p className="auth-toggle">{mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setBranchOpen(false); setError(''); }}>{mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}</button></p>
    </form></section></main>;
}
