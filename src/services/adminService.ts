import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    deleteDoc,
    Timestamp,
    getCountFromServer
} from "firebase/firestore";
import { db } from "../firebase/config";

// ============ TYPES ============

export interface UserProfile {
    id: string;
    username: string;
    email?: string;
    name: string;
    role: "patient" | "caretaker" | "admin";
    profileCompleted?: boolean;
    createdAt?: Timestamp;
    lastLogin?: Timestamp;
    // Patient-specific fields
    tipoDiabetes?: string;
    fechaNacimiento?: string;
    prevision?: string;
}

export interface AdminStats {
    totalUsers: number;
    totalPatients: number;
    totalCaretakers: number;
    totalAdmins: number;
    activeToday: number;
    alertsToday: number;
    glucoseReadingsToday: number;
}

export interface SystemLog {
    id: string;
    type: "info" | "warning" | "error" | "action";
    message: string;
    userId?: string;
    userName?: string;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
}

// ============ ADMIN FUNCTIONS ============

/**
 * Get all users from Firestore
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserProfile));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: "patient" | "caretaker" | "admin"): Promise<UserProfile[]> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", role));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserProfile));
    } catch (error) {
        console.error(`Error fetching ${role}s:`, error);
        return [];
    }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, newRole: "patient" | "caretaker" | "admin"): Promise<boolean> => {
    try {
        await updateDoc(doc(db, "users", userId), { role: newRole });
        await logSystemAction("action", `Rol de usuario actualizado a ${newRole}`, userId);
        return true;
    } catch (error) {
        console.error("Error updating user role:", error);
        return false;
    }
};

/**
 * Delete a user (admin only) - Note: This only deletes Firestore data, not Auth
 */
export const deleteUserData = async (userId: string): Promise<boolean> => {
    try {
        // Delete user document
        await deleteDoc(doc(db, "users", userId));
        
        // Delete related data
        const collections = [
            "glucose_readings",
            "medicines", 
            "appointments",
            "weight_history",
            "insulin_doses",
            "diet_plans",
            "smoking_cravings"
        ];
        
        for (const collName of collections) {
            const q = query(collection(db, collName), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            for (const docSnap of snapshot.docs) {
                await deleteDoc(docSnap.ref);
            }
        }
        
        // Delete smoking profile
        try {
            await deleteDoc(doc(db, "smoking_profiles", userId));
        } catch {
            // May not exist
        }
        
        await logSystemAction("action", "Usuario eliminado del sistema", userId);
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        const usersRef = collection(db, "users");
        
        // Get counts by role
        const [totalSnap, patientsSnap, caretakersSnap, adminsSnap] = await Promise.all([
            getCountFromServer(usersRef),
            getCountFromServer(query(usersRef, where("role", "==", "patient"))),
            getCountFromServer(query(usersRef, where("role", "==", "caretaker"))),
            getCountFromServer(query(usersRef, where("role", "==", "admin")))
        ]);
        
        // Get today's activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(today);
        
        const glucoseRef = collection(db, "glucose_readings");
        const glucoseTodaySnap = await getCountFromServer(
            query(glucoseRef, where("timestamp", ">=", todayTimestamp))
        );
        
        // Get alerts today
        const alertsRef = collection(db, "alerts");
        let alertsToday = 0;
        try {
            const alertsTodaySnap = await getCountFromServer(
                query(alertsRef, where("createdAt", ">=", todayTimestamp))
            );
            alertsToday = alertsTodaySnap.data().count;
        } catch {
            // Alerts collection may not exist yet
        }
        
        return {
            totalUsers: totalSnap.data().count,
            totalPatients: patientsSnap.data().count,
            totalCaretakers: caretakersSnap.data().count,
            totalAdmins: adminsSnap.data().count,
            activeToday: glucoseTodaySnap.data().count > 0 ? glucoseTodaySnap.data().count : 0,
            alertsToday,
            glucoseReadingsToday: glucoseTodaySnap.data().count
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
            totalUsers: 0,
            totalPatients: 0,
            totalCaretakers: 0,
            totalAdmins: 0,
            activeToday: 0,
            alertsToday: 0,
            glucoseReadingsToday: 0
        };
    }
};

/**
 * Get recent system logs
 */
export const getSystemLogs = async (limitCount: number = 50): Promise<SystemLog[]> => {
    try {
        const logsRef = collection(db, "system_logs");
        const q = query(logsRef, orderBy("timestamp", "desc"), limit(limitCount));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SystemLog));
    } catch (error) {
        console.error("Error fetching system logs:", error);
        return [];
    }
};

/**
 * Log a system action
 */
export const logSystemAction = async (
    type: "info" | "warning" | "error" | "action",
    message: string,
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> => {
    try {
        const { addDoc } = await import("firebase/firestore");
        
        let userName: string | undefined;
        if (userId) {
            const user = await getUserById(userId);
            userName = user?.name;
        }
        
        await addDoc(collection(db, "system_logs"), {
            type,
            message,
            userId,
            userName,
            timestamp: Timestamp.now(),
            metadata
        });
    } catch (error) {
        console.error("Error logging system action:", error);
    }
};

/**
 * Get patient's health data summary (for admin view)
 */
export const getPatientHealthSummary = async (patientId: string) => {
    try {
        // Get recent glucose readings
        const glucoseRef = collection(db, "glucose_readings");
        const glucoseQuery = query(
            glucoseRef,
            where("userId", "==", patientId),
            orderBy("timestamp", "desc"),
            limit(10)
        );
        const glucoseSnap = await getDocs(glucoseQuery);
        const glucoseReadings = glucoseSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Get medicines
        const medsRef = collection(db, "medicines");
        const medsQuery = query(medsRef, where("userId", "==", patientId));
        const medsSnap = await getDocs(medsQuery);
        const medicines = medsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Get upcoming appointments
        const apptRef = collection(db, "appointments");
        const apptQuery = query(
            apptRef,
            where("userId", "==", patientId),
            orderBy("fecha", "asc"),
            limit(5)
        );
        const apptSnap = await getDocs(apptQuery);
        const appointments = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        return {
            glucoseReadings,
            medicines,
            appointments
        };
    } catch (error) {
        console.error("Error fetching patient health summary:", error);
        return {
            glucoseReadings: [],
            medicines: [],
            appointments: []
        };
    }
};
