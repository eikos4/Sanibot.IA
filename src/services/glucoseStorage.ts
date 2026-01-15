// Glucose Storage - Firestore Version with localStorage fallback
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

const getCurrentUserId = (): string | null => {
    const user = localStorage.getItem("glucobot_current_user");
    return user ? JSON.parse(user).id : null;
};

export const saveGlucose = async (record: Omit<GlucoseRecord, "timestamp" | "id" | "userId">): Promise<boolean> => {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error("No user ID for glucose save");
        return false;
    }

    try {
        await addDoc(collection(db, COLLECTION), {
            ...record,
            userId: uid,
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Firestore saveGlucose failed, saving locally:", error);
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        local.push({ ...record, id: Date.now().toString(), timestamp: Date.now() });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
        return true;
    }
};

export const getGlucoseHistory = async (): Promise<GlucoseRecord[]> => {
    const uid = getCurrentUserId();
    if (!uid) return [];

    try {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", uid),
            orderBy("fecha", "asc"),
            orderBy("hora", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as GlucoseRecord));
    } catch (error) {
        console.error("Firestore getGlucoseHistory failed, using localStorage:", error);
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    }
};

export const getLastGlucose = async (): Promise<GlucoseRecord | null> => {
    const uid = getCurrentUserId();
    if (!uid) return null;

    try {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", uid),
            orderBy("fecha", "desc"),
            orderBy("hora", "desc"),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GlucoseRecord;
        }
    } catch (error) {
        console.error("Firestore getLastGlucose failed:", error);
    }
    return null;
};

export const getGlucoseReadings = getGlucoseHistory;
