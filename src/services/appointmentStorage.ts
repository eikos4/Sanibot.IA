// Appointment Storage - Improved with timeouts and localStorage fallback
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    where
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface Appointment {
    id: string;
    doctor: string;
    especialidad?: string;
    lugar?: string;
    fecha: string; // YYYY-MM-DD
    hora: string; // HH:MM
    motivo: string;
    userId?: string;
}

const COLLECTION = "appointments";
const LOCAL_KEY = "glucobot_appointments";
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
            console.warn(`Appointment operation timed out after ${ms}ms`);
            resolve(fallback);
        }, ms))
    ]);
};

// Local storage helpers
const getLocalAppointments = (): Appointment[] => {
    try {
        const local = localStorage.getItem(LOCAL_KEY);
        return local ? JSON.parse(local) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalAppointments = (appointments: Appointment[]): void => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(appointments));
};

export const getAppointments = async (): Promise<Appointment[]> => {
    const uid = getCurrentUserId();
    const localData = getLocalAppointments();

    if (!uid) {
        return localData.sort((a, b) => {
            const dateA = `${a.fecha}T${a.hora}`;
            const dateB = `${b.fecha}T${b.hora}`;
            return dateA.localeCompare(dateB);
        });
    }

    const firestoreGet = async (): Promise<Appointment[]> => {
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
        } as Appointment));
    };

    try {
        const firestoreData = await withTimeout(firestoreGet(), TIMEOUT_MS, []);
        // Merge and sort
        const allData = [...firestoreData, ...localData];
        return allData.sort((a, b) => {
            const dateA = `${a.fecha}T${a.hora}`;
            const dateB = `${b.fecha}T${b.hora}`;
            return dateA.localeCompare(dateB);
        });
    } catch (error) {
        console.error("getAppointments failed:", error);
        return localData;
    }
};

export const saveAppointment = async (appointment: Omit<Appointment, "id">): Promise<boolean> => {
    const uid = getCurrentUserId();

    const localId = `local_${Date.now()}`;
    const localAppointment = { ...appointment, id: localId };

    if (!uid) {
        const appointments = getLocalAppointments();
        appointments.push(localAppointment);
        saveLocalAppointments(appointments);
        console.log("Saved appointment locally (no user)");
        return true;
    }

    const firestoreSave = async (): Promise<boolean> => {
        await addDoc(collection(db, COLLECTION), {
            ...appointment,
            userId: uid
        });
        console.log("Saved appointment to Firestore");
        return true;
    };

    try {
        const result = await withTimeout(firestoreSave(), TIMEOUT_MS, false);
        if (!result) {
            // Timeout - save locally
            const appointments = getLocalAppointments();
            appointments.push(localAppointment);
            saveLocalAppointments(appointments);
            console.log("Timeout - saved appointment locally");
        }
        return true;
    } catch (error) {
        console.error("saveAppointment failed:", error);
        const appointments = getLocalAppointments();
        appointments.push(localAppointment);
        saveLocalAppointments(appointments);
        return true;
    }
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
    // If local appointment
    if (id.startsWith("local_")) {
        const appointments = getLocalAppointments().filter(a => a.id !== id);
        saveLocalAppointments(appointments);
        return true;
    }

    try {
        await withTimeout(deleteDoc(doc(db, COLLECTION, id)), TIMEOUT_MS, undefined);
        return true;
    } catch (error) {
        console.error("deleteAppointment failed:", error);
        return false;
    }
};

export const getNextAppointment = async (): Promise<Appointment | null> => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    const allAppointments = await getAppointments();

    // Filter future appointments
    const futureAppointments = allAppointments.filter(a => {
        if (a.fecha > today) return true;
        if (a.fecha === today && a.hora >= now) return true;
        return false;
    });

    return futureAppointments.length > 0 ? futureAppointments[0] : null;
};

// Get upcoming appointments (within next 7 days)
export const getUpcomingAppointments = async (): Promise<Appointment[]> => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const allAppointments = await getAppointments();

    return allAppointments.filter(a => a.fecha >= todayStr && a.fecha <= nextWeekStr);
};

// Check if there's an appointment reminder needed
export const getAppointmentReminder = async (): Promise<Appointment | null> => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const allAppointments = await getAppointments();

    // Find appointment that is today and within 30 minutes
    for (const appointment of allAppointments) {
        if (appointment.fecha !== todayStr) continue;

        const [hour, min] = appointment.hora.split(':').map(Number);
        const appointmentMinutes = hour * 60 + min;

        // 30 minutes before to 5 minutes after
        if (appointmentMinutes - nowMinutes >= 0 && appointmentMinutes - nowMinutes <= 30) {
            return appointment;
        }
    }

    return null;
};
