import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'production-offline';
const DB_VERSION = 1;

export interface TimeEntry {
  id: string;
  userId: string;
  timestamp: number;
  type: 'clock-in' | 'clock-out';
  synced: boolean;
}

export interface ChecklistEntry {
  id: string;
  checklistId: string;
  completed: boolean;
  timestamp: number;
  photos?: string[];
  synced: boolean;
}

export interface SOPCache {
  id: string;
  title: string;
  content: string;
  cachedAt: number;
}

let dbInstance: IDBPDatabase | null = null;

export const initOfflineDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Time entries queue
      if (!db.objectStoreNames.contains('time-entries')) {
        const timeStore = db.createObjectStore('time-entries', { keyPath: 'id' });
        timeStore.createIndex('synced', 'synced');
      }
      
      // Checklist completions
      if (!db.objectStoreNames.contains('checklists')) {
        const checklistStore = db.createObjectStore('checklists', { keyPath: 'id' });
        checklistStore.createIndex('synced', 'synced');
      }
      
      // SOPs cache
      if (!db.objectStoreNames.contains('sops')) {
        const sopStore = db.createObjectStore('sops', { keyPath: 'id' });
        sopStore.createIndex('cachedAt', 'cachedAt');
      }
    }
  });
  
  dbInstance = db;
  return db;
};

// Save time entry offline
export const saveTimeEntryOffline = async (entry: TimeEntry) => {
  const db = await initOfflineDB();
  await db.put('time-entries', entry);
};

// Get all unsynced time entries
export const getUnsyncedTimeEntries = async (): Promise<TimeEntry[]> => {
  const db = await initOfflineDB();
  const index = db.transaction('time-entries').store.index('synced');
  // Query for entries where synced is falsy (0/false in IndexedDB)
  return await index.getAll(IDBKeyRange.only(0));
};

// Delete time entry after sync
export const deleteTimeEntry = async (id: string) => {
  const db = await initOfflineDB();
  await db.delete('time-entries', id);
};

// Save checklist entry offline
export const saveChecklistOffline = async (entry: ChecklistEntry) => {
  const db = await initOfflineDB();
  await db.put('checklists', entry);
};

// Get all unsynced checklist entries
export const getUnsyncedChecklists = async (): Promise<ChecklistEntry[]> => {
  const db = await initOfflineDB();
  const index = db.transaction('checklists').store.index('synced');
  // Query for entries where synced is falsy (0/false in IndexedDB)
  return await index.getAll(IDBKeyRange.only(0));
};

// Delete checklist entry after sync
export const deleteChecklistEntry = async (id: string) => {
  const db = await initOfflineDB();
  await db.delete('checklists', id);
};

// Cache SOP
export const cacheSOP = async (sop: SOPCache) => {
  const db = await initOfflineDB();
  await db.put('sops', sop);
};

// Get cached SOP
export const getCachedSOP = async (id: string): Promise<SOPCache | undefined> => {
  const db = await initOfflineDB();
  return await db.get('sops', id);
};

// Get all cached SOPs
export const getAllCachedSOPs = async (): Promise<SOPCache[]> => {
  const db = await initOfflineDB();
  return await db.getAll('sops');
};

// Clear old SOP cache (older than 7 days)
export const clearOldSOPCache = async () => {
  const db = await initOfflineDB();
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  // Use cursor to iterate and delete to reduce memory usage
  const tx = db.transaction('sops', 'readwrite');
  const index = tx.store.index('cachedAt');
  let cursor = await index.openCursor(IDBKeyRange.upperBound(sevenDaysAgo));
  
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  
  await tx.done;
};
