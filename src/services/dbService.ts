import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { StudyCollection, VerseTransition } from '../types/quran';
import { auth, firestore } from '../firebase';
import { getInitialSeedCollections } from './quranService';

const DB_NAME = 'RusyaidanQuranMasteryDB';
const DB_VERSION = 1;
const STORE_COLLECTIONS = 'collections';
const STORE_TRANSITIONS = 'transitions';

let dbInstance: IDBDatabase | null = null;
let userPromise: Promise<User> | null = null;
let cloudReadyPromise: Promise<string> | null = null;

function getUser(): Promise<User> {
  if (!userPromise) {
    userPromise = (async () => {
      await auth.authStateReady();

      const user = auth.currentUser;

      if (!user) {
        throw new Error(
          "Kamu harus login menggunakan Google terlebih dahulu."
        );
      }

      return user;
    })();
  }

  return userPromise.catch((error: unknown) => {
    userPromise = null;
    throw error;
  });
}
function userCollection(userId: string, name: 'collections' | 'transitions' | 'transitionKeys') {
  return collection(firestore, 'users', userId, name);
}

function transitionKey(transition: Pick<
  VerseTransition,
  'collectionId' | 'firstVerseNumber' | 'nextVerseNumber'
>): string {
  return `${encodeURIComponent(transition.collectionId)}_${transition.firstVerseNumber}_${transition.nextVerseNumber}`;
}

function readLocalStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function migrateLocalData(userId: string, db: IDBDatabase): Promise<void> {
  const migrationRef = doc(firestore, 'users', userId, 'metadata', 'legacyDataImport');
  const migrationSnapshot = await getDoc(migrationRef);

  if (migrationSnapshot.exists()) {
    const state = migrationSnapshot.data().state;
    if (state !== 'in-progress') return;
  } else {
    const [cloudCollections, cloudTransitions] = await Promise.all([
      getDocs(userCollection(userId, 'collections')),
      getDocs(userCollection(userId, 'transitions')),
    ]);

    if (!cloudCollections.empty || !cloudTransitions.empty) {
      await setDoc(migrationRef, {
        state: 'skipped-cloud-data-exists',
        completedAt: new Date().toISOString(),
      });
      return;
    }

    await setDoc(migrationRef, {
      state: 'in-progress',
      startedAt: new Date().toISOString(),
    });
  }

  const [collections, transitions] = await Promise.all([
    readLocalStore<StudyCollection>(db, STORE_COLLECTIONS),
    readLocalStore<VerseTransition>(db, STORE_TRANSITIONS),
  ]);
  const writes: Array<{ ref: DocumentReference; data: object }> = [];

  for (const studyCollection of collections) {
    writes.push({
      ref: doc(userCollection(userId, 'collections'), studyCollection.id),
      data: studyCollection,
    });
  }

  for (const transition of transitions) {
    writes.push({
      ref: doc(userCollection(userId, 'transitions'), transition.id),
      data: transition,
    });
    writes.push({
      ref: doc(userCollection(userId, 'transitionKeys'), transitionKey(transition)),
      data: { transitionId: transition.id },
    });
  }

  for (let index = 0; index < writes.length; index += 400) {
    const batch = writeBatch(firestore);
    for (const write of writes.slice(index, index + 400)) {
      batch.set(write.ref, write.data);
    }
    await batch.commit();
  }

  await setDoc(migrationRef, {
    state: 'complete',
    collectionCount: collections.length,
    transitionCount: transitions.length,
    completedAt: new Date().toISOString(),
  });
}

async function ensureCloudReady(db: IDBDatabase): Promise<string> {
  if (!cloudReadyPromise) {
    cloudReadyPromise = (async () => {
      const user = await getUser();
      await migrateLocalData(user.uid, db);
      return user.uid;
    })();
  }

  return cloudReadyPromise.catch((error: unknown) => {
    cloudReadyPromise = null;
    throw error;
  });
}

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_COLLECTIONS)) {
        const colStore = db.createObjectStore(STORE_COLLECTIONS, { keyPath: 'id' });
        colStore.createIndex('type', 'type', { unique: false });
        colStore.createIndex('referenceNumber', 'referenceNumber', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_TRANSITIONS)) {
        const transStore = db.createObjectStore(STORE_TRANSITIONS, { keyPath: 'id' });
        transStore.createIndex('collectionId', 'collectionId', { unique: false });
        transStore.createIndex('surahNumber', 'surahNumber', { unique: false });
        transStore.createIndex(
          'collection_verses',
          ['collectionId', 'firstVerseNumber', 'nextVerseNumber'],
          { unique: true },
        );
      }
    };

    request.onsuccess = async () => {
      const db = request.result;
      try {
        await seedDefaultCollections(db);
        dbInstance = db;
        resolve(db);
      } catch (error) {
        db.close();
        reject(error);
      }
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
        for (const seed of getInitialSeedCollections()) {
          store.put(seed);
        }
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    countReq.onerror = () => reject(countReq.error);
  });
}

