import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface InsulinDose {
    id: string; // Firestore Doc ID
    description: string; // "Lantus noche", "Rápida almuerzo"
    units: string; // "20", "15-20"
    time: string; // HH:MM
    type: 'Basal' | 'Rapid' | 'Mix';
    enabled: boolean;
}

const getCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, "insulin_plan");
};

export const getInsulinPlan = async (): Promise<InsulinDose[]> => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const col = getCollection();
        const q = query(col, orderBy("time", "asc")); // Order by time of day

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as InsulinDose));
    } catch (e) {
        console.error("Error fetching insulin plan", e);
        return [];
    }
};

export const addInsulinDose = async (dose: Omit<InsulinDose, "id">) => {
    try {
        const col = getCollection();
        await addDoc(col, dose);
    } catch (e) {
        console.error("Error adding insulin dose", e);
        throw e;
    }
};

export const deleteInsulinDose = async (id: string) => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "insulin_plan", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting insulin dose", e);
        throw e;
    }
};

export const toggleInsulinDose = async (id: string, currentStatus: boolean) => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "insulin_plan", id);
        await updateDoc(docRef, { enabled: !currentStatus });
    } catch (e) {
        console.error("Error toggling insulin dose", e);
        throw e;
    }
};

// Compatibility export
export const saveInsulinPlan = async () => {
    console.warn("saveInsulinPlan is deprecated in favor of direct Firestore ops");
};
