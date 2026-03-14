export interface LunarInfo {
  solarDate: Date;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeap: boolean;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  tietKhi: string;
  gioHoangDao: string[];
  isHoliday?: string;
  stars: string[];
  truc: string;
  rating: 'good' | 'neutral' | 'bad';
  activities: {
    wedding: boolean;
    moving: boolean;
    opening: boolean;
  };
}

export interface AuspiciousDate {
  date: Date;
  lunarDate: string;
  score: number;
  stars: string[];
  truc: string;
  rating: 'good' | 'neutral' | 'bad';
}

export interface DayRating {
  name: string;
  description: string;
  isGood: boolean;
}

export interface UserNote {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  content: string;
  createdAt: number;
}

export interface LunarEvent {
  id: string;
  title: string;
  lunarDay: number;       // 1-30
  lunarMonth: number;     // 1-12 (always positive; leap stored separately)
  isLeapMonth: boolean;
  createdAt: number;
}
