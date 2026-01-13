import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

export interface Medicine {
  id: string; // Changed from number to string for Firestore IDs
  nombre: string;
  dosis: string;
  horarios: string[];
  duration?: 'chronic' | 'temporary';
  endDate?: string;
  userId: string; // New field to link to user
}

const COLLECTION = "medicines";

// Realtime subscription
export const subscribeToMedicines = (callback: (meds: Medicine[]) => void, targetUserId?: string) => {
  const user = auth.currentUser;
  const uid = targetUserId || user?.uid;

  if (!uid) {
    callback([]);
    return () => { };
  }

  const q = query(collection(db, COLLECTION), where("userId", "==", uid));

  return onSnapshot(q, (snapshot) => {
    const meds = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Medicine[];
    callback(meds);
  });
};

export const addMedicine = async (medicine: Omit<Medicine, "id" | "userId">) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  await addDoc(collection(db, COLLECTION), {
    ...medicine,
    userId: user.uid,
    createdAt: new Date()
  });
};

export const updateMedicine = async (id: string, updated: Partial<Medicine>) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, updated);
};

export const deleteMedicine = async (id: string) => {
  if (!id) return; // Prevent deleting undefined
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

// Legacy support / One-time fetch if needed
// But we should prefer subscription
export const getMedicines = async (): Promise<Medicine[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(collection(db, COLLECTION), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as Medicine[];
};

