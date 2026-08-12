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
    querySnapshot.forEach((doc) => {
      items.push({ ...doc.data() } as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

/**
 * Performs a batch save of a collection (e.g. for initial seeding or bulk import)
 */
export async function dbSaveCollection<T extends { id: string }>(collectionName: string, items: T[]) {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      const cleanedItem = cleanObject(item);
      batch.set(docRef, cleanedItem);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}
