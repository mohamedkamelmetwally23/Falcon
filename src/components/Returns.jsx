import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { orderApi, returnApi } from '../services/api';
import { DropdownFilter } from './LaptopFilters';

export default function Returns() {
  const [orders, setOrders] = useState([]); const [returns, setReturns] = useState([]);
  const [orderLabel, setOrderLabel] = useState(''); const [itemLabel, setItemLabel] = useState('');
  const [quantity, setQuantity] = useState(1); const [reason, setReason] = useState('');
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  const load = () => Promise.all([orderApi.list(), returnApi.list()]).then(([allOrders, allReturns]) => { setOrders(allOrders.filter(order => ['confirmed', 'returned'].includes(order.status) && order.items?.length)); setReturns(allReturns); }).catch(requestError => setError(requestError.message));
  useEffect(() => { load(); }, []);
  const orderOptions = useMemo(() => [...new Set(orders.map(order => order.customerName))], [orders]);
  const selectedOrder = orders.find(order => order.customerName === orderLabel);
  const itemOptions = selectedOrder?.items.map(item => `${item.product} — ${item._id.slice(-5)}`) || [];
  const selectedItem = selectedOrder?.items.find(item => `${item.product} — ${item._id.slice(-5)}` === itemLabel);
  const returnedQuantity = selectedItem ? returns.filter(entry => (entry.order?.id || entry.order) === selectedOrder.id && entry.orderItem === selectedItem._id).reduce((sum, entry) => sum + entry.quantity, 0) : 0;
  const availableToReturn = selectedItem ? selectedItem.quantity - returnedQuantity : 0;
  const submit = async event => { event.preventDefault(); setSaving(true); setError(''); setMessage(''); try { const saved = await returnApi.create({ orderId: selectedOrder.id, orderItemId: selectedItem._id, quantity: Number(quantity), reason }); setReturns(current => [saved, ...current]); setOrderLabel(''); setItemLabel(''); setQuantity(1); setReason(''); setMessage('تم تسجيل المرتجع وإضافة الكمية للمخزون'); } catch (requestError) { setError(requestError.message); } finally { setSaving(false); } };

  return (
    <section className="content p-4 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RotateCcw />
        </div>
        <div>
          <span className="text-xs font-semibold tracking-wider text-primary">FALCON RETURNS</span>
          <h2 className="text-xl font-bold">تسجيل مرتجع</h2>
          <p className="text-sm text-base-content/60">أرجع جهازًا من فاتورة مؤكدة إلى المخزون.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form className="card bg-base-100 shadow-sm" onSubmit={submit}>
          <div className="card-body gap-4">
            <label className="form-control">
              <span className="label-text mb-1">الفاتورة</span>
              <DropdownFilter label="الفاتورة" value={orderLabel} options={orderOptions} placeholder="اختر الفاتورة" onChange={value => { setOrderLabel(value); setItemLabel(''); }} />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">البند</span>
              <DropdownFilter label="البند" value={itemLabel} options={itemOptions} placeholder="اختر الجهاز" disabled={!selectedOrder} onChange={setItemLabel} />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">الكمية المرتجعة</span>
              <input required type="number" min="1" max={availableToReturn || 1} value={quantity} onChange={event => setQuantity(event.target.value)} className="input w-full" />
              {selectedItem && <small className="mt-1 text-base-content/60">المتاح للإرجاع: {availableToReturn}</small>}
            </label>
            <label className="form-control">
              <span className="label-text mb-1">ملحوظة</span>
              <textarea maxLength="500" value={reason} onChange={event => setReason(event.target.value)} placeholder="سبب أو ملحوظة المرتجع (اختياري)" className="textarea w-full" />
            </label>

            {error && <div className="alert alert-error">{error}</div>}
            {message && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}

            <button className="btn btn-primary" disabled={!selectedItem || availableToReturn < 1 || saving}>
              {saving && <span className="loading loading-spinner loading-sm" />}
              {saving ? 'جاري الحفظ...' : 'تأكيد المرتجع'}
            </button>
          </div>
        </form>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold tracking-wider text-primary">RETURN LOG</span>
                <h3 className="card-title mt-1">سجل المرتجعات</h3>
              </div>
              <b className="badge badge-primary badge-lg">{returns.length}</b>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {returns.map(entry => (
                <article className="card bg-base-200" key={entry.id}>
                  <div className="card-body flex-row items-center gap-3 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <RotateCcw size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block truncate">{entry.product}</b>
                      <small className="text-base-content/60">
                        فاتورة #{entry.order?.id?.slice(-6).toUpperCase()} • {entry.order?.customerName}
                      </small>
                      {entry.reason && <p className="mt-1 text-sm text-base-content/70">{entry.reason}</p>}
                    </div>
                    <strong className="badge badge-success">+{entry.quantity}</strong>
                    <time className="text-xs text-base-content/60">{new Date(entry.createdAt).toLocaleDateString('ar-EG')}</time>
                  </div>
                </article>
              ))}

              {!returns.length && (
                <div className="py-8 text-center text-sm text-base-content/60">لا توجد مرتجعات حتى الآن</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
