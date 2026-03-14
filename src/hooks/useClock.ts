import { useState, useEffect, useMemo } from 'react';
import { CHI_NAMES } from '../constants/calendar';

/**
 * Returns the current wall-clock time (updated every second) and the
 * corresponding traditional Vietnamese hour name (Giờ Can Chi).
 */
export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTraditionalHour = useMemo(() => {
    const index = Math.floor((now.getHours() + 1) / 2) % 12;
    return CHI_NAMES[index];
  }, [now]);

  return { now, currentTraditionalHour };
}
