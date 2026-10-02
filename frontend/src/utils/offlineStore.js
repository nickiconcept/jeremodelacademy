const DATABASE_NAME = 'jma-offline-v1';
const DATABASE_VERSION = 1;
const CACHE_STORE = 'api-cache';
const OUTBOX_STORE = 'outbox';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let databasePromise;

function getDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('Offline storage is unavailable in this browser.'));
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CACHE_STORE)) database.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) database.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open offline storage.'));
  });

  return databasePromise;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline storage request failed.'));
  });
}

function currentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('jma_offline_session') || '{}');
    if (session.user?.role !== 'teacher' || !session.user.id) return null;
    const token = localStorage.getItem('jma_token');
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return String(claims.sub) === String(session.user.id) ? session.user.id : null;
  } catch {
    return null;
  }
}

function scopedKey(key, userId = currentUserId()) {
  return userId ? `${userId}:${key}` : null;
}

function createSyncId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const randomHex = (length) => Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}-${randomHex(12)}`;
}

export async function cacheOfflineValue(key, value) {
  const scoped = scopedKey(key);
  if (!scoped) return;
  const database = await getDatabase();
  const transaction = database.transaction(CACHE_STORE, 'readwrite');
  await requestResult(transaction.objectStore(CACHE_STORE).put({ key: scoped, value, savedAt: Date.now() }));
}

export async function readOfflineValue(key) {
  const scoped = scopedKey(key);
  if (!scoped) return null;
  const database = await getDatabase();
  const record = await requestResult(database.transaction(CACHE_STORE, 'readonly').objectStore(CACHE_STORE).get(scoped));
  if (record && Date.now() - record.savedAt > CACHE_TTL_MS) {
    await requestResult(database.transaction(CACHE_STORE, 'readwrite').objectStore(CACHE_STORE).delete(scoped));
    return null;
  }
  return record?.value ?? null;
}

export async function enqueueOfflineRequest({ endpoint, method, body }) {
  const userId = currentUserId();
  if (!userId) throw new Error('Sign in online before creating offline work on this device.');
  const database = await getDatabase();
  const id = createSyncId();
  let queuedBody = { ...body, offline_sync: true, offline_sync_id: id };
  if (endpoint === '/attendance/save') {
    queuedBody = {
      ...queuedBody,
      captured_at: body.captured_at || new Date().toISOString(),
      timezone_offset_minutes: body.timezone_offset_minutes ?? new Date().getTimezoneOffset(),
    };
  }

  if (endpoint === '/grades/save') {
    const queuedRequests = await getOfflineQueue(userId);
    const matchingGradebooks = queuedRequests.filter((item) => {
      if (item.endpoint !== endpoint || item.blocked) return false;
      return String(item.body.class_id) === String(body.class_id)
        && String(item.body.subject_id) === String(body.subject_id)
        && item.body.term === body.term
        && item.body.academic_year === body.academic_year;
    });
    await Promise.all(matchingGradebooks.map((item) => removeOfflineRequest(item.id)));
  }

  const item = {
    id,
    userId: String(userId),
    endpoint,
    method,
    body: queuedBody,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: '',
  };
  await requestResult(database.transaction(OUTBOX_STORE, 'readwrite').objectStore(OUTBOX_STORE).add(item));
  return item;
}

export async function getOfflineQueue(userId = currentUserId()) {
  if (!userId) return [];
  const database = await getDatabase();
  const items = await requestResult(database.transaction(OUTBOX_STORE, 'readonly').objectStore(OUTBOX_STORE).getAll());
  return items.filter((item) => item.userId === String(userId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function updateOfflineRequest(item) {
  const database = await getDatabase();
  await requestResult(database.transaction(OUTBOX_STORE, 'readwrite').objectStore(OUTBOX_STORE).put(item));
}

export async function removeOfflineRequest(id) {
  const database = await getDatabase();
  await requestResult(database.transaction(OUTBOX_STORE, 'readwrite').objectStore(OUTBOX_STORE).delete(id));
}

export async function countOfflineRequests(userId = currentUserId()) {
  return (await getOfflineQueue(userId)).length;
}