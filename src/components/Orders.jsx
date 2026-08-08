import { Check, PackageCheck, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { orderApi } from '../services/api';
import { useUi } from '../UiContext';

const itemsOf = order => order.items?.length ? order.items : [{ product: order.product, quantity: order.quantity }];

export default function Orders({ orders, setOrders, isAdmin, loading, error }) {
  const { isArabic, language } = useUi();
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState('');
  const [workingId, setWorkingId] = useState('');
  const labels = isArabic ? { new: 'في انتظار المدير', confirmed: 'تم التأكيد والخصم', returned: 'تم الإرجاع', rejected: 'مرفوضة', preparing: 'جاري التجهيز', delivered: 'تم التسليم', cancelled: 'ملغية' } : { new: 'Waiting for manager', confirmed: 'Confirmed & deducted', returned: 'Returned', rejected: 'Rejected', preparing: 'Preparing', delivered: 'Delivered', cancelled: 'Cancelled' };
  const visible = useMemo(() => orders.filter(order => `${order.customerName || ''} ${order.notes || ''} ${order.user?.name || ''} ${itemsOf(order).map(item => item.product).join(' ')}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const act = async (order, action) => {
    setWorkingId(order.id); setActionError('');
    try { const saved = await orderApi[action](order.id); setOrders(current => current.map(item => item.id === order.id ? saved : item)); }
    catch (requestError) { setActionError(requestError.message); }
    finally { setWorkingId(''); }
  };

  return <section className="content orders-page">
    <div className="hero-row"><div className="hero-copy"><span>{isAdmin ? (isArabic ? 'إدارة المخزن' : 'WAREHOUSE') : (isArabic ? 'فواتيري' : 'MY INVOICES')}</span><h2>{isAdmin ? (isArabic ? 'راجع الفواتير قبل خصم المخزون' : 'Review invoices before stock deduction') : (isArabic ? 'تابع فواتيرك وحالتها' : 'Track your invoices')}</h2></div><div className="hero-mark">I<span>NVOICES</span></div></div>
    <div className="workspace">
      <div className="workspace-toolbar"><div><span className="eyebrow">VOLTIO INVOICES</span><h2>{isAdmin ? (isArabic ? 'فواتير العاملين' : 'Worker invoices') : (isArabic ? 'فواتيري' : 'My invoices')}</h2><p>{orders.length} {isArabic ? 'فاتورة مسجلة' : 'registered invoices'}</p></div></div>
      <div className="orders-search"><Search/><input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? 'ابحث في الأوردرات...' : 'Search orders...'}/></div>
      {(error || actionError) && <div className="status-message error">{error || actionError}</div>}{loading && <div className="status-message loading">{isArabic ? 'جاري التحميل...' : 'Loading...'}</div>}
      <div className="table-wrap"><table className="orders-table"><thead><tr><th>{isArabic ? 'الأوردر' : 'Order'}</th><th>{isArabic ? 'العميل' : 'Customer'}</th>{isAdmin && <th>{isArabic ? 'المستخدم' : 'User'}</th>}<th>{isArabic ? 'البنود' : 'Items'}</th><th>{isArabic ? 'إجمالي الكمية' : 'Total qty'}</th>{isAdmin && <th>{isArabic ? 'الإجمالي' : 'Total'}</th>}<th>{isArabic ? 'الحالة' : 'Status'}</th></tr></thead>
        <tbody>{visible.map(order => { const lineItems = itemsOf(order); return <tr key={order.id}><td><b>#{order.id.slice(-6).toUpperCase()}</b><small className="order-date">{new Date(order.invoiceDate || order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</small></td><td><b>{order.customerName || '—'}</b>{order.notes && <small className="invoice-note">{order.notes}</small>}</td>{isAdmin && <td><b>{order.user?.name}</b></td>}<td><div className="table-order-items">{lineItems.map((item, index) => <span key={item._id || index}><b>{item.product}</b><small>× {item.quantity}</small></span>)}</div></td><td><b>{lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</b></td>{isAdmin && <td><b className="price-cell">{order.total?.toLocaleString()} {isArabic ? 'ج.م' : 'EGP'}</b></td>}<td>{isAdmin && order.status === 'new' ? <div className="invoice-actions"><button disabled={workingId === order.id} className="confirm-invoice" onClick={() => act(order, 'confirm')}><Check/>{isArabic ? 'تأكيد' : 'Confirm'}</button><button disabled={workingId === order.id} className="reject-invoice" onClick={() => act(order, 'reject')}><X/>{isArabic ? 'رفض' : 'Reject'}</button></div> : <span className={`order-status ${order.status}`}>{labels[order.status] || order.status}</span>}</td></tr>; })}</tbody>
      </table>{!loading && !visible.length && <div className="empty"><PackageCheck/><b>{isArabic ? 'لا توجد أوردرات' : 'No orders yet'}</b></div>}</div>
      <div className="mobile-invoice-list">{visible.map(order => { const lineItems = itemsOf(order); return <article className="mobile-invoice" key={order.id}><header><div><b>#{order.id.slice(-6).toUpperCase()}</b><span>{new Date(order.invoiceDate || order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span></div><span className={`order-status ${order.status}`}>{labels[order.status] || order.status}</span></header><div className="mobile-customer"><small>{isArabic ? 'العميل' : 'Customer'}</small><b>{order.customerName || '—'}</b>{isAdmin && <span>{isArabic ? 'بواسطة' : 'By'}: {order.user?.name}</span>}</div><div className="mobile-lines">{lineItems.map((item, index) => <div key={item._id || index}><span>{item.product}</span><b>× {item.quantity}</b></div>)}</div>{order.notes && <p>{order.notes}</p>}{isAdmin && order.status === 'new' && <div className="mobile-invoice-actions"><button disabled={workingId === order.id} className="confirm-invoice" onClick={() => act(order, 'confirm')}><Check/>{isArabic ? 'تأكيد وخصم' : 'Confirm'}</button><button disabled={workingId === order.id} className="reject-invoice" onClick={() => act(order, 'reject')}><X/>{isArabic ? 'رفض' : 'Reject'}</button></div>}</article>; })}</div>
    </div>
  </section>;
}
