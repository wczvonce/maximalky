import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { useApp } from '../lib/appContext.js';
import { useDerived } from '../lib/derive.js';
import { fmt, perfLabel, paceLabel, inPeriod, dateLabel, plural } from '../lib/calc.js';
import { ExerciseThumb } from '../components/Pictogram.jsx';
import { ProgressChart, PeriodSwitch, Dialog } from '../components/ui.jsx';

const kg = (w, unit) => (unit === '+kg' ? '+' : '') + fmt(w) + ' kg';

export default function Detail({ id }) {
  const store = useStore();
  const app = useApp();
  const { exById, seriesById } = useDerived();
  const [period, setPeriod] = useState('6M');
  const [sel, setSel] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);

  const ex = exById[id];
  if (!ex) return <div className="pad"><p className="muted" style={{ margin: 0 }}>Cvik sa nenašiel.</p></div>;

  const cm = ex.unit === 'cm';
  const u = cm ? 'cm' : 'kg';
  const pts = seriesById[id] || [];
  const shown = inPeriod(pts, period);
  const vals = shown.map(p => p.v);
  const max = pts.length ? Math.max(...pts.map(p => p.v)) : null;
  const steps = (ex.steps || []).filter(s => s.img || s.src || s.title);
  const photo = (s) => (s.img ? store.images[s.img] : s.src);
  const kindText = (p) => (cm ? 'výkon' : p.kind === 'test' ? 'testované' : 'zo série');

  // Best weight for each rep count; a tested single counts as 1 rep.
  const repMax = {};
  for (const p of pts) {
    const r = p.kind === 'test' ? 1 : p.entry.reps;
    if (!repMax[r] || p.entry.weight > repMax[r].w) repMax[r] = { r, w: p.entry.weight, date: p.date };
  }
  const repRows = Object.values(repMax).sort((a, b) => a.r - b.r);

  const close = () => { setSel(null); setConfirmDel(false); };
  const del = async () => { await store.deleteEntry(sel.id); close(); app.toast('Zápis zmazaný · graf sa prepočítal'); };

  return (
    <div>
      <div style={{ height: 150, background: 'var(--color-surface)', borderBottom: '2px solid var(--color-divider)', padding: '14px 16px', overflow: 'hidden' }}>
        <ExerciseThumb ex={ex} images={store.images} w="100%" h={122} fit="contain" />
      </div>

      <div className="pad rule2">
        <div className="label" style={{ letterSpacing: '.14em', color: 'var(--color-accent-700)' }}>{ex.party}{ex.archived ? ' · archivovaný' : ''}</div>
        <h1 style={{ font: '800 30px/1 var(--font-heading)', letterSpacing: '-.02em', margin: '8px 0 0' }}>{ex.name}</h1>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <div className="label">{cm ? 'Najlepší výkon' : 'Aktuálne 1RM'}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 6 }}>
              <span className="num" style={{ font: '800 36px/.9 var(--font-heading)' }}>{max === null ? '—' : fmt(max)}</span>
              <span style={{ font: '800 14px/1 var(--font-heading)' }}>{ex.unit === '+kg' ? 'kg navyše' : ex.unit}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', font: '400 11px/1.5 var(--font-body)', color: 'var(--color-neutral-700)' }}>
            {pts.length ? <>{paceLabel(pts, ex.unit)}<br />posledne {pts[pts.length - 1].d}</> : 'zatiaľ bez zápisu'}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div className="kicker">{cm ? 'Vývoj výkonu' : 'Vývoj odhadovaného 1RM'}</div>
        {shown.length ? (
          <>
            <ProgressChart pts={shown} />
            <div className="num" style={{ display: 'flex', justifyContent: 'space-between', font: '400 11px/1 var(--font-body)', color: 'var(--color-neutral-700)', marginTop: 6 }}>
              <span>Rozpätie {fmt(Math.min(...vals))}–{fmt(Math.max(...vals))} {u}</span><span>{paceLabel(shown, ex.unit)}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, font: '400 11px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--color-accent-700)' }}>↑ Rast</span><span>↓ Pokles</span><span>● Testované</span><span>○ Zo série</span>
              <span style={{ color: 'var(--color-accent-700)' }}>■ Rekord</span><span>-- Trend</span>
            </div>
          </>
        ) : (
          <div className="empty" style={{ margin: '12px 0 0' }}>
            <div className="empty-title">{pts.length ? 'V tomto období nie je žiadny zápis' : 'Graf sa nakreslí po prvom zápise'}</div>
            <p className="body" style={{ margin: '8px 0 0' }}>{pts.length
              ? 'Prepni obdobie nižšie, napríklad na Všetko.'
              : 'Každý zápis je jeden bod. Z bodov vznikne čiara, ktorá ukáže, či ideš hore alebo dole.'}</p>
          </div>
        )}
        <PeriodSwitch value={period} onChange={setPeriod} style={{ marginTop: 14 }} />
      </div>

      <div style={{ padding: '22px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="kicker" style={{ flex: 1 }}>Technika</span>
          <span className="muted" style={{ lineHeight: 1 }}>{steps.length ? plural(steps.length, 'krok', 'kroky', 'krokov') : 'žiadne obrázky'}</span>
        </div>
      </div>
      {steps.length ? (
        <div className="tech-strip">
          {steps.map((t, i) => (
            <div key={i} className="tech-card">
              <div style={{ height: 208, background: 'var(--color-surface)', overflow: 'hidden' }}>
                {photo(t) && <img src={photo(t)} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '10px 12px 12px', borderTop: '1px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="num" style={{ font: '800 15px/1 var(--font-heading)', color: 'var(--color-accent-700)' }}>{i + 1}</span>
                  <span style={{ font: '800 13px/1.15 var(--font-heading)', flex: 1 }}>{t.title || 'Krok ' + (i + 1)}</span>
                </div>
                {t.caption && <p className="body" style={{ margin: '8px 0 0' }}>{t.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-title">Zatiaľ bez obrázkov</div>
          <p className="body" style={{ margin: '8px 0 12px' }}>Pridaj 3 až 5 obrázkov, ktoré ukazujú postup cviku krok za krokom.</p>
          <button onClick={() => app.go('upravit/' + ex.id)} className="btn btn-secondary" style={{ minHeight: 44 }}>Pridať obrázky</button>
        </div>
      )}

      {!cm && repRows.length > 0 && (
        <div style={{ padding: '22px 16px 0' }}>
          <div className="kicker">Rep-maxy</div>
          <table className="table" style={{ marginTop: 8 }}>
            <thead><tr><th style={{ paddingLeft: 0 }}>Opak.</th><th style={{ textAlign: 'right' }}>Váha</th><th style={{ textAlign: 'right', paddingRight: 0 }}>Kedy</th></tr></thead>
            <tbody>
              {repRows.map(r => (
                <tr key={r.r}>
                  <td className="num" style={{ paddingLeft: 0, fontWeight: 800 }}>{r.r}</td>
                  <td className="num" style={{ textAlign: 'right' }}>{kg(r.w, ex.unit)}</td>
                  <td className="num" style={{ textAlign: 'right', paddingRight: 0, color: 'var(--color-neutral-700)' }}>{dateLabel(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pts.length > 0 && (
        <>
          <div style={{ padding: '22px 16px 8px' }}><div className="kicker">Všetky zápisy</div></div>
          {pts.slice().reverse().map(p => (
            <button key={p.id} className="tap" onClick={() => setSel(p)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: '1px solid var(--color-divider)' }}>
              <span className="num" style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-neutral-700)', minWidth: 62, whiteSpace: 'nowrap' }}>{p.d}</span>
              <span className="num" style={{ font: '800 15px/1 var(--font-heading)', flex: 1 }}>{perfLabel(p.v, ex.unit)} · {kindText(p)}</span>
              <span style={{ font: '400 11px/1 var(--font-body)', color: 'var(--color-accent-700)' }}>{p.rec ? 'rekord' : ''}</span>
            </button>
          ))}
        </>
      )}

      <div className="pad" style={{ borderTop: pts.length ? '1px solid var(--color-divider)' : 0 }}>
        <button onClick={() => app.openZapis(ex.id)} className="btn btn-primary btn-block" style={{ minHeight: 52, fontSize: 15, marginTop: 0 }}>Zapísať výkon</button>
        <button onClick={() => app.go('upravit/' + ex.id)} className="btn btn-secondary btn-block" style={{ minHeight: 48 }}>Upraviť cvik</button>
      </div>

      {sel && (
        <Dialog title={dateLabel(sel.date, true)} onClose={close}
          actions={confirmDel ? (
            <>
              <button className="btn btn-secondary" onClick={() => setConfirmDel(false)}>Nie</button>
              <button className="btn btn-primary" onClick={del}>Áno, zmazať</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmDel(true)}>Zmazať zápis</button>
              <button className="btn btn-secondary" onClick={close}>Zavrieť</button>
            </>
          )}>
          <div className="num" style={{ font: '800 22px/1.1 var(--font-heading)' }}>{perfLabel(sel.v, ex.unit)}</div>
          <div style={{ marginTop: 6 }}>{cm ? 'výkon' : sel.kind === 'test' ? 'testované 1RM'
            : 'zo série · ' + kg(sel.entry.weight, ex.unit) + ' × ' + sel.entry.reps + ' (odhad ' + store.settings.formula + ')'}</div>
          {sel.entry.rpe ? <div>RPE {sel.entry.rpe}</div> : null}
          {sel.entry.note ? <div>„{sel.entry.note}“</div> : null}
          {sel.rec ? <div style={{ color: 'var(--color-accent-700)' }}>rekord</div> : null}
          {confirmDel && <div style={{ marginTop: 10, fontWeight: 600 }}>Naozaj zmazať tento zápis? Graf sa prepočíta.</div>}
        </Dialog>
      )}
    </div>
  );
}
