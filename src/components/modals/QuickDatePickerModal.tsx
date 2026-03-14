import { useState, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Moon, Sun, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WEEK_DAYS_SHORT, YEAR_RANGE } from '../../constants/calendar';
import { getSolarDate } from '@dqcai/vn-lunar';
import { getLunarInfo } from '../../services/lunarService';

interface Props {
  initialDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export function QuickDatePickerModal({ initialDate, onClose, onSelect }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date(initialDate));
  const [selected, setSelected] = useState(() => new Date(initialDate));

  const calendarDays = useMemo(() => {
    const ms = startOfMonth(viewDate);
    return eachDayOfInterval({
      start: startOfWeek(ms, { weekStartsOn: 1 }),
      end:   endOfWeek(endOfMonth(ms), { weekStartsOn: 1 }),
    });
  }, [viewDate]);

  const currentLunar = getLunarInfo(selected);

  const handleSolarChange = (field: 'day' | 'month' | 'year', value: number) => {
    const next = new Date(selected);
    if (field === 'day')   next.setDate(value);
    if (field === 'month') next.setMonth(value - 1);
    if (field === 'year')  next.setFullYear(value);
    setSelected(next);
    setViewDate(new Date(next));
  };

  const handleLunarChange = (field: 'day' | 'month' | 'year', value: number) => {
    let { lunarDay: d, lunarMonth: m, lunarYear: y, isLeap } = currentLunar;
    if (field === 'day')   d = value;
    if (field === 'month') m = value;
    if (field === 'year')  y = value;
    const solar  = getSolarDate(d, m, y, isLeap);
    const next   = new Date(solar.year, solar.month - 1, solar.day);
    setSelected(next);
    setViewDate(new Date(next));
  };

  const years = Array.from({ length: YEAR_RANGE.count }, (_, i) => YEAR_RANGE.start + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <header className="p-6 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-accent" size={24} />
            <h2 className="text-xl font-bold text-ink">Xem nhanh theo ngày</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-all">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Month navigation */}
          <div className="flex items-center justify-between bg-hover/30 p-3 rounded-xl border border-border/50">
            <h3 className="text-lg font-bold text-ink uppercase">
              Tháng {format(viewDate, 'MM - yyyy')}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-border/20"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-border/20"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Mini calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS_SHORT.map(day => (
              <div
                key={day}
                className={cn(
                  'text-center text-[10px] font-bold uppercase tracking-wider text-olive/40 mb-2',
                  day === 'CN' && 'text-rose-500/50',
                )}
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const lunar      = getLunarInfo(day);
              const isSelected = isSameDay(day, selected);
              const isSunday   = day.getDay() === 0;
              return (
                <button
                  key={idx}
                  onClick={() => { setSelected(day); setViewDate(new Date(day)); }}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 rounded-xl transition-all relative border border-transparent',
                    !isSameMonth(day, viewDate) && 'opacity-20',
                    isSelected
                      ? 'bg-accent text-white shadow-md shadow-accent/20 border-accent'
                      : 'hover:bg-hover hover:border-border/50',
                  )}
                >
                  <div className="absolute top-1 right-1 flex gap-0.5">
                    {lunar.rating === 'good' && (
                      <div className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-white' : 'bg-green-500')} />
                    )}
                    {lunar.rating === 'bad' && (
                      <div className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-white' : 'bg-red-500')} />
                    )}
                  </div>
                  <span className={cn('text-sm font-bold', isSunday && !isSelected && 'text-rose-500')}>
                    {format(day, 'd')}
                  </span>
                  <span className={cn('text-[9px] font-bold opacity-60', isSelected ? 'text-white' : 'text-olive')}>
                    {isToday(day) ? '●' : lunar.lunarDay}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-border/50" />

          {/* Solar selectors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-olive uppercase tracking-wider">
              <Sun size={14} className="text-amber-500" />
              Dương Lịch
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={selected.getDate()}
                onChange={e => handleSolarChange('day', +e.target.value)}
                className="border border-border rounded-lg p-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i} value={i + 1}>Ngày {i + 1}</option>
                ))}
              </select>
              <select
                value={selected.getMonth() + 1}
                onChange={e => handleSolarChange('month', +e.target.value)}
                className="border border-border rounded-lg p-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                value={selected.getFullYear()}
                onChange={e => handleSolarChange('year', +e.target.value)}
                className="border border-border rounded-lg p-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Lunar selectors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-olive uppercase tracking-wider">
              <Moon size={14} className="text-slate-400" />
              Âm Lịch
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={currentLunar.lunarDay}
                onChange={e => handleLunarChange('day', +e.target.value)}
                className="border border-border rounded-lg p-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i} value={i + 1}>Ngày {i + 1}</option>
                ))}
              </select>
              <select
                value={currentLunar.lunarMonth}
                onChange={e => handleLunarChange('month', +e.target.value)}
                className="border border-border rounded-lg p-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                value={currentLunar.lunarYear}
                onChange={e => handleLunarChange('year', +e.target.value)}
                className="border border-border rounded-lg p-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

        </div>

        <footer className="p-6 border-t border-border bg-slate-50 flex justify-end">
          <button
            onClick={() => onSelect(selected)}
            className="px-8 py-2.5 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-all active:scale-95 shadow-lg shadow-accent/20 uppercase tracking-wide text-sm"
          >
            Xem ngày này
          </button>
        </footer>

      </div>
    </div>
  );
}
