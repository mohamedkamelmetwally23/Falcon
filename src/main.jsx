import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import Products from './components/Products';
import ProductModal from './components/ProductModal';
import Orders from './components/Orders';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import CreateOrder from './components/CreateOrder';
import Returns from './components/Returns';
import { emptyForm } from './data/laptops';
import { parseLaptopSheet } from './utils/excelParser';
import { laptopApi } from './services/laptopApi';
import { orderApi } from './services/api';
import { customerApi } from './services/api';
import Customers from './components/Customers';
import BranchDashboard from './components/BranchDashboard';
import { UiProvider } from './UiContext';
import './styles.css';

const initialFilters = { search: '', model: '', processor: '', ram: '', storage: '', listName: '', priceRange: '' };
const unique = (items, key) => [...new Set(items.map(item => item[key]).filter(Boolean))].sort();
const priceRanges = {
  'من 5 إلى 10 آلاف': [5000, 10000],
  'من 10 إلى 15 ألف': [10000, 15000],
  'من 15 إلى 20 ألف': [15000, 20000],
  'من 20 إلى 25 ألف': [20000, 25000],
  '25 ألف فأكثر': [25000, Infinity],
};

function matchesFilters(item, filters, excludedFilter = '') {
  const allText = Object.values(item).join(' ').toLowerCase();
  const selectedRange = priceRanges[filters.priceRange];
  return (!filters.search || excludedFilter === 'search' || allText.includes(filters.search.toLowerCase()))
    && (!filters.model || excludedFilter === 'model' || item.model === filters.model)
    && (!filters.processor || excludedFilter === 'processor' || item.processor === filters.processor)
    && (!filters.ram || excludedFilter === 'ram' || item.ram === filters.ram)
    && (!filters.storage || excludedFilter === 'storage' || item.storage === filters.storage)
    && (!filters.listName || excludedFilter === 'listName' || item.listName === filters.listName)
    && (!selectedRange || excludedFilter === 'priceRange' || (item.price >= selectedRange[0] && item.price < selectedRange[1]));
}

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('voltio-user')); } catch { return null; } });
  const [selectedBranch, setSelectedBranch] = useState(() => { try { return JSON.parse(localStorage.getItem('voltio-branch')); } catch { return null; } });
  const [page, setPageState] = useState(() => location.hash.slice(1) || 'inventory');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const inputRef = useRef();

  useEffect(() => {
    if (!user || !selectedBranch || !['inventory', 'create-order'].includes(page)) { setLoading(false); return; }
    laptopApi.list()
      .then(setItems)
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [user, page, selectedBranch?.id]);
  useEffect(() => {
    if (!user || (page !== 'customers' && page !== 'create-order')) return;
    setCustomersLoading(true); setCustomersError('');
    customerApi.list().then(setCustomers).catch(e => setCustomersError(e.message)).finally(() => setCustomersLoading(false));
  }, [user, page, selectedBranch?.id]);
  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(user.role) || page !== 'orders' || !selectedBranch) return;
    setOrdersLoading(true); setOrdersError('');
    orderApi.list().then(setOrders).catch(e => setOrdersError(e.message)).finally(() => setOrdersLoading(false));
  }, [user, page, selectedBranch?.id]);
  const setPage = next => { setPageState(next); location.hash = next; };
  const onAuth = result => {
    localStorage.setItem('voltio-token', result.token); localStorage.setItem('voltio-user', JSON.stringify(result.user)); setUser(result.user);
    if (result.user.role === 'super_admin') { localStorage.removeItem('voltio-branch-id'); localStorage.removeItem('voltio-branch'); setSelectedBranch(null); setPage('branches'); }
    else { localStorage.setItem('voltio-branch-id', result.user.branch.id); localStorage.setItem('voltio-branch', JSON.stringify(result.user.branch)); setSelectedBranch(result.user.branch); setPage(result.user.role === 'admin' ? 'inventory' : 'create-order'); }
  };
  const logout = () => { localStorage.removeItem('voltio-token'); localStorage.removeItem('voltio-user'); localStorage.removeItem('voltio-branch-id'); localStorage.removeItem('voltio-branch'); setUser(null); setSelectedBranch(null); setItems([]); setOrders([]); location.hash = ''; };
  const selectBranch = branch => { localStorage.setItem('voltio-branch-id', branch.id); localStorage.setItem('voltio-branch', JSON.stringify(branch)); setSelectedBranch(branch); setItems([]); setOrders([]); setCustomers([]); setPage('inventory'); };
  const leaveBranch = () => { localStorage.removeItem('voltio-branch-id'); localStorage.removeItem('voltio-branch'); setSelectedBranch(null); setItems([]); setOrders([]); setCustomers([]); setPage('branches'); };
  const availableItems = useMemo(() => items.filter(item => Number(item.quantity) > 0), [items]);
  const filterOptions = useMemo(() => {
    const availableFor = key => availableItems.filter(item => matchesFilters(item, filters, key));
    const priceItems = availableFor('priceRange');
    return {
      models: unique(availableFor('model'), 'model'),
      processors: unique(availableFor('processor'), 'processor'),
      rams: unique(availableFor('ram'), 'ram'),
      storages: unique(availableFor('storage'), 'storage'),
      listNames: unique(availableFor('listName'), 'listName'),
      priceRanges: Object.entries(priceRanges)
        .filter(([, [min, max]]) => priceItems.some(item => item.price >= min && item.price < max))
        .map(([label]) => label),
    };
  }, [availableItems, filters]);
  const filtered = useMemo(() => availableItems.filter(item => matchesFilters(item, filters)), [availableItems, filters]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = item => { setEditing(item.id); setForm(item); setModal(true); };
  const submit = async e => {
    e.preventDefault();
    const clean = { ...form, cost: Number(form.cost), price: Number(form.price), quantity: Number(form.quantity) };
    try {
      setError('');
      const saved = editing ? await laptopApi.update(editing, clean) : await laptopApi.create(clean);
      setItems(current => editing ? current.map(item => item.id === editing ? saved : item) : [saved, ...current]);
      setModal(false);
    } catch (requestError) { setError(requestError.message); }
  };
  const remove = async id => {
    try {
      setError('');
      await laptopApi.remove(id);
      setItems(current => current.filter(item => item.id !== id));
      return true;
    } catch (requestError) { setError(requestError.message); return false; }
  };
  const duplicate = async source => {
    try {
      setError('');
      const { id, _id, createdAt, updatedAt, ...copy } = source;
      const saved = await laptopApi.create(copy);
      setItems(current => {
        const sourceIndex = current.findIndex(item => item.id === source.id);
        if (sourceIndex < 0) return [saved, ...current];
        const next = [...current];
        next.splice(sourceIndex + 1, 0, saved);
        return next;
      });
      return saved;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    }
  };
  const importFile = async e => {
    const file = e.target.files[0]; if (!file) return;
    const wb = XLSX.read(await file.arrayBuffer());
    const mapped = parseLaptopSheet(wb.Sheets[wb.SheetNames[0]], XLSX);
    if (mapped.length) {
      try {
        setError('');
        setLoading(true);
        const inserted = await laptopApi.import(mapped);
        setItems(current => [...inserted, ...current]);
      } catch (requestError) { setError(requestError.message); }
      finally { setLoading(false); }
    }
    e.target.value = '';
  };
  const exportData = () => {
    const sheet = XLSX.utils.json_to_sheet(items.map(({id, ...x}) => x));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Laptops');
    XLSX.writeFile(book, 'laptops-stock.xlsx');
  };

  if (!user) return <AuthPage onAuth={onAuth}/>;
  const isManager = ['admin', 'super_admin'].includes(user.role);
  const managerInvoiceBranches = ['cairo', 'omar-abou-samra'];
  const managerCanCreateOrder = isManager && managerInvoiceBranches.includes(selectedBranch?.code);
  const safePage = user.role === 'super_admin' && !selectedBranch
    ? 'branches'
    : isManager ? ([...['inventory', 'returns', 'customers'], ...(managerCanCreateOrder ? ['create-order'] : ['orders'])].includes(page) ? page : 'inventory') : 'create-order';
  return <div className="app-shell">
    <Sidebar page={safePage} setPage={setPage} user={user} logout={logout} selectedBranch={selectedBranch} leaveBranch={leaveBranch} managerCanCreateOrder={managerCanCreateOrder}/>
    <main className="single-page">
      <Header openAdd={openAdd} page={safePage} user={user} selectedBranch={selectedBranch}/>
      {safePage === 'branches' && <BranchDashboard selectBranch={selectBranch}/>} 
      {safePage === 'inventory' && <Products items={filtered} inventoryItems={availableItems} allCount={availableItems.length} loading={loading} error={error} filters={filters} setFilters={setFilters} filterOptions={filterOptions} resetFilters={() => setFilters(initialFilters)} openEdit={openEdit} duplicate={duplicate} remove={remove} importFile={importFile} exportData={exportData} inputRef={inputRef}/>} 
      {safePage === 'create-order' && <CreateOrder products={availableItems} customers={customers} customersLoading={customersLoading} customersError={customersError} autoConfirm={managerCanCreateOrder} onCreated={managerCanCreateOrder ? () => setPage('inventory') : undefined}/>} 
      {safePage === 'orders' && <Orders orders={orders} setOrders={setOrders} isAdmin={isManager} loading={ordersLoading} error={ordersError}/>} 
      {safePage === 'customers' && <Customers customers={customers} setCustomers={setCustomers} loading={customersLoading} error={customersError}/>} 
      {safePage === 'returns' && <Returns/>}
    </main>
    {modal && <ProductModal
      form={form}
      setForm={setForm}
      editing={editing}
      items={items}
      close={() => setModal(false)}
      submit={submit}
      onDelete={async () => { if (await remove(editing)) setModal(false); }}
    />}
  </div>;
}

createRoot(document.getElementById('root')).render(<UiProvider><App/></UiProvider>);
