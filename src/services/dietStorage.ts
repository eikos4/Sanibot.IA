// Diet Storage - Firestore Version with localStorage fallback
import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    where,
    serverTimestamp
} from "firebase/firestore";

export interface MealPlan {
    id: string;
    type: 'Desayuno' | 'Almuerzo' | 'Once' | 'Cena' | 'Colación';
    time: string;
    description: string;
    enabled: boolean;
    userId?: string;
}

const COLLECTION = "diet_plans";
const LOCAL_KEY = "glucobot_diet_plan";

const getCurrentUserId = (): string | null => {
    const user = localStorage.getItem("glucobot_current_user");
    return user ? JSON.parse(user).id : null;
};

export const getDietPlan = async (): Promise<MealPlan[]> => {
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
        } as MealPlan));
    } catch (error) {
        console.error("Firestore getDietPlan failed, using localStorage:", error);
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    }
};

export const saveMeal = async (meal: Omit<MealPlan, "id">) => {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("User not authenticated");

    try {
        await addDoc(collection(db, COLLECTION), {
            ...meal,
            userId: uid,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Firestore saveMeal failed, saving locally:", error);
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        local.push({ ...meal, id: Date.now().toString() });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
    }
};

export const deleteMeal = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
        console.error("Firestore deleteMeal failed:", error);
    }
};

export const toggleMealStatus = async (id: string, currentStatus: boolean) => {
    try {
        await updateDoc(doc(db, COLLECTION, id), { enabled: !currentStatus });
    } catch (error) {
        console.error("Firestore toggleMealStatus failed:", error);
    }
};
