import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface WeightEntry {
    id: string;
    date: string; // ISO String
    weight: number;
    height: number;
    bmi: number;
}

const getCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, "weight_history");
};

export const getWeightHistory = async (): Promise<WeightEntry[]> => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const col = getCollection();
        // Orden descendente por fecha
        const q = query(col, orderBy("date", "desc"));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as WeightEntry));
    } catch (e) {
        console.error("Error fetching weight history", e);
        return [];
    }
};

export const saveWeightEntry = async (weight: number, height: number, bmi: number) => {
    try {
        const col = getCollection();
        const newEntry = {
            date: new Date().toISOString(),
            weight,
            height,
            bmi
        };
        const docRef = await addDoc(col, newEntry);
        return { id: docRef.id, ...newEntry };
    } catch (e) {
        console.error("Error saving weight", e);
        throw e;
    }
};

export const deleteWeightEntry = async (id: string) => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "weight_history", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting weight", e);
        throw e;
    }
};
