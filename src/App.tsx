/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  getWeek,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Heart, Hammer, Store, StickyNote, Flag, Frown } from 'lucide-react';
import { cn } from './lib/utils';
import { WEEK_DAYS, CHI_NAMES } from './constants/calendar';
import { useClock } from './hooks/useClock';
import { useNotes } from './hooks/useNotes';
import { useLunarEvents } from './hooks/useLunarEvents';
import { getLunarInfo, getHoliday, findBestDates } from './services/lunarService';
import { Sidebar } from './components/Sidebar';
import { QuickDatePickerModal } from './components/modals/QuickDatePickerModal';
import { AuspiciousDateModal } from './components/modals/AuspiciousDateModal';
import { AboutModal } from './components/modals/AboutModal';
import { LunarEventModal } from './components/modals/LunarEventModal';
import { AuspiciousDate } from './types';

function loadZodiac(): string | null {
  try { return localStorage.getItem('userZodiac'); } catch { return null; }
}
function saveZodiac(value: string): void {
  try { localStorage.setItem('userZodiac', value); } catch { /* quota */ }
}

export default function App() {
  const [currentDate,  setCurrentDate]  = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [isQuickPickerOpen,      setIsQuickPickerOpen]      = useState(false);
  const [isAuspiciousPickerOpen, setIsAuspiciousPickerOpen] = useState(false);
  const [isAboutOpen,            setIsAboutOpen]            = useState(false);
  const [isLunarEventModalOpen,  setIsLunarEventModalOpen]  = useState(false);

  const [activeActivity,  setActiveActivity]  = useState<string | null>(null);
  const [auspiciousDates, setAuspiciousDates] = useState<AuspiciousDate[]>([]);
  const [userZodiac,      setUserZodiac]      = useState<string | null>(loadZodiac);

  const { now, currentTraditionalHour } = useClock();
  const { notes, selectedDateNotes, newNoteContent, setNewNoteContent, addNote, deleteNote } =
    useNotes(selectedDate);
  const { events: lunarEvents, addEvent, deleteEvent, updateEvent } = useLunarEvents();

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const calendarDays = useMemo(() => {
    const ms = startOfMonth(currentDate);
    return eachDayOfInterval({
      start: startOfWeek(ms, { weekStartsOn: 1 }),
      end:   endOfWeek(endOfMonth(ms), { weekStartsOn: 1 }),
    });
  }, [currentDate]);

  const selectedLunarInfo = useMemo(() => getLunarInfo(selectedDate), [selectedDate]);

  const zodiacClash = useMemo<boolean | null>(() => {
    if (!userZodiac) return null;
    const dayChi  = selectedLunarInfo.canChiDay.split(' ')[1];
    const userIdx = CHI_NAMES.indexOf(userZodiac as typeof CHI_NAMES[number]);
    const dayIdx  = CHI_NAMES.indexOf(dayChi as typeof CHI_NAMES[number]);
    if (userIdx === -1 || dayIdx === -1) return null;
    return Math.abs(userIdx - dayIdx) === 6;
  }, [userZodiac, selectedLunarInfo.canChiDay]);

  const holiday = useMemo(
    () => getHoliday(
      selectedLunarInfo.lunarDay,
      selectedLunarInfo.lunarMonth,
      selectedDate.getDate(),
      selectedDate.getMonth() + 1,
    ),
    [selectedLunarInfo, selectedDate],
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleZodiacChange = (zodiac: string) => {
    setUserZodiac(zodiac);
    saveZodiac(zodiac);
  };

  const handleFindDates = (key: string) => {
    setActiveActivity(key);
    setAuspiciousDates(findBestDates(key, 2));
  };

  const handleSelectAuspiciousDate = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
    setIsAuspiciousPickerOpen(false);
  };

  const handleAuspiciousPickerClose = () => {
    setIsAuspiciousPickerOpen(false);
    setActiveActivity(null);
    setAuspiciousDates([]);
  };

  const monthStart = startOfMonth(currentDate);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-paper overflow-hidden">

      <Sidebar
        selectedDate={selectedDate}
        now={now}
        currentTraditionalHour={currentTraditionalHour}
        lunarInfo={selectedLunarInfo}
        userZodiac={userZodiac}
        zodiacClash={zodiacClash}
        holiday={holiday}
        selectedDateNotes={selectedDateNotes}
        newNoteContent={newNoteContent}
        onNewNoteChange={setNewNoteContent}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
        onZodiacChange={handleZodiacChange}
        onOpenQuickPicker={() => setIsQuickPickerOpen(true)}
        onOpenAuspiciousPicker={() => setIsAuspiciousPickerOpen(true)}
        onOpenLunarEventModal={() => setIsLunarEventModalOpen(true)}
      />

      {/* Main calendar area */}
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden">

        {/* Month navigation header */}
        <header className="px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border bg-white sticky top-0 z-20">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 rounded-md hover:bg-hover transition-all text-olive"
                title="Tháng trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-md hover:bg-hover transition-all text-olive"
                title="Tháng sau"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-ink">
                Tháng {format(currentDate, 'MM, yyyy')}
              </h2>
              <div className="flex items-center gap-2 bg-hover/50 p-1 rounded-lg border border-border/50">
                <select
                  value={currentDate.getMonth()}
                  onChange={e => {
                    const next = new Date(currentDate);
                    next.setMonth(+e.target.value);
                    setCurrentDate(next);
                  }}
                  className="bg-transparent border-none text-sm font-bold px-3 py-1.5 focus:ring-0 cursor-pointer hover:bg-white rounded-md transition-all shadow-sm"
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
                    setCurrentDate(next);
                  }}
                  className="bg-transparent border-none text-sm font-bold px-3 py-1.5 focus:ring-0 cursor-pointer hover:bg-white rounded-md transition-all text-center shadow-sm"
                >
                  {Array.from({ length: 200 }, (_, i) => {
                    const y = 1900 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
              className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-hover transition-all active:scale-95 w-full sm:w-auto"
            >
              Hôm nay
            </button>
          </div>
        </header>

        {/* Calendar grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Week-day header row */}
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
                    const lunar     = getLunarInfo(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isHoliday  = getHoliday(
                      lunar.lunarDay, lunar.lunarMonth,
                      day.getDate(), day.getMonth() + 1,
                    );
                    const hasNote = notes.some(n => n.date === format(day, 'yyyy-MM-dd'));
                    const hasZodiacClash = (() => {
                      if (!userZodiac) return false;
                      const dayChi  = lunar.canChiDay.split(' ')[1];
                      const userIdx = CHI_NAMES.indexOf(userZodiac as typeof CHI_NAMES[number]);
                      const dayIdx  = CHI_NAMES.indexOf(dayChi  as typeof CHI_NAMES[number]);
                      return userIdx !== -1 && dayIdx !== -1 && Math.abs(userIdx - dayIdx) === 6;
                    })();
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          'day-cell aspect-square sm:aspect-auto sm:min-h-[100px] items-start justify-start p-1.5 sm:p-2',
                          !isSameMonth(day, monthStart) && 'other-month bg-hover/30',
                          isSelected && 'active',
                          isToday(day) && 'today',
                        )}
                      >
                        {/* Top-right status dots */}
                        <div className="absolute top-1.5 right-1.5 flex gap-1 items-center">
                          {lunar.rating === 'good' && (
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" title="Ngày tốt" />
                          )}
                          {lunar.rating === 'bad' && (
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" title="Ngày xấu" />
                          )}
                          {isHoliday && (
                            <Flag size={12} className="text-rose-500 fill-rose-500" title={isHoliday} />
                          )}
                          {hasNote && (
                            <StickyNote size={14} className="text-amber-500 fill-amber-200" title="Có ghi chú" />
                          )}
                          {hasZodiacClash && (
                            <Frown size={13} className="text-purple-500 fill-purple-100" title={`Xung tuổi ${userZodiac}`} />
                          )}
                        </div>
                        {/* Bottom-right activity icons */}
                        <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-70">
                          {lunar.activities.wedding && (
                            <Heart size={18} className="text-rose-500 fill-rose-500" />
                          )}
                          {lunar.activities.moving && (
                            <Hammer size={18} className="text-blue-500" />
                          )}
                          {lunar.activities.opening && (
                            <Store size={18} className="text-amber-500" />
                          )}
                        </div>
                        {/* Solar day */}
                        <span className="text-base sm:text-xl font-bold">{format(day, 'd')}</span>
                        {/* Lunar day + holiday label */}
                        <div className="mt-1 flex flex-col items-start gap-0.5">
                          <span className={cn(
                            'text-[10px] sm:text-sm font-bold',
                            isSelected ? 'text-accent' : 'text-olive/70',
                          )}>
                            {lunar.lunarDay}/{Math.abs(lunar.lunarMonth)}
                          </span>
                          {isHoliday && (
                            <span className="text-[9px] sm:text-xs font-bold text-rose-600 leading-tight text-left line-clamp-2">
                              {isHoliday}
                            </span>
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

        <footer className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-white border-t border-border shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span>&copy; {new Date().getFullYear()} Lịch Âm Việt Nam</span>
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-accent hover:text-accent/80 transition-colors underline underline-offset-2 decoration-accent/30 hover:decoration-accent"
          >
            Thông tin ứng dụng
          </button>
        </footer>

      </main>

      {/* Modals */}
      {isAuspiciousPickerOpen && (
        <AuspiciousDateModal
          activeActivity={activeActivity}
          auspiciousDates={auspiciousDates}
          onFindDates={handleFindDates}
          onSelectDate={handleSelectAuspiciousDate}
          onClose={handleAuspiciousPickerClose}
        />
      )}

      {isQuickPickerOpen && (
        <QuickDatePickerModal
          initialDate={selectedDate}
          onClose={() => setIsQuickPickerOpen(false)}
          onSelect={date => {
            setCurrentDate(date);
            setSelectedDate(date);
            setIsQuickPickerOpen(false);
          }}
        />
      )}

      {isAboutOpen && (
        <AboutModal onClose={() => setIsAboutOpen(false)} />
      )}

      {isLunarEventModalOpen && (
        <LunarEventModal
          events={lunarEvents}
          onAddEvent={addEvent}
          onDeleteEvent={deleteEvent}
          onUpdateEvent={updateEvent}
          onClose={() => setIsLunarEventModalOpen(false)}
        />
      )}

    </div>
  );
}
