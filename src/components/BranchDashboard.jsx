import { Boxes, Building2, PackageCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { branchApi } from '../services/api';

export default function BranchDashboard({ selectBranch }) {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { branchApi.list().then(setBranches).catch(requestError => setError(requestError.message)); }, []);
  return <section className="content branches-page">
    <div className="branches-heading"><span><Building2/></span><div><small>VOLTIO BRANCHES</small><h2>اختر الفرع</h2><p>ادخل إلى لوحة أي فرع لمتابعة المخزون والعملاء والفواتير.</p></div></div>
    {error && <div className="status-message error">{error}</div>}
    <div className="branch-cards">{branches.map(branch => <button key={branch.id} className="branch-card" onClick={() => selectBranch(branch)}>
      <span className="branch-card-icon"><Building2/></span><div className="branch-card-title"><h3>{branch.name}</h3><small>فتح لوحة الفرع</small></div>
      <div className="branch-stats"><span><Boxes/> <b>{branch.stats.units}</b><small>قطعة</small></span><span><Users/> <b>{branch.stats.customers}</b><small>عميل</small></span><span><PackageCheck/> <b>{branch.stats.orders}</b><small>فاتورة</small></span></div>
    </button>)}</div>
  </section>;
}
