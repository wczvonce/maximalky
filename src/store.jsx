import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as db from './data/db.js';
import { SEED_EXERCISES, DEFAULT_SETTINGS } from './data/seed.js';
import { syncData, uploadImage, downloadImage, testConnection } from './lib/github.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const now = () => Date.now();

async function loadAll() {
  let exercises = await db.getAll('exercises');
  const have = new Set(exercises.map(e => e.id));
  const missing = SEED_EXERCISES.filter(e => !have.has(e.id));
  if (missing.length) {
    await db.putMany('exercises', missing);
    exercises = exercises.concat(missing);
  }
  const entries = await db.getAll('entries');
  const settings = { ...DEFAULT_SETTINGS, ...((await db.get('meta', 'settings')) || {}) };
  const github = (await db.get('meta', 'github')) || null;
  const dirty = !!(await db.get('meta', 'dirty'));
  const lastSync = (await db.get('meta', 'lastSync')) || null;
  const imageIds = await db.allKeys('images');
  const images = {};
  for (const id of imageIds) {
    const blob = await db.get('images', id);
    if (blob) images[id] = URL.createObjectURL(blob);
  }
  return { exercises, entries, settings, github, dirty, lastSync, images };
}

export function StoreProvider({ children }) {
  const [s, setS] = useState(null);
  const [sync, setSync] = useState({ status: 'idle', error: null });
  const ref = useRef(null);
  ref.current = s;
  const syncing = useRef(false);

  useEffect(() => { loadAll().then(setS); }, []);

  const markDirty = async () => {
    await db.put('meta', 'dirty', true);
    setS(p => ({ ...p, dirty: true }));
  };

  const runSync = useCallback(async () => {
    const cur = ref.current;
    if (!cur || !cur.github || syncing.current) return;
    if (!navigator.onLine) { setSync({ status: 'offline', error: null }); return; }
    syncing.current = true;
    setSync({ status: 'syncing', error: null });
    try {
      const cfg = cur.github;
      // Images first, so another device never sees an exercise whose photos are not there yet.
      const uploaded = new Set((await db.get('meta', 'uploadedImages')) || []);
      const localIds = await db.allKeys('images');
      const referenced = new Set(cur.exercises.flatMap(e => (e.steps || []).map(s => s.img).filter(Boolean)));
      for (const id of localIds) {
        if (uploaded.has(id) || !referenced.has(id)) continue;
        await uploadImage(cfg, id, await db.get('images', id));
        uploaded.add(id);
        await db.put('meta', 'uploadedImages', [...uploaded]);
      }

      const merged = await syncData(cfg, { exercises: cur.exercises, entries: cur.entries, settings: cur.settings });
      if (merged.localChanged) {
        await db.putMany('exercises', merged.exercises);
        await db.putMany('entries', merged.entries);
        await db.put('meta', 'settings', merged.settings);
      }

      const images = { ...ref.current.images };
      const have = new Set(localIds);
      for (const ex of merged.exercises) {
        for (const st of ex.steps || []) {
          if (!st.img || have.has(st.img)) continue;
          const blob = await downloadImage(cfg, st.img);
          if (!blob) continue;
          await db.put('images', st.img, blob);
          have.add(st.img);
          uploaded.add(st.img);
          images[st.img] = URL.createObjectURL(blob);
        }
      }
      await db.put('meta', 'uploadedImages', [...uploaded]);

      // Edits made while this sync was in flight stay dirty and go out next time.
      const touchedMeanwhile = ref.current.exercises !== cur.exercises || ref.current.entries !== cur.entries
        || ref.current.settings !== cur.settings;
      const at = now();
      await db.put('meta', 'lastSync', at);
      if (!touchedMeanwhile) await db.put('meta', 'dirty', false);
      setS(p => ({
        ...p, images, lastSync: at, dirty: touchedMeanwhile ? p.dirty : false,
        ...(merged.localChanged && !touchedMeanwhile
          ? { exercises: merged.exercises, entries: merged.entries, settings: merged.settings } : {}),
      }));
      setSync({ status: 'ok', error: null });
      if (touchedMeanwhile) setTimeout(() => runSync(), 500);
    } catch (e) {
      setSync({ status: 'error', error: e.message || String(e) });
    } finally {
      syncing.current = false;
    }
  }, []);

  const ready = !!s;
  const hasGithub = !!(s && s.github);
  useEffect(() => {
    if (!ready || !hasGithub) return;
    runSync();
    let last = now();
    const onOnline = () => runSync();
    const onVisible = () => {
      if (document.visibilityState === 'visible' && now() - last > 60000) { last = now(); runSync(); }
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, hasGithub, runSync]);

  const afterWrite = async () => {
    await markDirty();
    setTimeout(() => runSync(), 300);
  };

  const actions = {
    async saveEntry(entry) {
      const e = { ...entry, updatedAt: now(), createdAt: entry.createdAt || now() };
      await db.put('entries', e.id, e);
      setS(p => ({ ...p, entries: p.entries.filter(x => x.id !== e.id).concat([e]) }));
      await afterWrite();
      return e;
    },
    async deleteEntry(id) {
      const old = ref.current.entries.find(x => x.id === id);
      const e = { ...old, deleted: true, updatedAt: now() };
      await db.put('entries', id, e);
      setS(p => ({ ...p, entries: p.entries.map(x => (x.id === id ? e : x)) }));
      await afterWrite();
    },
    // newImages: [{ id, blob }] for photos picked in the editor.
    async saveExercise(ex, newImages = []) {
      const images = {};
      for (const im of newImages) {
        await db.put('images', im.id, im.blob);
        images[im.id] = URL.createObjectURL(im.blob);
      }
      const e = { ...ex, updatedAt: now(), createdAt: ex.createdAt || now() };
      await db.put('exercises', e.id, e);
      setS(p => ({ ...p, images: { ...p.images, ...images }, exercises: p.exercises.filter(x => x.id !== e.id).concat([e]) }));
      await afterWrite();
      return e;
    },
    async updateSettings(patch) {
      const settings = { ...ref.current.settings, ...patch, updatedAt: now() };
      await db.put('meta', 'settings', settings);
      setS(p => ({ ...p, settings }));
      await afterWrite();
    },
    async setGithub(cfg) {
      if (cfg) await testConnection(cfg);
      await db.put('meta', 'github', cfg);
      if (!cfg) await db.put('meta', 'uploadedImages', []);
      setS(p => ({ ...p, github: cfg }));
      setSync({ status: 'idle', error: null });
    },
    syncNow: () => runSync(),
  };

  if (!s) return null;
  return <Ctx.Provider value={{ ...s, sync, ...actions }}>{children}</Ctx.Provider>;
}
