import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUi } from '../UiContext';

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1].filter(page => page > 0 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) result.push(`gap-${page}`);
    result.push(page);
  });
  return result;
}

export default function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const { isArabic } = useUi();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalItems);

  return <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-sm text-base-content/60">{isArabic ? 'عرض' : 'Showing'} <b className="text-base-content">{start}–{end}</b> {isArabic ? 'من' : 'of'} <b className="text-base-content">{totalItems}</b> {isArabic ? 'جهاز' : 'devices'}</div>
    <div className="join">
      <button className="join-item btn btn-sm" disabled={page === 1} onClick={() => onPageChange(page - 1)} title={isArabic ? 'السابق' : 'Previous'}>{isArabic ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
      {pageNumbers(page, totalPages).map(item => typeof item === 'string'
        ? <button key={item} type="button" className="join-item btn btn-sm btn-disabled">•••</button>
        : <button key={item} className={`join-item btn btn-sm ${page === item ? 'btn-active btn-primary' : ''}`} onClick={() => onPageChange(item)}>{item}</button>)}
      <button className="join-item btn btn-sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} title={isArabic ? 'التالي' : 'Next'}>{isArabic ? <ChevronLeft size={17}/> : <ChevronRight size={17}/>}</button>
    </div>
    <label className="flex items-center gap-2 text-sm text-base-content/60">
      {isArabic ? 'صفوف الصفحة' : 'Rows per page'}
      <select className="select select-sm" value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))}>
        <option value="10">10</option><option value="20">20</option><option value="50">50</option>
      </select>
    </label>
  </div>;
}
