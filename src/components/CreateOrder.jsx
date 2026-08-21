import { Check, CheckCircle2, Pencil, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { orderApi } from '../services/api';
import { useUi } from '../UiContext';
import { DropdownFilter } from './LaptopFilters';
import DatePicker from './DatePicker';

const fields = ['brand', 'model', 'processor', 'ram', 'storage'];
const emptyChoice = { brand: '', model: '', processor: '', ram: '', storage: '' };
const today = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };

export default function CreateOrder({ products, customers = [], customersLoading, customersError, onCreated }) {
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
      await orderApi.create({ customerId, customerName: customer?.name, invoiceDate, notes: notes.trim(), items: items.map(item => ({ laptopId: item.laptopId, quantity: item.quantity })) });
      setMessage(isArabic ? 'تم إرسال الفاتورة للمدير' : 'Invoice sent to manager');
      setChoice(emptyChoice); setQuantity(1); setItems([]); setEditingId(''); setCustomerId(''); setInvoiceDate(today()); setNotes('');
      setTimeout(() => onCreated?.(), 700);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  return <section className="invoice-page">
    <div className="invoice-page-head"><div className="invoice-head-icon"><ShoppingBag/></div><div><span className="invoice-eyebrow">VOLTIO INVOICE</span><h2>{isArabic ? 'إنشاء فاتورة جديدة' : 'Create a new invoice'}</h2><p>{isArabic ? 'أضف بنود الفاتورة وأرسلها للمدير للمراجعة.' : 'Add invoice items and send it to the manager for review.'}</p></div></div>
    <form onSubmit={submit} className="invoice-layout">
      <div className="invoice-main">
        <div className="invoice-card">
          <div className="invoice-card-head"><span className="step-num">1</span><div><h3>{isArabic ? 'بيانات الفاتورة' : 'Invoice details'}</h3><p>{isArabic ? 'اسم العميل وتاريخ الفاتورة' : 'Customer name and invoice date'}</p></div></div>
          <div className="invoice-card-body">
            <div className="order-fields-grid invoice-meta-grid">
              <label><span>{isArabic ? 'العميل' : 'Customer'}</span><select required value={customerId} onChange={event => setCustomerId(event.target.value)}><option value="">{customersLoading ? (isArabic ? 'جاري تحميل العملاء...' : 'Loading customers...') : (isArabic ? 'اختر العميل' : 'Choose customer')}</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` - ${customer.phone}` : ''}</option>)}</select></label>
              <DatePicker label={isArabic ? 'تاريخ الفاتورة' : 'Invoice date'} value={invoiceDate} onChange={setInvoiceDate}/>
            </div>
            {customersError && <div className="status-message error">{customersError}</div>}
            <label className="invoice-notes-field"><span>{isArabic ? 'ملحوظة' : 'Notes'}</span><textarea maxLength="1000" value={notes} onChange={event => setNotes(event.target.value)} placeholder={isArabic ? 'اكتب أي ملحوظة على الفاتورة (اختياري)' : 'Add an optional invoice note'}/></label>
          </div>
        </div>

        <div className="invoice-card">
          <div className="invoice-card-head"><span className="step-num">2</span><div><h3>{isArabic ? 'اختيار الجهاز' : 'Choose a device'}</h3><p>{isArabic ? 'حدد مواصفات الجهاز والكمية ثم أضفه كبند' : 'Pick the device specs and quantity, then add it as an item'}</p></div>{editingId && <span className="editing-badge"><Pencil size={12}/>{isArabic ? 'تعديل بند' : 'Editing item'}</span>}</div>
          <div className="invoice-card-body">
            <div className="order-fields-grid device-picker-grid">
              {fields.map((key, index) => <DropdownFilter key={key} label={labels[key]} value={choice[key]} options={optionsFor(index)} disabled={index > 0 && !choice[fields[index - 1]]} placeholder={isArabic ? `اختر ${labels[key]}` : `Choose ${labels[key]}`} onChange={value => updateChoice(index, value)}/>)}
              <label><span>{isArabic ? 'الكمية' : 'Quantity'}</span><input required type="number" min="1" max={selected?.quantity || 1} value={quantity} onChange={event => setQuantity(event.target.value)}/>{selected && <small>{isArabic ? `المتاح: ${selected.quantity}` : `Available: ${selected.quantity}`}</small>}</label>
            </div>
            <div className="add-line-action">{editingId && <button type="button" className="secondary cancel-line-edit" onClick={cancelEdit}><X/>{isArabic ? 'إلغاء' : 'Cancel'}</button>}<button type="button" className="secondary" disabled={!selected} onClick={addItem}>{editingId ? <Check/> : <Plus/>}{editingId ? (isArabic ? 'حفظ تعديل البند' : 'Save item') : (isArabic ? 'إضافة كبند' : 'Add item')}</button></div>
          </div>
        </div>
      </div>

      <aside className="invoice-cart">
        <div className="invoice-cart-head"><b>{isArabic ? 'بنود الفاتورة' : 'Invoice items'}</b><span>{items.length} {isArabic ? 'بند' : 'items'}</span></div>
        <div className="invoice-cart-items">
          {items.length ? items.map((item, index) => <div className="order-line" key={item.laptopId}><span className="line-number">{index + 1}</span><div><b>{item.product.brand} {item.product.model}</b><small>{item.product.processor} • {item.product.ram} • {item.product.storage}</small></div><strong>{isArabic ? 'الكمية' : 'Qty'}: {item.quantity}</strong><div className="order-line-actions"><button type="button" className="edit-line" aria-label={isArabic ? 'تعديل البند' : 'Edit item'} title={isArabic ? 'تعديل البند' : 'Edit item'} onClick={() => editItem(item)}><Pencil/></button><button type="button" aria-label={isArabic ? 'حذف البند' : 'Delete item'} title={isArabic ? 'حذف البند' : 'Delete item'} onClick={() => { if (editingId === item.laptopId) cancelEdit(); setItems(current => current.filter(entry => entry.laptopId !== item.laptopId)); }}><Trash2/></button></div></div>) : <div className="invoice-cart-empty"><ShoppingBag/><p>{isArabic ? 'لم تتم إضافة أي بند بعد' : 'No items added yet'}</p></div>}
        </div>
        {!!items.length && <div className="invoice-cart-total"><span>{isArabic ? 'إجمالي الأوردر' : 'Order total'}</span><strong>{totalQuantity} <small>{isArabic ? 'جهاز' : 'units'}</small></strong></div>}
        {error && <div className="status-message error">{error}</div>}{message && <div className="order-success"><CheckCircle2/>{message}</div>}
        <div className="invoice-cart-actions">
          <button className="primary" disabled={!items.length || !customerId || !invoiceDate || saving}>{saving ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : (isArabic ? `إرسال للمدير (${items.length})` : `Send to manager (${items.length})`)}</button>
          <button type="button" className="secondary" onClick={() => { setChoice(emptyChoice); setQuantity(1); setItems([]); setEditingId(''); setCustomerId(''); setInvoiceDate(today()); setNotes(''); }}>{isArabic ? 'مسح الكل' : 'Clear all'}</button>
        </div>
      </aside>
    </form>
  </section>;
}
