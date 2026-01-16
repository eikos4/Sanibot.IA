// Weight Storage - Improved with timeouts and persistent height
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    limit,
    where
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface WeightEntry {
    id: string;
    date: string;
    weight: number;
    height: number;
    bmi: number;
    userId?: string;
}

const COLLECTION = "weight_history";
const LOCAL_KEY = "glucobot_weight";
const HEIGHT_KEY = "glucobot_user_height";
const TIMEOUT_MS = 5000;

const getCurrentUserId = (): string | null => {
    try {
        const user = localStorage.getItem("glucobot_current_user");
        if (user) {
            const parsed = JSON.parse(user);
            return parsed.id || null;
        }
    } catch (e) {
        console.error("Error getting user ID:", e);
    }
    return null;
};

// Helper to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => {
            console.warn(`Weight operation timed out after ${ms}ms`);
            resolve(fallback);
        }, ms))
    ]);
};

// Local storage helpers
const getLocalHistory = (): WeightEntry[] => {
    try {
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalHistory = (entries: WeightEntry[]): void => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
};

// Persistent height management
export const getSavedHeight = (): number | null => {
    const height = localStorage.getItem(HEIGHT_KEY);
    return height ? parseFloat(height) : null;
};

export const saveHeight = (height: number): void => {
    localStorage.setItem(HEIGHT_KEY, height.toString());
};

export const getWeightHistory = async (): Promise<WeightEntry[]> => {
    const uid = getCurrentUserId();
    const localData = getLocalHistory();

    if (!uid) {
        return localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const firestoreGet = async (): Promise<WeightEntry[]> => {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", uid),
            orderBy("date", "desc"),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as WeightEntry));
    };

    try {
        const firestoreData = await withTimeout(firestoreGet(), TIMEOUT_MS, []);
        // Merge and sort by date desc
        const allData = [...firestoreData, ...localData];
        return allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("getWeightHistory failed:", error);
        return localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
};

export const saveWeightEntry = async (weight: number, height: number, bmi: number): Promise<boolean> => {
    const uid = getCurrentUserId();

    // Always save height for future use
    saveHeight(height);

    const entry: Omit<WeightEntry, "id"> = {
        date: new Date().toISOString(),
        weight,
        height,
        bmi
    };

    const localId = `local_${Date.now()}`;
    const localEntry = { ...entry, id: localId };

    if (!uid) {
        const history = getLocalHistory();
        history.unshift(localEntry);
        saveLocalHistory(history);
        console.log("Saved weight locally (no user)");
        return true;
    }

    const firestoreSave = async (): Promise<boolean> => {
        await addDoc(collection(db, COLLECTION), {
            ...entry,
            userId: uid
        });
        console.log("Saved weight to Firestore");
        return true;
    };

    try {
        const result = await withTimeout(firestoreSave(), TIMEOUT_MS, false);
        if (!result) {
            // Timeout - save locally
            const history = getLocalHistory();
            history.unshift(localEntry);
            saveLocalHistory(history);
            console.log("Timeout - saved weight locally");
        }
        return true;
    } catch (error) {
        console.error("saveWeightEntry failed:", error);
        const history = getLocalHistory();
        history.unshift(localEntry);
        saveLocalHistory(history);
        return true;
    }
};

export const deleteWeightEntry = async (id: string): Promise<boolean> => {
    // If local entry
    if (id.startsWith("local_")) {
        const history = getLocalHistory().filter(e => e.id !== id);
        saveLocalHistory(history);
        return true;
    }

    const uid = getCurrentUserId();
    if (!uid) return false;

    try {
        await withTimeout(deleteDoc(doc(db, COLLECTION, id)), TIMEOUT_MS, undefined);
        return true;
    } catch (error) {
        console.error("deleteWeightEntry failed:", error);
        return false;
    }
};

// Get latest weight
export const getLatestWeight = async (): Promise<WeightEntry | null> => {
    const history = await getWeightHistory();
    return history.length > 0 ? history[0] : null;
};
