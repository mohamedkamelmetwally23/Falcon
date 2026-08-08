import { AlertTriangle, Check, PackagePlus, Trash2, X } from 'lucide-react';
import { useUi } from '../UiContext';
import { useState } from 'react';

export default function ProductModal({ form, setForm, editing, close, submit, onDelete }) {
  const { isArabic } = useUi();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const field = (key, label, type = 'text', placeholder = '', className = '') => <label className={className}>
    <span>{label}</span>
    <input type={type} min={type === 'number' ? 0 : undefined} required value={form[key]} placeholder={placeholder} autoComplete="off" onChange={event => update(key, event.target.value)}/>
  </label>;

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div className="modal-title"><span><PackagePlus/></span><div><h2>{editing ? (isArabic ? 'تعديل بيانات الجهاز' : 'Edit device') : (isArabic ? 'إضافة جهاز جديد' : 'Add new device')}</h2><p>{isArabic ? 'اكتب بيانات الجهاز كاملة في الحقول التالية' : 'Enter the complete device details below'}</p></div></div><button type="button" onClick={close}><X/></button></div>
      <div className="form-body">
        <div className="form-section-head"><b>{isArabic ? 'مواصفات الجهاز' : 'Device specifications'}</b><span>{isArabic ? 'البيانات الأساسية والمواصفات الفنية' : 'Basic details and technical specifications'}</span></div>
        <div className="form-grid">
          {field('model', isArabic ? 'الموديل' : 'Model', 'text', isArabic ? 'مثال: Latitude 5420' : 'e.g. Latitude 5420')}
          {field('brand', isArabic ? 'الماركة' : 'Brand', 'text', isArabic ? 'مثال: Dell' : 'e.g. Dell')}
          {field('processor', isArabic ? 'المعالج' : 'Processor', 'text', isArabic ? 'مثال: Intel Core i5-1145G7' : 'e.g. Intel Core i5-1145G7', 'wide-field')}
          {field('ram', isArabic ? 'الرام' : 'RAM', 'text', isArabic ? 'مثال: 16 GB' : 'e.g. 16 GB')}
          {field('storage', isArabic ? 'التخزين' : 'Storage', 'text', isArabic ? 'مثال: 512 GB SSD' : 'e.g. 512 GB SSD')}
        </div>
        <div className="form-section-head stock-head"><b>{isArabic ? 'السعر والمخزون' : 'Price and stock'}</b><span>{isArabic ? 'حدد سعر الجهاز والكمية المتاحة' : 'Set the price and available quantity'}</span></div>
        <div className="form-grid stock-grid">
          {field('listName', isArabic ? 'اسم الليستة' : 'List name', 'text', isArabic ? 'مثال: ليستة أغسطس' : 'e.g. August list')}
          {field('cost', isArabic ? 'التكلفة بالجنيه' : 'Cost (EGP)', 'number', isArabic ? 'مثال: 12000' : 'e.g. 12000')}
          {field('price', isArabic ? 'السعر بالجنيه' : 'Price (EGP)', 'number', isArabic ? 'مثال: 15000' : 'e.g. 15000')}
          {field('quantity', isArabic ? 'الكمية المتاحة' : 'Available quantity', 'number', isArabic ? 'مثال: 5' : 'e.g. 5')}
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
