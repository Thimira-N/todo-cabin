import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Helper to convert Firestore data to proper types
const convertDates = (data: any) => {
    if (!data) return data;

    const result = { ...data };
    for (const key in result) {
        if (key.endsWith('At') || key === 'date' || key === 'dueDate') {
            result[key] = new Date(result[key]);
        }
    }
    return result;
};

export const firestore = {
    set: async <T>(collectionName: string, id: string, data: T): Promise<void> => {
        // Convert Dates to strings for Firestore
        const dataForFirestore = JSON.parse(JSON.stringify(data));
        await setDoc(doc(db, collectionName, id), dataForFirestore);
    },

    get: async <T>(collectionName: string, id: string): Promise<T | null> => {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? convertDates(docSnap.data()) as T : null;
    },

    getAll: async <T>(collectionName: string): Promise<T[]> => {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => convertDates(doc.data()) as T);
    },

    getWhere: async <T>(
        collectionName: string,
        field: string | string[],
        value: any | any[]
    ): Promise<T[]> => {
        let q = query(collection(db, collectionName));

        if (Array.isArray(field)) {
            // Handle array of fields/values
            if (!Array.isArray(value) || field.length !== value.length) {
                throw new Error('Fields and values arrays must be the same length');
            }

            field.forEach((f, i) => {
                q = query(q, where(f, '==', value[i]));
            });
        } else {
            // Handle single field/value
            q = query(q, where(field, '==', value));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => convertDates(doc.data()) as T);
    },

    update: async <T>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
        const dataForFirestore = JSON.parse(JSON.stringify(data));
        await updateDoc(doc(db, collectionName, id), dataForFirestore);
    },

    delete: async (collectionName: string, id: string): Promise<void> => {
        await deleteDoc(doc(db, collectionName, id));
    }
};