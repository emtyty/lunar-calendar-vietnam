# Lịch Âm Việt Nam

A Vietnamese lunar calendar single-page application built with React 19, TypeScript, and Tailwind CSS 4. View lunar/solar dates side-by-side, find auspicious dates for important events, manage personal notes, and export recurring lunar anniversaries to Google Calendar.

---

## Features

### Calendar
- **Monthly calendar grid** with solar and lunar dates displayed together
- **Week numbers** (ISO standard)
- Navigate by month or jump directly via month/year selectors
- **"Today" shortcut** button

### Day Detail (Sidebar)
- Large solar and lunar date display
- **Can Chi** for year, month, and day (Heavenly Stems & Earthly Branches)
- **Trực** (Thập Nhị Trực / 12 Directors) with good/neutral/bad rating
- **Giờ Hoàng Đạo** — six auspicious hours for the day
- Recommended activities: Cưới hỏi, Chuyển nhà, Khai trương
- Vietnamese lunar and solar **holiday badges**
- **Live clock** with current traditional hour (Giờ)

### Zodiac Clash (Xung Tuổi)
- Select your zodiac (tuổi) — persisted to localStorage across sessions
- Sidebar warning when the selected date clashes with your zodiac (Lục Xung rule)
- **Frown icon on calendar cells** marking every clashing day at a glance

### Auspicious Date Finder (Chọn Ngày Tốt)
- Search upcoming good dates for **Cưới Hỏi**, **Khởi Công**, or **Khai Trương**
- Results ranked by activity-specific Trực match (5-star = perfect fit)
- Click a result to jump directly to that date on the calendar

### Quick Date Picker
- Navigate by clicking any solar or lunar field
- Mini calendar with good/bad day indicators
- Lunar ↔ solar two-way conversion

### Personal Notes
- Add free-text notes to any calendar day
- Notes persist in **localStorage** — no account needed
- Sticky-note icon appears on calendar cells that have notes

### Lunar Event Export (Google Calendar Sync)
- Save recurring **lunar anniversaries** (giỗ, sinh nhật âm lịch, etc.) with title, lunar day/month, and optional leap-month flag
- Select **1–30 years** to generate using a slider — the app resolves the correct solar date individually for each year (since lunar dates shift annually)
- Downloads a standard **RFC 5545 `.ics` file** importable into Google Calendar, Apple Calendar, Outlook, and any calendar app
- Skipped years (e.g. leap month absent in a given year) are listed with a clear explanation

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Lunar library | `@dqcai/vn-lunar` |
| Date utilities | `date-fns` |
| Icons | `lucide-react` |
| Class merging | `clsx` + `tailwind-merge` |

---

## Project Structure

```
src/
├── App.tsx                          # Root orchestrator — calendar grid + modal state
├── main.tsx
├── index.css
├── types.ts                         # LunarInfo, AuspiciousDate, UserNote, LunarEvent
├── constants/
│   └── calendar.ts                  # CHI_NAMES, WEEK_DAYS, YEAR_RANGE
├── lib/
│   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
├── hooks/
│   ├── useClock.ts                  # Live clock + current traditional hour
│   ├── useNotes.ts                  # Per-day notes CRUD + localStorage
│   └── useLunarEvents.ts            # Lunar event CRUD + localStorage
├── services/
│   ├── lunarService.ts              # getLunarInfo, findBestDates, ACTIVITY_RULES
│   └── icsService.ts                # RFC 5545 ICS generation + download
└── components/
    ├── Sidebar.tsx                  # Left panel
    └── modals/
        ├── QuickDatePickerModal.tsx
        ├── AuspiciousDateModal.tsx
        ├── LunarEventModal.tsx
        └── AboutModal.tsx
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

Opens at **http://localhost:3000**. The server is accessible on the local network at the IP shown in the terminal output.

### Type check

```bash
npm run lint
```

### Build for production

```bash
npm run build
```

Output is written to `dist/`. Serve it with any static file host.

### Preview the production build locally

```bash
npm run preview
```

---

## Exporting to Google Calendar

1. Click **"Xuất sự kiện âm lịch"** in the sidebar.
2. Add one or more lunar events (title + lunar day/month).
3. Use the slider to choose how many years to generate (default: 5).
4. Click **"Tải file .ics"** — a file named `lich-am-su-kien-YYYY-YYYY.ics` downloads automatically.
5. In Google Calendar: **Settings → Import & export → Import** → select the file.

Each year gets its own calendar entry on the correct solar date, since a fixed lunar date falls on a different solar date every year.

---

## License

MIT
