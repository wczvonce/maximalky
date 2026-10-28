import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { useApp } from '../lib/appContext.js';
import { fmt, entryValue, todayISO, timeLabel, plural } from '../lib/calc.js';

const SETTINGS_ROWS = [
  ['Jednotky', 'kg', 'MVP'],
  ['Offline zápis', 'zapnutý', 'MVP'],
  ['Pripomienka testu', 'vypnuté', 'v2'],
  ['Ciele, napr. bench 120 kg do leta', '—', 'v2'],
  ['Fázy sezóny a turnaje', '—', 'v2'],
  ['Prístup pre trénera', '—', 'v3'],
];

// Prefilled GitHub forms for the private data repository and its token (the repository is picked on the token page).
const REPO_URL = 'https://github.com/new?name=maximalky-data&visibility=private';

// On <meno>.github.io the account is <meno> and the data repository most likely <meno>/maximalky-data.
const pagesOwner = () => { const m = location.hostname.match(/^([^.]+)\.github\.io$/i); return m ? m[1] : ''; };
const guessRepo = () => (pagesOwner() ? pagesOwner() + '/maximalky-data' : '');
// A one-year token that may write repository contents; GitHub e-mails before it expires.
const tokenUrl = () => 'https://github.com/settings/personal-access-tokens/new?name=Maximalky&description=Z%C3%A1loha%20appky%20Maxim%C3%A1lky'
  + (pagesOwner() ? '&target_name=' + pagesOwner() : '') + '&expires_in=365&contents=write';

const csvCell = (v) => {
  const s = typeof v === 'number' ? String(v).replace('.', ',') : String(v ?? '');
  return /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

// Semicolon-separated with decimal commas, so Excel in Slovak opens it as columns.
function exportCsv(exercises, entries, formula) {
  const byId = Object.fromEntries(exercises.map(e => [e.id, e]));
  const rows = [['dátum', 'cvik', 'partia', 'druh', 'váha', 'opakovania', 'jednotka', 'odhad 1RM', 'RPE', 'poznámka']];
  entries.filter(e => !e.deleted && byId[e.exId]).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).forEach(e => {
    const ex = byId[e.exId];
    rows.push([e.date, ex.name, ex.party, e.kind === 'test' ? 'testované' : 'zo série', e.weight, e.reps, ex.unit,
      entryValue(e, ex.unit, formula), e.rpe || '', e.note || '']);
  });
  const csv = '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'maximalky-' + todayISO() + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return rows.length - 1;
}

function Bodyweight() {
  const { settings, updateSettings } = useStore();
  const [text, setText] = useState(fmt(settings.bw));
  const typing = useRef(false);
  useEffect(() => { if (!typing.current) setText(fmt(settings.bw)); }, [settings.bw]);
  const set = (v) => updateSettings({ bw: Math.max(20, Math.round(v * 10) / 10) });
  return (
    <div className="pad rule">
      <div className="label">Telesná hmotnosť</div>
      <div className="stepper">
        <button className="step-btn" style={{ width: 56, height: 56 }} onClick={() => set(settings.bw - 0.1)}>−0,1</button>
        <input className="big-input" style={{ fontSize: 34 }} inputMode="decimal" value={text} aria-label="Telesná hmotnosť"
          onFocus={e => { typing.current = true; e.target.select(); }}
          onChange={e => setText(e.target.value)}
          onBlur={() => {
            typing.current = false;
            const v = Number(text.replace(',', '.'));
            if (v > 0 && v !== settings.bw) set(v); else setText(fmt(settings.bw));
          }} />
        <button className="step-btn plus" style={{ width: 56, height: 56 }} onClick={() => set(settings.bw + 0.1)}>+0,1</button>
      </div>
    </div>
  );
}

