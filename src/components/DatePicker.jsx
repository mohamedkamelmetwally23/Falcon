import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUi } from '../UiContext';

const fromIso = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); };
const toIso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function DatePicker({ label, value, onChange }) {
  const { isArabic, language } = useUi();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => fromIso(value));
  const rootRef = useRef(null);
  const selected = fromIso(value);
  const weekdays = isArabic ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  useEffect(() => { const close = event => !rootRef.current?.contains(event.target) && setOpen(false); document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
  }, [view]);
  const moveMonth = amount => setView(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const choose = date => { onChange(toIso(date)); setView(date); setOpen(false); };
  const PrevIcon = isArabic ? ChevronRight : ChevronLeft;
  const NextIcon = isArabic ? ChevronLeft : ChevronRight;
  return <div className="relative form-control" ref={rootRef}>
    <span className="label-text mb-1">{label}</span>
    <button type="button" className="btn btn-outline justify-between w-full font-normal" onClick={() => setOpen(current => !current)}>
      <span>{selected.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      <CalendarDays size={18}/>
    </button>
    {open && <div className="card bg-base-100 shadow-xl border border-base-300 absolute top-full mt-2 start-0 z-20 w-72 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={() => moveMonth(-1)}><PrevIcon size={16}/></button>
        <b className="text-sm">{view.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}</b>
        <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={() => moveMonth(1)}><NextIcon size={16}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map(day => <span key={day} className="text-center text-xs font-medium text-base-content/50 py-1">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          const outside = date.getMonth() !== view.getMonth();
          const active = toIso(date) === value;
          const isToday = toIso(date) === toIso(new Date());
          const classes = ['btn', 'btn-sm', 'btn-square', 'font-normal'];
          if (active) classes.push('btn-primary');
          else if (isToday) classes.push('btn-outline', 'btn-primary');
          else classes.push('btn-ghost');
          if (outside && !active) classes.push('text-base-content/30');
          return <button type="button" key={toIso(date)} className={classes.join(' ')} onClick={() => choose(date)}>{date.getDate()}</button>;
        })}
      </div>
      <button type="button" className="btn btn-ghost btn-sm w-full mt-2" onClick={() => choose(new Date())}>{isArabic ? 'اليوم' : 'Today'}</button>
    </div>}
  </div>;
}
