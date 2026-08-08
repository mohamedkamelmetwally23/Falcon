import { Laptop, LogOut, PackageCheck, PackagePlus, RotateCcw } from 'lucide-react';
import logo from '../assets/voltio-logo.png';
import { useUi } from '../UiContext';

export default function Sidebar({ page, setPage, user, logout }) {
  const { isArabic } = useUi();
  return <aside className="app-sidebar">
    <div className="sidebar-brand"><img src={logo} alt="VOLTIO"/><span>VOLTIO</span></div>
    <nav className="main-nav" aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
      {user.role === 'admin' ? <>
        <button className={page === 'inventory' ? 'active' : ''} onClick={() => setPage('inventory')}><Laptop size={19}/><span>{isArabic ? 'المخزون' : 'Inventory'}</span></button>
        <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}><PackageCheck size={19}/><span>{isArabic ? 'الفواتير المعلقة' : 'Invoices'}</span></button>
        <button className={page === 'returns' ? 'active' : ''} onClick={() => setPage('returns')}><RotateCcw size={19}/><span>{isArabic ? 'المرتجعات' : 'Returns'}</span></button>
      </> : <>
        <button className={page === 'create-order' ? 'active' : ''} onClick={() => setPage('create-order')}><PackagePlus size={19}/><span>{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span></button>
        <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}><PackageCheck size={19}/><span>{isArabic ? 'فواتيري' : 'My invoices'}</span></button>
      </>}
    </nav>
    <button className="sidebar-logout" onClick={logout}><LogOut size={18}/><span>{isArabic ? 'تسجيل الخروج' : 'Logout'}</span></button>
    <small>VOLTIO INVENTORY</small>
  </aside>;
}
