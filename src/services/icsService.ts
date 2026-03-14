import { getSolarDate } from '@dqcai/vn-lunar';
import { getLunarInfo } from './lunarService';
import { LunarEvent } from '../types';

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ResolvedEventYear {
  skipped: false;
  solarYear: number;
  solarDate: { year: number; month: number; day: number };
}

export interface SkippedEventYear {
  skipped: true;
  solarYear: number;
  title: string;
  reason: 'leap_month_not_found' | 'conversion_error';
}

export type EventYearResult = ResolvedEventYear | SkippedEventYear;

export interface ExportSummary {
  totalEvents: number;
  skippedCount: number;
  skippedReasons: SkippedEventYear[];
}

// ---------------------------------------------------------------------------
// ICS text helpers
// ---------------------------------------------------------------------------

/** Escape special characters in RFC 5545 TEXT values. */
function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold an ICS property line at 75 UTF-8 bytes per RFC 5545.
 * Continuation lines start with a single space.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let remaining = line;
  let maxBytes = 75;

  while (true) {
    const bytes = encoder.encode(remaining);
    if (bytes.length <= maxBytes) {
      parts.push(remaining);
      break;
    }
    // Find the split point at maxBytes bytes without cutting a multi-byte char
    let byteCount = 0;
    let splitAt = 0;
    for (const char of remaining) {
      const charLen = encoder.encode(char).length;
      if (byteCount + charLen > maxBytes) break;
      byteCount += charLen;
      splitAt += char.length;
    }
    parts.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
    maxBytes = 74; // continuation lines: space prefix takes 1 byte
  }

  return parts.join('\r\n ');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateString(y: number, m: number, d: number): string {
  return `${y}${pad2(m)}${pad2(d)}`;
}

function nextDay(y: number, m: number, d: number): string {
  const dt = new Date(y, m - 1, d + 1);
  return toDateString(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

function utcStamp(): string {
  const now = new Date();
  return (
    `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}` +
    `T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`
  );
}

// ---------------------------------------------------------------------------
// Core resolution logic
// ---------------------------------------------------------------------------

/**
 * Resolves the solar date for a lunar event across a range of solar years.
 *
 * Strategy: probe June 15 of each solar year to get a stable lunarYear
 * (well past Tết, avoiding the Jan–Feb ambiguity window), then call
 * LunarCalendar.toSolar with the event's lunar day/month/year.
 */
export function resolveEventYears(
  event: LunarEvent,
  startYear: number,
  yearCount: number,
): EventYearResult[] {
  const results: EventYearResult[] = [];

  for (let i = 0; i < yearCount; i++) {
    const solarYear = startYear + i;

    try {
      const probe = getLunarInfo(new Date(solarYear, 5, 15)); // June 15
      const lunarYear = probe.lunarYear;

      const solar = getSolarDate(event.lunarDay, event.lunarMonth, lunarYear, event.isLeapMonth);

      // Validate the result is a plausible calendar date
      if (
        !solar ||
        solar.year < 1900 || solar.year > 2100 ||
        solar.month < 1   || solar.month > 12  ||
        solar.day < 1     || solar.day > 31
      ) {
        results.push({ skipped: true, solarYear, title: event.title, reason: 'conversion_error' });
        continue;
      }

      results.push({ skipped: false, solarYear, solarDate: solar });
    } catch {
      results.push({
        skipped: true,
        solarYear,
        title: event.title,
        reason: event.isLeapMonth ? 'leap_month_not_found' : 'conversion_error',
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// ICS formatting
// ---------------------------------------------------------------------------

function formatVEvent(event: LunarEvent, resolved: ResolvedEventYear, dtstamp: string): string {
  const { year, month, day } = resolved.solarDate;
  const dtstart = toDateString(year, month, day);
  const dtend   = nextDay(year, month, day);

  const leapTag = event.isLeapMonth ? ' Nhuận' : '';
  const summary = escapeText(
    `${event.title} (Âm ${event.lunarDay}/${event.lunarMonth}${leapTag})`,
  );
  const description = escapeText(
    `Sự kiện âm lịch ngày ${event.lunarDay} tháng ${event.lunarMonth}${leapTag}\nTạo bởi Lịch Âm Việt Nam`,
  );

  const lines = [
    'BEGIN:VEVENT',
    foldLine(`UID:${event.id}-${resolved.solarYear}@lunar-vn`),
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    foldLine(`SUMMARY:${summary}`),
    foldLine(`DESCRIPTION:${description}`),
    'END:VEVENT',
  ];

  return lines.join('\r\n');
}

function wrapVCalendar(vevents: string[]): string {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lịch Âm Việt Nam//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine('X-WR-CALNAME:Sự kiện âm lịch Việt Nam'),
  ].join('\r\n');

  return `${header}\r\n${vevents.join('\r\n')}\r\nEND:VCALENDAR`;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Generates an ICS file for all saved lunar events across `yearCount` years
 * starting from `startYear`, then triggers a browser download.
 */
export function generateAndDownloadICS(
  events: LunarEvent[],
  startYear: number,
  yearCount: number,
): ExportSummary {
  const dtstamp = utcStamp();
  const vevents: string[] = [];
  const skippedReasons: SkippedEventYear[] = [];
  let totalEvents = 0;

  for (const event of events) {
    const results = resolveEventYears(event, startYear, yearCount);
    for (const result of results) {
      if (result.skipped === true) {
        skippedReasons.push(result);
      } else {
        vevents.push(formatVEvent(event, result, dtstamp));
        totalEvents++;
      }
    }
  }

  const icsContent = wrapVCalendar(vevents);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `lich-am-su-kien-${startYear}-${startYear + yearCount - 1}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { totalEvents, skippedCount: skippedReasons.length, skippedReasons };
}
