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
  return <div className="custom-date-field" ref={rootRef}><span>{label}</span><button type="button" className={open ? 'date-trigger open' : 'date-trigger'} onClick={() => setOpen(current => !current)}><b>{selected.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</b><CalendarDays/></button>
    {open && <div className="calendar-popover"><div className="calendar-head"><button type="button" onClick={() => moveMonth(-1)}><ChevronRight/></button><b>{view.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}</b><button type="button" onClick={() => moveMonth(1)}><ChevronLeft/></button></div><div className="calendar-weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{days.map(date => { const outside = date.getMonth() !== view.getMonth(); const active = toIso(date) === value; const today = toIso(date) === toIso(new Date()); return <button type="button" key={toIso(date)} className={`${outside ? 'outside' : ''} ${active ? 'active' : ''} ${today ? 'today' : ''}`} onClick={() => choose(date)}>{date.getDate()}</button>; })}</div><button type="button" className="calendar-today" onClick={() => choose(new Date())}>{isArabic ? 'اليوم' : 'Today'}</button></div>}
  </div>;
}
