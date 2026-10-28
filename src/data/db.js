// Thin promise wrapper over IndexedDB. Everything the app knows lives here, on the phone.

const DB_NAME = 'maximalky';
const STORES = ['exercises', 'entries', 'images', 'meta'];

let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

const done = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

async function store(name, mode = 'readonly') {
  return (await open()).transaction(name, mode).objectStore(name);
}

export async function getAll(name) {
  return done((await store(name)).getAll());
}

export async function get(name, key) {
  return done((await store(name)).get(key));
}

export async function put(name, key, value) {
  return done((await store(name, 'readwrite')).put(value, key));
}

export async function del(name, key) {
  return done((await store(name, 'readwrite')).delete(key));
}

export async function putMany(name, items) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(name, 'readwrite');
    const s = tx.objectStore(name);
    for (const it of items) s.put(it, it.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function allKeys(name) {
  return done((await store(name)).getAllKeys());
}
