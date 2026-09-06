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

  return <div className="dropdown relative w-full" ref={rootRef}>
    <span className="mb-1 block text-xs font-medium text-base-content/60">{label}</span>
    <button
      type="button"
      disabled={disabled}
      className="btn btn-outline btn-sm w-full justify-between font-normal"
      onClick={() => !disabled && setOpen(current => !current)}
    >
      <b className="truncate font-normal">{value || placeholder || (isArabic ? 'الكل' : 'All')}</b>
      <ChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'}/>
    </button>
    {open && <div className="dropdown-content menu z-20 mt-1 w-full rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
      {options.length > 7 && <label className="input input-sm mb-1 flex items-center gap-2">
        <Search size={14} className="text-base-content/40"/>
        <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={isArabic ? `ابحث في ${label}...` : `Search ${label}...`} className="grow"/>
      </label>}
      <div className="max-h-56 overflow-y-auto">
        <button type="button" className={`flex w-full items-center justify-between rounded-field px-3 py-2 text-start text-sm hover:bg-base-200 ${!value ? 'bg-base-200 font-semibold text-primary' : ''}`} onClick={() => choose('')}>
          <span>{placeholder || (isArabic ? 'الكل' : 'All')}</span>{!value && <Check size={15}/>}
        </button>
        {visibleOptions.map(option => <button type="button" key={option} className={`flex w-full items-center justify-between rounded-field px-3 py-2 text-start text-sm hover:bg-base-200 ${value === option ? 'bg-base-200 font-semibold text-primary' : ''}`} onClick={() => choose(option)}>
          <span>{option}</span>{value === option && <Check size={15}/>}
        </button>)}
        {!visibleOptions.length && <div className="px-3 py-2 text-sm text-base-content/40">لا توجد نتائج</div>}
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

  return <div className="card bg-base-200">
    <div className="card-body gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base-content">
          <Filter size={18} className="text-primary"/>
          <b>{isArabic ? 'تصفية الأجهزة' : 'Filter devices'}</b>
          <span className="badge badge-ghost">{resultCount} {isArabic ? 'نتيجة' : 'results'}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onReset}><RotateCcw size={15}/>{isArabic ? 'مسح الفلاتر' : 'Reset filters'}</button>
      </div>

      <label className="input flex w-full items-center gap-2">
        <Search size={18} className="text-base-content/40"/>
        <input value={filters.search} onChange={event => update('search', event.target.value)} placeholder={isArabic ? 'ابحث في كل البيانات: الموديل، المعالج، الماركة...' : 'Search model, processor, brand...'} className="grow"/>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DropdownFilter label={isArabic ? 'الموديل' : 'Model'} value={filters.model} options={options.models} onChange={value => update('model', value)}/>
        <DropdownFilter label={isArabic ? 'المعالج' : 'Processor'} value={filters.processor} options={options.processors} onChange={value => update('processor', value)}/>
        <DropdownFilter label={isArabic ? 'الرام' : 'RAM'} value={filters.ram} options={options.rams} onChange={value => update('ram', value)}/>
        <DropdownFilter label={isArabic ? 'التخزين' : 'Storage'} value={filters.storage} options={options.storages} onChange={value => update('storage', value)}/>
        <DropdownFilter label={isArabic ? 'الليستة' : 'List'} value={filters.listName} options={options.listNames} onChange={value => update('listName', value)}/>
        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
          <span className="mb-1 block text-xs font-medium text-base-content/60">{isArabic ? 'فئة السعر' : 'Price range'}</span>
          <div className="join flex flex-wrap">
            <button type="button" className={`btn join-item btn-sm ${!filters.priceRange ? 'btn-primary' : 'btn-outline'}`} onClick={() => update('priceRange', '')}>{isArabic ? 'الكل' : 'All'}</button>
            {options.priceRanges.map(range => <button type="button" key={range} className={`btn join-item btn-sm ${filters.priceRange === range ? 'btn-primary' : 'btn-outline'}`} onClick={() => update('priceRange', range)}>{priceLabel(range)}</button>)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}
