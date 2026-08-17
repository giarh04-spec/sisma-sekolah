import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';

// Memory cache for differential sync to drastically reduce Firestore write quota
const collectionCache = new Map<string, Map<string, string>>();

/**
 * Validates connection to Firestore at app startup (Critical constraint)
 */
export async function validateFirestoreConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    // console.log('Firestore connection validation succeeded.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // Gracing connectivity checks to prevent total app blockage
  }
}

/**
 * Helper to recursively clean object properties, removing any 'undefined' fields
 * before they are sent to Firestore (which would cause a write error).
 */
function cleanObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanObject) as unknown as T;
  }
  if (typeof obj === 'string') {
    // Firestore has a 1MB document size limit. 
    // Prevent huge base64 data strings (e.g. >800KB) from causing a crash.
    if (obj.length > 800000 && obj.startsWith('data:image')) {
      console.warn('Skipping oversized image data string to prevent Firestore limit error');
      return '' as unknown as T;
    }
    return obj;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          cleaned[key] = cleanObject(val);
        }
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Saves or updates a single document in a collection
 */
export async function dbSaveItem<T extends { id: string }>(collectionName: string, item: T) {
  const path = `${collectionName}/${item.id}`;
  try {
    const docRef = doc(db, collectionName, item.id);
    const cleanedItem = cleanObject(item);
    await setDoc(docRef, cleanedItem);
    
    // Update cache
    const cacheMap = collectionCache.get(collectionName) || new Map<string, string>();
    cacheMap.set(item.id, JSON.stringify(cleanedItem));
    collectionCache.set(collectionName, cacheMap);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a single document from a collection
 */
export async function dbDeleteItem(collectionName: string, id: string) {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    
    // Update cache
    const cacheMap = collectionCache.get(collectionName);
    if (cacheMap) {
      cacheMap.delete(id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches all documents from a Firestore collection
 */
export async function dbFetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    const cacheMap = new Map<string, string>();
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      const data = { id: doc.id, ...docData } as unknown as T;
      items.push(data);
      cacheMap.set(doc.id, JSON.stringify(data));
    });
    collectionCache.set(collectionName, cacheMap);
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

/**
 * Clears all documents from a Firestore collection
 */
export async function dbClearCollection(collectionName: string): Promise<boolean> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    collectionCache.set(collectionName, new Map());
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionName);
    return false;
  }
}

/**
 * Performs a batch save of a collection (e.g. for initial seeding or bulk import)
 * Uses a memory cache to perform a differential sync, drastically reducing Firestore writes.
 */
export async function dbSaveCollection<T extends { id: string }>(collectionName: string, items: T[]) {
  try {
    const cacheMap = collectionCache.get(collectionName) || new Map<string, string>();
    const newCacheMap = new Map<string, string>();
    const itemsToWrite: T[] = [];
    const itemsToDelete: string[] = [];

    // 1. Find additions and modifications
    for (const item of items) {
      const cleanedItem = cleanObject(item);
      const itemStr = JSON.stringify(cleanedItem);
      newCacheMap.set(item.id, itemStr);
      
      if (cacheMap.get(item.id) !== itemStr) {
        itemsToWrite.push(cleanedItem);
      }
    }

    // 2. Find deletions (in old cache but not in new array)
    for (const oldId of cacheMap.keys()) {
      if (!newCacheMap.has(oldId)) {
        itemsToDelete.push(oldId);
      }
    }

    // If nothing changed, exit early to save quota
    if (itemsToWrite.length === 0 && itemsToDelete.length === 0) {
      return; 
    }

    const CHUNK_SIZE = 450;
    
    // Process writes
    for (let i = 0; i < itemsToWrite.length; i += CHUNK_SIZE) {
      const chunk = itemsToWrite.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    }
    
    // Process deletes
    for (let i = 0; i < itemsToDelete.length; i += CHUNK_SIZE) {
      const chunk = itemsToDelete.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((id) => {
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
      });
      await batch.commit();
    }
    
    // Update cache
    collectionCache.set(collectionName, newCacheMap);

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}
