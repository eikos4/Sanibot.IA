// Diet Storage - Firestore Version with localStorage fallback and timeouts
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
            console.warn(`Diet operation timed out after ${ms}ms`);
            resolve(fallback);
        }, ms))
    ]);
};

// Local storage helpers
const getLocalMeals = (): MealPlan[] => {
    try {
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalMeals = (meals: MealPlan[]): void => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(meals));
};

export const getDietPlan = async (): Promise<MealPlan[]> => {
    const uid = getCurrentUserId();
    const localMeals = getLocalMeals();

    if (!uid) {
        return localMeals;
    }

    const firestoreGet = async (): Promise<MealPlan[]> => {
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
    };

    try {
        const firestoreData = await withTimeout(firestoreGet(), TIMEOUT_MS, []);
        // Merge with local data
        return [...firestoreData, ...localMeals];
    } catch (error) {
        console.error("getDietPlan failed:", error);
        return localMeals;
    }
};

export const saveMeal = async (meal: Omit<MealPlan, "id">): Promise<boolean> => {
    const uid = getCurrentUserId();

    // Save to local first as backup
    const localId = `local_${Date.now()}`;
    const localMeal = { ...meal, id: localId };

    if (!uid) {
        const meals = getLocalMeals();
        meals.push(localMeal);
        saveLocalMeals(meals);
        console.log("Saved meal locally (no user)");
        return true;
    }

    const firestoreSave = async (): Promise<boolean> => {
        await addDoc(collection(db, COLLECTION), {
            ...meal,
            userId: uid,
            createdAt: serverTimestamp()
        });
        console.log("Saved meal to Firestore");
        return true;
    };

    try {
        const result = await withTimeout(firestoreSave(), TIMEOUT_MS, false);
        if (!result) {
            // Timeout - save locally
            const meals = getLocalMeals();
            meals.push(localMeal);
            saveLocalMeals(meals);
            console.log("Timeout - saved meal locally");
        }
        return true;
    } catch (error) {
        console.error("saveMeal failed:", error);
        const meals = getLocalMeals();
        meals.push(localMeal);
        saveLocalMeals(meals);
        return true;
    }
};

export const deleteMeal = async (id: string): Promise<boolean> => {
    // If local meal
    if (id.startsWith("local_")) {
        const meals = getLocalMeals().filter(m => m.id !== id);
        saveLocalMeals(meals);
        return true;
    }

    try {
        await withTimeout(deleteDoc(doc(db, COLLECTION, id)), TIMEOUT_MS, undefined);
        return true;
    } catch (error) {
        console.error("deleteMeal failed:", error);
        return false;
    }
};

export const toggleMealStatus = async (id: string, currentStatus: boolean): Promise<boolean> => {
    // If local meal
    if (id.startsWith("local_")) {
        const meals = getLocalMeals();
        const meal = meals.find(m => m.id === id);
        if (meal) {
            meal.enabled = !currentStatus;
            saveLocalMeals(meals);
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
        console.error("toggleMealStatus failed:", error);
        return false;
    }
};

// Get upcoming meals (for reminders)
export const getUpcomingMeals = async (): Promise<MealPlan[]> => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const allMeals = await getDietPlan();

    // Filter meals that are enabled and upcoming (within next hour)
    return allMeals.filter(meal => {
        if (!meal.enabled) return false;

        // Parse times
        const [mealHour, mealMin] = meal.time.split(':').map(Number);
        const [nowHour, nowMin] = currentTime.split(':').map(Number);

        const mealMinutes = mealHour * 60 + mealMin;
        const nowMinutes = nowHour * 60 + nowMin;

        // Meal is within 5 minutes before to 30 minutes after current time
        return mealMinutes >= nowMinutes - 5 && mealMinutes <= nowMinutes + 30;
    });
};

// Check if it's time for a meal reminder
export const getMealReminder = async (): Promise<MealPlan | null> => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const allMeals = await getDietPlan();

    // Find meal that matches current time (within 2 min window)
    for (const meal of allMeals) {
        if (!meal.enabled) continue;

        const [mealHour, mealMin] = meal.time.split(':').map(Number);
        const [nowHour, nowMin] = currentTime.split(':').map(Number);

        const mealMinutes = mealHour * 60 + mealMin;
        const nowMinutes = nowHour * 60 + nowMin;

        if (Math.abs(mealMinutes - nowMinutes) <= 2) {
            return meal;
        }
    }

    return null;
};
