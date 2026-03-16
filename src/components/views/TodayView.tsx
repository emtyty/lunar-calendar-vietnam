import { format, getWeek, addDays, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Sun, Moon, Clock, Star, Heart, Hammer, Store,
  Flag, Info, Frown, StickyNote, Plus, Trash2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CHI_NAMES } from '../../constants/calendar';
import { LunarInfo, UserNote } from '../../types';

const CHI_EMOJI: Record<string, string> = {
  'Tý': '🐭', 'Sửu': '🐂', 'Dần': '🐯', 'Mão': '🐱',
  'Thìn': '🐲', 'Tỵ': '🐍', 'Ngọ': '🐴', 'Mùi': '🐐',
  'Thân': '🐒', 'Dậu': '🐓', 'Tuất': '🐕', 'Hợi': '🐷',
};

function getChiEmoji(canChi: string): string {
  const chi = canChi.split(' ')[1] ?? '';
  return CHI_EMOJI[chi] ?? '🗓️';
}

/** Returns "Mồng 1" or "Ngày rằm" label for lunar day 1/15, excluding 1/1 and 15/1 */
function getLunarDayLabel(lunarDay: number, lunarMonth: number): string | null {
  const m = Math.abs(lunarMonth);
  if (lunarDay === 1  && m !== 1) return 'Mồng 1';
  if (lunarDay === 15 && m !== 1) return 'Ngày rằm';
  return null;
}

