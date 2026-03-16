import { useState, useEffect } from 'react';
import { PresetId, PRESET_DEFINITIONS } from '../constants/presets';
import { LunarEvent } from '../types';

const STORAGE_KEY = 'lunarPresets';

function loadEnabled(): Set<PresetId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as PresetId[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useLunarPresets() {
  const [enabled, setEnabled] = useState<Set<PresetId>>(loadEnabled);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
    } catch { /* quota */ }
  }, [enabled]);

  function toggle(id: PresetId) {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  /** All LunarEvent entries for currently enabled presets */
  const expandedPresets: LunarEvent[] = PRESET_DEFINITIONS
    .filter(p => enabled.has(p.id))
    .flatMap(p => p.events);

  return { enabled, toggle, expandedPresets };
}
