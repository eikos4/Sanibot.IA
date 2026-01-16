// Insulin Storage - Improved with timeouts and localStorage fallback
import { db } from "../firebase/config";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp
} from "firebase/firestore";

export interface InsulinDose {
    id: string;
    description: string;
    units: string;
    time: string;
    type: 'Basal' | 'Rapid' | 'Mix';
    enabled: boolean;
    userId?: string;
}

const COLLECTION = "insulin_doses";
const LOCAL_KEY = "glucobot_insulin_plan";
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
            console.warn(`Insulin operation timed out after ${ms}ms`);
            resolve(fallback);
        }, ms))
    ]);
};

// Local storage helpers
const getLocalDoses = (): InsulinDose[] => {
    try {
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalDoses = (doses: InsulinDose[]): void => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(doses));
};

export const getInsulinPlan = async (): Promise<InsulinDose[]> => {
    const uid = getCurrentUserId();
    const localData = getLocalDoses();

    if (!uid) {
        return localData.sort((a, b) => a.time.localeCompare(b.time));
    }

    const firestoreGet = async (): Promise<InsulinDose[]> => {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", uid),
            orderBy("time", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as InsulinDose));
    };

    try {
        const firestoreData = await withTimeout(firestoreGet(), TIMEOUT_MS, []);
        return [...firestoreData, ...localData].sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
        console.error("getInsulinPlan failed:", error);
        return localData;
    }
};

export const addInsulinDose = async (dose: Omit<InsulinDose, "id">): Promise<boolean> => {
    const uid = getCurrentUserId();
    const localId = `local_${Date.now()}`;
    const localDose = { ...dose, id: localId };

    if (!uid) {
        const doses = getLocalDoses();
        doses.push(localDose);
        saveLocalDoses(doses);
        return true;
    }

    const firestoreSave = async (): Promise<boolean> => {
        await addDoc(collection(db, COLLECTION), {
            ...dose,
            userId: uid,
            createdAt: serverTimestamp()
        });
        return true;
    };

    try {
        const result = await withTimeout(firestoreSave(), TIMEOUT_MS, false);
        if (!result) {
            const doses = getLocalDoses();
            doses.push(localDose);
            saveLocalDoses(doses);
        }
        return true;
    } catch (error) {
        console.error("addInsulinDose failed:", error);
        const doses = getLocalDoses();
        doses.push(localDose);
        saveLocalDoses(doses);
        return true;
    }
};

export const deleteInsulinDose = async (id: string): Promise<boolean> => {
    if (id.startsWith("local_")) {
        const doses = getLocalDoses().filter(d => d.id !== id);
        saveLocalDoses(doses);
        return true;
    }

    try {
        await withTimeout(deleteDoc(doc(db, COLLECTION, id)), TIMEOUT_MS, undefined);
        return true;
    } catch (error) {
        console.error("deleteInsulinDose failed:", error);
        return false;
    }
};

export const toggleInsulinDose = async (id: string, currentStatus: boolean): Promise<boolean> => {
    if (id.startsWith("local_")) {
        const doses = getLocalDoses();
        const dose = doses.find(d => d.id === id);
        if (dose) {
            dose.enabled = !currentStatus;
            saveLocalDoses(doses);
        }
        return true;
    }

    try {
        await withTimeout(
            updateDoc(doc(db, COLLECTION, id), { enabled: !currentStatus }),
            TIMEOUT_MS,
            undefined
        );
        return true;
    } catch (error) {
        console.error("toggleInsulinDose failed:", error);
        return false;
    }
};

// Get insulin reminder for current time
export const getInsulinReminder = async (): Promise<InsulinDose | null> => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const allDoses = await getInsulinPlan();

    for (const dose of allDoses) {
        if (!dose.enabled) continue;

        const [hour, min] = dose.time.split(':').map(Number);
        const doseMinutes = hour * 60 + min;

        // Within 2 minutes of scheduled time
        if (Math.abs(doseMinutes - nowMinutes) <= 2) {
            return dose;
        }
    }

    return null;
};
