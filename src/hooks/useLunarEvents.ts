import { useState, useEffect } from 'react';
import { LunarEvent } from '../types';

const STORAGE_KEY = 'lunarEvents';

function load(): LunarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LunarEvent[]) : [];
  } catch {
    return [];
  }
}

/**
 * Manages user-defined lunar events (anniversaries, giỗ, etc.)
 * persisted to localStorage.
 */
export function useLunarEvents() {
  const [events, setEvents] = useState<LunarEvent[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, [events]);

  function addEvent(draft: Omit<LunarEvent, 'id' | 'createdAt'>): void {
    setEvents(prev => [
      ...prev,
      { ...draft, id: crypto.randomUUID(), createdAt: Date.now() },
    ]);
  }

  function deleteEvent(id: string): void {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  function updateEvent(id: string, patch: Partial<Omit<LunarEvent, 'id' | 'createdAt'>>): void {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  }

  return { events, addEvent, deleteEvent, updateEvent };
}
