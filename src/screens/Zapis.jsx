import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { useApp } from '../lib/appContext.js';
import { useDerived } from '../lib/derive.js';
import { est, fmt, entryValue, dateLabel, todayISO, uid } from '../lib/calc.js';
import { ExerciseThumb } from '../components/Pictogram.jsx';
import { Chevron } from '../components/ui.jsx';

const REPS = [1, 2, 3, 5, 8, 10];
const parseNum = (s) => Number(String(s).replace(',', '.').replace(/[^0-9.]/g, ''));

export default function Zapis() {
  const store = useStore();
  const app = useApp();
  const { exById, best } = useDerived();
  const { form, setForm } = app;
  const ex = exById[form.exId] || exById.bench;
  const cm = ex.unit === 'cm';
  const step = cm ? 1 : Number(store.settings.step) || 2.5;
  const formula = store.settings.formula;
  const [text, setText] = useState(fmt(form.weight));
  const [saving, setSaving] = useState(false);
  const typing = useRef(false);

  // The +/− buttons and the exercise picker change the weight; mirror it unless the user is typing "102,5".
  useEffect(() => { if (!typing.current) setText(fmt(form.weight)); }, [form.weight]);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const reps = form.kind === 'test' || cm ? 1 : form.reps;
  const value = cm ? form.weight : Math.round(est(form.weight, reps, formula) * 2) / 2;
  const over10 = !cm && reps > 10;
  const today = form.date === todayISO();

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const prev = best(ex.id);
    const entry = await store.saveEntry({
      id: uid(), exId: ex.id, date: form.date || todayISO(), weight: form.weight,
      reps, kind: cm ? 'test' : form.kind, rpe: form.rpe, note: form.note.trim(),
    });
    const v = entryValue(entry, ex.unit, formula);
    const u = cm ? ' cm' : ' kg';
    app.toast(prev === null ? 'Uložené · prvý zápis · ' + fmt(v) + u
      : v > prev ? 'Nový rekord · ' + fmt(v) + u + (cm ? '' : ' odhadované 1RM')
      : 'Uložené · ' + fmt(v) + u + ', rekord ostáva ' + fmt(prev) + u);
    setForm(f => ({ ...f, note: '', date: todayISO() }));
    app.go('cvik/' + ex.id, { replace: true });
  };

  const weightLabel = cm ? 'Výška (cm)' : ex.unit === '+kg' ? 'Záťaž navyše (kg)' : 'Váha (kg)';

  return (
    <div>
      <div className="head">
        <h1 className="h1">Zapísať maximálku</h1>
        <p style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '8px 0 0' }}>Jeden výkon k jednému dátumu. Dátum je predvolene dnes.</p>
      </div>

      <div className="rule2" style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: '14px 16px', background: 'var(--color-surface)' }}>
        <div style={{ flex: 1 }}>
          <div className="label">{cm ? 'Výkon' : 'Odhadované 1RM · ' + formula}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
            <span className="num" style={{ font: '800 40px/.9 var(--font-heading)', color: over10 ? 'var(--color-neutral-700)' : 'var(--color-text)' }}>
              {ex.unit === '+kg' ? '+' : ''}{fmt(value)}
            </span>
            <span style={{ font: '800 15px/1 var(--font-heading)' }}>{cm ? 'cm' : 'kg'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', font: '400 11px/1.4 var(--font-body)', color: 'var(--color-neutral-700)' }}>
          {cm ? '' : over10 ? 'nad 10 opakovaní je odhad menej spoľahlivý' : fmt(form.weight) + ' kg × ' + reps}
        </div>
      </div>

      <button className="tap rule" onClick={app.openPicker}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, minHeight: 68, padding: '10px 16px' }}>
        <ExerciseThumb ex={ex} images={store.images} w={46} h={36} />
        <span style={{ font: '800 17px/1.1 var(--font-heading)', flex: 1 }}>{ex.name}</span>
        <Chevron size={18} />
      </button>

      <label className="rule" style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '10px 16px', position: 'relative', cursor: 'pointer' }}>
        <span className="label" style={{ width: 84 }}>Dátum</span>
        <span className="num" style={{ font: '800 17px/1.1 var(--font-heading)', flex: 1 }}>{dateLabel(form.date, true)}</span>
        <span className="tag tag-neutral">{today ? 'dnes' : 'zmeniť'}</span>
        <input type="date" value={form.date} max={todayISO()} aria-label="Dátum"
          onClick={e => { try { e.currentTarget.showPicker(); } catch { /* older browsers open it themselves */ } }}
          onChange={e => e.target.value && set({ date: e.target.value })}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} />
      </label>

      <div className="pad rule">
        <div className="label">{weightLabel}</div>
        <div className="stepper">
          <button className="step-btn" onClick={() => set({ weight: Math.max(0, Math.round((form.weight - step) * 10) / 10) })}>−{fmt(step)}</button>
          <input className="big-input" inputMode="decimal" value={text} aria-label={weightLabel}
            onFocus={e => { typing.current = true; e.target.select(); }}
            onChange={e => { setText(e.target.value); const v = parseNum(e.target.value); if (!Number.isNaN(v)) set({ weight: v }); }}
            onBlur={() => { typing.current = false; setText(fmt(form.weight)); }} />
          <button className="step-btn plus" onClick={() => set({ weight: Math.round((form.weight + step) * 10) / 10 })}>+{fmt(step)}</button>
        </div>
      </div>

      {!cm && (
        <>
          <div className="pad rule">
            <div className="label">Opakovania</div>
            <div className="grid-choice" style={{ gridTemplateColumns: 'repeat(6,1fr)', marginTop: 10 }}>
              {REPS.map(n => (
                <button key={n} className={'choice center num' + (form.kind !== 'test' && form.reps === n ? ' on' : '')}
                  style={{ minHeight: 52, fontSize: 18 }} onClick={() => set({ reps: n, kind: 'set' })}>{n}</button>
              ))}
            </div>
          </div>

          <div className="pad rule">
            <div className="label">Druh výkonu</div>
            <div className="grid-choice" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 10 }}>
              <button className={'choice' + (form.kind === 'test' ? ' on' : '')} onClick={() => set({ kind: 'test' })}>Testované 1RM</button>
              <button className={'choice' + (form.kind !== 'test' ? ' on' : '')} onClick={() => set({ kind: 'set' })}>Max na X opakovaní</button>
            </div>
          </div>
        </>
      )}

      <div className="pad rule">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="label" style={{ flex: 1 }}>Náročnosť · RPE</span>
          <span className="num" style={{ font: '800 15px/1 var(--font-heading)' }}>{form.rpe}</span>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button key={n} aria-label={'RPE ' + n} onClick={() => set({ rpe: n })}
              style={{ flex: 1, height: 44, border: 0, cursor: 'pointer',
                background: n <= form.rpe ? (n > 8 ? 'var(--color-accent)' : 'var(--color-accent-400)') : 'var(--color-neutral-200)' }} />
          ))}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>10 = už ani jedno opakovanie navyše</div>
      </div>

      <div className="pad">
        <div className="field"><label htmlFor="note">Poznámka</label>
          <input id="note" className="input" value={form.note} onChange={e => set({ note: e.target.value })} placeholder="napr. s pásom" style={{ minHeight: 44 }} />
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary btn-block btn-tall" style={{ marginTop: 16 }}>Uložiť maximálku</button>
        <p className="muted" style={{ margin: '12px 0 0' }}>Uloží sa do telefónu aj bez signálu{store.github ? ' a odošle sa na GitHub, keď je internet.' : '. Zálohu na GitHub zapneš v Profile.'}</p>
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}
