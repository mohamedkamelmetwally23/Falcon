import { CheckCircle2, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { orderApi } from '../services/api';
import { useUi } from '../UiContext';
import { DropdownFilter } from './LaptopFilters';
import DatePicker from './DatePicker';

const fields = ['brand', 'model', 'processor', 'ram', 'storage'];
const emptyChoice = { brand: '', model: '', processor: '', ram: '', storage: '' };
const today = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };

export default function CreateOrder({ products, onCreated }) {
  const { isArabic } = useUi();
  const [choice, setChoice] = useState(emptyChoice);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
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
    if (items.some(item => item.laptopId === selected.id)) { setError(isArabic ? 'الجهاز مضاف بالفعل؛ احذف البند وأضفه بالكمية الجديدة.' : 'This device is already added.'); return; }
    setItems(current => [...current, { laptopId: selected.id, product: selected, quantity: Number(quantity) }]);
    setChoice(emptyChoice); setQuantity(1); setError(''); setMessage('');
  };
  const submit = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await orderApi.create({ customerName: customerName.trim(), invoiceDate, notes: notes.trim(), items: items.map(item => ({ laptopId: item.laptopId, quantity: item.quantity })) });
      setMessage(isArabic ? 'تم إرسال الفاتورة للمدير' : 'Invoice sent to manager');
      setChoice(emptyChoice); setQuantity(1); setItems([]); setCustomerName(''); setInvoiceDate(today()); setNotes('');
      setTimeout(() => onCreated?.(), 700);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  return <section className="simple-order-page">
    <div className="simple-page-heading"><div className="simple-title-icon"><ShoppingBag/></div><div><span>VOLTIO INVOICE</span><h2>{isArabic ? 'إنشاء فاتورة جديدة' : 'Create a new invoice'}</h2><p>{isArabic ? 'أضف بنود الفاتورة وأرسلها للمدير للمراجعة.' : 'Add invoice items and send it to the manager for review.'}</p></div></div>
    <form onSubmit={submit} className="simple-order-card">
      <div className="order-fields-grid">
        <label className="customer-name-field"><span>{isArabic ? 'اسم العميل' : 'Customer name'}</span><input required type="text" value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder={isArabic ? 'اكتب اسم العميل' : 'Enter customer name'}/></label>
        <DatePicker label={isArabic ? 'تاريخ الفاتورة' : 'Invoice date'} value={invoiceDate} onChange={setInvoiceDate}/>
        {fields.map((key, index) => <DropdownFilter key={key} label={labels[key]} value={choice[key]} options={optionsFor(index)} disabled={index > 0 && !choice[fields[index - 1]]} placeholder={isArabic ? `اختر ${labels[key]}` : `Choose ${labels[key]}`} onChange={value => updateChoice(index, value)}/>)}
        <label><span>{isArabic ? 'الكمية' : 'Quantity'}</span><input required type="number" min="1" max={selected?.quantity || 1} value={quantity} onChange={event => setQuantity(event.target.value)}/>{selected && <small>{isArabic ? `المتاح: ${selected.quantity}` : `Available: ${selected.quantity}`}</small>}</label>
      </div>
      <label className="invoice-notes-field"><span>{isArabic ? 'ملحوظة' : 'Notes'}</span><textarea maxLength="1000" value={notes} onChange={event => setNotes(event.target.value)} placeholder={isArabic ? 'اكتب أي ملحوظة على الفاتورة (اختياري)' : 'Add an optional invoice note'}/></label>
      <div className="add-line-action"><button type="button" className="secondary" disabled={!selected} onClick={addItem}><Plus/>{isArabic ? 'إضافة كبند' : 'Add item'}</button></div>
      {!!items.length && <div className="order-lines"><div className="order-lines-head"><b>{isArabic ? 'بنود الفاتورة' : 'Invoice items'}</b><span>{items.length} {isArabic ? 'بند' : 'items'}</span></div>{items.map((item, index) => <div className="order-line" key={item.laptopId}><span className="line-number">{index + 1}</span><div><b>{item.product.brand} {item.product.model}</b><small>{item.product.processor} • {item.product.ram} • {item.product.storage}</small></div><strong>{isArabic ? 'الكمية' : 'Qty'}: {item.quantity}</strong><button type="button" onClick={() => setItems(current => current.filter(entry => entry.laptopId !== item.laptopId))}><Trash2/></button></div>)}</div>}
      {error && <div className="status-message error">{error}</div>}{message && <div className="order-success"><CheckCircle2/>{message}</div>}
      <div className="simple-form-actions"><button type="button" className="secondary" onClick={() => { setChoice(emptyChoice); setQuantity(1); setItems([]); setCustomerName(''); setInvoiceDate(today()); setNotes(''); }}>{isArabic ? 'مسح الكل' : 'Clear all'}</button><button className="primary" disabled={!items.length || !customerName.trim() || !invoiceDate || saving}>{saving ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : (isArabic ? `إرسال للمدير (${items.length})` : `Send to manager (${items.length})`)}</button></div>
    </form>
  </section>;
}
