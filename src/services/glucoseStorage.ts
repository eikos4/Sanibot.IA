import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface GlucoseRecord {
    id?: string;
    valor: number;
    fecha: string; // "YYYY-MM-DD"
    hora: string; // "HH:mm"
    comida: string; // "Ayuno", "Antes almuerzo", etc.
    timestamp?: any;
}

// Helper to get collection ref
const getCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, "glucose_readings");
};

export const saveGlucose = async (record: Omit<GlucoseRecord, "timestamp">) => {
    try {
        const col = getCollection();
        await addDoc(col, {
            ...record,
            timestamp: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error("Error saving glucose:", e);
        return false;
    }
};

export const getGlucoseHistory = async (): Promise<GlucoseRecord[]> => {
    try {
        const user = auth.currentUser;
        if (!user) return []; // Return empty if no user (or handle offline cache if configured)

        const col = collection(db, "users", user.uid, "glucose_readings");
        // Order by date/time descending (newest first)
        const q = query(col, orderBy("fecha", "asc"), orderBy("hora", "asc"));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as GlucoseRecord));
    } catch (e) {
        console.error("Error fetching glucose history:", e);
        return [];
    }
};

export const getLastGlucose = async (): Promise<GlucoseRecord | null> => {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const col = collection(db, "users", user.uid, "glucose_readings");
        // Get the very last one based on timestamp or combined date/time
        // We use fecha+hora for ordering logically
        const q = query(col, orderBy("fecha", "desc"), orderBy("hora", "desc"), limit(1));

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GlucoseRecord;
        }
    } catch (e) {
        console.error("Error fetching last glucose:", e);
    }
    return null;
};

// Alias for compatibility if needed, using the new async function
export const getGlucoseReadings = getGlucoseHistory;
