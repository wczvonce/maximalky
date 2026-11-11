import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/600.css';
import '@fontsource/archivo/800.css';
import './styles/modernist.css';
import './styles/app.css';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

// The installed app stays in memory for days, so look for a new deploy on start, whenever it comes back
// to the screen and hourly; autoUpdate then reloads the page onto the new version by itself.
registerSW({
  immediate: true,
  onRegisteredSW(url, reg) {
    if (!reg) return;
    const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    setInterval(check, 60 * 60 * 1000);
  },
});

// Backup for the reload above, which workbox-window skips when the page started before the first install
// finished: once a new service worker replaces one that already controlled the page, reload onto the new
// version. The very first takeover (no worker before) does not reload.
if ('serviceWorker' in navigator) {
  let controlled = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; }
    if (reloading) return;
    reloading = true;
    location.reload();
  });
}

createRoot(document.getElementById('root')).render(<App />);
