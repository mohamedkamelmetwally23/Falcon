import { Building2, Laptop, LogOut, PackageCheck, PackagePlus, RotateCcw, Users } from 'lucide-react';
import logo from '../assets/voltio-logo.png';
import { useUi } from '../UiContext';

export default function Sidebar({ page, setPage, user, logout, selectedBranch, leaveBranch, managerCanCreateOrder }) {
  const { isArabic } = useUi();
  return <aside className="app-sidebar">
    <div className="sidebar-brand"><img src={logo} alt="VOLTIO"/><span>VOLTIO</span></div>
    <nav className="main-nav" aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
      {user.role === 'super_admin' && !selectedBranch ? <>
        <button className={page === 'branches' ? 'active' : ''} onClick={() => setPage('branches')}><Building2 size={19}/><span>{isArabic ? 'الفروع' : 'Branches'}</span></button>
      </> : ['admin', 'super_admin'].includes(user.role) ? <>
        <button className={page === 'inventory' ? 'active' : ''} onClick={() => setPage('inventory')}><Laptop size={19}/><span>{isArabic ? 'المخزون' : 'Inventory'}</span></button>
        {managerCanCreateOrder && <button className={page === 'create-order' ? 'active' : ''} onClick={() => setPage('create-order')}><PackagePlus size={19}/><span>{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span></button>}
        {!managerCanCreateOrder && <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}><PackageCheck size={19}/><span>{isArabic ? 'الفواتير المعلقة' : 'Invoices'}</span></button>}
        <button className={page === 'returns' ? 'active' : ''} onClick={() => setPage('returns')}><RotateCcw size={19}/><span>{isArabic ? 'المرتجعات' : 'Returns'}</span></button>
        <button className={page === 'customers' ? 'active' : ''} onClick={() => setPage('customers')}><Users size={19}/><span>{isArabic ? 'العملاء' : 'Customers'}</span></button>
      </> : <>
        <button className={page === 'create-order' ? 'active' : ''} onClick={() => setPage('create-order')}><PackagePlus size={19}/><span>{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span></button>
      </>}
    </nav>
    {user.role === 'super_admin' && selectedBranch && <button className="sidebar-branch-back" onClick={leaveBranch}><Building2 size={18}/><span>{isArabic ? 'الرجوع إلى الفروع' : 'Back to branches'}</span></button>}
    <button className="sidebar-logout" onClick={logout}><LogOut size={18}/><span>{isArabic ? 'تسجيل الخروج' : 'Logout'}</span></button>
    <small>VOLTIO INVENTORY</small>
  </aside>;
}
