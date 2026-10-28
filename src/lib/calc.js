// Number/date formatting, 1RM estimates and the progress-chart geometry.

export const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

export const unitLabel = (unit) => (unit === '+kg' ? '+kg' : unit);

export const perfLabel = (v, unit) => (unit === '+kg' ? '+' + fmt(v) + ' kg' : fmt(v) + ' ' + unit);

export function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const DAY = 86400000;

export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);

// "24. 10." in the current year, "24. 10. 2025" otherwise.
export function dateLabel(iso, withYear) {
  const d = parse(iso);
  const s = d.getDate() + '. ' + (d.getMonth() + 1) + '.';
  return withYear || d.getFullYear() !== new Date().getFullYear() ? s + ' ' + d.getFullYear() : s;
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

// Estimated 1RM. A single rep is the max itself, whatever the formula.
export function est(weight, reps, formula) {
  if (reps <= 1) return weight;
  if (formula === 'Brzycki') return reps >= 37 ? weight : weight * 36 / (37 - reps);
  return weight * (1 + reps / 30);
}

// The comparable value of one entry: e1RM for weights, the raw number for cm.
export function entryValue(e, unit, formula) {
  if (unit === 'cm' || e.kind === 'test') return e.weight;
  return Math.round(est(e.weight, e.reps, formula) * 2) / 2;
}

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.createdAt || 0) - (b.createdAt || 0));

// Chronological points for one exercise, each flagged as a record when it beats every earlier one.
export function series(entries, ex, formula) {
  let best = -Infinity;
  return entries.filter(e => e.exId === ex.id && !e.deleted).sort(byDate).map((e, i) => {
    const v = entryValue(e, ex.unit, formula);
    const rec = i > 0 && v > best;
    best = Math.max(best, v);
    return { id: e.id, date: e.date, d: dateLabel(e.date), v, kind: e.kind, rec, entry: e };
  });
}

export const PERIODS = [['1M', 30], ['3M', 91], ['6M', 183], ['1R', 365], ['Všetko', Infinity]];

export function inPeriod(pts, period) {
  const days = (PERIODS.find(p => p[0] === period) || PERIODS[4])[1];
  const t = todayISO();
  return pts.filter(p => daysBetween(p.date, t) <= days);
}

// Linear regression of value over days; returns slope per day.
function regress(pts) {
  if (pts.length < 2) return { slope: 0, at: () => (pts[0] ? pts[0].v : 0) };
  const t0 = pts[0].date;
  const xs = pts.map(p => daysBetween(t0, p.date));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = pts.reduce((a, p) => a + p.v, 0) / pts.length;
  let num = 0, den = 0;
  xs.forEach((x, i) => { num += (x - mx) * (pts[i].v - my); den += (x - mx) * (x - mx); });
  const slope = den ? num / den : 0;
  return { slope, at: (x) => my + slope * (x - mx) };
}

export function paceLabel(pts, unit) {
  const u = unit === 'cm' ? 'cm' : 'kg';
  const s = regress(pts).slope * 30.4;
  return (s >= 0 ? '+' : '−') + fmt(Math.abs(s)) + ' ' + u + ' / mesiac';
}

