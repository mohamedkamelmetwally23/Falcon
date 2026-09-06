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

  return (
    <section className="content mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wide text-primary">{isArabic ? 'إدارة العملاء' : 'CUSTOMERS'}</span>
        <h2 className="text-2xl font-bold text-base-content">{isArabic ? 'العملاء والحسابات' : 'Customers & accounts'}</h2>
        <p className="text-sm text-base-content/60">{isArabic ? 'أضف العملاء وتابع الفواتير والمدفوعات والمتبقي.' : 'Manage customers, invoices, payments and balances.'}</p>
      </div>

      <div className="card bg-base-200">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold tracking-wide text-primary">FALCON</span>
              <h3 className="text-lg font-bold text-base-content">{isArabic ? 'سجل العملاء' : 'Customer register'}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-base-content/70"><b className="text-base-content">{customers.length}</b> {isArabic ? 'عميل' : 'customers'}</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
                <Plus size={16} />
                {isArabic ? 'إضافة عميل' : 'Add customer'}
              </button>
            </div>
          </div>

          <label className="input flex w-full items-center gap-2 sm:max-w-sm">
            <Search size={17} className="text-base-content/50" />
            <input
              className="grow"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={isArabic ? 'ابحث باسم العميل...' : 'Search by customer name...'}
            />
          </label>

          {(error || formError) && <div className="alert alert-error text-sm">{error || formError}</div>}
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {loading && <div className="alert alert-info text-sm">{isArabic ? 'جاري التحميل...' : 'Loading...'}</div>}

          {!loading && (
            <div className="flex flex-col gap-3">
              {visible.map(customer => (
                <div key={customer.id} className="card bg-base-100 shadow-sm">
                  <div className="card-body gap-3 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-11 rounded-full bg-primary/20 text-primary">
                            <span className="text-base font-bold">{customer.name.slice(0, 1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start">
                          <button
                            type="button"
                            className="link link-hover text-start text-base font-semibold text-base-content"
                            onClick={() => setHistoryFor(customer)}
                          >
                            {customer.name}
                          </button>
                          <small className="text-base-content/60">{customer.phone || (isArabic ? 'بدون هاتف' : 'No phone')}</small>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex flex-col">
                          <small className="text-xs text-base-content/50">{isArabic ? 'الإجمالي' : 'Invoiced'}</small>
                          <b className="text-sm text-base-content">{money(customer.totalInvoiced)}</b>
                        </div>
                        <div className="flex flex-col">
                          <small className="text-xs text-base-content/50">{isArabic ? 'المدفوع' : 'Paid'}</small>
                          <b className="text-sm text-success">{money(customer.totalPaid)}</b>
                        </div>
                        <div className="flex flex-col">
                          <small className="text-xs text-base-content/50">{isArabic ? 'المتبقي' : 'Balance'}</small>
                          <b className={`text-sm ${customer.balance > 0 ? 'text-error' : 'text-success'}`}>{money(customer.balance)}</b>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => openEdit(customer)}
                          title={isArabic ? 'تعديل' : 'Edit'}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => { setPaymentFor(paymentFor === customer.id ? '' : customer.id); setPayment({ amount: '', note: '' }); }}
                        >
                          <CreditCard size={15} />
                          {isArabic ? 'دفعة' : 'Payment'}
                        </button>
                      </div>
                    </div>

                    {paymentFor === customer.id && (
                      <form className="flex flex-col gap-2 border-t border-base-300 pt-3 sm:flex-row sm:items-center" onSubmit={addPayment}>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="input input-sm w-full sm:w-40"
                          value={payment.amount}
                          onChange={event => setPayment(current => ({ ...current, amount: event.target.value }))}
                          placeholder={isArabic ? 'قيمة الدفعة' : 'Payment amount'}
                        />
                        <input
                          className="input input-sm w-full sm:flex-1"
                          value={payment.note}
                          onChange={event => setPayment(current => ({ ...current, note: event.target.value }))}
                          placeholder={isArabic ? 'ملاحظة' : 'Note'}
                        />
                        <button className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <span className="loading loading-spinner loading-xs" /> : <Check size={14} />}
                          {isArabic ? 'تسجيل' : 'Save'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}

              {!visible.length && (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-base-content/50">
                  <Users size={32} />
                  <p>{isArabic ? 'لا يوجد عملاء مطابقون' : 'No matching customers'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg sm:w-full">
            <form onSubmit={save} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold tracking-wide text-primary">FALCON</span>
                  <h3 className="text-lg font-bold text-base-content">
                    {editingId ? (isArabic ? 'تعديل عميل' : 'Edit customer') : (isArabic ? 'إضافة عميل جديد' : 'Add new customer')}
                  </h3>
                </div>
                <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={() => setShowForm(false)}>
                  <X size={18} />
                </button>
              </div>

              {formError && <div className="alert alert-error text-sm">{formError}</div>}

              <label className="form-control w-full">
                <span className="label-text mb-1">{isArabic ? 'اسم العميل' : 'Customer name'}</span>
                <input
                  required
                  name="name"
                  className="input w-full"
                  value={form.name}
                  onChange={update}
                  placeholder={isArabic ? 'اكتب اسم العميل' : 'Customer name'}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1">{isArabic ? 'رقم الهاتف' : 'Phone'}</span>
                <input
                  name="phone"
                  className="input w-full"
                  value={form.phone}
                  onChange={update}
                  placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1">{isArabic ? 'العنوان' : 'Address'}</span>
                <input
                  name="address"
                  className="input w-full"
                  value={form.address}
                  onChange={update}
                  placeholder={isArabic ? 'عنوان العميل' : 'Address'}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1">{isArabic ? 'ملاحظات' : 'Notes'}</span>
                <textarea
                  name="notes"
                  className="textarea w-full"
                  value={form.notes}
                  onChange={update}
                  placeholder={isArabic ? 'ملاحظات اختيارية' : 'Optional notes'}
                />
              </label>

              <div className="modal-action mt-2">
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-sm" /> : <Check size={16} />}
                  {editingId ? (isArabic ? 'حفظ التعديل' : 'Save changes') : (isArabic ? 'إضافة العميل' : 'Add customer')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
          <button type="button" className="modal-backdrop" aria-label="close" onClick={() => setShowForm(false)}><span /></button>
        </div>
      )}

      {historyFor && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg sm:w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold tracking-wide text-primary">{isArabic ? 'سجل الدفعات' : 'PAYMENT HISTORY'}</span>
                <h3 className="text-lg font-bold text-base-content">{historyFor.name}</h3>
                <p className="text-sm text-base-content/60">{isArabic ? 'سجل كل الدفعات بالتاريخ' : 'All payments by date'}</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={() => setHistoryFor(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="stat rounded-box bg-base-200 p-3">
                <div className="stat-title text-xs">{isArabic ? 'إجمالي المدفوع' : 'Total paid'}</div>
                <div className="stat-value text-lg text-success">{money(historyFor.totalPaid)}</div>
              </div>
              <div className="stat rounded-box bg-base-200 p-3">
                <div className="stat-title text-xs">{isArabic ? 'المتبقي' : 'Balance'}</div>
                <div className={`stat-value text-lg ${historyFor.balance > 0 ? 'text-error' : 'text-success'}`}>{money(historyFor.balance)}</div>
              </div>
            </div>

            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {historyFor.payments?.length ? (
                [...historyFor.payments].reverse().map(payment => (
                  <div key={payment._id} className="flex items-center justify-between gap-3 rounded-box bg-base-200 px-3 py-2">
                    <div className="flex flex-col">
                      <b className="text-sm text-base-content">{date(payment.createdAt)}</b>
                      <small className="text-base-content/60">{payment.note || (isArabic ? 'دفعة مالية' : 'Payment')}</small>
                    </div>
                    <strong className="text-success">{money(payment.amount)}</strong>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-base-content/50">
                  <CreditCard size={32} />
                  <p>{isArabic ? 'لا توجد دفعات مسجلة' : 'No payments recorded'}</p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setHistoryFor(null)}>
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
          <button type="button" className="modal-backdrop" aria-label="close" onClick={() => setHistoryFor(null)}><span /></button>
        </div>
      )}
    </section>
  );
}
