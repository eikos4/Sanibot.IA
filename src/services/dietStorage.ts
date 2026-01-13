import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface MealPlan {
    id: string;
    type: 'Desayuno' | 'Almuerzo' | 'Once' | 'Cena' | 'Colación';
    time: string; // HH:MM
    description: string;
    enabled: boolean;
}

const getCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, "diet_plan");
};

export const getDietPlan = async (): Promise<MealPlan[]> => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const col = getCollection();
        const q = query(col, orderBy("time", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MealPlan));
    } catch (e) {
        console.error("Error getting diet plan", e);
        return [];
    }
};

export const saveMeal = async (meal: Omit<MealPlan, "id">) => {
    try {
        const col = getCollection();
        await addDoc(col, meal);
    } catch (e) {
        console.error("Error saving meal", e);
        throw e;
    }
};

export const deleteMeal = async (id: string) => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "diet_plan", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting meal", e);
        throw e;
    }
};

export const toggleMealStatus = async (id: string, currentStatus: boolean) => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "diet_plan", id);
        await updateDoc(docRef, { enabled: !currentStatus });
    } catch (e) {
        console.error("Error toggling meal status", e);
        throw e;
    }
};
