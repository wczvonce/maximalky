import React from 'react';
import { useStore } from '../store.jsx';
import { useApp } from '../lib/appContext.js';
import { useDerived } from '../lib/derive.js';
import { fmt, perfLabel, paceLabel, dateLabel, todayISO, trendColor, plural } from '../lib/calc.js';
import { ExerciseThumb } from '../components/Pictogram.jsx';
import { ProgressChart, Chevron } from '../components/ui.jsx';

const kindLabel = (p) => (p.kind === 'test' ? 'testované' : 'zo série');

function heroDetail(p) {
  if (p.ex.unit === 'cm') return p.ex.name + ' · výkon';
  if (p.kind === 'test') return p.ex.name + ' · testované 1RM';
  const w = p.ex.unit === '+kg' ? '+' + fmt(p.entry.weight) : fmt(p.entry.weight);
  return p.ex.name + ' · odhadované 1RM · ' + w + ' kg × ' + p.entry.reps;
}

const arrow = (p) => (!p.prev ? '' : p.v > p.prev.v ? '↑' : p.v < p.prev.v ? '↓' : '→');

export default function Home() {
  const { settings, images } = useStore();
  const app = useApp();
  const { all, seriesById, visible, lastDays, best } = useDerived();

  const month = todayISO().slice(0, 7);
  const prMonth = all.filter(p => p.rec && p.date.slice(0, 7) === month).length;
  const hero = all.find(p => p.rec) || all[0] || null;

  // The home chart follows the exercise with the most entries (bench press in the design).
  const chartEx = visible
    .map(e => ({ e, n: (seriesById[e.id] || []).length }))
    .filter(x => x.n >= 2)
    .sort((a, b) => b.n - a.n || (b.e.id === 'bench') - (a.e.id === 'bench'))[0];
  const chartPts = chartEx ? seriesById[chartEx.e.id] : [];

  const stale = visible
    .map(e => ({ e, days: lastDays(e.id) }))
    .filter(x => x.days !== null && x.days >= 35)
    .sort((a, b) => b.days - a.days)
    .slice(0, 3);

  return (
    <div>
      <div style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', padding: '18px 16px 20px' }}>
        {hero ? (
          <>
            <div style={{ font: '400 10px/1 var(--font-body)', letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.9 }}>
              {hero.rec ? 'Posledný rekord' : 'Posledný zápis'} · {dateLabel(hero.date)}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
              <span className="num" style={{ font: '800 54px/.9 var(--font-heading)', letterSpacing: '-.03em' }}>
                {hero.ex.unit === '+kg' ? '+' : ''}{fmt(hero.v)}
              </span>
              <span style={{ font: '800 20px/1 var(--font-heading)' }}>{hero.ex.unit === 'cm' ? 'cm' : 'kg'}</span>
            </div>
            <div style={{ font: '400 13px/1.3 var(--font-body)', marginTop: 8 }}>{heroDetail(hero)}</div>
          </>
        ) : (
          <>
            <div style={{ font: '400 10px/1 var(--font-body)', letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.9 }}>Zatiaľ bez zápisu</div>
            <div style={{ font: '800 34px/1 var(--font-heading)', letterSpacing: '-.02em', marginTop: 10 }}>Prvý test</div>
            <div style={{ font: '400 13px/1.3 var(--font-body)', marginTop: 8 }}>Zapíš maximálku a appka začne kresliť graf a hľadať rekordy.</div>
          </>
        )}
      </div>

      <button className="tap rule2" onClick={() => app.openZapis()}
        style={{ width: '100%', minHeight: 68, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
        <span style={{ font: '800 17px/1.1 var(--font-heading)', flex: 1 }}>Zapísať maximálku</span>
        <Chevron />
      </button>

      <div className="rule2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {[[prMonth, 'PR tento mesiac'], [all.length, 'Zápisov spolu'], [fmt(settings.bw), 'Hmotnosť kg']].map(([v, l], i) => (
          <div key={l} style={{ padding: '12px 16px', borderLeft: i ? '1px solid var(--color-divider)' : 0 }}>
            <div className="num" style={{ font: '800 26px/1 var(--font-heading)' }}>{v}</div>
            <div className="label" style={{ letterSpacing: '.1em', lineHeight: 1.2, marginTop: 5 }}>{l}</div>
          </div>
        ))}
      </div>

      {chartEx && (
        <button className="tap rule2" onClick={() => app.go('cvik/' + chartEx.e.id)}
          style={{ width: '100%', display: 'block', padding: '16px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="kicker" style={{ flex: 1 }}>{chartEx.e.name} · vývoj {chartEx.e.unit === 'cm' ? 'výkonu' : '1RM'}</span>
            <span className="num" style={{ font: '800 18px/1 var(--font-heading)' }}>{perfLabel(best(chartEx.e.id), chartEx.e.unit)}</span>
          </div>
          <ProgressChart pts={chartPts} axis={false} h={76} />
          <div className="num" style={{ display: 'flex', justifyContent: 'space-between', font: '400 11px/1 var(--font-body)', color: 'var(--color-neutral-700)', marginTop: 8 }}>
            <span>{plural(chartPts.length, 'zápis', 'zápisy', 'zápisov')} · od {chartPts[0].d}</span><span>{paceLabel(chartPts, chartEx.e.unit)}</span>
          </div>
        </button>
      )}

      <div className="sec"><div className="kicker">Posledné testy</div></div>
      {all.length === 0 && (
        <p className="muted" style={{ padding: '10px 16px 0', margin: 0 }}>Zatiaľ tu nič nie je. Po prvom zápise tu uvidíš, kedy si sa testoval a koľko ti vyšlo.</p>
      )}
      {all.slice(0, 5).map(p => {
        const t = arrow(p);
        return (
          <button key={p.id} className="tap row" onClick={() => app.go('cvik/' + p.ex.id)}>
            <ExerciseThumb ex={p.ex} images={images} w={46} h={36} />
            <span style={{ flex: 1 }}>
              <span className="row-title">{p.ex.name}</span>
              <span className="row-sub num">{p.d} · {kindLabel(p)}</span>
            </span>
            <span className="num" style={{ font: '800 17px/1 var(--font-heading)' }}>{perfLabel(p.v, p.ex.unit)}</span>
            <span style={{ font: '800 15px/1 var(--font-heading)', color: trendColor(t), width: 14, textAlign: 'right' }}>{t}</span>
          </button>
        );
      })}

      {stale.length > 0 && (
        <>
          <div className="sec" style={{ paddingTop: 22 }}><div className="kicker">Dlho netestované</div></div>
          {stale.map(({ e, days }) => (
            <button key={e.id} className="tap row" onClick={() => app.openZapis(e.id)}>
              <ExerciseThumb ex={e} images={images} w={46} h={36} />
              <span style={{ font: '800 15px/1.2 var(--font-heading)', flex: 1 }}>{e.name}</span>
              <span className="num" style={{ font: '400 11px/1 var(--font-body)', color: 'var(--color-neutral-700)' }}>{perfLabel(best(e.id), e.unit)}</span>
              <span className="tag tag-accent num">{Math.floor(days / 7)} t.</span>
            </button>
          ))}
        </>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}