interface Props {
  today: Date;
  now: Date;
  currentTraditionalHour: string;
  lunarInfo: LunarInfo;
  userZodiac: string | null;
  zodiacClash: boolean | null;
  holiday: string | undefined;
  todayNotes: UserNote[];
  newNoteContent: string;
  onNewNoteChange: (v: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onZodiacChange: (zodiac: string) => void;
  onDayChange: (date: Date) => void;
}

export function TodayView({
  today,
  now,
  currentTraditionalHour,
  lunarInfo,
  userZodiac,
  zodiacClash,
  holiday,
  todayNotes,
  newNoteContent,
  onNewNoteChange,
  onAddNote,
  onDeleteNote,
  onZodiacChange,
  onDayChange,
}: Props) {
  const lunarDayLabel = getLunarDayLabel(lunarInfo.lunarDay, lunarInfo.lunarMonth);

  return (
    <div className="min-h-full relative overflow-y-auto bg-gray-100">
      {/* Blue header background */}
      <div className="absolute top-0 left-0 right-0 h-[220px] z-0" style={{ backgroundColor: '#124F8B' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-20">
        {/* Title */}
        <h1
          className="text-white text-3xl font-extrabold text-center mb-8"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
        >
          Lịch Âm Việt Nam
        </h1>

        {/* Main info cards */}
        <div className="flex gap-4 items-stretch mb-5">
          {/* Date card with prev/next navigation */}
          <div className="flex-1 flex gap-2 items-stretch">
            <button
              onClick={() => onDayChange(subDays(today, 1))}
              className="w-9 shrink-0 flex items-center justify-center rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-amber-600 transition-colors shadow-sm"
              title="Ngày trước"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Date card */}
            <div
              className="flex-1 rounded-2xl shadow-sm p-6 flex border border-amber-100"
              style={{ backgroundColor: '#fff8e7' }}
            >
            {/* Solar */}
            <div className="flex-1 text-center pr-6 border-r border-amber-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sun size={15} className="text-amber-500 fill-amber-500" />
                <span className="text-[11px] font-semibold text-gray-600 tracking-widest uppercase">Dương lịch</span>
              </div>
              <div
                className="text-[76px] leading-none font-bold mb-2 tracking-tighter"
                style={{ color: '#1671C6' }}
              >
                {format(today, 'd')}
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                Tháng {format(today, 'MM')}, {format(today, 'yyyy')}
              </div>
              <div className="text-sm text-gray-600">
                {format(today, 'EEEE', { locale: vi })}
                {' '}•{' '}
                Tuần {getWeek(today, { weekStartsOn: 1, locale: vi })}
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Clock size={12} />
                {format(now, 'HH:mm:ss')}
                <span className="ml-1 px-1.5 py-0.5 bg-amber-100 rounded text-amber-700 font-semibold text-[10px]">
                  Giờ {currentTraditionalHour}
                </span>
              </div>
            </div>

            {/* Lunar */}
            <div className="flex-1 text-center pl-6 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Moon size={15} className="text-[#1671C6] fill-[#1671C6]" />
                <span className="text-[11px] font-semibold text-gray-600 tracking-widest uppercase">Âm lịch</span>
              </div>
              <div
                className="text-[76px] leading-none font-bold mb-2 tracking-tighter"
                style={{ color: '#1671C6' }}
              >
                {lunarInfo.lunarDay}
              </div>
              <div className="text-lg font-bold text-gray-800">
                tháng {Math.abs(lunarInfo.lunarMonth)}
              </div>
              {/* Mồng 1 / Ngày rằm badge */}
              {lunarDayLabel && (
                <span className="mt-2 px-3 py-0.5 bg-red-100 text-red-600 rounded-full text-sm font-bold border border-red-200">
                  {lunarDayLabel}
                </span>
              )}
              {lunarInfo.isLeap && (
                <span className="mt-1.5 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                  Nhuận
                </span>
              )}
            </div>
          </div>

            <button
              onClick={() => onDayChange(addDays(today, 1))}
              className="w-9 shrink-0 flex items-center justify-center rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-amber-600 transition-colors shadow-sm"
              title="Ngày sau"
            >
              <ChevronRight size={20} />
            </button>
          </div>{/* end date-card group */}

          {/* Can Chi zodiac card */}
          <div
            className="w-[270px] rounded-2xl shadow-sm p-5 border border-blue-100 relative shrink-0"
            style={{ backgroundColor: '#EBF3FC' }}
          >
            {/* Decorative vertical line */}
            <div className="absolute left-10 top-10 bottom-10 w-px bg-blue-200" />
            <div className="flex flex-col gap-5 relative z-10">
              {[
                { label: 'NĂM', value: lunarInfo.canChiYear },
                { label: 'THÁNG', value: lunarInfo.canChiMonth },
                { label: 'NGÀY', value: lunarInfo.canChiDay },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100 z-10 shrink-0">
                    {getChiEmoji(value)}
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{label}</div>
                    <div className="font-bold text-gray-800 text-base">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-blue-500 fill-blue-500" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Tuổi của bạn</span>
          </div>
          <select
            value={userZodiac ?? ''}
            onChange={e => onZodiacChange(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm font-medium px-3 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer text-gray-700 bg-white"
          >
            <option value="">Chọn tuổi</option>
            {CHI_NAMES.map(chi => (
              <option key={chi} value={chi}>{chi}</option>
            ))}
          </select>
        </div>

        {/* Zodiac clash warning */}
        {zodiacClash && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 flex items-center gap-2 text-sm font-bold">
            <Frown size={16} />
            Ngày này xung với tuổi {userZodiac} của bạn!
          </div>
        )}

        {/* Holiday badge */}
        {holiday && (
          <div className="mb-4 p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
            <Flag size={16} className="text-rose-600 fill-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-400 mb-0.5">Ngày Lễ</div>
              <div className="text-sm font-bold text-rose-700">{holiday}</div>
            </div>
          </div>
        )}

        {/* Trực & rating */}
        {lunarInfo.truc && (
          <div className={cn(
            'mb-4 flex items-center gap-3 p-4 border rounded-xl',
            lunarInfo.rating === 'good' ? 'bg-green-50 border-green-200'
              : lunarInfo.rating === 'bad' ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200',
          )}>
            <Info size={20} className={cn(
              lunarInfo.rating === 'good' ? 'text-green-600'
                : lunarInfo.rating === 'bad' ? 'text-red-600'
                : 'text-gray-400',
            )} />
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Trực & Đánh giá</div>
              <div className={cn(
                'text-sm font-bold',
                lunarInfo.rating === 'good' ? 'text-green-700'
                  : lunarInfo.rating === 'bad' ? 'text-red-700'
                  : 'text-gray-600',
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

        {/* Việc nên làm — hide on bad days, show plain message on neutral days */}
        {lunarInfo.rating !== 'bad' && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 pl-1">
              Việc nên làm hôm nay
            </h2>
            {lunarInfo.truc === 'Trừ' ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
                <span className="text-xl shrink-0">🧹</span>
                <p className="text-sm text-teal-800 font-medium">
                  Đây là ngày rất tốt để dọn dẹp, phá dỡ, chữa bệnh, hoặc giải tỏa mâu thuẫn.
                </p>
              </div>
            ) : lunarInfo.rating === 'neutral' ? (
              <div className="rounded-2xl p-6 border border-gray-200 bg-white text-center text-gray-500 font-medium shadow-sm">
                Mọi việc bình thường
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Wedding */}
                {lunarInfo.activities.wedding ? (
                  <div
                    className="rounded-2xl p-6 border border-red-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: '#FDECE8' }}
                  >
                    <div>
                      <h3 className="text-[#a52a2a] text-lg font-bold mb-1">Cưới hỏi</h3>
                      <p className="text-gray-500 text-sm">Ngày tốt cho hôn nhân</p>
                    </div>
                    <Heart size={48} className="text-rose-400 fill-rose-300 opacity-80" />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-6 border border-red-100 flex items-center justify-between opacity-35"
                    style={{ backgroundColor: '#FDECE8' }}
                  >
                    <div>
                      <div className="h-5 w-24 bg-red-200 rounded mb-2" />
                      <div className="h-4 w-16 bg-red-200 rounded" />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-red-200" />
                  </div>
                )}

                {/* Moving */}
                {lunarInfo.activities.moving ? (
                  <div
                    className="rounded-2xl p-6 border border-blue-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: '#EBF3FC' }}
                  >
                    <div>
                      <h3 className="text-[#1e3a8a] text-lg font-bold mb-1">Chuyển nhà</h3>
                      <p className="text-gray-500 text-sm">Ngày tốt để chuyển nhà</p>
                    </div>
                    <Hammer size={48} className="text-blue-400 opacity-80" />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-6 border border-blue-100 flex items-center justify-between opacity-35"
                    style={{ backgroundColor: '#EBF3FC' }}
                  >
                    <div>
                      <div className="h-5 w-24 bg-blue-200 rounded mb-2" />
                      <div className="h-4 w-16 bg-blue-200 rounded" />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-blue-200" />
                  </div>
                )}

                {/* Opening */}
                {lunarInfo.activities.opening ? (
                  <div
                    className="rounded-2xl p-6 border border-amber-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: '#fffbeb' }}
                  >
                    <div>
                      <h3 className="text-amber-800 text-lg font-bold mb-1">Khai trương</h3>
                      <p className="text-gray-500 text-sm">Ngày tốt để khai trương</p>
                    </div>
                    <Store size={48} className="text-amber-400 opacity-80" />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-6 border border-amber-100 flex items-center justify-between opacity-35"
                    style={{ backgroundColor: '#fffbeb' }}
                  >
                    <div>
                      <div className="h-5 w-24 bg-amber-200 rounded mb-2" />
                      <div className="h-4 w-16 bg-amber-200 rounded" />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-amber-200" />
                  </div>
                )}

                {/* Placeholder 4th slot */}
                <div
                  className="rounded-2xl p-6 border border-green-100 flex items-center justify-between opacity-35"
                  style={{ backgroundColor: '#f0fdf4' }}
                >
                  <div>
                    <div className="h-5 w-24 bg-green-200 rounded mb-2" />
                    <div className="h-4 w-16 bg-green-200 rounded" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-green-200" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Giờ Hoàng Đạo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-blue-500" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Giờ Hoàng Đạo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lunarInfo.gioHoangDao.map((gio, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700"
              >
                {gio}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <StickyNote size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Ghi chú ngày này</span>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {todayNotes.map(note => (
              <div key={note.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm group relative">
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
                <p className="text-gray-700 pr-5 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
          <textarea
            value={newNoteContent}
            onChange={e => onNewNoteChange(e.target.value)}
            placeholder="Thêm ghi chú cho ngày này..."
            className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none h-20 bg-gray-50"
          />
          <button
            onClick={onAddNote}
            disabled={!newNoteContent.trim()}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-[#1671C6] text-white rounded-lg text-sm font-semibold hover:bg-[#1461a8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} /> Lưu ghi chú
          </button>
        </div>
      </div>
    </div>
  );
}
