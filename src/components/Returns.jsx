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

  return <section className="content returns-page"><div className="simple-page-heading"><div className="simple-title-icon"><RotateCcw/></div><div><span>VOLTIO RETURNS</span><h2>تسجيل مرتجع</h2><p>أرجع جهازًا من فاتورة مؤكدة إلى المخزون.</p></div></div><div className="returns-layout"><form className="simple-order-card return-form" onSubmit={submit}><div className="return-fields"><DropdownFilter label="الفاتورة" value={orderLabel} options={orderOptions} placeholder="اختر الفاتورة" onChange={value => { setOrderLabel(value); setItemLabel(''); }}/><DropdownFilter label="البند" value={itemLabel} options={itemOptions} placeholder="اختر الجهاز" disabled={!selectedOrder} onChange={setItemLabel}/><label><span>الكمية المرتجعة</span><input required type="number" min="1" max={availableToReturn || 1} value={quantity} onChange={event => setQuantity(event.target.value)}/>{selectedItem && <small>المتاح للإرجاع: {availableToReturn}</small>}</label><label><span>ملحوظة</span><textarea maxLength="500" value={reason} onChange={event => setReason(event.target.value)} placeholder="سبب أو ملحوظة المرتجع (اختياري)"/></label></div>{error && <div className="status-message error">{error}</div>}{message && <div className="order-success"><CheckCircle2/>{message}</div>}<button className="primary return-submit" disabled={!selectedItem || availableToReturn < 1 || saving}>{saving ? 'جاري الحفظ...' : 'تأكيد المرتجع'}</button></form>
    <div className="return-history"><div className="return-history-head"><div><span>RETURN LOG</span><h3>سجل المرتجعات</h3></div><b>{returns.length}</b></div>{returns.map(entry => <article key={entry.id}><span><RotateCcw/></span><div><b>{entry.product}</b><small>فاتورة #{entry.order?.id?.slice(-6).toUpperCase()} • {entry.order?.customerName}</small>{entry.reason && <p>{entry.reason}</p>}</div><strong>+{entry.quantity}</strong><time>{new Date(entry.createdAt).toLocaleDateString('ar-EG')}</time></article>)}{!returns.length && <div className="returns-empty">لا توجد مرتجعات حتى الآن</div>}</div></div></section>;
}