function GithubBackup() {
  const store = useStore();
  const app = useApp();
  const cfg = store.github;
  const [repo, setRepo] = useState(guessRepo);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [help, setHelp] = useState(false);

  const connect = async () => {
    const parts = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '').split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1] || !token.trim()) { setErr('Zadaj repozitár v tvare meno/repozitar a token.'); return; }
    setBusy(true);
    setErr(null);
    try {
      await store.setGithub({ owner: parts[0], repo: parts[1], token: token.trim() });
      setToken('');
      app.toast('GitHub pripojený · ' + parts[0] + '/' + parts[1]);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const s = store.sync;
  const status = s.status === 'syncing' ? 'Zálohujem…'
    : s.status === 'error' ? 'Chyba: ' + s.error
    : s.status === 'offline' ? 'Bez internetu · odošle sa, keď bude signál'
    : store.dirty ? 'Neodoslané zmeny · odošlú sa o chvíľu'
    : store.lastSync ? 'Zálohované · ' + timeLabel(store.lastSync)
    : 'Čaká na prvú zálohu';

  return (
    <div style={{ padding: '18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="kicker" style={{ flex: 1 }}>Záloha na GitHub</span>
        {cfg && <span className={'tag ' + (s.status === 'error' ? 'tag-accent' : 'tag-neutral')}>{s.status === 'error' ? 'chyba' : 'zapnutá'}</span>}
      </div>
      {cfg ? (
        <>
          <div style={{ font: '800 17px/1.2 var(--font-heading)', marginTop: 12, wordBreak: 'break-all' }}>{cfg.owner}/{cfg.repo}</div>
          <div className="muted" style={{ marginTop: 6, color: s.status === 'error' ? 'var(--color-accent-700)' : undefined }}>{status}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary" style={{ minHeight: 44 }} disabled={s.status === 'syncing'} onClick={store.syncNow}>Zálohovať teraz</button>
            <button className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => store.setGithub(null)}>Odpojiť</button>
          </div>
        </>
      ) : (
        <>
          <p className="body" style={{ margin: '10px 0 0' }}>Zápisy, cviky aj obrázky sa okrem telefónu uložia do tvojho súkromného repozitára na GitHube. Ten istý repozitár nastavíš aj na ďalšom telefóne a dáta sa zosynchronizujú.</p>
          <div className="field" style={{ marginTop: 12 }}><label htmlFor="gh-repo">Repozitár</label>
            <input id="gh-repo" className="input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="meno/maximalky-data"
              autoCapitalize="off" autoCorrect="off" spellCheck="false" style={{ minHeight: 44 }} />
          </div>
          <div className="field" style={{ marginTop: 10 }}><label htmlFor="gh-token">Token</label>
            <input id="gh-token" className="input" type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="github_pat_…"
              autoComplete="off" style={{ minHeight: 44 }} />
          </div>
          {err && <p className="muted" style={{ color: 'var(--color-accent-700)', margin: '10px 0 0' }}>{err}</p>}
          <button className="btn btn-primary btn-block" style={{ minHeight: 48, marginTop: 12 }} disabled={busy} onClick={connect}>{busy ? 'Overujem…' : 'Pripojiť GitHub'}</button>
          <button className="btn btn-ghost" style={{ minHeight: 40, marginTop: 6 }} onClick={() => setHelp(h => !h)}>{help ? 'Skryť návod' : 'Ako získať token'}</button>
          {help && (
            <ol className="body" style={{ margin: '8px 0 0', paddingLeft: 18 }}>
              <li>Na GitHube si vytvor súkromný (Private) repozitár, napríklad <strong>maximalky-data</strong>.</li>
              <li>Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.</li>
              <li>Repository access: Only select repositories → ten repozitár. Permissions → Contents: Read and write.</li>
              <li>Platnosť je nastavená na rok, GitHub ti pred koncom pošle e-mail. Token skopíruj a vlož sem. Ostane len v tomto telefóne.</li>
            </ol>
          )}
          {help && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
              <a className="btn btn-secondary" href={REPO_URL} target="_blank" rel="noreferrer" style={{ minHeight: 44 }}>1 · Vytvoriť súkromný repozitár</a>
              <a className="btn btn-secondary" href={tokenUrl()} target="_blank" rel="noreferrer" style={{ minHeight: 44 }}>2 · Vytvoriť token</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Profil() {
  const store = useStore();
  const app = useApp();
  const { settings, updateSettings } = store;
  return (
    <div>
      <div className="head"><h1 className="h1">Profil</h1></div>
      <Bodyweight />

      <div style={{ padding: '16px 16px 6px' }}>
        <div className="kicker">Vzorec odhadu 1RM</div>
        <div className="grid-choice" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 10 }}>
          {['Epley', 'Brzycki'].map(f => (
            <button key={f} className={'choice' + (settings.formula === f ? ' on' : '')} onClick={() => updateSettings({ formula: f })}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div className="kicker">Krok váhy pri zápise</div>
        <div className="grid-choice" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 10 }}>
          {[2.5, 5].map(v => (
            <button key={v} className={'choice' + (Number(settings.step) === v ? ' on' : '')} onClick={() => updateSettings({ step: v })}>{fmt(v)} kg</button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '2px solid var(--color-divider)' }}><GithubBackup /></div>

      {SETTINGS_ROWS.map(([name, value, ver]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '10px 16px', borderTop: '1px solid var(--color-divider)' }}>
          <span style={{ font: '400 14px/1.2 var(--font-body)', flex: 1 }}>{name}</span>
          <span className="muted" style={{ lineHeight: 1 }}>{value}</span>
          <span className="tag tag-neutral">{ver}</span>
        </div>
      ))}

      <div className="pad" style={{ borderTop: '1px solid var(--color-divider)' }}>
        <button className="btn btn-secondary btn-block" style={{ minHeight: 48, marginTop: 0 }} onClick={() => {
          const n = exportCsv(store.exercises, store.entries, settings.formula);
          app.toast('Export hotový · ' + plural(n, 'zápis', 'zápisy', 'zápisov'));
        }}>Exportovať do CSV</button>
        <p className="muted" style={{ margin: '12px 0 0' }}>Dáta sú tvoje — export a záloha kedykoľvek.</p>
      </div>
    </div>
  );
}
