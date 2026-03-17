import { LunarCalendar, CHI } from '@dqcai/vn-lunar';
import { LunarInfo, AuspiciousDate, UpcomingEvent } from '../types';

export { LunarCalendar, CHI };

// ---------------------------------------------------------------------------
// Module-level constants (hoisted out of hot paths for clarity & performance)
// ---------------------------------------------------------------------------

/**
 * Maps a day's Chi index (0-11) to the six auspicious hour indices (Giờ Hoàng Đạo).
 * Pairs sharing the same hour set are listed together (e.g. 0 & 6 both map to Tý–Ngọ axis).
 */
const GIO_HD_MAP: Readonly<Record<number, readonly number[]>> = {
  0: [0, 1, 3, 6, 8, 9],  6: [0, 1, 3, 6, 8, 9],
  1: [2, 3, 5, 8, 10, 11], 7: [2, 3, 5, 8, 10, 11],
  2: [0, 1, 4, 5, 7, 10],  8: [0, 1, 4, 5, 7, 10],
  3: [0, 2, 3, 6, 7, 9],   9: [0, 2, 3, 6, 7, 9],
  4: [2, 4, 5, 8, 9, 11],  10: [2, 4, 5, 8, 9, 11],
  5: [0, 1, 4, 6, 7, 10],  11: [0, 1, 4, 6, 7, 10],
};

/** The 12 Directors (Thập Nhị Trực), in cycle order starting from Kiến. */
const TRUC_NAMES = [
  'Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp',
  'Phá', 'Nguy', 'Thành', 'Thâu', 'Khai', 'Bế',
] as const;

/**
 * Offset of each lunar month's Chi index within the 12-branch cycle.
 * Lunar month 1 starts at Dần (index 2), month 2 at Mão (index 3), etc.
 */
const MONTH_CHI_START: Readonly<Record<number, number>> = {
  1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7,
  7: 8, 8: 9, 9: 10, 10: 11, 11: 0, 12: 1,
};

const GOOD_TRUC = new Set(['Trừ', 'Định', 'Nguy', 'Thành', 'Khai']);
const BAD_TRUC  = new Set(['Phá', 'Bế', 'Chấp']);

// ---------------------------------------------------------------------------
// Holiday data
// ---------------------------------------------------------------------------

/** Traditional lunar holidays keyed as "day-month". */
export const VIETNAMESE_HOLIDAYS: Readonly<Record<string, string>> = {
  '1-1':  'Tết Nguyên Đán',
  '2-1':  'Tết Nguyên Đán',
  '3-1':  'Tết Nguyên Đán',
  '15-1': 'Rằm Tháng Giêng',
  '10-3': 'Giỗ Tổ Hùng Vương',
  '15-4': 'Lễ Phật Đản',
  '5-5':  'Tết Đoan Ngọ',
  '15-7': 'Lễ Vu Lan',
  '15-8': 'Tết Trung Thu',
  '23-12':'Tết Táo Quân',
};

/** Public solar holidays keyed as "day-month". */
export const SOLAR_HOLIDAYS: Readonly<Record<string, string>> = {
  '1-1': 'Tết Dương Lịch',
  '30-4':'Giải phóng Miền Nam',
  '1-5': 'Quốc tế Lao động',
  '2-9': 'Quốc khánh',
};

// ---------------------------------------------------------------------------
// Activity rules (used by the auspicious-date picker)
// ---------------------------------------------------------------------------

export const ACTIVITY_RULES: Readonly<Record<string, {
  label: string;
  requiredStars: string[];
  forbiddenStars: string[];
  preferredTruc: string[];
}>> = {
  WEDDING:       { label: 'Cưới Hỏi',   requiredStars: [], forbiddenStars: [], preferredTruc: [] },
  GROUNDBREAKING:{ label: 'Khởi Công',  requiredStars: [], forbiddenStars: [], preferredTruc: [] },
  OPENING:       { label: 'Khai Trương', requiredStars: [], forbiddenStars: [], preferredTruc: [] },
};

// ---------------------------------------------------------------------------
// Core service functions
// ---------------------------------------------------------------------------

