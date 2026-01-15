// Medicine Storage - Firestore Version with localStorage fallback
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

export interface Medicine {
  id: string;
  nombre: string;
  dosis: string;
  horarios: string[];
  duration?: 'chronic' | 'temporary';
  endDate?: string;
  userId: string;
}

const COLLECTION = "medicines";
const LOCAL_KEY = "glucobot_medicines";

// Get current user ID from localStorage (since we're using local auth)
const getCurrentUserId = (): string | null => {
  const user = localStorage.getItem("glucobot_current_user");
  if (user) {
    return JSON.parse(user).id;
  }
  return null;
};

// Realtime subscription with Firestore
export const subscribeToMedicines = (callback: (meds: Medicine[]) => void, targetUserId?: string) => {
  const uid = targetUserId || getCurrentUserId();

  if (!uid) {
    callback([]);
    return () => { };
  }

  try {
    const q = query(collection(db, COLLECTION), where("userId", "==", uid));

    return onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Medicine[];
      callback(meds);
    }, (error) => {
      console.error("Firestore subscription error, falling back to localStorage:", error);
      // Fallback to localStorage
      const local = localStorage.getItem(LOCAL_KEY);
      callback(local ? JSON.parse(local) : []);
    });
  } catch (error) {
    console.error("Error setting up subscription:", error);
    const local = localStorage.getItem(LOCAL_KEY);
    callback(local ? JSON.parse(local) : []);
    return () => { };
  }
};

export const addMedicine = async (medicine: Omit<Medicine, "id" | "userId">) => {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("User not authenticated");

  try {
    await addDoc(collection(db, COLLECTION), {
      ...medicine,
      userId: uid,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore addMedicine failed, saving locally:", error);
    // Fallback to localStorage
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    local.push({ ...medicine, id: Date.now().toString(), userId: uid });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
  }
};

export const updateMedicine = async (id: string, updated: Partial<Medicine>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, updated);
  } catch (error) {
    console.error("Firestore updateMedicine failed:", error);
  }
};

export const deleteMedicine = async (id: string) => {
  if (!id) return;
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Firestore deleteMedicine failed:", error);
  }
};

// One-time fetch
export const getMedicines = async (): Promise<Medicine[]> => {
  const uid = getCurrentUserId();
  if (!uid) return [];

  try {
    const q = query(collection(db, COLLECTION), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    })) as Medicine[];
  } catch (error) {
    console.error("Firestore getMedicines failed, using localStorage:", error);
    const local = localStorage.getItem(LOCAL_KEY);
    return local ? JSON.parse(local) : [];
  }
};
