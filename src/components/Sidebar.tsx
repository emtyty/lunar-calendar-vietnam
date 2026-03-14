import { format, getWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Sun, Moon, Clock, Star, Info, Heart, Hammer, Store,
  StickyNote, Trash2, Plus, Flag, Search, Calendar as CalendarIcon, Download, Frown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CHI_NAMES } from '../constants/calendar';
import { LunarInfo, UserNote } from '../types';

interface Props {
  selectedDate: Date;
  now: Date;
  currentTraditionalHour: string;
  lunarInfo: LunarInfo;
  userZodiac: string | null;
  zodiacClash: boolean | null;
  holiday: string | undefined;
  selectedDateNotes: UserNote[];
  newNoteContent: string;
  onNewNoteChange: (value: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onZodiacChange: (zodiac: string) => void;
  onOpenQuickPicker: () => void;
  onOpenAuspiciousPicker: () => void;
  onOpenLunarEventModal: () => void;
}

export function Sidebar({
  selectedDate,
  now,
  currentTraditionalHour,
  lunarInfo,
  userZodiac,
  zodiacClash,
  holiday,
  selectedDateNotes,
  newNoteContent,
  onNewNoteChange,
  onAddNote,
  onDeleteNote,
  onZodiacChange,
  onOpenQuickPicker,
  onOpenAuspiciousPicker,
  onOpenLunarEventModal,
}: Props) {
  return (
    <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-border p-6 flex flex-col gap-6 overflow-y-auto h-full no-scrollbar z-30 shadow-sm">

      {/* Branding + quick actions */}
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-accent tracking-tight">Lịch Âm Việt Nam</h1>
        <div className="flex flex-col gap-2 items-start">
          <button
            onClick={onOpenQuickPicker}
            className="text-accent hover:text-accent/80 font-bold text-sm transition-all flex items-center gap-2 underline underline-offset-4 decoration-accent/30 hover:decoration-accent"
          >
            <CalendarIcon size={16} />
            Xem nhanh theo ngày
          </button>
          <button
            onClick={onOpenAuspiciousPicker}
            className="text-accent hover:text-accent/80 font-bold text-sm transition-all flex items-center gap-2 underline underline-offset-4 decoration-accent/30 hover:decoration-accent"
          >
            <Search size={16} />
            Chọn ngày tốt
          </button>
          <button
            onClick={onOpenLunarEventModal}
            className="text-accent hover:text-accent/80 font-bold text-sm transition-all flex items-center gap-2 underline underline-offset-4 decoration-accent/30 hover:decoration-accent"
          >
            <Download size={16} />
            Xuất sự kiện âm lịch
          </button>
        </div>
      </div>

      {/* Solar date + clock */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-olive font-bold uppercase tracking-tight text-[10px]">
            <Sun size={12} className="text-amber-500 fill-amber-500" />
            Dương Lịch
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-olive/60">
            <Clock size={10} />
            {format(now, 'HH:mm:ss')}
            <span className="ml-1 px-1 bg-hover rounded">Giờ {currentTraditionalHour}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-6xl font-bold text-accent tracking-tighter leading-none">
            {format(selectedDate, 'dd')}
          </div>
          <div className="mt-2 text-lg font-bold text-ink/90">
            Tháng {format(selectedDate, 'MM, yyyy')}
          </div>
          <div className="text-sm font-medium text-olive/80">
            {format(selectedDate, 'EEEE', { locale: vi })}
            &bull; Tuần {getWeek(selectedDate, { weekStartsOn: 1, locale: vi })}
          </div>
        </div>
      </div>

      {/* Lunar date + Can Chi */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-tight text-[10px]">
          <Moon size={12} className="fill-accent" />
          Âm Lịch
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-ink leading-none">{lunarInfo.lunarDay}</span>
          <span className="text-xl font-bold text-olive/80">tháng {Math.abs(lunarInfo.lunarMonth)}</span>
          {lunarInfo.isLeap && (
            <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-bold ml-1">
              Nhuận
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1 bg-hover/20 p-3 rounded-lg border border-border/40">
          {[
            { label: 'Năm',   value: lunarInfo.canChiYear },
            { label: 'Tháng', value: lunarInfo.canChiMonth },
            { label: 'Ngày',  value: lunarInfo.canChiDay },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={cn(
                'flex items-center justify-between py-1',
                i < arr.length - 1 && 'border-b border-border/30',
              )}
            >
              <span className="text-[11px] font-medium text-olive uppercase tracking-wider">{label}</span>
              <span className="text-sm font-bold text-ink">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zodiac selector + clash warning */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between bg-hover/30 p-2 rounded-md border border-border/50">
          <div className="flex items-center gap-2 text-olive font-bold uppercase tracking-tight text-[10px]">
            <Star size={12} className="text-accent" />
            Tuổi của bạn
          </div>
          <select
            value={userZodiac ?? ''}
            onChange={e => onZodiacChange(e.target.value)}
            className="bg-transparent border-none text-[11px] font-bold focus:ring-0 cursor-pointer hover:bg-hover rounded px-1 text-ink"
          >
            <option value="">Chọn tuổi</option>
            {CHI_NAMES.map(chi => (
              <option key={chi} value={chi}>{chi}</option>
            ))}
          </select>
        </div>
        {zodiacClash && (
          <div className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-100 text-[10px] font-bold flex items-center gap-2">
            <Info size={12} />
            Ngày này xung với tuổi {userZodiac} của bạn!
          </div>
        )}
      </div>

      {/* Day rating (Trực) */}
      {lunarInfo.truc && (
        <div className={cn(
          'flex items-center gap-3 p-4 border rounded-lg',
          lunarInfo.rating === 'good' ? 'bg-green-50 border-green-200'
            : lunarInfo.rating === 'bad' ? 'bg-red-50 border-red-200'
            : 'bg-hover/20 border-border',
        )}>
          <Info size={18} className={cn(
            lunarInfo.rating === 'good' ? 'text-green-600'
              : lunarInfo.rating === 'bad' ? 'text-red-600'
              : 'text-accent',
          )} />
          <div>
            <div className="text-[11px] uppercase opacity-60 font-bold">Trực & Đánh giá</div>
            <div className={cn(
              'text-sm font-bold',
              lunarInfo.rating === 'good' ? 'text-green-700'
                : lunarInfo.rating === 'bad' ? 'text-red-700'
                : 'text-ink/80',
            )}>
              Trực {lunarInfo.truc} &bull; {
                lunarInfo.rating === 'good' ? 'Ngày Tốt'
                  : lunarInfo.rating === 'bad' ? 'Ngày Xấu'
                  : 'Ngày Bình Thường'
              }
            </div>
          </div>
        </div>
      )}

      {/* Recommended activities */}
      {lunarInfo.rating === 'good' && (
        <div className="flex flex-col gap-3">
          <div className="text-[11px] uppercase font-bold text-olive opacity-60">Việc nên làm</div>
          <div className="flex flex-wrap gap-2">
            {lunarInfo.activities.wedding && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-md text-xs font-bold border border-rose-200">
                <Heart size={14} className="fill-rose-700" /> Cưới hỏi
              </div>
            )}
            {lunarInfo.activities.moving && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-200">
                <Hammer size={14} /> Chuyển nhà
              </div>
            )}
            {lunarInfo.activities.opening && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-md text-xs font-bold border border-amber-200">
                <Store size={14} /> Khai trương
              </div>
            )}
            {!lunarInfo.activities.wedding && !lunarInfo.activities.moving && !lunarInfo.activities.opening && (
              <span className="text-xs text-olive italic">Mọi việc bình thường</span>
            )}
          </div>
        </div>
      )}

      {/* Holiday badge */}
      {holiday && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-md border border-rose-100 flex items-start gap-2">
          <Flag className="shrink-0 mt-0.5 fill-rose-700" size={14} />
          <div>
            <div className="text-[10px] uppercase font-bold opacity-60">Ngày Lễ</div>
            <div className="text-sm font-bold leading-tight">{holiday}</div>
          </div>
        </div>
      )}

      {/* Personal notes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-olive font-bold uppercase tracking-tight text-[10px]">
          <StickyNote size={12} className="text-accent" />
          Ghi chú cá nhân
        </div>
        <div className="flex flex-col gap-2">
          {selectedDateNotes.map(note => (
            <div key={note.id} className="p-2 bg-amber-50 border border-amber-100 rounded text-xs group relative">
              <button
                onClick={() => onDeleteNote(note.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
              <p className="text-ink/80 pr-4 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              value={newNoteContent}
              onChange={e => onNewNoteChange(e.target.value)}
              placeholder="Thêm ghi chú cho ngày này..."
              className="w-full p-2 text-xs border border-border rounded focus:ring-1 focus:ring-accent outline-none resize-none h-16 bg-paper/50"
            />
            <button
              onClick={onAddNote}
              disabled={!newNoteContent.trim()}
              className="flex items-center justify-center gap-1 py-1.5 bg-accent text-white rounded text-[10px] font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={12} /> Lưu ghi chú
            </button>
          </div>
        </div>
      </div>

      {/* Auspicious hours */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-olive font-bold uppercase tracking-tight text-[10px]">
          <Clock size={12} className="text-accent" />
          Giờ Hoàng Đạo
        </div>
        <div className="flex flex-wrap gap-1.5">
          {lunarInfo.gioHoangDao.map((gio, idx) => (
            <span key={idx} className="px-2 py-1 bg-white rounded border border-border text-[10px] font-semibold text-olive">
              {gio}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-[11px] uppercase font-bold text-olive opacity-40 mb-3">Chú thích</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            { icon: <div className="w-2 h-2 rounded-full bg-green-500" />, label: 'Ngày Tốt' },
            { icon: <div className="w-2 h-2 rounded-full bg-red-500" />,   label: 'Ngày Xấu' },
            { icon: <Heart size={12} className="text-rose-500 fill-rose-500" />, label: 'Cưới hỏi' },
            { icon: <Hammer size={12} className="text-blue-500" />,        label: 'Chuyển nhà' },
            { icon: <Store size={12} className="text-amber-500" />,        label: 'Khai trương' },
            { icon: <StickyNote size={12} className="text-amber-500 fill-amber-100" />, label: 'Có ghi chú' },
            { icon: <Flag size={12} className="text-rose-500 fill-rose-100" />, label: 'Ngày lễ' },
            { icon: <Frown size={12} className="text-purple-500 fill-purple-100" />, label: 'Xung tuổi' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[11px] font-medium text-olive">
              {icon} {label}
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
