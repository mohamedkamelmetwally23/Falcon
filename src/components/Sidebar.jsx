import { Laptop, LogOut, PackageCheck, PackagePlus, RotateCcw, Users, UserRoundSearch } from 'lucide-react';
import { useUi } from '../UiContext';

const navClass = (active) =>
  `btn btn-ghost btn-sm h-auto min-h-0 flex-col gap-1 rounded-btn px-2 py-2 text-[11px] normal-case md:w-full md:flex-col lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-2.5 lg:text-sm ${
    active ? 'btn-active bg-primary/15 text-primary' : 'text-base-content/70'
  }`;

export default function Sidebar({ page, setPage, user, logout, managerCanCreateOrder }) {
  const { isArabic } = useUi();
  return (
    <aside className="fixed inset-x-0 bottom-0 z-20 flex h-16 flex-row items-center justify-around border-t border-base-300 bg-base-100 px-1 md:inset-y-0 md:bottom-auto md:start-0 md:end-auto md:h-screen md:w-20 md:flex-col md:items-stretch md:justify-start md:gap-2 md:border-e md:border-t-0 md:px-2 md:py-4 lg:w-64">
      <div className="hidden shrink-0 items-center gap-3 pb-4 md:flex md:flex-col lg:flex-row lg:items-center">
        <span className="hidden text-lg font-bold tracking-wide text-primary lg:inline">FALCON</span>
      </div>

      <nav
        className="flex flex-1 flex-row items-center justify-around gap-1 md:flex-col md:items-stretch md:justify-start md:gap-1 md:overflow-y-auto"
        aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}
      >
        {['admin', 'super_admin'].includes(user.role) ? (
          <>
            <button className={navClass(page === 'inventory')} onClick={() => setPage('inventory')}>
              <Laptop size={19} />
              <span className="hidden lg:inline">{isArabic ? 'المخزون' : 'Inventory'}</span>
            </button>
            {managerCanCreateOrder && (
              <button className={navClass(page === 'create-order')} onClick={() => setPage('create-order')}>
                <PackagePlus size={19} />
                <span className="hidden lg:inline">{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span>
              </button>
            )}
            {!managerCanCreateOrder && (
              <button className={navClass(page === 'orders')} onClick={() => setPage('orders')}>
                <PackageCheck size={19} />
                <span className="hidden lg:inline">{isArabic ? 'الفواتير المعلقة' : 'Invoices'}</span>
              </button>
            )}
            <button className={navClass(page === 'returns')} onClick={() => setPage('returns')}>
              <RotateCcw size={19} />
              <span className="hidden lg:inline">{isArabic ? 'المرتجعات' : 'Returns'}</span>
            </button>
            <button className={navClass(page === 'customers')} onClick={() => setPage('customers')}>
              <Users size={19} />
              <span className="hidden lg:inline">{isArabic ? 'العملاء' : 'Customers'}</span>
            </button>
            <button className={navClass(page === 'leads')} onClick={() => setPage('leads')}>
              <UserRoundSearch size={19} />
              <span className="hidden lg:inline">{isArabic ? 'المهتمين' : 'Leads'}</span>
            </button>
          </>
        ) : (
          <button className={navClass(page === 'create-order')} onClick={() => setPage('create-order')}>
            <PackagePlus size={19} />
            <span className="hidden lg:inline">{isArabic ? 'فاتورة جديدة' : 'New invoice'}</span>
          </button>
        )}
      </nav>

      <button
        className="btn btn-ghost btn-sm h-auto min-h-0 flex-col gap-1 rounded-btn px-2 py-2 text-[11px] normal-case text-error md:mt-auto md:w-full md:flex-col lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-2.5 lg:text-sm"
        onClick={logout}
      >
        <LogOut size={18} />
        <span className="hidden lg:inline">{isArabic ? 'تسجيل الخروج' : 'Logout'}</span>
      </button>
      <small className="hidden pt-2 text-center text-[10px] text-base-content/40 lg:block">FALCON LAPTOP</small>
    </aside>
  );
}