// SVG geometry for the progress chart, ported from the design prototype; x is proportional to time.
export function chartGeometry(d, opts = {}) {
  const axis = opts.axis !== false;
  const W = 360, H = opts.h || 182;
  const PL = axis ? 34 : 5, PR = axis ? 12 : 5, PT = axis ? 22 : 7, PB = axis ? 24 : 7;
  const vs = d.map(p => p.v);
  const rawLo = Math.min(...vs), rawHi = Math.max(...vs);
  const pad = Math.max(2.5, (rawHi - rawLo) * 0.2);
  const lo = Math.floor((rawLo - pad) / 5) * 5, hi = Math.ceil((rawHi + pad) / 5) * 5;
  const t0 = d.length ? d[0].date : '';
  const span = d.length > 1 ? daysBetween(t0, d[d.length - 1].date) : 0;
  const xs = d.map((p, i) => (d.length < 2 ? (PL + W - PR) / 2
    : span ? PL + daysBetween(t0, p.date) / span * (W - PL - PR) : PL + i * (W - PL - PR) / (d.length - 1)));
  const x = (i) => xs[i];
  const y = (v) => PT + (hi - v) / (hi - lo || 1) * (H - PT - PB);
  const P = (n) => n.toFixed(1);

  const segs = d.slice(1).map((p, i) => ({
    d: 'M' + P(x(i)) + ' ' + P(y(d[i].v)) + ' L' + P(x(i + 1)) + ' ' + P(y(p.v)),
    color: p.v > d[i].v ? 'var(--color-accent)' : p.v < d[i].v ? 'var(--color-neutral-700)' : 'var(--color-neutral-500)',
  }));

  const r = regress(d);
  const xEnd = d.length > 1 ? daysBetween(t0, d[d.length - 1].date) : 0;
  const trend = d.length > 1
    ? 'M' + P(x(0)) + ' ' + P(y(r.at(0))) + ' L' + P(x(d.length - 1)) + ' ' + P(y(r.at(xEnd))) : '';

  const anchor = (px) => (px < PL + 34 ? 'start' : px > W - PR - 34 ? 'end' : 'middle');
  const iMax = vs.indexOf(rawHi), iLast = d.length - 1;
  const callouts = [];
  if (d.length) {
    callouts.push({ x: P(x(iMax)), y: P(y(rawHi) - (d[iMax].rec ? 26 : 10)), anchor: anchor(x(iMax)), label: fmt(rawHi), color: 'var(--color-accent-700)' });
    if (iLast !== iMax) callouts.push({ x: P(x(iLast)), y: P(y(d[iLast].v) - (d[iLast].rec ? 26 : 10)), anchor: anchor(x(iLast)), label: fmt(d[iLast].v), color: 'var(--color-text)' });
  }

  // Date ticks: first, last and up to two in between, dropping any that would collide.
  const every = Math.max(1, Math.ceil(d.length / 4));
  const xticks = [];
  d.forEach((p, i) => {
    if (i % every !== 0 && i !== iLast) return;
    const prev = xticks[xticks.length - 1];
    if (prev && x(i) - prev.px < 52) { if (i === iLast) xticks.pop(); else return; }
    xticks.push({ px: x(i), x: P(x(i)), y: P(H - 7), anchor: anchor(x(i)), label: p.d });
  });

  return {
    viewBox: '0 0 ' + W + ' ' + H, x0: PL, x1: W - PR, segs, trend, callouts, xticks,
    grid: [0, 1, 2, 3].map(i => ({
      y: P(PT + i * (H - PT - PB) / 3), ty: P(PT + i * (H - PT - PB) / 3 + 4), label: fmt(hi - i * (hi - lo) / 3),
    })),
    dots: d.map((p, i) => ({ key: p.id, x: P(x(i)), y: P(y(p.v)), fill: p.kind === 'test' ? 'var(--color-text)' : 'var(--color-bg)' })),
    recs: d.map((p, i) => ({ p, i })).filter(t => t.p.rec).map(t => ({ key: t.p.id, rx: P(x(t.i) - 4.5), ry: P(y(t.p.v) - 22) })),
    rangeLabel: d.length ? fmt(rawLo) + '–' + fmt(rawHi) : '',
  };
}

export const trendArrow = (pts) => {
  if (pts.length < 2) return '';
  const a = pts[pts.length - 2].v, b = pts[pts.length - 1].v;
  return b > a ? '↑' : b < a ? '↓' : '→';
};

export const trendColor = (t) => (t === '↑' ? 'var(--color-accent-700)' : 'var(--color-neutral-700)');

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

// Slovak plural forms: plural(3, 'krok', 'kroky', 'krokov') → "3 kroky".
export const plural = (n, one, few, many) => n + ' ' + (n === 1 ? one : n >= 2 && n <= 4 ? few : many);

export function timeLabel(ms) {
  const d = new Date(ms);
  return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
