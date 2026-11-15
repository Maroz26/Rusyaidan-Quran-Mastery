import type { StudyCollection, VerseTransition } from '../types/quran';
import { getInitialSeedCollections } from './quranService';

const DB_NAME = 'RusyaidanQuranMasteryDB';
const DB_VERSION = 1;

const STORE_COLLECTIONS = 'collections';
const STORE_TRANSITIONS = 'transitions';

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Collections store
      if (!db.objectStoreNames.contains(STORE_COLLECTIONS)) {
        const colStore = db.createObjectStore(STORE_COLLECTIONS, { keyPath: 'id' });
        colStore.createIndex('type', 'type', { unique: false });
        colStore.createIndex('referenceNumber', 'referenceNumber', { unique: false });
      }

      // Transitions store
      if (!db.objectStoreNames.contains(STORE_TRANSITIONS)) {
        const transStore = db.createObjectStore(STORE_TRANSITIONS, { keyPath: 'id' });
        transStore.createIndex('collectionId', 'collectionId', { unique: false });
        transStore.createIndex('surahNumber', 'surahNumber', { unique: false });
        transStore.createIndex('collection_verses', ['collectionId', 'firstVerseNumber', 'nextVerseNumber'], { unique: true });
      }
    };

    request.onsuccess = async () => {
      dbInstance = request.result;

      // Ensure initial seed collections exist
      try {
        await seedDefaultCollections(dbInstance);
      } catch (err) {
        console.error('Failed to seed default collections', err);
      }

      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
  });
}

async function seedDefaultCollections(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readwrite');
    const store = tx.objectStore(STORE_COLLECTIONS);
    const countReq = store.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        const seeds = getInitialSeedCollections();
        for (const seed of seeds) {
          store.put(seed);
        }
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all study collections
 */
export async function getCollections(): Promise<StudyCollection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readonly');
    const store = tx.objectStore(STORE_COLLECTIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort collections: surah 7 first, then 9, then others by referenceNumber
      const list = (request.result as StudyCollection[]).sort((a, b) => a.referenceNumber - b.referenceNumber);
      resolve(list);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a single collection by ID
 */
export async function getCollectionById(collectionId: string): Promise<StudyCollection | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readonly');
    const store = tx.objectStore(STORE_COLLECTIONS);
    const request = store.get(collectionId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add or update a collection
 */
export async function saveCollection(collection: StudyCollection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readwrite');
    const store = tx.objectStore(STORE_COLLECTIONS);
    const request = store.put(collection);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all verse transitions, optionally filtered by collectionId
 */
export async function getTransitions(collectionId?: string): Promise<VerseTransition[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSITIONS, 'readonly');
    const store = tx.objectStore(STORE_TRANSITIONS);

    let request: IDBRequest<VerseTransition[]>;
    if (collectionId) {
      const index = store.index('collectionId');
      request = index.getAll(collectionId);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      // Sort by firstVerseNumber ascending
      const sorted = (request.result as VerseTransition[]).sort(
        (a, b) => a.firstVerseNumber - b.firstVerseNumber
      );
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a single transition by ID
 */
export async function getTransitionById(id: string): Promise<VerseTransition | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSITIONS, 'readonly');
    const store = tx.objectStore(STORE_TRANSITIONS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a new transition with validation for duplicate
 */
export async function addTransition(transition: VerseTransition): Promise<void> {
  const db = await openDB();

  // Validate duplicate
  const isDup = await isTransitionDuplicate(
    transition.collectionId,
    transition.firstVerseNumber,
    transition.nextVerseNumber
  );
  if (isDup) {
    throw new Error(
      `Transisi ayat ${transition.firstVerseNumber} → ${transition.nextVerseNumber} sudah terdaftar dalam koleksi ini.`
    );
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSITIONS, 'readwrite');
    const store = tx.objectStore(STORE_TRANSITIONS);
    const request = store.add(transition);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update memorization strength score (1-10) for a transition
 */
export async function updateTransitionScore(id: string, newScore: number): Promise<void> {
  // Clamp score strictly between 1 and 10
  const clampedScore = Math.max(1, Math.min(10, Math.round(newScore)));
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSITIONS, 'readwrite');
    const store = tx.objectStore(STORE_TRANSITIONS);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const record = getReq.result as VerseTransition | undefined;
      if (!record) {
        reject(new Error(`Transisi dengan id ${id} tidak ditemukan.`));
        return;
      }

      record.memorizationScore = clampedScore;
      record.updatedAt = new Date().toISOString();

      const putReq = store.put(record);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Delete a transition
 */
export async function deleteTransition(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSITIONS, 'readwrite');
    const store = tx.objectStore(STORE_TRANSITIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Check if a transition already exists in the given collection
 */
export async function isTransitionDuplicate(
  collectionId: string,
  firstVerseNumber: number,
  nextVerseNumber: number
): Promise<boolean> {
  const transitions = await getTransitions(collectionId);
  return transitions.some(
    (t) => t.firstVerseNumber === firstVerseNumber && t.nextVerseNumber === nextVerseNumber
  );
}

/**
 * Calculate count and average score for a collection
 */
export async function getCollectionStats(
  collectionId: string
): Promise<{ count: number; avgScore: number | null }> {
  const transitions = await getTransitions(collectionId);
  if (transitions.length === 0) {
    return { count: 0, avgScore: null };
  }
  const sum = transitions.reduce((acc, curr) => acc + curr.memorizationScore, 0);
  const avg = Number((sum / transitions.length).toFixed(1));
  return { count: transitions.length, avgScore: avg };
}
