import { useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Moon, Sun, Bell } from 'lucide-react';
import { getUpcomingEvents } from '../../services/lunarService';

export function EventsView() {
  const events = useMemo(() => getUpcomingEvents(10), []);

  return (
    <div className="min-h-full relative overflow-y-auto bg-gray-100">
      {/* Blue header background */}
      <div className="absolute top-0 left-0 right-0 h-[180px] z-0" style={{ backgroundColor: '#124F8B' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-8 pb-20">
        {/* Title */}
        <h1
          className="text-white text-3xl text-center mb-2 font-extrabold"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
        >
          Sự Kiện Âm Lịch
        </h1>
        <p className="text-blue-200 text-sm text-center mb-8">
          10 ngày lễ sắp diễn ra gần nhất
        </p>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-gray-500">Không tìm thấy sự kiện</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event, idx) => {
              const isToday = event.daysUntil === 0;
              const isSoon  = event.daysUntil <= 7 && event.daysUntil > 0;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl shadow-sm border flex items-center gap-4 p-5 transition-shadow hover:shadow-md ${
                    isToday ? 'border-[#1671C6]' : isSoon ? 'border-amber-200' : 'border-gray-100'
                  }`}
                >
                  {/* Date badge */}
                  <div
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold text-white shadow-sm"
                    style={{ backgroundColor: event.source === 'lunar' ? '#124F8B' : '#1671C6' }}
                  >
                    <span className="text-2xl leading-none">{format(event.solarDate, 'd')}</span>
                    <span className="text-[11px] mt-0.5 opacity-80">
                      Th.{format(event.solarDate, 'MM')}
                    </span>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base mb-1 truncate">
                      {event.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      {event.source === 'lunar' ? (
                        <span className="flex items-center gap-1">
                          <Moon size={11} className="text-blue-500 fill-blue-500" />
                          {event.lunarDay}/{event.lunarMonth} âm lịch
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Sun size={11} className="text-amber-500 fill-amber-500" />
                          Dương lịch
                        </span>
                      )}
                      <span className="capitalize">
                        {format(event.solarDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                  </div>

                  {/* Days-until badge */}
                  <div className="shrink-0 text-right">
                    {isToday ? (
                      <span className="inline-block px-2.5 py-1 bg-[#1671C6] text-white text-xs font-bold rounded-full">
                        Hôm nay
                      </span>
                    ) : (
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        isSoon
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {event.daysUntil} ngày nữa
                      </span>
                    )}
                    <div className={`mt-1 text-[10px] font-semibold ${
                      event.source === 'lunar' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {event.source === 'lunar' ? 'Âm lịch' : 'Dương lịch'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
