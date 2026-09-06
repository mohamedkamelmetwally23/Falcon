import { Phone, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Leads({ leads, setLeads, loading, error }) {
  return (
    <section className="content p-4 md:p-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold tracking-wider text-primary">FALCON COMMUNITY</span>
              <h2 className="card-title mt-1">المهتمين الجدد</h2>
              <p className="text-sm text-base-content/60">الأشخاص الذين أنشأوا حسابًا من صفحة المنتجات.</p>
            </div>
            <strong className="badge badge-primary badge-lg gap-1">
              {leads.length} <small className="font-normal">مسجل</small>
            </strong>
          </div>

          {error && <div className="alert alert-error mt-4">{error}</div>}

          {loading ? (
            <div className="alert mt-4">جاري تحميل البيانات...</div>
          ) : (
            <div className="mt-4 flex flex-col divide-y divide-base-200">
              {leads.map(lead => (
                <div className="flex items-center gap-3 py-3" key={lead._id || lead.id}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate">{lead.name}</b>
                    <small className="text-base-content/60">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</small>
                  </div>
                  <a href={`tel:${lead.phone}`} className="btn btn-ghost btn-sm gap-2">
                    <Phone size={16} />
                    {lead.phone || 'لا يوجد رقم'}
                  </a>
                </div>
              ))}

              {!leads.length && (
                <div className="flex flex-col items-center gap-2 py-12 text-center text-base-content/60">
                  <UserRound size={35} />
                  <b className="text-base-content">لا يوجد مسجلون حتى الآن</b>
                  <span className="text-sm">سيظهر هنا كل شخص ينشئ حسابًا من صفحة المنتجات.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
