import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { useApp } from '../lib/appContext.js';
import { PARTIES } from '../data/seed.js';
import { uid, plural } from '../lib/calc.js';
import { resizeImage } from '../lib/images.js';
import { Dialog } from '../components/ui.jsx';

const UNITS = [['kg', 'kg'], ['+kg', '+kg navyše'], ['cm', 'cm']];
const blank = () => ({ title: '', caption: '' });

// "Nový cvik" and "Upraviť cvik": name, muscle group, unit and 3–5 technique photos.
export default function Editor({ id }) {
  const store = useStore();
  const app = useApp();
  const existing = id ? store.exercises.find(e => e.id === id) : null;
  const [name, setName] = useState(existing ? existing.name : '');
  const [party, setParty] = useState(existing ? existing.party : 'Nohy');
  const [unit, setUnit] = useState(existing ? existing.unit : 'kg');
  const [steps, setSteps] = useState(() => {
    const st = ((existing && existing.steps) || []).slice(0, 5).map(s => ({ ...s, preview: s.img ? store.images[s.img] : s.src }));
    while (st.length < 3) st.push(blank());
    return st;
  });
  const [blobs, setBlobs] = useState({});
  const [busy, setBusy] = useState(false);
  const [archiveAsk, setArchiveAsk] = useState(false);

  if (id && !existing) return <div className="pad"><p className="muted" style={{ margin: 0 }}>Cvik sa nenašiel.</p></div>;

  const patch = (i, p) => setSteps(s => s.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const onFile = (i) => async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const blob = await resizeImage(file);
      const imgId = uid();
      setBlobs(b => ({ ...b, [imgId]: blob }));
      patch(i, { img: imgId, src: undefined, preview: URL.createObjectURL(blob) });
    } catch {
      app.toast('Obrázok sa nepodarilo načítať');
    }
  };

  const save = async () => {
    if (!name.trim()) { app.toast('Zadaj názov cviku'); return; }
    const photos = steps.filter(s => s.preview).length;
    if (photos > 0 && photos < 3) { app.toast('Pridaj aspoň 3 obrázky postupu, alebo zatiaľ žiadny'); return; }
    const kept = steps
      .filter(s => s.preview || (s.title || '').trim() || (s.caption || '').trim())
      .map(s => ({ title: (s.title || '').trim(), caption: (s.caption || '').trim(), ...(s.img ? { img: s.img } : s.src ? { src: s.src } : {}) }));
    setBusy(true);
    // Custom exercises have no pictogram; their first photo becomes the thumbnail.
    const base = existing || { id: 'vlastny-' + uid().slice(0, 8), icon: null, archived: false };
    const ex = { ...base, name: name.trim(), party, unit, steps: kept };
    const fresh = kept.filter(s => s.img && blobs[s.img]).map(s => ({ id: s.img, blob: blobs[s.img] }));
    await store.saveExercise(ex, fresh);
    app.toast((existing ? 'Cvik uložený · ' : 'Cvik pridaný · ') + ex.name + ' · ' + plural(photos, 'obrázok', 'obrázky', 'obrázkov'));
    app.go('cvik/' + ex.id, { replace: true });
  };

  const archive = async () => {
    await store.saveExercise({ ...existing, archived: !existing.archived });
    app.toast(existing.archived ? 'Cvik obnovený' : 'Cvik archivovaný · história zostala');
    app.go('cviky', { replace: true });
  };

  return (
    <div>
      <div className="head">
        <h1 className="h1">{existing ? 'Upraviť cvik' : 'Nový cvik'}</h1>
        <p style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '8px 0 0' }}>Názov, partia a 3 až 5 obrázkov s postupom.</p>
      </div>

      <div className="pad rule">
        <div className="field"><label htmlFor="ex-name">Názov cviku</label>
          <input id="ex-name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="napr. Split squat" style={{ minHeight: 48 }} />
        </div>
      </div>

      <div className="rule" style={{ padding: '16px 16px 14px' }}>
        <div className="label">Partia</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {PARTIES.map(p => (
            <button key={p} className={'chip' + (party === p ? ' on' : '')} style={{ minHeight: 40, fontSize: 13 }} onClick={() => setParty(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="rule2" style={{ padding: '16px 16px 14px' }}>
        <div className="label">Jednotka výkonu</div>
        <div className="grid-choice" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 10 }}>
          {UNITS.map(([v, l]) => (
            <button key={v} className={'choice' + (unit === v ? ' on' : '')} onClick={() => setUnit(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="kicker" style={{ flex: 1 }}>Obrázky techniky</span>
          <span className="muted num" style={{ lineHeight: 1 }}>{steps.length} z 5</span>
        </div>
        <p className="body" style={{ margin: '8px 0 0' }}>
          Jeden obrázok na jeden krok, v poradí ako sa cvičí.{existing && existing.icon ? '' : ' Prvý je zároveň náhľad cviku v zozname.'} Obrázky môžeš doplniť aj neskôr.
        </p>
      </div>

      {steps.map((st, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--color-divider)' }}>
          <div style={{ position: 'relative', flex: 'none' }}>
            <label className={'slot' + (st.preview ? ' filled' : '')}>
              {st.preview ? <img src={st.preview} alt="" /> : <span style={{ padding: 8 }}>Krok {i + 1}<br />pridať obrázok</span>}
              <input type="file" accept="image/*" onChange={onFile(i)} style={{ display: 'none' }} />
            </label>
            {st.preview && (
              <button onClick={() => patch(i, { img: undefined, src: undefined, preview: undefined })} aria-label={'Odstrániť obrázok ' + (i + 1)}
                style={{ position: 'absolute', top: 4, right: 4, width: 28, height: 28, border: 0, background: 'var(--color-text)', color: 'var(--color-bg)', cursor: 'pointer', font: '800 12px/1 var(--font-heading)' }}>✕</button>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="num" style={{ font: '800 15px/1 var(--font-heading)', color: 'var(--color-accent-700)' }}>{i + 1}</span>
              <span className="label" style={{ letterSpacing: '.1em' }}>{i < 3 ? 'povinný' : 'voliteľný'}</span>
            </div>
            <input className="input" value={st.title || ''} onChange={e => patch(i, { title: e.target.value })} placeholder="Názov kroku" style={{ minHeight: 44, marginTop: 8 }} />
            <input className="input" value={st.caption || ''} onChange={e => patch(i, { caption: e.target.value })} placeholder="Na čo si dať pozor" style={{ minHeight: 44, marginTop: 6 }} />
          </div>
        </div>
      ))}

      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-divider)', borderBottom: '2px solid var(--color-divider)', display: 'flex', gap: 8 }}>
        <button onClick={() => setSteps(s => (s.length < 5 ? s.concat([blank()]) : s))} disabled={steps.length >= 5} className="btn btn-secondary" style={{ minHeight: 44 }}>+ Krok</button>
        <button onClick={() => setSteps(s => (s.length > 3 ? s.slice(0, -1) : s))} disabled={steps.length <= 3} className="btn btn-ghost" style={{ minHeight: 44 }}>− Krok</button>
      </div>

      <div className="pad">
        <button onClick={save} disabled={busy} className="btn btn-primary btn-block btn-tall" style={{ marginTop: 0 }}>Uložiť cvik</button>
        <p className="muted" style={{ margin: '12px 0 0' }}>Obrázky sa uložia do telefónu spolu s cvikom{store.github ? ' a zálohujú sa na GitHub' : ''}. Fotky si môžeš odfotiť alebo vybrať z galérie.</p>
        {existing && (
          <button onClick={() => setArchiveAsk(true)} className="btn btn-ghost" style={{ minHeight: 44, marginTop: 12 }}>
            {existing.archived ? 'Obnoviť z archívu' : 'Archivovať cvik'}
          </button>
        )}
      </div>

      {archiveAsk && (
        <Dialog title={existing.archived ? 'Obnoviť cvik?' : 'Archivovať cvik?'} onClose={() => setArchiveAsk(false)}
          actions={<>
            <button className="btn btn-secondary" onClick={() => setArchiveAsk(false)}>Nie</button>
            <button className="btn btn-primary" onClick={archive}>{existing.archived ? 'Obnoviť' : 'Archivovať'}</button>
          </>}>
          {existing.archived ? 'Cvik sa vráti do zoznamu cvikov.'
            : 'Cvik zmizne zo zoznamu, ale jeho zápisy, história a grafy zostanú. Obnoviť ho môžeš v Cvikoch → Archivované.'}
        </Dialog>
      )}
      <div style={{ height: 16 }} />
    </div>
  );
}
