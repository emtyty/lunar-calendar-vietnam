import { CalendarDays, LayoutGrid, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export type NavTab = 'today' | 'calendar' | 'events';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const NAV_ITEMS = [
  { id: 'today' as NavTab, label: 'Hôm nay', Icon: CalendarDays },
  { id: 'calendar' as NavTab, label: 'Lịch', Icon: LayoutGrid },
  { id: 'events' as NavTab, label: 'Sự kiện', Icon: Bell },
];

export function NavSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="
      fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex flex-row z-30 shadow-sm
      md:relative md:bottom-auto md:left-auto md:right-auto md:h-auto
      md:w-[100px] md:border-t-0 md:border-r md:flex-col md:pt-6 md:shrink-0
    ">
      <nav className="flex flex-row w-full md:flex-col md:gap-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center py-2 px-2 md:py-4 w-full transition-colors',
              activeTab === id
                ? 'text-[#1671C6]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
            )}
          >
            {/* Mobile: top indicator */}
            {activeTab === id && (
              <span className="md:hidden absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#1671C6] rounded-b" />
            )}
            {/* Desktop: left indicator */}
            {activeTab === id && (
              <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-[#1671C6] rounded-r" />
            )}
            <Icon size={22} className="mb-1" />
            <span className="text-[10px] md:text-[11px] font-medium text-center leading-tight">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
