import { Check, ChevronDown, Filter, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUi } from '../UiContext';

export function DropdownFilter({ label, value, options, onChange, placeholder, disabled = false }) {
  const { isArabic } = useUi();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const visibleOptions = useMemo(
    () => options.filter(option => option.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    const close = event => !rootRef.current?.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const choose = option => {
    onChange(option);
    setOpen(false);
    setQuery('');
  };

  return <div className="filter-field dropdown-filter" ref={rootRef}>
    <span>{label}</span>
    <button type="button" disabled={disabled} className={`${open ? 'dropdown-trigger open' : 'dropdown-trigger'}${disabled ? ' disabled' : ''}`} onClick={() => !disabled && setOpen(current => !current)}>
      <b>{value || placeholder || (isArabic ? 'الكل' : 'All')}</b><ChevronDown size={16}/>
    </button>
    {open && <div className="dropdown-menu">
      {options.length > 7 && <label className="dropdown-search"><Search size={15}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={isArabic ? `ابحث في ${label}...` : `Search ${label}...`}/></label>}
      <div className="dropdown-options">
        <button type="button" className={!value ? 'selected' : ''} onClick={() => choose('')}><span>{placeholder || (isArabic ? 'الكل' : 'All')}</span>{!value && <Check size={15}/>}</button>
        {visibleOptions.map(option => <button type="button" className={value === option ? 'selected' : ''} onClick={() => choose(option)} key={option}><span>{option}</span>{value === option && <Check size={15}/>}</button>)}
        {!visibleOptions.length && <div className="no-options">لا توجد نتائج</div>}
      </div>
    </div>}
  </div>;
}

export default function LaptopFilters({ filters, setFilters, options, resultCount, onReset }) {
  const { isArabic } = useUi();
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const priceLabel = range => isArabic ? range : ({
    'من 5 إلى 10 آلاف': '5K–10K',
    'من 10 إلى 15 ألف': '10K–15K',
    'من 15 إلى 20 ألف': '15K–20K',
    '25 ألف فأكثر': '25K+',
  }[range] || range);

  return <div className="filter-box">
    <div className="filter-heading">
      <div><Filter size={18}/><b>{isArabic ? 'تصفية الأجهزة' : 'Filter devices'}</b><span>{resultCount} {isArabic ? 'نتيجة' : 'results'}</span></div>
      <button className="reset-button" onClick={onReset}><RotateCcw size={15}/>{isArabic ? 'مسح الفلاتر' : 'Reset filters'}</button>
    </div>
    <label className="global-search"><Search size={19}/><input value={filters.search} onChange={event => update('search', event.target.value)} placeholder={isArabic ? 'ابحث في كل البيانات: الموديل، المعالج، الماركة...' : 'Search model, processor, brand...'}/></label>
    <div className="filter-grid">
      <DropdownFilter label={isArabic ? 'الموديل' : 'Model'} value={filters.model} options={options.models} onChange={value => update('model', value)}/>
      <DropdownFilter label={isArabic ? 'المعالج' : 'Processor'} value={filters.processor} options={options.processors} onChange={value => update('processor', value)}/>
      <DropdownFilter label={isArabic ? 'الرام' : 'RAM'} value={filters.ram} options={options.rams} onChange={value => update('ram', value)}/>
      <DropdownFilter label={isArabic ? 'التخزين' : 'Storage'} value={filters.storage} options={options.storages} onChange={value => update('storage', value)}/>
      <DropdownFilter label={isArabic ? 'الليستة' : 'List'} value={filters.listName} options={options.listNames} onChange={value => update('listName', value)}/>
      <div className="filter-field price-filter">
        <span>{isArabic ? 'فئة السعر' : 'Price range'}</span>
        <div className="price-buttons">
          <button type="button" className={!filters.priceRange ? 'active' : ''} onClick={() => update('priceRange', '')}>{isArabic ? 'الكل' : 'All'}</button>
          {options.priceRanges.map(range => <button type="button" className={filters.priceRange === range ? 'active' : ''} onClick={() => update('priceRange', range)} key={range}>{priceLabel(range)}</button>)}
        </div>
      </div>
    </div>
  </div>;
}
