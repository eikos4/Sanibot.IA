// Glucose Storage - Firestore Version with localStorage fallback and timeouts
import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    serverTimestamp
} from "firebase/firestore";

export interface GlucoseRecord {
    id?: string;
    valor: number;
    fecha: string;
    hora: string;
    comida: string;
    timestamp?: any;
    userId?: string;
}

const COLLECTION = "glucose_readings";
const LOCAL_KEY = "glucobot_glucose";
const TIMEOUT_MS = 5000; // 5 second timeout

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
            console.warn(`Operation timed out after ${ms}ms, using fallback`);
            resolve(fallback);
        }, ms))
    ]);
};

// Save to localStorage
const saveToLocalStorage = (record: GlucoseRecord): void => {
    try {
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        local.push({ ...record, id: Date.now().toString(), timestamp: Date.now() });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
        console.log("Saved to localStorage");
    } catch (e) {
        console.error("Error saving to localStorage:", e);
    }
};

// Get from localStorage
const getFromLocalStorage = (): GlucoseRecord[] => {
    try {
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    } catch (e) {
        console.error("Error reading from localStorage:", e);
        return [];
    }
};

export const saveGlucose = async (record: Omit<GlucoseRecord, "timestamp" | "id" | "userId">): Promise<boolean> => {
    const uid = getCurrentUserId();

    // Even without UID, save locally
    if (!uid) {
        console.warn("No user ID, saving to localStorage only");
        saveToLocalStorage(record as GlucoseRecord);
        return true;
    }

    // Try Firestore with timeout
    const firestoreSave = async (): Promise<boolean> => {
        try {
            await addDoc(collection(db, COLLECTION), {
                ...record,
                userId: uid,
                timestamp: serverTimestamp()
            });
            console.log("Saved to Firestore");
            return true;
        } catch (error) {
            console.error("Firestore save failed:", error);
            throw error;
        }
    };

    try {
        const result = await withTimeout(firestoreSave(), TIMEOUT_MS, false);
        if (!result) {
            // Timeout occurred, save locally
            saveToLocalStorage(record as GlucoseRecord);
        }
        return true;
    } catch (error) {
        console.error("Save error, falling back to localStorage:", error);
        saveToLocalStorage(record as GlucoseRecord);
        return true;
    }
};

export const getGlucoseHistory = async (): Promise<GlucoseRecord[]> => {
    const uid = getCurrentUserId();

    // Always include local storage data
    const localData = getFromLocalStorage();

    if (!uid) {
        return localData;
    }

    // Try Firestore with timeout
    const firestoreGet = async (): Promise<GlucoseRecord[]> => {
        try {
            const q = query(
                collection(db, COLLECTION),
                where("userId", "==", uid),
                orderBy("timestamp", "asc"),
                limit(50)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as GlucoseRecord));
        } catch (error) {
            console.error("Firestore getHistory failed:", error);
            throw error;
        }
    };

    try {
        const firestoreData = await withTimeout(firestoreGet(), TIMEOUT_MS, []);
        // Merge Firestore and local data (avoiding duplicates by checking dates)
        const allData = [...firestoreData, ...localData];
        return allData;
    } catch (error) {
        console.error("Get history error, using localStorage:", error);
        return localData;
    }
};

export const getLastGlucose = async (): Promise<GlucoseRecord | null> => {
    const history = await getGlucoseHistory();
    if (history.length > 0) {
        return history[history.length - 1];
    }
    return null;
};

export const getGlucoseReadings = getGlucoseHistory;
