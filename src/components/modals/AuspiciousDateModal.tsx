import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, Heart, Hammer, Store, Star, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ACTIVITY_RULES } from '../../services/lunarService';
import { AuspiciousDate } from '../../types';

interface Props {
  activeActivity: string | null;
  auspiciousDates: AuspiciousDate[];
  onFindDates: (key: string) => void;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  WEDDING:        <Heart size={24} />,
  GROUNDBREAKING: <Hammer size={24} />,
  OPENING:        <Store size={24} />,
};

export function AuspiciousDateModal({
  activeActivity,
  auspiciousDates,
  onFindDates,
  onSelectDate,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]">

        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Search className="text-accent" size={24} />
            <h2 className="text-xl font-bold text-ink">Chọn Ngày Tốt</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-all">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">

          {/* Activity selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(ACTIVITY_RULES).map(([key, rule]) => (
              <button
                key={key}
                onClick={() => onFindDates(key)}
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center',
                  activeActivity === key
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/40 hover:bg-slate-50',
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  activeActivity === key ? 'bg-accent text-white' : 'bg-slate-100 text-olive',
                )}>
                  {ACTIVITY_ICONS[key]}
                </div>
                <span className="font-bold text-ink">{rule.label}</span>
              </button>
            ))}
          </div>

          {/* Results list */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-olive uppercase tracking-tight">
              Kết quả gợi ý (2 tháng tới)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {auspiciousDates.length > 0 ? (
                auspiciousDates.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectDate(item.date)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all group text-left',
                      item.score === 10
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-border hover:border-accent',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg group-hover:bg-accent/5 transition-all shadow-sm">
                        <span className="text-xs font-bold text-olive">{format(item.date, 'MM')}</span>
                        <span className="text-xl font-bold text-accent">{format(item.date, 'dd')}</span>
                      </div>
                      <div>
                        <div className="font-bold text-ink">
                          {format(item.date, 'EEEE, dd/MM/yyyy', { locale: vi })}
                        </div>
                        <div className="text-xs text-olive">
                          Âm lịch: {item.lunarDate} &bull; Trực: {item.truc}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={cn(
                              i < (item.score === 10 ? 5 : 4)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-200',
                            )}
                          />
                        ))}
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold uppercase',
                        item.score === 10 ? 'text-green-600' : 'text-accent',
                      )}>
                        {item.score === 10 ? 'Rất tốt cho việc này' : 'Ngày tốt'}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-olive opacity-50 italic">
                  {activeActivity
                    ? 'Không tìm thấy ngày phù hợp trong khoảng thời gian này.'
                    : 'Chọn loại việc bên trên để tìm ngày tốt.'}
                </div>
              )}
            </div>
          </div>

        </div>

        <footer className="p-4 bg-slate-50 border-t border-border text-center text-[10px] text-olive/60">
          Dữ liệu dựa trên hệ thống Sao và Trực truyền thống. Chỉ mang tính chất tham khảo.
        </footer>

      </div>
    </div>
  );
}
