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
 * Saves or updates a single document in a collection
 */
export async function dbSaveItem<T extends { id: string }>(collectionName: string, item: T) {
  const path = `${collectionName}/${item.id}`;
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item);
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
      batch.set(docRef, item);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}
