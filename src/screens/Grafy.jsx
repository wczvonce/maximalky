import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { useDerived } from '../lib/derive.js';
import { fmt, inPeriod, MONTHS } from '../lib/calc.js';
import { PeriodSwitch } from '../components/ui.jsx';

const pctLabel = (p) => (p >= 0 ? '+' : '−') + Math.abs(Math.round(p)) + ' %';
const pctColor = (p) => (p >= 10 ? 'var(--color-accent)' : p >= 0 ? 'var(--color-accent-500)' : 'var(--color-neutral-700)');

export default function Grafy() {
  const { settings } = useStore();
  const { visible, seriesById, all } = useDerived();
  const [period, setPeriod] = useState('6M');

  // Improvement from the first to the last entry inside the period.
  const compare = visible.map(e => {
    const pts = inPeriod(seriesById[e.id] || [], period);
    if (pts.length < 2 || !pts[0].v) return null;
    return { e, pct: (pts[pts.length - 1].v - pts[0].v) / pts[0].v * 100 };
  }).filter(Boolean).sort((a, b) => b.pct - a.pct).slice(0, 5);
  const top = Math.max(1, ...compare.map(c => Math.abs(c.pct)));

  const relative = visible.filter(e => e.unit === 'kg').map(e => {
    const pts = inPeriod(seriesById[e.id] || [], period);
    return pts.length ? { e, x: Math.max(...pts.map(p => p.v)) / settings.bw } : null;
  }).filter(Boolean).sort((a, b) => b.x - a.x).slice(0, 5);

  // Entries per month for the last 8 months, the current month last.
  const now = new Date();
  const months = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    return { key, label: MONTHS[d.getMonth()], n: all.filter(p => p.date.startsWith(key)).length };
  });
  const peak = Math.max(1, ...months.map(m => m.n));

  return (
    <div>
      <div className="head">
        <h1 className="h1">Grafy</h1>
        <PeriodSwitch value={period} onChange={setPeriod} style={{ marginTop: 14 }} />
      </div>

      <div className="rule" style={{ padding: '18px 16px' }}>
        <div className="kicker">Porovnanie cvikov · zlepšenie</div>
        {compare.length === 0 && <p className="muted" style={{ margin: '10px 0 0' }}>Na porovnanie treba aspoň dva zápisy toho istého cviku v zvolenom období.</p>}
        {compare.map(c => (
          <div key={c.e.id} style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ font: '400 12px/1 var(--font-body)', flex: 1 }}>{c.e.name}</span>
              <span className="num" style={{ font: '800 13px/1 var(--font-heading)', color: pctColor(c.pct) }}>{pctLabel(c.pct)}</span>
            </div>
            <div style={{ height: 10, background: 'var(--color-neutral-200)', marginTop: 5 }}>
              <div style={{ height: 10, width: Math.max(4, Math.abs(c.pct) / top * 100) + '%', background: pctColor(c.pct) }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rule" style={{ padding: '18px 16px' }}>
        <div className="kicker">Relatívna sila · {fmt(settings.bw)} kg</div>
        {relative.length === 0 && <p className="muted" style={{ margin: '10px 0 0' }}>Zatiaľ žiadne zápisy v kg v tomto období.</p>}
        {relative.map(r => (
          <div key={r.e.id} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '10px 0', borderTop: '1px solid var(--color-divider)', marginTop: 4 }}>
            <span style={{ font: '400 13px/1 var(--font-body)', flex: 1 }}>{r.e.name}</span>
            <span className="num" style={{ font: '800 20px/1 var(--font-heading)' }}>{r.x.toFixed(2).replace('.', ',')}×</span>
            <span className="muted" style={{ lineHeight: 1 }}>telesnej váhy</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '18px 16px 24px' }}>
        <div className="kicker">Kedy som sa testoval</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, marginTop: 14, borderBottom: '2px solid var(--color-divider)' }}>
          {months.map((m, i) => (
            <div key={m.key} title={m.label + ': ' + m.n}
              style={{ flex: 1, height: (m.n / peak * 100) + '%', background: i === months.length - 1 ? 'var(--color-accent)' : 'var(--color-neutral-400)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 11px/1 var(--font-body)', color: 'var(--color-neutral-700)', marginTop: 6 }}>
          <span>{months[0].label}</span><span>{months[months.length - 1].label}</span>
        </div>
        <p className="muted" style={{ margin: '12px 0 0' }}>Počet zápisov za mesiac. Červený stĺpec je aktuálny mesiac.</p>
      </div>
    </div>
  );
}
