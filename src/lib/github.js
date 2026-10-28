// Backup and sync to a private GitHub repository through the Contents API.
// data.json holds exercises, entries and settings; images/<id>.jpg holds technique photos.
// Merging is per record: the copy with the newer updatedAt wins, deletions travel as tombstones.

const API = 'https://api.github.com';

async function gh(cfg, path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + cfg.token,
      Accept: opts.accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  return res;
}

const contents = (cfg, file) => '/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + file;

async function fail(res, what) {
  let msg = '';
  try { msg = (await res.json()).message || ''; } catch { /* body is not JSON */ }
  if (res.status === 401) return new Error('Token je neplatný alebo vypršal.');
  if (res.status === 403) return new Error('Token nemá právo zapisovať do repozitára (' + msg + ').');
  if (res.status === 404) return new Error('Repozitár ' + what + ' neexistuje alebo k nemu token nemá prístup.');
  return new Error('GitHub ' + res.status + (msg ? ': ' + msg : ''));
}

function b64encodeBytes(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

const b64encodeText = (text) => b64encodeBytes(new TextEncoder().encode(text));

function b64decodeText(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function testConnection(cfg) {
  const res = await gh(cfg, '/repos/' + cfg.owner + '/' + cfg.repo);
  if (!res.ok) throw await fail(res, cfg.owner + '/' + cfg.repo);
  const repo = await res.json();
  if (repo.permissions && !repo.permissions.push) throw new Error('Token má k repozitáru len čítanie.');
  return { private: repo.private, name: repo.full_name };
}

async function readData(cfg) {
  const res = await gh(cfg, contents(cfg, 'data.json'));
  if (res.status === 404) {
    // Either the file or the whole repo is missing; tell them apart.
    await testConnection(cfg);
    return { data: null, sha: null };
  }
  if (!res.ok) throw await fail(res, cfg.owner + '/' + cfg.repo);
  const meta = await res.json();
  let text;
  if (meta.encoding === 'base64' && meta.content) text = b64decodeText(meta.content);
  else {
    const raw = await gh(cfg, contents(cfg, 'data.json'), { accept: 'application/vnd.github.raw+json' });
    if (!raw.ok) throw await fail(raw, cfg.owner + '/' + cfg.repo);
    text = await raw.text();
  }
  return { data: JSON.parse(text), sha: meta.sha };
}

async function writeData(cfg, data, sha) {
  const body = { message: 'Maximálky: záloha ' + new Date().toISOString().slice(0, 16).replace('T', ' '), content: b64encodeText(JSON.stringify(data, null, 1)) };
  if (sha) body.sha = sha;
  const res = await gh(cfg, contents(cfg, 'data.json'), { method: 'PUT', body: JSON.stringify(body) });
  if (res.status === 409 || res.status === 422) return false; // someone else wrote first — caller retries
  if (!res.ok) throw await fail(res, cfg.owner + '/' + cfg.repo);
  return true;
}

export async function uploadImage(cfg, id, blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const res = await gh(cfg, contents(cfg, 'images/' + id + '.jpg'), {
    method: 'PUT', body: JSON.stringify({ message: 'Maximálky: obrázok ' + id, content: b64encodeBytes(bytes) }),
  });
  // 422 means the file already exists; images are immutable, so that counts as uploaded.
  if (!res.ok && res.status !== 422) throw await fail(res, cfg.owner + '/' + cfg.repo);
}

export async function downloadImage(cfg, id) {
  const res = await gh(cfg, contents(cfg, 'images/' + id + '.jpg'), { accept: 'application/vnd.github.raw+json' });
  if (res.status === 404) return null;
  if (!res.ok) throw await fail(res, cfg.owner + '/' + cfg.repo);
  return new Blob([await res.arrayBuffer()], { type: 'image/jpeg' });
}

function mergeList(local, remote) {
  const map = new Map(local.map(r => [r.id, r]));
  let localChanged = false;
  for (const r of remote || []) {
    const l = map.get(r.id);
    if (!l || (r.updatedAt || 0) > (l.updatedAt || 0)) { map.set(r.id, r); localChanged = true; }
  }
  const merged = [...map.values()];
  const remoteIds = new Map((remote || []).map(r => [r.id, r.updatedAt || 0]));
  const remoteChanged = merged.some(r => !remoteIds.has(r.id) || remoteIds.get(r.id) < (r.updatedAt || 0));
  return { merged, localChanged, remoteChanged };
}

// Pull, merge, push. `local` is { exercises, entries, settings }; returns the merged state.
export async function syncData(cfg, local) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, sha } = await readData(cfg);
    const r = data || {};
    const ex = mergeList(local.exercises, r.exercises);
    const en = mergeList(local.entries, r.entries);
    const remoteSettingsNewer = r.settings && (r.settings.updatedAt || 0) > (local.settings.updatedAt || 0);
    const settings = remoteSettingsNewer ? r.settings : local.settings;
    const settingsPush = !r.settings || (local.settings.updatedAt || 0) > (r.settings.updatedAt || 0);
    const merged = { version: 1, exercises: ex.merged, entries: en.merged, settings };
    if (!data || ex.remoteChanged || en.remoteChanged || settingsPush) {
      if (!(await writeData(cfg, merged, sha))) continue;
    }
    return { ...merged, localChanged: ex.localChanged || en.localChanged || remoteSettingsNewer };
  }
  throw new Error('Záloha sa práve mení z iného zariadenia, skús to o chvíľu.');
}
