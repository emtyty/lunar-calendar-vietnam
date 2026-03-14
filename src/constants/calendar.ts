/** The 12 Earthly Branches (Địa Chi) used for zodiac and time calculations. */
export const CHI_NAMES = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
] as const;

export type ChiName = (typeof CHI_NAMES)[number];

/** Mon-Sun week day headers for the main calendar grid. */
export const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

/** Mon-Sun week day headers for the compact date-picker modal. */
export const WEEK_DAYS_SHORT = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'] as const;

/** Solar year range available in selectors. */
export const YEAR_RANGE = { start: 1900, count: 200 } as const;
