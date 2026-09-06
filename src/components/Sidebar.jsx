import { Laptop, LogOut, PackageCheck, PackagePlus, RotateCcw, Users, UserRoundSearch } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { useUi } from '../UiContext';

export default function Sidebar({ page, setPage, user, logout, managerCanCreateOrder }) {
  const { isArabic } = useUi();
  return <aside className="app-sidebar">
    <div className="sidebar-brand"><img src={logo} alt="FALCON LAPTOP"/><span>FALCON</span></div>
    <nav className="main-nav" aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
      {['admin', 'super_admin'].includes(user.role) ? <>
        <button className={page === 'inventory' ? 'active' : ''} onClick={() => setPage('inventory')}><Laptop size={19}/><span>{isArabic ? 'المخزون' : 'Inventory'}</span></button>
        {managerCanCreateOrder && <button className={page === 'create-order' ? 'active' : ''} onClick={() => setPage('create-order')}><PackagePlus size={19}/><span>{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span></button>}
        {!managerCanCreateOrder && <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}><PackageCheck size={19}/><span>{isArabic ? 'الفواتير المعلقة' : 'Invoices'}</span></button>}
        <button className={page === 'returns' ? 'active' : ''} onClick={() => setPage('returns')}><RotateCcw size={19}/><span>{isArabic ? 'المرتجعات' : 'Returns'}</span></button>
        <button className={page === 'customers' ? 'active' : ''} onClick={() => setPage('customers')}><Users size={19}/><span>{isArabic ? 'العملاء' : 'Customers'}</span></button>
        <button className={page === 'leads' ? 'active' : ''} onClick={() => setPage('leads')}><UserRoundSearch size={19}/><span>{isArabic ? 'المهتمين' : 'Leads'}</span></button>
      </> : <>
        <button className={page === 'create-order' ? 'active' : ''} onClick={() => setPage('create-order')}><PackagePlus size={19}/><span>{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span></button>
      </>}
    </nav>
    <button className="sidebar-logout" onClick={logout}><LogOut size={18}/><span>{isArabic ? 'تسجيل الخروج' : 'Logout'}</span></button>
    <small>FALCON LAPTOP</small>
  </aside>;
}
