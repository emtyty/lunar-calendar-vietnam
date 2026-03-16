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
    <aside className="w-[100px] bg-white border-r border-gray-200 flex flex-col pt-6 shrink-0 shadow-sm z-10">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'relative flex flex-col items-center py-4 px-2 w-full transition-colors',
              activeTab === id
                ? 'text-[#1671C6]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
            )}
          >
            {activeTab === id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-[#1671C6] rounded-r" />
            )}
            <Icon size={22} className="mb-1.5" />
            <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