export async function getCollections(): Promise<StudyCollection[]> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const snapshot = await getDocs(userCollection(userId, 'collections'));
  return snapshot.docs
    .map((item) => ({ ...item.data(), id: item.id }) as StudyCollection)
    .sort((a, b) => a.referenceNumber - b.referenceNumber);
}

export async function getCollectionById(collectionId: string): Promise<StudyCollection | undefined> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const snapshot = await getDoc(doc(userCollection(userId, 'collections'), collectionId));
  return snapshot.exists()
    ? ({ ...snapshot.data(), id: snapshot.id } as StudyCollection)
    : undefined;
}

export async function saveCollection(studyCollection: StudyCollection): Promise<void> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  await setDoc(doc(userCollection(userId, 'collections'), studyCollection.id), studyCollection);
}

export async function getTransitions(collectionId?: string): Promise<VerseTransition[]> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const snapshot = await getDocs(userCollection(userId, 'transitions'));
  return snapshot.docs
    .map((item) => ({ ...item.data(), id: item.id }) as VerseTransition)
    .filter((transition) => !collectionId || transition.collectionId === collectionId)
    .sort((a, b) => a.firstVerseNumber - b.firstVerseNumber);
}

export async function getTransitionById(id: string): Promise<VerseTransition | undefined> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const snapshot = await getDoc(doc(userCollection(userId, 'transitions'), id));
  return snapshot.exists()
    ? ({ ...snapshot.data(), id: snapshot.id } as VerseTransition)
    : undefined;
}

export async function addTransition(transition: VerseTransition): Promise<void> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const transitionRef = doc(userCollection(userId, 'transitions'), transition.id);
  const keyRef = doc(userCollection(userId, 'transitionKeys'), transitionKey(transition));

  await runTransaction(firestore, async (transaction) => {
    const existing = await transaction.get(keyRef);
    if (existing.exists()) {
      throw new Error(
        `Transisi ayat ${transition.firstVerseNumber} → ${transition.nextVerseNumber} sudah terdaftar dalam koleksi ini.`,
      );
    }
    transaction.set(transitionRef, transition);
    transaction.set(keyRef, { transitionId: transition.id });
  });
}

export async function updateTransitionScore(id: string, newScore: number): Promise<void> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const transitionRef = doc(userCollection(userId, 'transitions'), id);
  const clampedScore = Math.max(1, Math.min(10, Math.round(newScore)));

  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(transitionRef);
    if (!snapshot.exists()) {
      throw new Error(`Transisi dengan id ${id} tidak ditemukan.`);
    }
    const record = {
      ...snapshot.data(),
      id: snapshot.id,
      memorizationScore: clampedScore,
      updatedAt: new Date().toISOString(),
    } as VerseTransition;
    transaction.set(transitionRef, record);
  });
}

export async function deleteTransition(id: string): Promise<void> {
  const db = await openDB();
  const userId = await ensureCloudReady(db);
  const transitionRef = doc(userCollection(userId, 'transitions'), id);

  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(transitionRef);
    if (snapshot.exists()) {
      const transition = snapshot.data() as VerseTransition;
      transaction.delete(
        doc(userCollection(userId, 'transitionKeys'), transitionKey(transition)),
      );
      transaction.delete(transitionRef);
    }
  });

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSITIONS, 'readwrite');
    tx.objectStore(STORE_TRANSITIONS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function isTransitionDuplicate(
  collectionId: string,
  firstVerseNumber: number,
  nextVerseNumber: number,
): Promise<boolean> {
  const transitions = await getTransitions(collectionId);
  return transitions.some(
    (transition) =>
      transition.firstVerseNumber === firstVerseNumber &&
      transition.nextVerseNumber === nextVerseNumber,
  );
}

export async function getCollectionStats(
  collectionId: string,
): Promise<{ count: number; avgScore: number | null }> {
  const transitions = await getTransitions(collectionId);
  if (transitions.length === 0) {
    return { count: 0, avgScore: null };
  }
  const sum = transitions.reduce((acc, curr) => acc + curr.memorizationScore, 0);
  return { count: transitions.length, avgScore: Number((sum / transitions.length).toFixed(1)) };
}