/** Converts a solar Date to a full LunarInfo object. */
export function getLunarInfo(date: Date): LunarInfo {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  const lunar = LunarCalendar.fromSolar(d, m, y);
  const dayChi = lunar.dayCanChi.split(' ')[1];
  const chiIndex = CHI.indexOf(dayChi);

  // --- Giờ Hoàng Đạo ---
  const hoursIndices = GIO_HD_MAP[chiIndex] ?? [];
  const gioHoangDao = hoursIndices.map(i => {
    const start = (i * 2 - 1 + 24) % 24;
    const end   = (i * 2 + 1) % 24;
    return `${CHI[i]} (${start}h-${end}h)`;
  });

  // --- Thập Nhị Trực ---
  const monthChiIdx = MONTH_CHI_START[Math.abs(lunar.lunarDate.month)] ?? 0;
  const dayChiIdx   = CHI.indexOf(dayChi);
  const truc        = TRUC_NAMES[(dayChiIdx - monthChiIdx + 12) % 12];

  // --- Day rating ---
  const rating: LunarInfo['rating'] = GOOD_TRUC.has(truc)
    ? 'good'
    : BAD_TRUC.has(truc)
    ? 'bad'
    : 'neutral';

  // --- Activity suitability ---
  const activities: LunarInfo['activities'] = {
    wedding: rating === 'good' && ['Thành', 'Định', 'Mãn'].includes(truc),
    moving:  rating === 'good' && ['Khai',  'Thành', 'Kiến'].includes(truc),
    opening: rating === 'good' && ['Khai',  'Mãn',   'Thành'].includes(truc),
  };

  return {
    solarDate:    date,
    lunarDay:     lunar.lunarDate.day,
    lunarMonth:   lunar.lunarDate.month,
    lunarYear:    lunar.lunarDate.year,
    isLeap:       lunar.lunarDate.leap,
    // @dqcai/vn-lunar has a typo: "Bình" instead of "Bính" (丙) in its CAN array
    canChiDay:    lunar.dayCanChi.replace(/^Bình /, 'Bính '),
    canChiMonth:  lunar.monthCanChi.replace(/^Bình /, 'Bính '),
    canChiYear:   lunar.yearCanChi.replace(/^Bình /, 'Bính '),
    tietKhi:      'Đang cập nhật',
    gioHoangDao,
    stars:        [],
    truc,
    rating,
    activities,
  };
}

/** Returns the holiday name for a given lunar/solar date pair, or undefined. */
export function getHoliday(
  lunarDay: number,
  lunarMonth: number,
  solarDay: number,
  solarMonth: number,
): string | undefined {
  const lunarKey = `${lunarDay}-${Math.abs(lunarMonth)}`;
  const solarKey = `${solarDay}-${solarMonth}`;
  return VIETNAMESE_HOLIDAYS[lunarKey] ?? SOLAR_HOLIDAYS[solarKey];
}

/** Activity key → LunarInfo activities field mapping. */
const ACTIVITY_FIELD_MAP: Readonly<Record<string, keyof LunarInfo['activities']>> = {
  WEDDING:       'wedding',
  GROUNDBREAKING:'moving',
  OPENING:       'opening',
};

/**
 * Scans forward from today and returns up to 10 auspicious dates for the
 * given activity within `monthsToScan * 31` days.
 *
 * Dates where the Truc matches the activity get score 10; generically good
 * days get score 7.
 */
export function findBestDates(activityKey: string, monthsToScan = 3): AuspiciousDate[] {
  const activityField = ACTIVITY_FIELD_MAP[activityKey];
  const results: AuspiciousDate[] = [];
  const cursor = new Date();

  for (let i = 0; i < monthsToScan * 31; i++) {
    const info = getLunarInfo(cursor);

    const include = activityField
      ? info.activities[activityField]          // activity selected: only exact matches (score 10)
      : info.rating === 'good';                 // no activity: all good-rated days

    if (include) {
      results.push({
        date:      new Date(cursor),
        lunarDate: `${info.lunarDay}/${info.lunarMonth}`,
        score:     activityField ? 10 : 7,
        stars:     [],
        truc:      info.truc,
        rating:    info.rating,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
    if (results.length >= 10) break;
  }

  return results;
}

/**
 * Scans forward from today and returns up to `maxCount` upcoming lunar/solar
 * holiday events within `daysToScan` days (inclusive of today).
 */
export function getUpcomingEvents(maxCount = 10, daysToScan = 180): UpcomingEvent[] {
  const results: UpcomingEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);

  for (let i = 0; i < daysToScan && results.length < maxCount; i++) {
    const d = cursor.getDate();
    const m = cursor.getMonth() + 1;
    const daysUntil = i;

    const solarKey = `${d}-${m}`;
    if (SOLAR_HOLIDAYS[solarKey]) {
      results.push({
        solarDate: new Date(cursor),
        title: SOLAR_HOLIDAYS[solarKey],
        source: 'solar',
        daysUntil,
      });
      if (results.length >= maxCount) break;
    }

    const lunar = LunarCalendar.fromSolar(d, m, cursor.getFullYear());
    const ld = lunar.lunarDate.day;
    const lm = Math.abs(lunar.lunarDate.month);
    const lunarKey = `${ld}-${lm}`;
    if (VIETNAMESE_HOLIDAYS[lunarKey]) {
      results.push({
        solarDate: new Date(cursor),
        title: VIETNAMESE_HOLIDAYS[lunarKey],
        lunarDay: ld,
        lunarMonth: lm,
        source: 'lunar',
        daysUntil,
      });
    } else if (ld === 1 && lm !== 1 && results.length < maxCount) {
      // Mồng 1 (new moon) — skip if already a named holiday or lunar 1/1
      results.push({
        solarDate: new Date(cursor),
        title: `Mồng 1 tháng ${lm}`,
        lunarDay: ld,
        lunarMonth: lm,
        source: 'lunar',
        daysUntil,
      });
    } else if (ld === 15 && lm !== 1 && results.length < maxCount) {
      // Ngày rằm (full moon) — skip if already a named holiday or lunar 15/1
      results.push({
        solarDate: new Date(cursor),
        title: `Ngày rằm tháng ${lm}`,
        lunarDay: ld,
        lunarMonth: lm,
        source: 'lunar',
        daysUntil,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return results.slice(0, maxCount);
}
