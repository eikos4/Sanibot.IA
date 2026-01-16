// Smoking Cessation Storage - with localStorage and Firestore
import { db } from "../firebase/config";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    where,
    limit
} from "firebase/firestore";

export interface SmokingProfile {
    quitDate: string; // ISO date when user started quitting
    cigarettesPerDay: number; // Before quitting
    pricePerPack: number; // In local currency
    cigarettesPerPack: number; // Usually 20
    motivations: string[]; // Personal reasons to quit
    isActive: boolean; // Currently in the program
}

export interface CravingLog {
    id?: string;
    timestamp: string;
    intensity: number; // 1-5
    trigger: string; // What caused it
    resisted: boolean; // Did they resist?
    notes?: string;
}

export interface SmokingStats {
    daysSmokeFree: number;
    hoursSmokeFree: number;
    minutesSmokeFree: number;
    cigarettesAvoided: number;
    moneySaved: number;
    cravingsResisted: number;
    cravingsTotal: number;
}

// Health milestones (in hours since quitting)
export const HEALTH_MILESTONES = [
    { hours: 0.33, title: "20 minutos", description: "Tu presión arterial y pulso comienzan a normalizarse", emoji: "❤️", achieved: false },
    { hours: 8, title: "8 horas", description: "El nivel de oxígeno en tu sangre vuelve a la normalidad", emoji: "🫁", achieved: false },
    { hours: 24, title: "24 horas", description: "El riesgo de ataque cardíaco comienza a disminuir", emoji: "💪", achieved: false },
    { hours: 48, title: "48 horas", description: "Tus sentidos del gusto y olfato comienzan a mejorar", emoji: "👃", achieved: false },
    { hours: 72, title: "72 horas", description: "Respirar se vuelve más fácil, los bronquios se relajan", emoji: "🌬️", achieved: false },
    { hours: 336, title: "2 semanas", description: "Mejora la circulación sanguínea y función pulmonar", emoji: "🩸", achieved: false },
    { hours: 720, title: "1 mes", description: "Menos tos, congestión y fatiga", emoji: "🏃", achieved: false },
    { hours: 2160, title: "3 meses", description: "Tu función pulmonar mejora significativamente", emoji: "🫀", achieved: false },
    { hours: 4320, title: "6 meses", description: "Menos episodios de falta de aire", emoji: "☀️", achieved: false },
    { hours: 8760, title: "1 año", description: "El riesgo de enfermedad cardíaca se reduce a la mitad", emoji: "🏆", achieved: false },
];

const PROFILE_KEY = "glucobot_smoking_profile";
const CRAVINGS_KEY = "glucobot_smoking_cravings";
const COLLECTION_PROFILE = "smoking_profiles";
const COLLECTION_CRAVINGS = "smoking_cravings";
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

const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => {
            console.warn(`Smoking operation timed out after ${ms}ms`);
            resolve(fallback);
        }, ms))
    ]);
};

// Profile functions
export const getSmokingProfile = async (): Promise<SmokingProfile | null> => {
    const uid = getCurrentUserId();

    // Try localStorage first
    const local = localStorage.getItem(PROFILE_KEY);
    const localProfile = local ? JSON.parse(local) : null;

    if (!uid) return localProfile;

    try {
        const docRef = doc(db, COLLECTION_PROFILE, uid);
        const docSnap = await withTimeout(getDoc(docRef), TIMEOUT_MS, null);

        if (docSnap?.exists()) {
            const profile = docSnap.data() as SmokingProfile;
            // Cache locally
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
            return profile;
        }
    } catch (error) {
        console.error("Error getting smoking profile:", error);
    }

    return localProfile;
};

export const saveSmokingProfile = async (profile: SmokingProfile): Promise<boolean> => {
    const uid = getCurrentUserId();

    // Always save locally
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    if (!uid) return true;

    try {
        const docRef = doc(db, COLLECTION_PROFILE, uid);
        await withTimeout(setDoc(docRef, { ...profile, userId: uid }), TIMEOUT_MS, undefined);
        return true;
    } catch (error) {
        console.error("Error saving smoking profile:", error);
        return true; // Still saved locally
    }
};

// Craving functions
export const logCraving = async (craving: Omit<CravingLog, "id" | "timestamp">): Promise<boolean> => {
    const uid = getCurrentUserId();
    const newCraving: CravingLog = {
        ...craving,
        timestamp: new Date().toISOString()
    };

    // Save locally
    const local = JSON.parse(localStorage.getItem(CRAVINGS_KEY) || "[]");
    const localId = `local_${Date.now()}`;
    local.push({ ...newCraving, id: localId });
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(local));

    if (!uid) return true;

    try {
        await withTimeout(
            addDoc(collection(db, COLLECTION_CRAVINGS), { ...newCraving, userId: uid }),
            TIMEOUT_MS,
            null
        );
        return true;
    } catch (error) {
        console.error("Error logging craving:", error);
        return true;
    }
};

export const getCravingHistory = async (): Promise<CravingLog[]> => {
    const uid = getCurrentUserId();
    const local = JSON.parse(localStorage.getItem(CRAVINGS_KEY) || "[]");

    if (!uid) return local;

    try {
        const q = query(
            collection(db, COLLECTION_CRAVINGS),
            where("userId", "==", uid),
            orderBy("timestamp", "desc"),
            limit(100)
        );
        const snapshot = await withTimeout(getDocs(q), TIMEOUT_MS, null);

        if (snapshot) {
            const firestoreData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CravingLog));
            return [...firestoreData, ...local];
        }
    } catch (error) {
        console.error("Error getting cravings:", error);
    }

    return local;
};

// Calculate stats
export const calculateStats = async (): Promise<SmokingStats | null> => {
    const profile = await getSmokingProfile();
    if (!profile || !profile.isActive) return null;

    const quitDate = new Date(profile.quitDate);
    const now = new Date();
    const diffMs = now.getTime() - quitDate.getTime();

    if (diffMs < 0) return null; // Quit date is in the future

    const totalMinutes = Math.floor(diffMs / 60000);
    const totalHours = Math.floor(diffMs / 3600000);
    const totalDays = Math.floor(diffMs / 86400000);

    // Cigarettes avoided = days * cigarettes per day
    const cigarettesAvoided = Math.floor((diffMs / 86400000) * profile.cigarettesPerDay);

    // Money saved = cigarettes avoided / cigarettes per pack * price per pack
    const moneySaved = (cigarettesAvoided / profile.cigarettesPerPack) * profile.pricePerPack;

    // Get cravings stats
    const cravings = await getCravingHistory();
    const cravingsResisted = cravings.filter(c => c.resisted).length;

    return {
        daysSmokeFree: totalDays,
        hoursSmokeFree: totalHours % 24,
        minutesSmokeFree: totalMinutes % 60,
        cigarettesAvoided,
        moneySaved: Math.round(moneySaved),
        cravingsResisted,
        cravingsTotal: cravings.length
    };
};

// Get achieved milestones
export const getAchievedMilestones = async () => {
    const profile = await getSmokingProfile();
    if (!profile || !profile.isActive) return [];

    const quitDate = new Date(profile.quitDate);
    const now = new Date();
    const hoursElapsed = (now.getTime() - quitDate.getTime()) / 3600000;

    return HEALTH_MILESTONES.map(m => ({
        ...m,
        achieved: hoursElapsed >= m.hours
    }));
};

// Reset/stop the program
export const stopSmokingProgram = async (): Promise<boolean> => {
    const profile = await getSmokingProfile();
    if (profile) {
        profile.isActive = false;
        await saveSmokingProfile(profile);
    }
    return true;
};
