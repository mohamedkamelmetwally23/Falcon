import { Languages, Moon, Plus, ShieldCheck, Sun } from 'lucide-react';
import { useUi } from '../UiContext';

export default function Header({ openAdd, page, user }) {
  const { isArabic, language, setLanguage, theme, setTheme } = useUi();
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-base-300 bg-base-100/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div>
          <span className="block text-xs font-semibold tracking-wide text-primary">FALCON LAPTOP</span>
          <h1 className="text-lg font-bold leading-tight text-base-content">
            {isArabic ? 'إدارة مخزون اللابتوبات' : 'Laptop Inventory Management'}
          </h1>
          <p className="flex items-center gap-1 text-xs text-base-content/60">
            <ShieldCheck size={13} />
            {isArabic ? 'إدارة الفواتير والمخزون' : 'Invoices and inventory management'}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="hidden rounded-btn bg-base-200 px-3 py-1.5 text-sm sm:block">
          <b className="text-base-content">{user.name}</b>
        </div>
        <button
          className="btn btn-ghost btn-sm flex-1 sm:flex-none"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          title={isArabic ? 'English' : 'العربية'}
        >
          <Languages size={17} />
          <span>{isArabic ? 'EN' : 'عربي'}</span>
        </button>
        <button
          className="btn btn-ghost btn-sm flex-1 sm:flex-none"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === 'dark' ? (isArabic ? 'فاتح' : 'Light') : (isArabic ? 'داكن' : 'Dark')}</span>
        </button>
        {page === 'inventory' && (
          <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={openAdd}>
            <Plus size={18} />
            <span>{isArabic ? 'إضافة جهاز جديد' : 'Add new device'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
