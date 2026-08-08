import { Languages, Moon, Plus, ShieldCheck, Sun } from 'lucide-react';
import logo from '../assets/voltio-logo.png';
import { useUi } from '../UiContext';

export default function Header({ openAdd, page, user }) {
  const { isArabic, language, setLanguage, theme, setTheme } = useUi();
  return <header className="app-header">
    <div className="brand-block">
      <span className="brand-logo"><img src={logo} alt="VOLTIO"/></span>
      <div><span className="brand-kicker">VOLTIO INVENTORY</span><h1>{isArabic ? 'إدارة مخزون اللابتوبات' : 'Laptop Inventory Management'}</h1><p><ShieldCheck size={13}/>{isArabic ? 'إدارة الفواتير والمخزون' : 'Invoices and inventory management'}</p></div>
    </div>
    <div className="header-tools">
      <div className="current-user"><b>{user.name}</b></div>
      <button className="ui-switch" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} title={isArabic ? 'English' : 'العربية'}><Languages size={17}/><span>{isArabic ? 'EN' : 'عربي'}</span></button>
      <button className="ui-switch theme-switch" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}<span>{theme === 'dark' ? (isArabic ? 'فاتح' : 'Light') : (isArabic ? 'داكن' : 'Dark')}</span></button>
      {page === 'inventory' && <button className="primary header-action" onClick={openAdd}><Plus size={18}/><span>{isArabic ? 'إضافة جهاز جديد' : 'Add new device'}</span></button>}
    </div>
  </header>;
}
