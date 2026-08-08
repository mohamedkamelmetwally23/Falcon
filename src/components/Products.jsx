import { Boxes, Download, FileSpreadsheet, Laptop, Layers3, ListChecks, Pencil, Tags, Trash2, Upload } from 'lucide-react';
import { money } from '../data/laptops';
import LaptopFilters from './LaptopFilters';
import Pagination from './Pagination';
import { useEffect, useMemo, useState } from 'react';
import { useUi } from '../UiContext';

export default function Products({
  items, allCount, loading, error, filters, setFilters, filterOptions, resetFilters,
  openEdit, remove, importFile, exportData, inputRef, inventoryItems = items,
}) {
  const { isArabic, language } = useUi();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const visibleItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);
  const summary = useMemo(() => ({
    records: inventoryItems.length,
    units: inventoryItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    brands: new Set(inventoryItems.map(item => item.brand).filter(Boolean)).size,
    lists: new Set(inventoryItems.map(item => item.listName).filter(Boolean)).size,
  }), [inventoryItems]);

  useEffect(() => setPage(1), [items]);

  const changePageSize = size => {
    setPageSize(size);
    setPage(1);
  };

  return <section className="content">
    <div className="hero-row">
      <div className="hero-copy"><span>{isArabic ? 'لوحة التحكم' : 'DASHBOARD'}</span><h2>{isArabic ? 'نظرة شاملة على المخزون' : 'Your inventory at a glance'}</h2><p>{isArabic ? 'تابع الأجهزة والكميات من مكان واحد.' : 'Track devices and quantities from one place.'}</p></div>
      <div className="hero-mark">V<span>OLTIO</span></div>
    </div>
    <div className="inventory-summary">
      <div><span><Layers3/></span><p>{isArabic ? 'إجمالي الأصناف' : 'Total records'}<b>{summary.records}</b></p></div>
      <div><span><Boxes/></span><p>{isArabic ? 'إجمالي القطع' : 'Total units'}<b>{summary.units.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</b></p></div>
      <div><span><Tags/></span><p>{isArabic ? 'عدد الماركات' : 'Brands'}<b>{summary.brands}</b></p></div>
      <div><span><ListChecks/></span><p>{isArabic ? 'عدد الليستات' : 'Lists'}<b>{summary.lists}</b></p></div>
    </div>
    <div className="workspace">
      <div className="workspace-toolbar">
        <div>
          <span className="eyebrow">VOLTIO STOCK DATABASE</span>
          <h2>{isArabic ? 'قائمة الأجهزة' : 'Device list'}</h2>
          <p>{allCount} {isArabic ? 'جهاز مسجل' : 'registered'} • {items.length} {isArabic ? 'نتيجة ظاهرة' : 'results'}</p>
        </div>
        <div className="toolbar-actions">
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={importFile}/>
          <button className="import-button" onClick={() => inputRef.current.click()}><Upload size={18}/>{isArabic ? 'رفع ملف Excel' : 'Import Excel'}</button>
          <button className="secondary" onClick={exportData} disabled={!allCount}><Download size={17}/>{isArabic ? 'تصدير البيانات' : 'Export data'}</button>
        </div>
      </div>

      <LaptopFilters filters={filters} setFilters={setFilters} options={filterOptions} resultCount={items.length} onReset={resetFilters}/>

      {error && <div className="status-message error">{error}</div>}
      {loading && <div className="status-message loading">{isArabic ? 'جاري تحميل البيانات...' : 'Loading data...'}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>{isArabic ? 'الجهاز' : 'Device'}</th><th>{isArabic ? 'المعالج' : 'Processor'}</th><th>{isArabic ? 'الرام' : 'RAM'}</th><th>{isArabic ? 'التخزين' : 'Storage'}</th><th>{isArabic ? 'التكلفة' : 'Cost'}</th><th>{isArabic ? 'السعر' : 'Price'}</th><th>{isArabic ? 'الكمية' : 'Quantity'}</th><th>{isArabic ? 'الإجراءات' : 'Actions'}</th></tr></thead>
          <tbody>{visibleItems.map(item => <tr key={item.id}>
            <td><div className="product"><span><Laptop size={20}/></span><div><b>{item.model}</b><small>{!isArabic && item.brand === 'غير محدد' ? 'Not specified' : item.brand}{item.listName ? ` • ${item.listName}` : ''}</small></div></div></td>
            <td><span className="processor-cell">{item.processor}</span></td>
            <td><span className="spec-pill">{item.ram || '—'}</span></td>
            <td><span className="spec-pill">{item.storage || '—'}</span></td>
            <td><b className="cost-cell" dir={isArabic ? 'rtl' : 'ltr'}>{money(item.cost, language)}</b></td>
            <td><b className="price-cell" dir={isArabic ? 'rtl' : 'ltr'}>{money(item.price, language)}</b></td>
            <td><span className={item.quantity <= 2 ? 'qty low' : 'qty'}>{item.quantity} {isArabic ? 'جهاز' : 'units'}</span></td>
            <td><div className="row-actions"><button onClick={() => openEdit(item)} title={isArabic ? 'تعديل' : 'Edit'}><Pencil size={17}/></button>{item.quantity <= 0 && <button className="danger" onClick={() => remove(item.id)} title={isArabic ? 'حذف' : 'Delete'}><Trash2 size={17}/></button>}</div></td>
          </tr>)}</tbody>
        </table>
        {!loading && !items.length && <div className="empty"><FileSpreadsheet size={38}/><b>{allCount ? (isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results') : (isArabic ? 'ابدأ برفع ملف Excel' : 'Start by importing Excel')}</b><span>{allCount ? (isArabic ? 'غيّر الفلاتر أو امسحها لعرض البيانات' : 'Change or reset filters to view data') : (isArabic ? 'سيتم حفظ بيانات الملف في MongoDB Atlas' : 'Your data will be saved in MongoDB Atlas')}</span>{!allCount && <button className="import-button" onClick={() => inputRef.current.click()}><Upload size={17}/>{isArabic ? 'اختيار ملف Excel' : 'Choose Excel file'}</button>}</div>}
      </div>
      {!!items.length && <Pagination page={page} pageSize={pageSize} totalItems={items.length} onPageChange={setPage} onPageSizeChange={changePageSize}/>} 
    </div>
  </section>;
}
