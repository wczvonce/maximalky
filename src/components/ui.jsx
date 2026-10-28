import React from 'react';
import { chartGeometry, PERIODS } from '../lib/calc.js';

export function ProgressChart({ pts, axis = true, h }) {
  const c = chartGeometry(pts, { axis, h });
  if (!axis) {
    return (
      <svg viewBox={c.viewBox} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 10 }} aria-hidden="true">
        {c.segs.map((s, i) => <path key={i} d={s.d} stroke={s.color} strokeWidth="2.5" fill="none" />)}
        {c.dots.map(d => <circle key={d.key} cx={d.x} cy={d.y} r="2.5" fill={d.fill} stroke="var(--color-text)" strokeWidth="1.5" />)}
      </svg>
    );
  }
  return (
    <svg viewBox={c.viewBox} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 12, overflow: 'visible', fontFamily: 'var(--font-body)' }}
      role="img" aria-label="Graf vývoja">
      {c.grid.map((g, i) => <line key={'l' + i} x1={c.x0} x2={c.x1} y1={g.y} y2={g.y} stroke="var(--color-neutral-300)" strokeWidth="1" />)}
      {c.grid.map((g, i) => <text key={'t' + i} x="0" y={g.ty} fill="var(--color-neutral-700)" fontSize="10" className="num">{g.label}</text>)}
      {c.trend && <path d={c.trend} stroke="var(--color-neutral-500)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />}
      {c.segs.map((s, i) => <path key={'s' + i} d={s.d} stroke={s.color} strokeWidth="2.5" fill="none" />)}
      {c.dots.map(d => <circle key={d.key} cx={d.x} cy={d.y} r="4" fill={d.fill} stroke="var(--color-text)" strokeWidth="2" />)}
      {c.recs.map(d => <rect key={'r' + d.key} x={d.rx} y={d.ry} width="9" height="9" fill="var(--color-accent)" />)}
      {c.callouts.map((t, i) => (
        <text key={'c' + i} x={t.x} y={t.y} fill={t.color} fontSize="13" fontWeight="800" textAnchor={t.anchor}
          style={{ fontFamily: 'var(--font-heading)', fontVariantNumeric: 'tabular-nums' }}>{t.label}</text>
      ))}
      {c.xticks.map((t, i) => (
        <text key={'x' + i} x={t.x} y={t.y} fill="var(--color-neutral-700)" fontSize="10" textAnchor={t.anchor} className="num">{t.label}</text>
      ))}
    </svg>
  );
}

export function PeriodSwitch({ value, onChange, style }) {
  return (
    <div className="grid-choice" style={{ gridTemplateColumns: 'repeat(5,1fr)', ...style }}>
      {PERIODS.map(([name]) => (
        <button key={name} className={'choice center' + (value === name ? ' on' : '')} style={{ minHeight: 40, fontSize: 12 }}
          onClick={() => onChange(name)}>{name}</button>
      ))}
    </div>
  );
}

export function Dialog({ title, children, actions, onClose }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">{actions}</div>
      </div>
    </div>
  );
}

export const Chevron = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
);
