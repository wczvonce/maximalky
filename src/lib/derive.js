import { useMemo } from 'react';
import { useStore } from '../store.jsx';
import { series, todayISO, daysBetween } from './calc.js';

// Per-exercise chronological series plus a flat, newest-first list of every point.
export function useDerived() {
  const { exercises, entries, settings } = useStore();
  return useMemo(() => {
    const exById = Object.fromEntries(exercises.map(e => [e.id, e]));
    const seriesById = {};
    const all = [];
    for (const ex of exercises) {
      const pts = series(entries, ex, settings.formula);
      seriesById[ex.id] = pts;
      pts.forEach((p, i) => all.push({ ...p, ex, prev: i ? pts[i - 1] : null }));
    }
    all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.entry.createdAt || 0) - (a.entry.createdAt || 0)));
    const visible = exercises.filter(e => !e.archived);
    const today = todayISO();
    const best = (id) => {
      const pts = seriesById[id] || [];
      return pts.length ? Math.max(...pts.map(p => p.v)) : null;
    };
    const lastDays = (id) => {
      const pts = seriesById[id] || [];
      return pts.length ? daysBetween(pts[pts.length - 1].date, today) : null;
    };
    return { exById, seriesById, all, visible, best, lastDays };
  }, [exercises, entries, settings.formula]);
}
