import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { useApp } from '../lib/appContext.js';
import { useDerived } from '../lib/derive.js';
import { PARTIES, exerciseOrder } from '../data/seed.js';
import { fmt, trendArrow, trendColor, plural } from '../lib/calc.js';
import { ExerciseThumb } from '../components/Pictogram.jsx';

// The exercise grid. With `pick` it is the exercise picker of the entry form.
export default function Cviky({ pick }) {
  const { exercises, images } = useStore();
  const app = useApp();
  const { seriesById, best } = useDerived();
  const [party, setParty] = useState('Všetko');
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const live = exercises.filter(e => !e.archived);
  const archived = exercises.filter(e => e.archived);
  const pool = showArchived ? archived : live;
  const used = new Set(live.map(e => e.party));
  const parties = ['Všetko'].concat(PARTIES.filter(p => used.has(p)));
  const q = query.trim().toLowerCase();
  const list = pool
    .filter(e => (party === 'Všetko' || e.party === party) && (!q || e.name.toLowerCase().includes(q)))
    .sort(exerciseOrder);

  const open = (e) => (pick ? app.pickExercise(e.id) : app.go('cvik/' + e.id));

  return (
    <div>
      <div className="rule" style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 className="h1" style={{ flex: 1 }}>{pick ? 'Vyber cvik' : showArchived ? 'Archív' : 'Cviky'}</h1>
          <span className="num" style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-neutral-700)' }}>{plural(list.length, 'cvik', 'cviky', 'cvikov')}</span>
        </div>
        <input className="input" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Hľadať cvik"
          style={{ minHeight: 44, marginTop: 12 }} />
      </div>

      <div className="rule2" style={{ display: 'flex', gap: 6, padding: '12px 16px', overflow: 'auto' }}>
        {parties.map(p => (
          <button key={p} className={'chip' + (party === p ? ' on' : '')} onClick={() => setParty(p)}>{p}</button>
        ))}
      </div>

      <div className="rule2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: 'var(--color-divider)' }}>
        {list.map(e => {
          const b = best(e.id);
          const t = trendArrow(seriesById[e.id] || []);
          return (
            <button key={e.id} className="tap" onClick={() => open(e)}
              style={{ display: 'block', padding: '0 0 12px', background: 'var(--color-bg)' }}>
              <div style={{ height: 92, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-divider)', overflow: 'hidden' }}>
                <ExerciseThumb ex={e} images={images} w="100%" h={92} />
              </div>
              <div style={{ padding: '10px 12px 0' }}>
                <div style={{ font: '400 9px/1 var(--font-body)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{e.party}</div>
                <div style={{ font: '800 14px/1.15 var(--font-heading)', minHeight: 33, marginTop: 6 }}>{e.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                  <span className="num" style={{ font: '800 20px/1 var(--font-heading)' }}>
                    {b === null ? '—' : fmt(b) + (e.unit === '+kg' ? ' +kg' : ' ' + e.unit)}
                  </span>
                  <span style={{ font: '800 14px/1 var(--font-heading)', color: trendColor(t) }}>{t}</span>
                </div>
              </div>
            </button>
          );
        })}
        {list.length % 2 === 1 && <div style={{ background: 'var(--color-bg)' }} />}
      </div>
      {list.length === 0 && <p className="muted" style={{ padding: '16px 16px 0', margin: 0 }}>Nič sa nenašlo.</p>}

      <div className="pad">
        {!pick && !showArchived && (
          <button onClick={() => app.go('novy')} className="btn btn-secondary btn-block" style={{ minHeight: 48 }}>+ Pridať vlastný cvik</button>
        )}
        {!pick && archived.length > 0 && (
          <button onClick={() => setShowArchived(v => !v)} className="btn btn-ghost" style={{ minHeight: 44, marginTop: 8 }}>
            {showArchived ? '← Späť na cviky' : 'Archivované cviky (' + archived.length + ')'}
          </button>
        )}
        <p className="muted" style={{ margin: '12px 0 0' }}>Nepoužívaný cvik sa archivuje, nemaže — história a grafy zostanú.</p>
      </div>
    </div>
  );
}
