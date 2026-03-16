import { LunarEvent } from '../types';

export type PresetId = 'mong1' | 'ngay-ram' | 'tet' | 'gio-to';

export interface PresetDefinition {
  id: PresetId;
  label: string;
  description: string;
  emoji: string;
  events: LunarEvent[];
}

export const PRESET_DEFINITIONS: PresetDefinition[] = [
  {
    id: 'tet',
    label: 'Tết Nguyên Đán',
    description: 'Mùng 1, 2, 3 tháng Giêng',
    emoji: '🎆',
    events: [
      { id: 'preset-tet-1', title: 'Mùng 1 Tết Nguyên Đán', lunarDay: 1, lunarMonth: 1, isLeapMonth: false, createdAt: 0 },
      { id: 'preset-tet-2', title: 'Mùng 2 Tết Nguyên Đán', lunarDay: 2, lunarMonth: 1, isLeapMonth: false, createdAt: 0 },
      { id: 'preset-tet-3', title: 'Mùng 3 Tết Nguyên Đán', lunarDay: 3, lunarMonth: 1, isLeapMonth: false, createdAt: 0 },
    ],
  },
  {
    id: 'gio-to',
    label: 'Giỗ tổ Hùng Vương',
    description: 'Ngày 10 tháng 3 âm lịch',
    emoji: '🏛️',
    events: [
      { id: 'preset-gioto', title: 'Giỗ tổ Hùng Vương', lunarDay: 10, lunarMonth: 3, isLeapMonth: false, createdAt: 0 },
    ],
  },
  {
    id: 'mong1',
    label: 'Mồng 1 hàng tháng',
    description: 'Ngày 1 của cả 12 tháng âm',
    emoji: '🌑',
    events: Array.from({ length: 12 }, (_, i) => ({
      id: `preset-mong1-${i + 1}`,
      title: `Mồng 1 tháng ${i + 1}`,
      lunarDay: 1,
      lunarMonth: i + 1,
      isLeapMonth: false,
      createdAt: 0,
    })),
  },
  {
    id: 'ngay-ram',
    label: 'Ngày rằm hàng tháng',
    description: 'Ngày 15 của cả 12 tháng âm',
    emoji: '🌕',
    events: Array.from({ length: 12 }, (_, i) => ({
      id: `preset-ram-${i + 1}`,
      title: `Rằm tháng ${i + 1}`,
      lunarDay: 15,
      lunarMonth: i + 1,
      isLeapMonth: false,
      createdAt: 0,
    })),
  },
];
