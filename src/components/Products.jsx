import { Boxes, Copy, Download, FileSpreadsheet, Laptop, Layers3, ListChecks, Pencil, Tags, Trash2, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { money } from '../data/laptops';
import LaptopFilters from './LaptopFilters';
import Pagination from './Pagination';
import { useEffect, useMemo, useState } from 'react';
import { useUi } from '../UiContext';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const imageSource = image => image?.startsWith('/uploads/') ? `${BACKEND_URL}${image}` : image;

export default function Products({
  items, allCount, loading, error, filters, setFilters, filterOptions, resetFilters,
  openEdit, duplicate, remove, importFile, exportData, inputRef, inventoryItems = items,
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

  const confirmDuplicate = async item => {
    const result = await Swal.fire({
      title: isArabic ? 'نسخ هذا الجهاز؟' : 'Duplicate this device?',
      text: isArabic
        ? `سيتم إنشاء نسخة جديدة من ${item.brand} ${item.model} ووضعها أسفل الجهاز مباشرة.`
        : `A copy of ${item.brand} ${item.model} will be created directly below it.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isArabic ? 'نعم، اعمل نسخة' : 'Yes, duplicate',
      cancelButtonText: isArabic ? 'إلغاء' : 'Cancel',
      confirmButtonColor: '#f5a524',
      cancelButtonColor: '#27272a',
      reverseButtons: isArabic,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: { popup: '!bg-base-200 !text-base-content !rounded-2xl' },
      preConfirm: async () => {
        const saved = await duplicate(item);
        if (!saved) {
          Swal.showValidationMessage(isArabic ? 'تعذر نسخ الجهاز. حاول مرة أخرى.' : 'Could not duplicate the device. Please try again.');
          return false;
        }
        return saved;
      },
    });
    if (result.isConfirmed) {
      await Swal.fire({
        title: isArabic ? 'تم إنشاء النسخة' : 'Device duplicated',
        text: isArabic ? 'تمت إضافة الجهاز الجديد أسفل الجهاز الأصلي.' : 'The new device was added below the original.',
        icon: 'success',
        confirmButtonColor: '#f5a524',
        timer: 1800,
        timerProgressBar: true,
        customClass: { popup: '!bg-base-200 !text-base-content !rounded-2xl' },
      });
    }
  };

  return <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{isArabic ? 'لوحة التحكم' : 'DASHBOARD'}</span>
        <h2 className="mt-1 text-2xl font-bold text-base-content sm:text-3xl">{isArabic ? 'نظرة شاملة على المخزون' : 'Your inventory at a glance'}</h2>
        <p className="mt-1 text-sm text-base-content/60">{isArabic ? 'تابع الأجهزة والكميات من مكان واحد.' : 'Track devices and quantities from one place.'}</p>
      </div>
      <div className="text-2xl font-black tracking-tight text-base-content">F<span className="text-primary">ALCON</span></div>
    </div>

    <div className="stats stats-vertical w-full bg-base-100 shadow sm:stats-horizontal">
      <div className="stat">
        <div className="stat-figure text-primary"><Layers3 size={26}/></div>
        <div className="stat-title">{isArabic ? 'إجمالي الأصناف' : 'Total records'}</div>
        <div className="stat-value text-2xl">{summary.records}</div>
      </div>
      <div className="stat">
        <div className="stat-figure text-secondary"><Boxes size={26}/></div>
        <div className="stat-title">{isArabic ? 'إجمالي القطع' : 'Total units'}</div>
        <div className="stat-value text-2xl">{summary.units.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</div>
      </div>
      <div className="stat">
        <div className="stat-figure text-accent"><Tags size={26}/></div>
        <div className="stat-title">{isArabic ? 'عدد الماركات' : 'Brands'}</div>
        <div className="stat-value text-2xl">{summary.brands}</div>
      </div>
      <div className="stat">
        <div className="stat-figure text-info"><ListChecks size={26}/></div>
        <div className="stat-title">{isArabic ? 'عدد الليستات' : 'Lists'}</div>
        <div className="stat-value text-2xl">{summary.lists}</div>
      </div>
    </div>

    <div className="card bg-base-100 shadow">
      <div className="card-body gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">FALCON STOCK DATABASE</span>
            <h2 className="text-xl font-bold text-base-content">{isArabic ? 'قائمة الأجهزة' : 'Device list'}</h2>
            <p className="text-sm text-base-content/60">{allCount} {isArabic ? 'جهاز مسجل' : 'registered'} • {items.length} {isArabic ? 'نتيجة ظاهرة' : 'results'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={importFile}/>
            <button className="btn btn-primary" onClick={() => inputRef.current.click()}><Upload size={18}/>{isArabic ? 'رفع ملف Excel' : 'Import Excel'}</button>
            <button className="btn btn-outline" onClick={exportData} disabled={!allCount}><Download size={17}/>{isArabic ? 'تصدير البيانات' : 'Export data'}</button>
          </div>
        </div>

        <LaptopFilters filters={filters} setFilters={setFilters} options={filterOptions} resultCount={items.length} onReset={resetFilters}/>

        {error && <div className="alert alert-error">{error}</div>}
        {loading && <div className="alert alert-info">{isArabic ? 'جاري تحميل البيانات...' : 'Loading data...'}</div>}

        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{isArabic ? 'الصورة' : 'Image'}</th>
                <th>{isArabic ? 'الجهاز' : 'Device'}</th>
                <th>{isArabic ? 'المعالج' : 'Processor'}</th>
                <th>{isArabic ? 'الرام' : 'RAM'}</th>
                <th>{isArabic ? 'التخزين' : 'Storage'}</th>
                <th>{isArabic ? 'التكلفة' : 'Cost'}</th>
                <th>{isArabic ? 'قبل الخصم' : 'Before discount'}</th>
                <th>{isArabic ? 'بعد الخصم' : 'After discount'}</th>
                <th>{isArabic ? 'الكمية' : 'Quantity'}</th>
                <th className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map(item => <tr key={item.id}>
                <td>
                  {item.image
                    ? <img src={imageSource(item.image)} alt={item.model} className="h-12 w-12 rounded-box object-cover"/>
                    : <span className="flex h-12 w-12 items-center justify-center rounded-box bg-base-200 text-base-content/50"><Laptop size={20}/></span>}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-box bg-base-200 text-base-content/60"><Laptop size={20}/></span>
                    <div>
                      <b className="block text-base-content">{item.model}</b>
                      <small className="text-base-content/50">{!isArabic && item.brand === 'غير محدد' ? 'Not specified' : item.brand}{item.listName ? ` • ${item.listName}` : ''}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <strong className="block">{item.processor || '—'}</strong>
                    <div className="flex flex-wrap gap-1 text-xs text-base-content/50">
                      {item.generation && <span>{isArabic ? `جيل ${item.generation}` : `Gen ${item.generation}`}</span>}
                      {item.processorType && <span>{item.processorType}</span>}
                    </div>
                    {item.graphics && <small className="text-base-content/50">{isArabic ? 'كارت شاشة' : 'Graphics'}: {item.graphics}</small>}
                  </div>
                </td>
                <td><span className="badge badge-ghost">{item.ram || '—'}</span></td>
                <td><span className="badge badge-ghost">{item.storage || '—'}</span></td>
                <td><b className="text-base-content/70" dir={isArabic ? 'rtl' : 'ltr'}>{money(item.cost, language)}</b></td>
                <td><b className="text-base-content/60" dir={isArabic ? 'rtl' : 'ltr'}>{Number(item.oldPrice) > 0 ? money(item.oldPrice, language) : '—'}</b></td>
                <td><b className="text-primary" dir={isArabic ? 'rtl' : 'ltr'}>{money(item.price, language)}</b></td>
                <td><span className={`badge ${item.quantity <= 2 ? 'badge-warning' : 'badge-neutral'}`}>{item.quantity} {isArabic ? 'جهاز' : 'units'}</span></td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button className="btn btn-square btn-ghost btn-sm" onClick={() => openEdit(item)} title={isArabic ? 'تعديل' : 'Edit'}><Pencil size={17}/></button>
                    <button className="btn btn-square btn-ghost btn-sm" onClick={() => confirmDuplicate(item)} title={isArabic ? 'عمل نسخة' : 'Duplicate'}><Copy size={17}/></button>
                    {item.quantity <= 0 && <button className="btn btn-square btn-ghost btn-sm text-error" onClick={() => remove(item.id)} title={isArabic ? 'حذف' : 'Delete'}><Trash2 size={17}/></button>}
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
          {!loading && !items.length && <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <FileSpreadsheet size={38} className="text-base-content/30"/>
            <b className="text-base-content">{allCount ? (isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results') : (isArabic ? 'ابدأ برفع ملف Excel' : 'Start by importing Excel')}</b>
            <span className="text-sm text-base-content/50">{allCount ? (isArabic ? 'غيّر الفلاتر أو امسحها لعرض البيانات' : 'Change or reset filters to view data') : (isArabic ? 'سيتم حفظ بيانات الملف في MongoDB Atlas' : 'Your data will be saved in MongoDB Atlas')}</span>
            {!allCount && <button className="btn btn-primary btn-sm mt-2" onClick={() => inputRef.current.click()}><Upload size={17}/>{isArabic ? 'اختيار ملف Excel' : 'Choose Excel file'}</button>}
          </div>}
        </div>

        {!!items.length && <Pagination page={page} pageSize={pageSize} totalItems={items.length} onPageChange={setPage} onPageSizeChange={changePageSize}/>}
      </div>
    </div>
  </section>;
}
