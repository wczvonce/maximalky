import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import { todayISO } from './lib/calc.js';
import { AppCtx } from './lib/appContext.js';
import Home from './screens/Home.jsx';
import Zapis from './screens/Zapis.jsx';
import Cviky from './screens/Cviky.jsx';
import Detail from './screens/Detail.jsx';
import Grafy from './screens/Grafy.jsx';
import Profil from './screens/Profil.jsx';
import Editor from './screens/Editor.jsx';

// Hash routes keep Android's back gesture working inside the installed app.
function parse() {
  const [name = '', param = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: name || 'domov', param: decodeURIComponent(param) };
}

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);

function Shell() {
  const store = useStore();
  const [route, setRoute] = useState(parse);
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);
  const pickerFromZapis = useRef(false);

  const lastEx = () => {
    const live = store.entries.filter(e => !e.deleted).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return live.length ? live[0].exId : 'bench';
  };
  const lastWeight = (exId) => {
    const live = store.entries.filter(e => !e.deleted && e.exId === exId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (live.length) return live[0].weight;
    const ex = store.exercises.find(e => e.id === exId);
    return ex && ex.unit === 'cm' ? 40 : ex && ex.unit === '+kg' ? 0 : 60;
  };
  const freshForm = (exId) => ({ exId, date: todayISO(), weight: lastWeight(exId), reps: 3, kind: 'set', rpe: 9, note: '' });
  const [form, setForm] = useState(() => freshForm(lastEx()));

  useEffect(() => {
    const onHash = () => { setRoute(parse()); if (scrollRef.current) scrollRef.current.scrollTop = 0; };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const go = useCallback((path, opts = {}) => {
    const hash = '#/' + path;
    if (opts.replace) location.replace(hash);
    else location.hash = hash;
  }, []);

  const app = {
    route, go, toast: setToast, form, setForm,
    // Opens the entry form; with an exercise id it starts a fresh entry prefilled with that exercise's last weight.
    openZapis(exId) {
      if (exId) setForm(freshForm(exId));
      else setForm(f => ({ ...f, date: f.date || todayISO() }));
      go('zapis');
    },
    openPicker() { pickerFromZapis.current = true; go('vyber'); },
    pickExercise(exId) {
      setForm(f => ({ ...f, exId, weight: lastWeight(exId) }));
      if (pickerFromZapis.current) { pickerFromZapis.current = false; history.back(); }
      else go('zapis', { replace: true });
    },
  };

  const n = route.name;
  let screen;
  if (n === 'zapis') screen = <Zapis />;
  else if (n === 'cviky') screen = <Cviky />;
  else if (n === 'vyber') screen = <Cviky pick />;
  else if (n === 'cvik') screen = <Detail id={route.param} />;
  else if (n === 'grafy') screen = <Grafy />;
  else if (n === 'profil') screen = <Profil />;
  else if (n === 'novy') screen = <Editor key="novy" />;
  else if (n === 'upravit') screen = <Editor key={'e-' + route.param} id={route.param} />;
  else screen = <Home />;

  const on = (k) => 'navbtn' + (n === k || (k === 'cviky' && (n === 'cvik' || n === 'vyber')) ? ' on' : '');

  return (
    <AppCtx.Provider value={app}>
      <div className="app">
        <div className="topbar">
          <span className="brand">MAXIMÁLKY</span>
          <button className="icon-btn" onClick={() => go('profil')} aria-label="Profil"><UserIcon /></button>
        </div>

        <div className="scroll" ref={scrollRef}>{screen}</div>

        <nav className="bottomnav">
          <button className={on('domov')} onClick={() => go('domov')}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /></svg>
            <span>Domov</span>
          </button>
          <button className={on('cviky')} onClick={() => go('cviky')}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 9v6M21 9v6M6.5 6.5v11M17.5 6.5v11M6.5 12h11" /></svg>
            <span>Cviky</span>
          </button>
          <button className="navbtn plus" onClick={() => app.openZapis()} aria-label="Zapísať maximálku">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button className={on('grafy')} onClick={() => go('grafy')}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 20h18" /><path d="m4 15 5-6 4 4 6-8" /></svg>
            <span>Grafy</span>
          </button>
          <button className={on('profil')} onClick={() => go('profil')}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>
            <span>Profil</span>
          </button>
        </nav>

        {toast && (
          <div className="toast" role="status">
            <span className="toast-text">{toast}</span>
            <button className="toast-x" onClick={() => setToast(null)} aria-label="Zavrieť">✕</button>
          </div>
        )}
      </div>
    </AppCtx.Provider>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
