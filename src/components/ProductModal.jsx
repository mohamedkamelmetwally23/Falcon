import { AlertTriangle, Check, ImagePlus, PackagePlus, Trash2, X } from 'lucide-react';
import { useUi } from '../UiContext';
import { useState } from 'react';

const ramOptions = ['4 GB', '8 GB', '16 GB', '32 GB'];
const storageOptions = ['256 M.2', '512 M.2', '500 HDD', 'بدون هارد'];
const graphicsOptions = ['INTEL', 'VGA 2', 'VGA 4', 'VGA 6', 'VGA 8'];
const processorOptions = ['I5', 'I7', 'I9', 'RYZEN 5', 'RYZEN 7'];
const generationOptions = Array.from({ length: 9 }, (_, index) => String(index + 6));
const processorTypeOptions = ['U', 'HQ', 'H', 'G7'];

export default function ProductModal({ form, setForm, editing, close, submit, onDelete }) {
  const { isArabic } = useUi();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const uploadImage = event => {
    const file = event.target.files[0];
    if (!file || file.size > 3 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => update('image', reader.result);
    reader.readAsDataURL(file);
  };

  const field = (key, label, type = 'text', placeholder = '', className = '') => <label className={className}>
    <span>{label}</span>
    <input type={type} min={type === 'number' ? 0 : undefined} required value={form[key]} placeholder={placeholder} autoComplete="off" onChange={event => update(key, event.target.value)}/>
  </label>;

  const selectField = (key, label, options, className = '') => <label className={className}>
    <span>{label}</span>
    <select required value={form[key] ?? ''} onChange={event => update(key, event.target.value)}>
      <option value="" disabled>{isArabic ? 'اختر' : 'Select'}</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div className="modal-title"><span><PackagePlus/></span><div><h2>{editing ? (isArabic ? 'تعديل بيانات الجهاز' : 'Edit device') : (isArabic ? 'إضافة جهاز جديد' : 'Add new device')}</h2><p>{isArabic ? 'اكتب بيانات الجهاز كاملة في الحقول التالية' : 'Enter the complete device details below'}</p></div></div><button type="button" onClick={close}><X/></button></div>
      <div className="form-body">
        <div className="form-card">
          <div className="form-section-head"><b>{isArabic ? 'بيانات الجهاز' : 'Device details'}</b><span>{isArabic ? 'الماركة والموديل' : 'Brand and model'}</span></div>
          <div className="form-grid identity-grid">
            {field('brand', isArabic ? 'الماركة' : 'Brand', 'text', isArabic ? 'مثال: Dell' : 'e.g. Dell')}
            {field('model', isArabic ? 'الموديل' : 'Model', 'text', isArabic ? 'مثال: Latitude 5420' : 'e.g. Latitude 5420')}
          </div>
          <label className="image-upload-field"><span>{isArabic ? 'صورة الجهاز' : 'Device image'}</span><input type="file" accept="image/*" onChange={uploadImage}/>{form.image ? <img src={form.image} alt="معاينة الجهاز"/> : <span className="image-upload-placeholder"><ImagePlus size={20}/>{isArabic ? 'اختر صورة للجهاز' : 'Choose a device image'}</span>}</label>
        </div>
        <div className="form-card">
          <div className="form-section-head"><b>{isArabic ? 'مواصفات المعالج' : 'Processor details'}</b><span>{isArabic ? 'المعالج والجيل والفئة' : 'Processor, generation and type'}</span></div>
          <div className="form-grid processor-grid">
            {selectField('processor', isArabic ? 'المعالج' : 'Processor', processorOptions)}
            {selectField('generation', isArabic ? 'الجيل' : 'Generation', generationOptions)}
            {selectField('processorType', isArabic ? 'فئة البروسيسور' : 'Processor type', processorTypeOptions)}
          </div>
        </div>
        <div className="form-card">
          <div className="form-section-head"><b>{isArabic ? 'الذاكرة والتخزين' : 'Memory and storage'}</b><span>{isArabic ? 'الرام والهارد وكارت الشاشة' : 'RAM, storage and graphics'}</span></div>
          <div className="form-grid hardware-grid">
            {selectField('ram', isArabic ? 'الرام' : 'RAM', ramOptions)}
            {selectField('storage', isArabic ? 'التخزين' : 'Storage', storageOptions)}
            {selectField('graphics', isArabic ? 'كارت الشاشة' : 'Graphics card', graphicsOptions)}
          </div>
        </div>
        <div className="form-card stock-card">
          <div className="form-section-head"><b>{isArabic ? 'السعر والمخزون' : 'Price and stock'}</b><span>{isArabic ? 'بيانات التسعير والكمية المتاحة' : 'Pricing and available quantity'}</span></div>
          <div className="form-grid stock-grid">
            {field('listName', isArabic ? 'اسم الليستة' : 'List name', 'text', isArabic ? 'مثال: ليستة أغسطس' : 'e.g. August list')}
            {field('cost', isArabic ? 'التكلفة بالجنيه' : 'Cost (EGP)', 'number', isArabic ? 'مثال: 12000' : 'e.g. 12000')}
            {field('oldPrice', isArabic ? 'السعر قبل الخصم' : 'Price before discount', 'number', isArabic ? 'مثال: 18000' : 'e.g. 18000')}
            {field('price', isArabic ? 'السعر بالجنيه' : 'Price (EGP)', 'number', isArabic ? 'مثال: 15000' : 'e.g. 15000')}
            {field('quantity', isArabic ? 'الكمية المتاحة' : 'Available quantity', 'number', isArabic ? 'مثال: 5' : 'e.g. 5')}
          </div>
        </div>
      </div>
      <div className="modal-actions">
        {editing && Number(form.quantity) === 0 && <button type="button" className="delete-device" onClick={() => setConfirmDelete(true)}><Trash2 size={17}/>{isArabic ? 'حذف الجهاز' : 'Delete device'}</button>}
        <span className="modal-actions-spacer"/>
        <button type="button" className="secondary" onClick={close}>{isArabic ? 'إلغاء' : 'Cancel'}</button><button className="primary" type="submit" disabled={editing && Number(form.quantity) === 0} title={editing && Number(form.quantity) === 0 ? (isArabic ? 'لا يمكن حفظ جهاز كميته صفر؛ احذف الجهاز أو أدخل كمية أكبر' : 'A device with zero quantity cannot be saved. Delete it or enter a higher quantity.') : ''}><Check size={18}/>{editing ? (isArabic ? 'حفظ التعديلات' : 'Save changes') : (isArabic ? 'إضافة الجهاز' : 'Add device')}</button>
      </div>
      {confirmDelete && <div className="delete-confirm-backdrop" onMouseDown={event => event.target === event.currentTarget && setConfirmDelete(false)}>
        <div className="delete-confirm" role="alertdialog" aria-modal="true">
          <span className="delete-confirm-icon"><AlertTriangle/></span>
          <h3>{isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?'}</h3>
          <p>{isArabic ? 'سيتم حذف الجهاز نهائيًا من قاعدة البيانات ولا يمكن التراجع عن هذا الإجراء.' : 'This device will be permanently removed from the database. This action cannot be undone.'}</p>
          <div><button type="button" className="secondary" onClick={() => setConfirmDelete(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</button><button type="button" className="confirm-delete-button" onClick={onDelete}><Trash2 size={16}/>{isArabic ? 'نعم، احذف' : 'Yes, delete'}</button></div>
        </div>
      </div>}
    </form>
  </div>;
}
