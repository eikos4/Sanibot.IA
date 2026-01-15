// Insulin Storage - Firestore Version with localStorage fallback
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

const getCurrentUserId = (): string | null => {
    const user = localStorage.getItem("glucobot_current_user");
    return user ? JSON.parse(user).id : null;
};

export const getInsulinPlan = async (): Promise<InsulinDose[]> => {
    const uid = getCurrentUserId();
    if (!uid) return [];

    try {
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
    } catch (error) {
        console.error("Firestore getInsulinPlan failed, using localStorage:", error);
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    }
};

export const addInsulinDose = async (dose: Omit<InsulinDose, "id">) => {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("User not authenticated");

    try {
        await addDoc(collection(db, COLLECTION), {
            ...dose,
            userId: uid,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Firestore addInsulinDose failed, saving locally:", error);
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        local.push({ ...dose, id: Date.now().toString() });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
    }
};

export const deleteInsulinDose = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
        console.error("Firestore deleteInsulinDose failed:", error);
        // Fallback: remove from localStorage
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        const filtered = local.filter((d: InsulinDose) => d.id !== id);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(filtered));
    }
};

export const toggleInsulinDose = async (id: string, currentStatus: boolean) => {
    try {
        await updateDoc(doc(db, COLLECTION, id), { enabled: !currentStatus });
    } catch (error) {
        console.error("Firestore toggleInsulinDose failed:", error);
    }
};

export const saveInsulinPlan = async () => {
    console.warn("saveInsulinPlan is deprecated");
};
