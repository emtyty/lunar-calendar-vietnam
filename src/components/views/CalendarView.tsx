import React, { useMemo } from 'react';
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval,
  isSameMonth, isSameDay, isToday, getWeek,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight,
  Heart, Hammer, Store, StickyNote, Flag, Frown, Info,
  Search, Calendar as CalendarIcon, Download, Clock, Plus, Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { WEEK_DAYS, CHI_NAMES } from '../../constants/calendar';
import { getLunarInfo, getHoliday } from '../../services/lunarService';
import { LunarInfo, UserNote } from '../../types';

interface Props {
  currentDate: Date;
  selectedDate: Date;
  notes: UserNote[];
  userZodiac: string | null;
  selectedLunarInfo: LunarInfo;
  holiday: string | undefined;
  selectedDateNotes: UserNote[];
  newNoteContent: string;
  onNewNoteChange: (v: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onCurrentDateChange: (date: Date) => void;
  onSelectedDateChange: (date: Date) => void;
  onOpenQuickPicker: () => void;
  onOpenAuspiciousPicker: () => void;
  onOpenLunarEventModal: () => void;
}

export function CalendarView({
  currentDate,
  selectedDate,
  notes,
  userZodiac,
  selectedLunarInfo,
  holiday,
  selectedDateNotes,
  newNoteContent,
  onNewNoteChange,
  onAddNote,
  onDeleteNote,
  onCurrentDateChange,
  onSelectedDateChange,
  onOpenQuickPicker,
  onOpenAuspiciousPicker,
  onOpenLunarEventModal,
}: Props) {
  const calendarDays = useMemo(() => {
    const ms = startOfMonth(currentDate);
    return eachDayOfInterval({
      start: startOfWeek(ms, { weekStartsOn: 1 }),
      end:   endOfWeek(endOfMonth(ms), { weekStartsOn: 1 }),
    });
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);

  const zodiacClashForDay = (lunarDay: LunarInfo) => {
    if (!userZodiac) return false;
    const dayChi  = lunarDay.canChiDay.split(' ')[1];
    const userIdx = CHI_NAMES.indexOf(userZodiac as typeof CHI_NAMES[number]);
    const dayIdx  = CHI_NAMES.indexOf(dayChi as typeof CHI_NAMES[number]);
    return userIdx !== -1 && dayIdx !== -1 && Math.abs(userIdx - dayIdx) === 6;
  };

  const selectedZodiacClash = zodiacClashForDay(selectedLunarInfo);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">

      {/* Header */}
      <header className="px-5 py-3 flex items-center justify-between gap-3 border-b border-border bg-white shrink-0 flex-wrap">
        {/* Month navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onCurrentDateChange(subMonths(currentDate, 1))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onCurrentDateChange(addMonths(currentDate, 1))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Tháng {format(currentDate, 'MM, yyyy')}
          </h2>
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <select
              value={currentDate.getMonth()}
              onChange={e => {
                const next = new Date(currentDate);
                next.setMonth(+e.target.value);
                onCurrentDateChange(next);
              }}
              className="bg-transparent border-none text-sm font-semibold px-2 py-1 focus:ring-0 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>Tháng {i + 1}</option>
              ))}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={e => {
                const next = new Date(currentDate);
                next.setFullYear(+e.target.value);
                onCurrentDateChange(next);
              }}
              className="bg-transparent border-none text-sm font-semibold px-2 py-1 focus:ring-0 cursor-pointer"
            >
              {Array.from({ length: 200 }, (_, i) => {
                const y = 1900 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Right side: Hôm nay + actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const today = new Date();
              onCurrentDateChange(today);
              onSelectedDateChange(today);
            }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Hôm nay
          </button>
          <button
            onClick={onOpenQuickPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1671C6] text-[#1671C6] text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <CalendarIcon size={14} />
            Xem nhanh
          </button>
          <button
            onClick={onOpenAuspiciousPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1671C6] text-[#1671C6] text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <Search size={14} />
            Ngày tốt
          </button>
          <button
            onClick={onOpenLunarEventModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            Xuất lịch
          </button>
        </div>
      </header>

      {/* Main area: calendar + detail panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* Calendar grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Week-day header */}
          <div className="calendar-grid border-none bg-white shrink-0">
            <div className="py-2 text-center text-[10px] font-bold text-olive/40 border-b border-border bg-slate-50">
              W
            </div>
            {WEEK_DAYS.map(day => (
              <div
                key={day}
                className={cn(
                  'py-2 text-center text-xs font-semibold text-olive border-b border-border',
                  day === 'CN' && 'text-rose-600',
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="calendar-grid flex-1 overflow-y-auto no-scrollbar">
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIdx) => {
              const week       = calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7);
              const weekNumber = getWeek(week[0], { weekStartsOn: 1, locale: vi });
              return (
                <React.Fragment key={weekIdx}>
                  <div className="week-cell">Tuần {weekNumber}</div>
                  {week.map((day, idx) => {
                    const lunar      = getLunarInfo(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isHoliday  = getHoliday(
                      lunar.lunarDay, lunar.lunarMonth,
                      day.getDate(), day.getMonth() + 1,
                    );
                    const hasNote = notes.some(n => n.date === format(day, 'yyyy-MM-dd'));
                    const hasZodiacClash = zodiacClashForDay(lunar);

                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectedDateChange(day)}
                        className={cn(
                          'day-cell aspect-square sm:aspect-auto sm:min-h-[100px] items-start justify-start p-2',
                          !isSameMonth(day, monthStart) && 'other-month bg-hover/30',
                          isSelected && 'active',
                          isToday(day) && 'today',
                        )}
                      >
                        {/* Status dots */}
                        <div className="absolute top-1 right-1 flex gap-0.5 items-center">
                          {lunar.rating === 'good' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" title="Ngày tốt" />
                          )}
                          {lunar.rating === 'bad' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" title="Ngày xấu" />
                          )}
                          {isHoliday && (
                            <Flag size={11} className="text-rose-500 fill-rose-500" />
                          )}
                          {hasNote && (
                            <StickyNote size={12} className="text-amber-500 fill-amber-200" />
                          )}
                          {hasZodiacClash && (
                            <Frown size={11} className="text-purple-500 fill-purple-100" />
                          )}
                        </div>

                        {/* Activity icons */}
                        <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-70">
                          {lunar.activities.wedding && (
                            <Heart size={14} className="text-rose-500 fill-rose-500" />
                          )}
                          {lunar.activities.moving && (
                            <Hammer size={14} className="text-blue-500" />
                          )}
                          {lunar.activities.opening && (
                            <Store size={14} className="text-amber-500" />
                          )}
                        </div>

                        {/* Solar day */}
                        <span className="text-xl sm:text-2xl font-bold">{format(day, 'd')}</span>
                        <div className="mt-0.5 flex flex-col items-start gap-0.5">
                          <span className={cn(
                            'text-xs sm:text-sm font-bold',
                            isSelected ? 'text-accent' : 'text-olive/70',
                          )}>
                            {lunar.lunarDay}/{Math.abs(lunar.lunarMonth)}
                          </span>
                          {isHoliday && (
                            <span className="text-[11px] font-bold text-rose-600 leading-tight line-clamp-1">
                              {isHoliday}
                            </span>
                          )}
                          {!isHoliday && lunar.lunarDay === 1  && Math.abs(lunar.lunarMonth) !== 1 && (
                            <span className="text-[11px] font-bold text-rose-600 leading-tight">Mồng 1</span>
                          )}
                          {!isHoliday && lunar.lunarDay === 15 && Math.abs(lunar.lunarMonth) !== 1 && (
                            <span className="text-[11px] font-bold text-rose-600 leading-tight">Ngày rằm</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Detail panel (right) */}
        <aside className="w-72 shrink-0 border-l border-border bg-white overflow-y-auto no-scrollbar flex flex-col gap-5 p-5">

          {/* Selected date header */}
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Ngày đã chọn</div>
            <div className="text-2xl font-bold text-[#1671C6]">
              {format(selectedDate, 'dd/MM/yyyy')}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {format(selectedDate, 'EEEE', { locale: vi })}
            </div>
          </div>

          {/* Lunar date */}
          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50">
            <div className="text-[10px] uppercase font-bold text-blue-400 mb-1">Âm lịch</div>
            <div className="text-lg font-bold text-gray-800">
              {selectedLunarInfo.lunarDay} tháng {Math.abs(selectedLunarInfo.lunarMonth)}
              {selectedLunarInfo.isLeap && (
                <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold align-middle">Nhuận</span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
              {[
                { label: 'Năm', value: selectedLunarInfo.canChiYear },
                { label: 'Tháng', value: selectedLunarInfo.canChiMonth },
                { label: 'Ngày', value: selectedLunarInfo.canChiDay },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="font-bold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day rating */}
          {selectedLunarInfo.truc && (
            <div className={cn(
              'p-3 rounded-xl border text-sm',
              selectedLunarInfo.rating === 'good' ? 'bg-green-50 border-green-200'
                : selectedLunarInfo.rating === 'bad' ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200',
            )}>
              <div className="flex items-center gap-2">
                <Info size={15} className={
                  selectedLunarInfo.rating === 'good' ? 'text-green-600'
                    : selectedLunarInfo.rating === 'bad' ? 'text-red-600'
                    : 'text-gray-400'
                } />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Trực</div>
                  <div className={cn(
                    'font-bold text-sm',
                    selectedLunarInfo.rating === 'good' ? 'text-green-700'
                      : selectedLunarInfo.rating === 'bad' ? 'text-red-700'
                      : 'text-gray-600',
                  )}>
                    {selectedLunarInfo.truc} &bull; {
                      selectedLunarInfo.rating === 'good' ? 'Ngày Tốt'
                        : selectedLunarInfo.rating === 'bad' ? 'Ngày Xấu'
                        : 'Bình Thường'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activities */}
          {selectedLunarInfo.rating === 'good' && (
            <div className="flex flex-wrap gap-2">
              {selectedLunarInfo.activities.wedding && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">
                  <Heart size={12} className="fill-rose-700" /> Cưới hỏi
                </span>
              )}
              {selectedLunarInfo.activities.moving && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">
                  <Hammer size={12} /> Chuyển nhà
                </span>
              )}
              {selectedLunarInfo.activities.opening && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
                  <Store size={12} /> Khai trương
                </span>
              )}
            </div>
          )}

          {/* Holiday */}
          {holiday && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-2">
              <Flag size={14} className="text-rose-600 fill-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] uppercase font-bold text-rose-400">Ngày lễ</div>
                <div className="text-sm font-bold text-rose-700">{holiday}</div>
              </div>
            </div>
          )}

          {/* Zodiac clash */}
          {selectedZodiacClash && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-2 text-xs font-bold text-purple-700">
              <Frown size={14} />
              Ngày xung tuổi {userZodiac}
            </div>
          )}

          {/* Giờ Hoàng Đạo */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={13} className="text-blue-500" />
              <span className="text-[10px] uppercase font-bold text-gray-500">Giờ Hoàng Đạo</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedLunarInfo.gioHoangDao.map((gio, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[10px] font-semibold text-blue-700">
                  {gio}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <StickyNote size={13} className="text-amber-500" />
              <span className="text-[10px] uppercase font-bold text-gray-500">Ghi chú</span>
            </div>
            <div className="flex flex-col gap-2 mb-2">
              {selectedDateNotes.map(note => (
                <div key={note.id} className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs group relative">
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                  <p className="text-gray-700 pr-4 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
            <textarea
              value={newNoteContent}
              onChange={e => onNewNoteChange(e.target.value)}
              placeholder="Thêm ghi chú..."
              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none h-16 bg-gray-50"
            />
            <button
              onClick={onAddNote}
              disabled={!newNoteContent.trim()}
              className="mt-1.5 w-full flex items-center justify-center gap-1 py-1.5 bg-[#1671C6] text-white rounded-lg text-xs font-bold hover:bg-[#1461a8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={11} /> Lưu
            </button>
          </div>

        </aside>
      </div>

    </div>
  );
}
