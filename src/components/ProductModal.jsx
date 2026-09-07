import { AlertTriangle, Check, ImagePlus, LoaderCircle, PackagePlus, Trash2, X } from 'lucide-react';
import { useUi } from '../UiContext';
import { useState } from 'react';

const ramOptions = ['4 GB', '8 GB', '16 GB', '32 GB'];
const storageOptions = ['256 M.2', '512 M.2', '500 HDD', 'بدون هارد'];
const graphicsOptions = ['INTEL', 'VGA 2', 'VGA 4', 'VGA 6', 'VGA 8'];
const processorOptions = ['I5', 'I7', 'I9', 'RYZEN 5', 'RYZEN 7'];
const generationOptions = Array.from({ length: 9 }, (_, index) => String(index + 6));
const processorTypeOptions = ['U', 'HQ', 'H', 'G7'];
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const imageSource = image => image?.startsWith('/uploads/') ? `${BACKEND_URL}${image}` : image;

export default function ProductModal({ form, setForm, editing, close, submit, onDelete, saving = false }) {
  const { isArabic } = useUi();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const uploadImage = event => {
    const file = event.target.files[0];
    if (!file || file.size > 3 * 1024 * 1024) return;
    update('imageFile', file);
    update('image', URL.createObjectURL(file));
  };

  const field = (key, label, type = 'text', placeholder = '', className = '') => <label className={`form-control w-full ${className}`}>
    <span className="label-text mb-1 text-xs font-medium text-base-content/60">{label}</span>
    <input type={type} min={type === 'number' ? 0 : undefined} value={form[key] ?? ''} placeholder={placeholder} autoComplete="off" className="input w-full" onChange={event => update(key, event.target.value)}/>
  </label>;

  const selectField = (key, label, options, className = '') => <label className={`form-control w-full ${className}`}>
    <span className="label-text mb-1 text-xs font-medium text-base-content/60">{label}</span>
    <select value={form[key] ?? ''} className="select w-full" onChange={event => update(key, event.target.value)}>
      <option value="">{isArabic ? 'اختر' : 'Select'}</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;

  return <div className="modal modal-open" onMouseDown={event => event.target === event.currentTarget && close()}>
    <form className="modal-box flex max-h-[92vh] w-11/12 max-w-3xl flex-col gap-0 p-0" onSubmit={submit}>
      <div className="flex items-start justify-between gap-4 border-b border-base-300 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-box bg-primary/10 text-primary"><PackagePlus/></span>
          <div>
            <h2 className="text-lg font-bold text-base-content">{editing ? (isArabic ? 'تعديل بيانات الجهاز' : 'Edit device') : (isArabic ? 'إضافة جهاز جديد' : 'Add new device')}</h2>
            <p className="text-sm text-base-content/50">{isArabic ? 'اكتب بيانات الجهاز كاملة في الحقول التالية' : 'Enter the complete device details below'}</p>
          </div>
        </div>
        <button type="button" className="btn btn-square btn-ghost btn-sm" onClick={close}><X/></button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-5">
        <div className="card bg-base-200">
          <div className="card-body gap-4 p-4">
            <div>
              <b className="block text-base-content">{isArabic ? 'بيانات الجهاز' : 'Device details'}</b>
              <span className="text-xs text-base-content/50">{isArabic ? 'الماركة والموديل' : 'Brand and model'}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field('brand', isArabic ? 'الماركة' : 'Brand', 'text', isArabic ? 'مثال: Dell' : 'e.g. Dell')}
              {field('model', isArabic ? 'الموديل' : 'Model', 'text', isArabic ? 'مثال: Latitude 5420' : 'e.g. Latitude 5420')}
            </div>
            <label className="form-control w-full">
              <span className="label-text mb-1 text-xs font-medium text-base-content/60">{isArabic ? 'صورة الجهاز' : 'Device image'}</span>
              <div className="flex items-center gap-4">
                {form.image
                  ? <img src={imageSource(form.image)} alt="معاينة الجهاز" className="h-16 w-16 rounded-box object-cover"/>
                  : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-box bg-base-300 text-base-content/40"><ImagePlus size={20}/></span>}
                <input type="file" accept="image/*" className="file-input file-input-sm w-full max-w-xs" onChange={uploadImage}/>
              </div>
            </label>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body gap-4 p-4">
            <div>
              <b className="block text-base-content">{isArabic ? 'مواصفات المعالج' : 'Processor details'}</b>
              <span className="text-xs text-base-content/50">{isArabic ? 'المعالج والجيل والفئة' : 'Processor, generation and type'}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {selectField('processor', isArabic ? 'المعالج' : 'Processor', processorOptions)}
              {selectField('generation', isArabic ? 'الجيل' : 'Generation', generationOptions)}
              {selectField('processorType', isArabic ? 'فئة البروسيسور' : 'Processor type', processorTypeOptions)}
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body gap-4 p-4">
            <div>
              <b className="block text-base-content">{isArabic ? 'الذاكرة والتخزين' : 'Memory and storage'}</b>
              <span className="text-xs text-base-content/50">{isArabic ? 'الرام والهارد وكارت الشاشة' : 'RAM, storage and graphics'}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {selectField('ram', isArabic ? 'الرام' : 'RAM', ramOptions)}
              {selectField('storage', isArabic ? 'التخزين' : 'Storage', storageOptions)}
              {selectField('graphics', isArabic ? 'كارت الشاشة' : 'Graphics card', graphicsOptions)}
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body gap-4 p-4">
            <div>
              <b className="block text-base-content">{isArabic ? 'السعر والمخزون' : 'Price and stock'}</b>
              <span className="text-xs text-base-content/50">{isArabic ? 'بيانات التسعير والكمية المتاحة' : 'Pricing and available quantity'}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {field('listName', isArabic ? 'اسم الليستة' : 'List name', 'text', isArabic ? 'مثال: ليستة أغسطس' : 'e.g. August list')}
              {field('cost', isArabic ? 'التكلفة بالجنيه' : 'Cost (EGP)', 'number', isArabic ? 'مثال: 12000' : 'e.g. 12000')}
              {field('oldPrice', isArabic ? 'السعر قبل الخصم' : 'Price before discount', 'number', isArabic ? 'مثال: 18000' : 'e.g. 18000')}
              {field('price', isArabic ? 'السعر بعد الخصم بالجنيه' : 'Price after discount (EGP)', 'number', isArabic ? 'مثال: 15000' : 'e.g. 15000')}
              {field('quantity', isArabic ? 'الكمية المتاحة' : 'Available quantity', 'number', isArabic ? 'مثال: 5' : 'e.g. 5')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-base-300 p-5">
        {editing && Number(form.quantity) === 0 && <button type="button" className="btn btn-error btn-outline" onClick={() => setConfirmDelete(true)}><Trash2 size={17}/>{isArabic ? 'حذف الجهاز' : 'Delete device'}</button>}
        <span className="grow"/>
        <button type="button" className="btn btn-ghost" onClick={close}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={saving || (editing && Number(form.quantity) === 0)}
          title={editing && Number(form.quantity) === 0 ? (isArabic ? 'لا يمكن حفظ جهاز كميته صفر؛ احذف الجهاز أو أدخل كمية أكبر' : 'A device with zero quantity cannot be saved. Delete it or enter a higher quantity.') : ''}
        >
          {saving ? <LoaderCircle size={18} className="animate-spin"/> : <Check size={18}/>} {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : editing ? (isArabic ? 'حفظ التعديلات' : 'Save changes') : (isArabic ? 'إضافة الجهاز' : 'Add device')}
        </button>
      </div>

      {confirmDelete && <div className="modal modal-open" onMouseDown={event => event.target === event.currentTarget && setConfirmDelete(false)}>
        <div className="modal-box max-w-sm text-center" role="alertdialog" aria-modal="true">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error"><AlertTriangle/></span>
          <h3 className="mt-3 text-lg font-bold text-base-content">{isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?'}</h3>
          <p className="mt-1 text-sm text-base-content/60">{isArabic ? 'سيتم حذف الجهاز نهائيًا من قاعدة البيانات ولا يمكن التراجع عن هذا الإجراء.' : 'This device will be permanently removed from the database. This action cannot be undone.'}</p>
          <div className="modal-action justify-center">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
            <button type="button" className="btn btn-error" onClick={onDelete}><Trash2 size={16}/>{isArabic ? 'نعم، احذف' : 'Yes, delete'}</button>
          </div>
        </div>
      </div>}
    </form>
  </div>;
}
