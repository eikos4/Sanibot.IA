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
import { auth, db } from "../firebase/config";

export interface Appointment {
    id: string;
    doctor: string;
    fecha: string; // YYYY-MM-DD
    hora: string; // HH:MM
    motivo: string;
}

const getCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, "appointments");
};

export const getAppointments = async (): Promise<Appointment[]> => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const col = getCollection();
        // Ordenar por fecha y hora ascendente
        const q = query(col, orderBy("fecha", "asc"), orderBy("hora", "asc"));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Appointment));
    } catch (e) {
        console.error("Error fetching appointments", e);
        return [];
    }
};

export const saveAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
        const col = getCollection();
        await addDoc(col, appointment);
    } catch (e) {
        console.error("Error saving appointment", e);
        throw e;
    }
};

export const deleteAppointment = async (id: string) => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "appointments", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting appointment", e);
        throw e;
    }
};

export const getNextAppointment = async (): Promise<Appointment | null> => {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const col = getCollection();
        // Since Firestore is server-side, ">= today" is tricky if we store just strings YYYY-MM-DD
        // A simple query is to get all and filter in JS, OR use ISO strings for query
        // For simplicity and small datasets, we fetch future ones by date
        const today = new Date().toISOString().split('T')[0];
        const q = query(col, where("fecha", ">=", today), orderBy("fecha", "asc"), orderBy("hora", "asc"));

        const snapshot = await getDocs(q);
        // JS Filter for exact time if needed, but date >= is usually enough for "upcoming" logic display
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Appointment;
        }
    } catch (e) {
        console.error("Error fetching next appointment", e);
    }
    return null;
};
