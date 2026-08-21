import { Check, CreditCard, Pencil, Plus, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { customerApi } from '../services/api';
import { useUi } from '../UiContext';

const empty = { name: '', phone: '', address: '', notes: '' };

export default function Customers({ customers, setCustomers, loading, error }) {
  const { isArabic, language } = useUi();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState('');
  const [paymentFor, setPaymentFor] = useState('');
  const [historyFor, setHistoryFor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState({ amount: '', note: '' });
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const visible = useMemo(() => customers.filter(customer => customer.name.toLowerCase().includes(search.trim().toLowerCase())), [customers, search]);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const openAdd = () => { setEditingId(''); setForm(empty); setFormError(''); setShowForm(true); };
  const openEdit = customer => { setEditingId(customer.id); setForm({ name: customer.name, phone: customer.phone, address: customer.address, notes: customer.notes }); setFormError(''); setShowForm(true); };
  const save = async event => {
    event.preventDefault(); setSaving(true); setFormError(''); setMessage('');
    try {
      const saved = editingId ? await customerApi.update(editingId, form) : await customerApi.create(form);
      setCustomers(current => editingId ? current.map(item => item.id === editingId ? saved : item) : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(empty); setEditingId(''); setShowForm(false); setMessage(isArabic ? 'تم حفظ بيانات العميل' : 'Customer saved');
    } catch (requestError) { setFormError(requestError.message); } finally { setSaving(false); }
  };
  const addPayment = async event => {
    event.preventDefault(); setSaving(true); setFormError('');
    try { const saved = await customerApi.addPayment(paymentFor, payment); setCustomers(current => current.map(item => item.id === paymentFor ? saved : item)); setHistoryFor(saved); setPaymentFor(''); setPayment({ amount: '', note: '' }); setMessage(isArabic ? 'تم تسجيل الدفعة' : 'Payment recorded'); }
    catch (requestError) { setFormError(requestError.message); } finally { setSaving(false); }
  };
  const money = value => `${Number(value || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} ${isArabic ? 'ج.م' : 'EGP'}`;
  const date = value => new Date(value).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  return <section className="content customers-page">
    <div className="hero-row"><div className="hero-copy"><span>{isArabic ? 'إدارة العملاء' : 'CUSTOMERS'}</span><h2>{isArabic ? 'العملاء والحسابات' : 'Customers & accounts'}</h2><p>{isArabic ? 'أضف العملاء وتابع الفواتير والمدفوعات والمتبقي.' : 'Manage customers, invoices, payments and balances.'}</p></div><div className="hero-mark">C<span>USTOMERS</span></div></div>
    <div className="customer-list workspace">
      <div className="customer-list-head"><div><span className="eyebrow">VOLTIO CUSTOMERS</span><h3>{isArabic ? 'سجل العملاء' : 'Customer register'}</h3></div><div className="customer-toolbar"><b>{customers.length}</b><button className="primary add-customer-button" onClick={openAdd}><Plus size={16}/>{isArabic ? 'إضافة عميل' : 'Add customer'}</button></div></div>
      <div className="customer-search"><Search size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? 'ابحث باسم العميل...' : 'Search by customer name...'}/></div>
      {(error || formError) && <div className="status-message error">{error || formError}</div>}{message && <div className="status-message success">{message}</div>}
      {loading ? <div className="status-message loading">{isArabic ? 'جاري التحميل...' : 'Loading...'}</div> : <div className="customer-records">{visible.map(customer => <article className="customer-record" key={customer.id}><div className="customer-record-main"><span className="customer-avatar">{customer.name.slice(0, 1)}</span><div><button type="button" className="customer-name-button" onClick={() => setHistoryFor(customer)}>{customer.name}</button><small>{customer.phone || (isArabic ? 'بدون هاتف' : 'No phone')}</small></div></div><div className="customer-money"><span><small>{isArabic ? 'الإجمالي' : 'Invoiced'}</small><b>{money(customer.totalInvoiced)}</b></span><span><small>{isArabic ? 'المدفوع' : 'Paid'}</small><b className="paid-money">{money(customer.totalPaid)}</b></span><span><small>{isArabic ? 'المتبقي' : 'Balance'}</small><b className={customer.balance > 0 ? 'due-money' : 'paid-money'}>{money(customer.balance)}</b></span></div><div className="customer-record-actions"><button type="button" className="customer-edit" onClick={() => openEdit(customer)} title={isArabic ? 'تعديل' : 'Edit'}><Pencil size={15}/></button><button type="button" className="customer-payment" onClick={() => { setPaymentFor(customer.id); setPayment({ amount: '', note: '' }); }}><CreditCard size={15}/>{isArabic ? 'دفعة' : 'Payment'}</button></div>{paymentFor === customer.id && <form className="payment-form" onSubmit={addPayment}><input required type="number" min="0.01" step="0.01" value={payment.amount} onChange={event => setPayment(current => ({ ...current, amount: event.target.value }))} placeholder={isArabic ? 'قيمة الدفعة' : 'Payment amount'}/><input value={payment.note} onChange={event => setPayment(current => ({ ...current, note: event.target.value }))} placeholder={isArabic ? 'ملاحظة' : 'Note'}/><button className="primary" disabled={saving}><Check size={14}/>{isArabic ? 'تسجيل' : 'Save'}</button></form>}</article>)}</div>}
    </div>
    {showForm && <div className="customer-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setShowForm(false)}><form className="customer-modal" onSubmit={save}><div className="customer-modal-head"><div><span className="eyebrow">VOLTIO CUSTOMERS</span><h3>{editingId ? (isArabic ? 'تعديل عميل' : 'Edit customer') : (isArabic ? 'إضافة عميل جديد' : 'Add new customer')}</h3></div><button type="button" className="modal-close" onClick={() => setShowForm(false)}><X size={18}/></button></div><label><span>{isArabic ? 'اسم العميل' : 'Customer name'}</span><input required name="name" value={form.name} onChange={update} placeholder={isArabic ? 'اكتب اسم العميل' : 'Customer name'}/></label><label><span>{isArabic ? 'رقم الهاتف' : 'Phone'}</span><input name="phone" value={form.phone} onChange={update} placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}/></label><label><span>{isArabic ? 'العنوان' : 'Address'}</span><input name="address" value={form.address} onChange={update} placeholder={isArabic ? 'عنوان العميل' : 'Address'}/></label><label><span>{isArabic ? 'ملاحظات' : 'Notes'}</span><textarea name="notes" value={form.notes} onChange={update} placeholder={isArabic ? 'ملاحظات اختيارية' : 'Optional notes'}/></label><div className="customer-form-actions"><button className="primary" disabled={saving}><Check size={16}/>{editingId ? (isArabic ? 'حفظ التعديل' : 'Save changes') : (isArabic ? 'إضافة العميل' : 'Add customer')}</button><button type="button" className="secondary" onClick={() => setShowForm(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</button></div></form></div>}
    {historyFor && <div className="customer-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setHistoryFor(null)}><div className="customer-history-modal"><div className="customer-modal-head"><div><span className="eyebrow">PAYMENT HISTORY</span><h3>{historyFor.name}</h3><p>{isArabic ? 'سجل كل الدفعات بالتاريخ' : 'All payments by date'}</p></div><button type="button" className="modal-close" onClick={() => setHistoryFor(null)}><X size={18}/></button></div><div className="history-summary"><span><small>{isArabic ? 'إجمالي المدفوع' : 'Total paid'}</small><b>{money(historyFor.totalPaid)}</b></span><span><small>{isArabic ? 'المتبقي' : 'Balance'}</small><b className="due-money">{money(historyFor.balance)}</b></span></div><div className="payment-history">{historyFor.payments?.length ? [...historyFor.payments].reverse().map(payment => <div className="payment-history-row" key={payment._id}><span><b>{date(payment.createdAt)}</b><small>{payment.note || (isArabic ? 'دفعة مالية' : 'Payment')}</small></span><strong>{money(payment.amount)}</strong></div>) : <div className="empty-history"><CreditCard/><p>{isArabic ? 'لا توجد دفعات مسجلة' : 'No payments recorded'}</p></div>}</div></div></div>}
  </section>;
}
