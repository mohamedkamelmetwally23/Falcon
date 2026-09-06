import { Check, CheckCircle2, Pencil, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { orderApi } from '../services/api';
import { useUi } from '../UiContext';
import { DropdownFilter } from './LaptopFilters';
import DatePicker from './DatePicker';

const fields = ['brand', 'model', 'processor', 'ram', 'storage'];
const emptyChoice = { brand: '', model: '', processor: '', ram: '', storage: '' };
const today = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };

export default function CreateOrder({ products, customers = [], customersLoading, customersError, onCreated, autoConfirm = false }) {
  const { isArabic } = useUi();
  const [choice, setChoice] = useState(emptyChoice);
  const [quantity, setQuantity] = useState(1);
  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const labels = isArabic
    ? { brand: 'الماركة', model: 'الموديل', processor: 'المعالج', ram: 'الرام', storage: 'التخزين' }
    : { brand: 'Brand', model: 'Model', processor: 'Processor', ram: 'RAM', storage: 'Storage' };

  const optionsFor = index => {
    const previous = fields.slice(0, index);
    const matching = products.filter(item => previous.every(key => !choice[key] || item[key] === choice[key]));
    return [...new Set(matching.map(item => item[fields[index]]).filter(Boolean))].sort();
  };
  const selected = useMemo(() => products.find(item => fields.every(key => item[key] === choice[key])), [products, choice]);
  const updateChoice = (index, value) => {
    const next = { ...choice, [fields[index]]: value };
    fields.slice(index + 1).forEach(key => { next[key] = ''; });
    setChoice(next); setMessage(''); setError('');
  };
  const addItem = () => {
    if (!selected) return;
    if (items.some(item => item.laptopId === selected.id && item.laptopId !== editingId)) { setError(isArabic ? 'الجهاز مضاف بالفعل في بند آخر.' : 'This device is already added in another item.'); return; }
    if (editingId) {
      setItems(current => current.map(item => item.laptopId === editingId ? { ...item, laptopId: selected.id, product: selected, quantity: Number(quantity) } : item));
    } else {
      setItems(current => [...current, { laptopId: selected.id, product: selected, quantity: Number(quantity) }]);
    }
    setChoice(emptyChoice); setQuantity(1); setEditingId(''); setError(''); setMessage('');
  };
  const editItem = item => {
    setChoice(fields.reduce((values, key) => ({ ...values, [key]: item.product[key] }), { ...emptyChoice }));
    setQuantity(item.quantity); setEditingId(item.laptopId); setError(''); setMessage('');
  };
  const cancelEdit = () => { setChoice(emptyChoice); setQuantity(1); setEditingId(''); setError(''); };
  const submit = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const customer = customers.find(item => item.id === customerId);
      const created = await orderApi.create({ customerId, customerName: customer?.name, invoiceDate, notes: notes.trim(), items: items.map(item => ({ laptopId: item.laptopId, quantity: item.quantity })) });
      if (autoConfirm) await orderApi.confirm(created.id);
      setMessage(autoConfirm ? (isArabic ? 'تم إنشاء وتأكيد الفاتورة' : 'Invoice created and confirmed') : (isArabic ? 'تم إرسال الفاتورة للمدير' : 'Invoice sent to manager'));
      setChoice(emptyChoice); setQuantity(1); setItems([]); setEditingId(''); setCustomerId(''); setInvoiceDate(today()); setNotes('');
      setTimeout(() => onCreated?.(), 700);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  return <section className="content p-4 md:p-6">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShoppingBag/>
      </div>
      <div>
        <span className="text-xs font-semibold tracking-wider text-primary">FALCON INVOICE</span>
        <h2 className="text-xl font-bold">{isArabic ? 'إنشاء فاتورة جديدة' : 'Create a new invoice'}</h2>
        <p className="text-sm text-base-content/60">{autoConfirm ? (isArabic ? 'أضف بنود الفاتورة وسيتم اعتمادها مباشرة.' : 'Add invoice items and confirm it directly.') : (isArabic ? 'أضف بنود الفاتورة وأرسلها للمدير للمراجعة.' : 'Add invoice items and send it to the manager for review.')}</p>
      </div>
    </div>

    <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-3">
              <span className="badge badge-primary badge-lg font-bold">1</span>
              <div>
                <h3 className="font-bold">{isArabic ? 'بيانات الفاتورة' : 'Invoice details'}</h3>
                <p className="text-sm text-base-content/60">{isArabic ? 'اسم العميل وتاريخ الفاتورة' : 'Customer name and invoice date'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="form-control">
                <span className="label-text mb-1">{isArabic ? 'العميل' : 'Customer'}</span>
                <select required className="select w-full" value={customerId} onChange={event => setCustomerId(event.target.value)}>
                  <option value="">{customersLoading ? (isArabic ? 'جاري تحميل العملاء...' : 'Loading customers...') : (isArabic ? 'اختر العميل' : 'Choose customer')}</option>
                  {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` - ${customer.phone}` : ''}</option>)}
                </select>
              </label>
              <DatePicker label={isArabic ? 'تاريخ الفاتورة' : 'Invoice date'} value={invoiceDate} onChange={setInvoiceDate}/>
            </div>

            {customersError && <div className="alert alert-error mt-4">{customersError}</div>}

            <label className="form-control mt-4">
              <span className="label-text mb-1">{isArabic ? 'ملحوظة' : 'Notes'}</span>
              <textarea maxLength="1000" className="textarea w-full" value={notes} onChange={event => setNotes(event.target.value)} placeholder={isArabic ? 'اكتب أي ملحوظة على الفاتورة (اختياري)' : 'Add an optional invoice note'}/>
            </label>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="badge badge-primary badge-lg font-bold">2</span>
                <div>
                  <h3 className="font-bold">{isArabic ? 'اختيار الجهاز' : 'Choose a device'}</h3>
                  <p className="text-sm text-base-content/60">{isArabic ? 'حدد مواصفات الجهاز والكمية ثم أضفه كبند' : 'Pick the device specs and quantity, then add it as an item'}</p>
                </div>
              </div>
              {editingId && <span className="badge badge-warning gap-1"><Pencil size={12}/>{isArabic ? 'تعديل بند' : 'Editing item'}</span>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((key, index) => <DropdownFilter key={key} label={labels[key]} value={choice[key]} options={optionsFor(index)} disabled={index > 0 && !choice[fields[index - 1]]} placeholder={isArabic ? `اختر ${labels[key]}` : `Choose ${labels[key]}`} onChange={value => updateChoice(index, value)}/>)}
              <label className="form-control">
                <span className="label-text mb-1">{isArabic ? 'الكمية' : 'Quantity'}</span>
                <input required type="number" min="1" max={selected?.quantity || 1} className="input w-full" value={quantity} onChange={event => setQuantity(event.target.value)}/>
                {selected && <small className="mt-1 text-base-content/60">{isArabic ? `المتاح: ${selected.quantity}` : `Available: ${selected.quantity}`}</small>}
              </label>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {editingId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}><X size={16}/>{isArabic ? 'إلغاء' : 'Cancel'}</button>}
              <button type="button" className="btn btn-primary" disabled={!selected} onClick={addItem}>
                {editingId ? <Check size={16}/> : <Plus size={16}/>}
                {editingId ? (isArabic ? 'حفظ تعديل البند' : 'Save item') : (isArabic ? 'إضافة كبند' : 'Add item')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="card bg-base-200 shadow-sm lg:sticky lg:top-4">
        <div className="card-body">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="card-title text-base">{isArabic ? 'بنود الفاتورة' : 'Invoice items'}</h3>
            <span className="badge badge-primary">{items.length} {isArabic ? 'بند' : 'items'}</span>
          </div>

          <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pe-1">
            {items.length ? items.map((item, index) => <div className="flex items-center gap-3 rounded-box bg-base-100 p-3" key={item.laptopId}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <b className="block truncate">{item.product.brand} {item.product.model}</b>
                <small className="text-base-content/60">{item.product.processor} • {item.product.ram} • {item.product.storage}</small>
              </div>
              <strong className="whitespace-nowrap text-sm">{isArabic ? 'الكمية' : 'Qty'}: {item.quantity}</strong>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={isArabic ? 'تعديل البند' : 'Edit item'} title={isArabic ? 'تعديل البند' : 'Edit item'} onClick={() => editItem(item)}><Pencil size={16}/></button>
                <button type="button" className="btn btn-ghost btn-sm btn-square text-error" aria-label={isArabic ? 'حذف البند' : 'Delete item'} title={isArabic ? 'حذف البند' : 'Delete item'} onClick={() => { if (editingId === item.laptopId) cancelEdit(); setItems(current => current.filter(entry => entry.laptopId !== item.laptopId)); }}><Trash2 size={16}/></button>
              </div>
            </div>) : <div className="flex flex-col items-center justify-center gap-2 py-10 text-base-content/50">
              <ShoppingBag size={28}/>
              <p className="text-sm">{isArabic ? 'لم تتم إضافة أي بند بعد' : 'No items added yet'}</p>
            </div>}
          </div>

          {!!items.length && <div className="mt-3 flex items-center justify-between border-t border-base-300 pt-3">
            <span className="text-sm text-base-content/60">{isArabic ? 'إجمالي الأوردر' : 'Order total'}</span>
            <strong>{totalQuantity} <small className="font-normal text-base-content/60">{isArabic ? 'جهاز' : 'units'}</small></strong>
          </div>}

          {error && <div className="alert alert-error mt-3">{error}</div>}
          {message && <div className="alert alert-success mt-3"><CheckCircle2 size={18}/>{message}</div>}

          <div className="mt-4 flex flex-col gap-2">
            <button className="btn btn-primary" disabled={!items.length || !customerId || !invoiceDate || saving}>
              {saving && <span className="loading loading-spinner loading-sm"/>}
              {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : autoConfirm ? (isArabic ? `إنشاء الفاتورة (${items.length})` : `Create invoice (${items.length})`) : (isArabic ? `إرسال للمدير (${items.length})` : `Send to manager (${items.length})`)}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setChoice(emptyChoice); setQuantity(1); setItems([]); setEditingId(''); setCustomerId(''); setInvoiceDate(today()); setNotes(''); }}>{isArabic ? 'مسح الكل' : 'Clear all'}</button>
          </div>
        </div>
      </aside>
    </form>
  </section>;
}
