import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
    onSnapshot
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "../firebase/config";

// ============ TYPES ============

export interface CaretakerPatientLink {
    id: string;
    caretakerId: string;
    patientId: string;
    patientName: string;
    patientEmail?: string;
    status: "pending" | "active" | "rejected";
    createdAt: Timestamp;
    acceptedAt?: Timestamp;
}

export interface PatientAlert {
    id: string;
    patientId: string;
    patientName: string;
    caretakerId: string;
    type: "hypoglycemia" | "hyperglycemia" | "missed_medication" | "missed_reading" | "appointment" | "custom";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: Timestamp;
    readAt?: Timestamp;
}

export interface PatientSummary {
    id: string;
    name: string;
    email?: string;
    tipoDiabetes?: string;
    lastGlucose?: {
        value: number;
        timestamp: Timestamp;
        status: "normal" | "low" | "high" | "critical";
    };
    lastActivity?: Timestamp;
    pendingAlerts: number;
}

// ============ LINK MANAGEMENT ============

/**
 * Request to link a caretaker with a patient (by patient email)
 */
export const requestPatientLink = async (
    caretakerId: string,
    patientEmail: string
): Promise<{ success: boolean; error?: string; linkId?: string }> => {
    try {
        // Find patient by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", patientEmail.toLowerCase()), where("role", "==", "patient"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: false, error: "No se encontró un paciente con ese correo." };
        }
        
        const patientDoc = snapshot.docs[0];
        const patientData = patientDoc.data();
        const patientId = patientDoc.id;
        
        // Check if link already exists
        const linksRef = collection(db, "caretaker_links");
        const existingQuery = query(
            linksRef,
            where("caretakerId", "==", caretakerId),
            where("patientId", "==", patientId)
        );
        const existingSnap = await getDocs(existingQuery);
        
        if (!existingSnap.empty) {
            const existingLink = existingSnap.docs[0].data();
            if (existingLink.status === "active") {
                return { success: false, error: "Ya tienes vinculación activa con este paciente." };
            }
            if (existingLink.status === "pending") {
                return { success: false, error: "Ya existe una solicitud pendiente para este paciente." };
            }
        }
        
        // Create link request
        const linkDoc = await addDoc(linksRef, {
            caretakerId,
            patientId,
            patientName: patientData.name || patientData.nombre || "Paciente",
            patientEmail: patientEmail.toLowerCase(),
            status: "pending",
            createdAt: Timestamp.now()
        });
        
        // Create notification for patient
        await createPatientNotification(patientId, {
            type: "link_request",
            title: "Solicitud de vinculación",
            message: "Un cuidador quiere vincularse contigo para monitorear tu salud.",
            linkId: linkDoc.id
        });
        
        return { success: true, linkId: linkDoc.id };
    } catch (error) {
        console.error("Error requesting patient link:", error);
        return { success: false, error: "Error al enviar la solicitud." };
    }
};

/**
 * Accept a link request (patient action)
 */
export const acceptLinkRequest = async (linkId: string, patientId: string): Promise<boolean> => {
    try {
        const linkRef = doc(db, "caretaker_links", linkId);
        const linkSnap = await getDoc(linkRef);
        
        if (!linkSnap.exists()) return false;
        
        const linkData = linkSnap.data();
        if (linkData.patientId !== patientId) return false;
        
        await updateDoc(linkRef, {
            status: "active",
            acceptedAt: Timestamp.now()
        });
        
        return true;
    } catch (error) {
        console.error("Error accepting link request:", error);
        return false;
    }
};

/**
 * Reject a link request (patient action)
 */
export const rejectLinkRequest = async (linkId: string, patientId: string): Promise<boolean> => {
    try {
        const linkRef = doc(db, "caretaker_links", linkId);
        const linkSnap = await getDoc(linkRef);
        
        if (!linkSnap.exists()) return false;
        
        const linkData = linkSnap.data();
        if (linkData.patientId !== patientId) return false;
        
        await updateDoc(linkRef, { status: "rejected" });
        return true;
    } catch (error) {
        console.error("Error rejecting link request:", error);
        return false;
    }
};

/**
 * Remove a patient link (caretaker or patient action)
 */
export const removePatientLink = async (linkId: string, userId: string): Promise<boolean> => {
    try {
        const linkRef = doc(db, "caretaker_links", linkId);
        const linkSnap = await getDoc(linkRef);
        
        if (!linkSnap.exists()) return false;
        
        const linkData = linkSnap.data();
        if (linkData.caretakerId !== userId && linkData.patientId !== userId) {
            return false;
        }
        
        await deleteDoc(linkRef);
        return true;
    } catch (error) {
        console.error("Error removing patient link:", error);
        return false;
    }
};

/**
 * Get all linked patients for a caretaker
 */
export const getLinkedPatients = async (caretakerId: string): Promise<CaretakerPatientLink[]> => {
    try {
        const linksRef = collection(db, "caretaker_links");
        const q = query(
            linksRef,
            where("caretakerId", "==", caretakerId),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as CaretakerPatientLink));
    } catch (error) {
        console.error("Error fetching linked patients:", error);
        return [];
    }
};

/**
 * Get pending link requests for a patient
 */
export const getPendingLinkRequests = async (patientId: string): Promise<CaretakerPatientLink[]> => {
    try {
        const linksRef = collection(db, "caretaker_links");
        const q = query(
            linksRef,
            where("patientId", "==", patientId),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        
        // Get caretaker names
        const links = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const caretakerDoc = await getDoc(doc(db, "users", data.caretakerId));
                const caretakerName = caretakerDoc.exists() 
                    ? caretakerDoc.data().name || "Cuidador"
                    : "Cuidador";
                
                return {
                    id: docSnap.id,
                    ...data,
                    caretakerName
                } as CaretakerPatientLink & { caretakerName: string };
            })
        );
        
        return links;
    } catch (error) {
        console.error("Error fetching pending link requests:", error);
        return [];
    }
};

// ============ PATIENT MONITORING ============

/**
 * Get patient summary with latest health data
 */
export const getPatientSummary = async (patientId: string): Promise<PatientSummary | null> => {
    try {
        // Get patient profile
        const patientDoc = await getDoc(doc(db, "users", patientId));
        if (!patientDoc.exists()) return null;
        
        const patientData = patientDoc.data();
        
        // Get last glucose reading
        const glucoseRef = collection(db, "glucose_readings");
        const glucoseQuery = query(
            glucoseRef,
            where("userId", "==", patientId),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const glucoseSnap = await getDocs(glucoseQuery);
        
        let lastGlucose: PatientSummary["lastGlucose"] | undefined;
        if (!glucoseSnap.empty) {
            const glucoseData = glucoseSnap.docs[0].data();
            const value = glucoseData.valor || glucoseData.value;
            lastGlucose = {
                value,
                timestamp: glucoseData.timestamp,
                status: getGlucoseStatus(value)
            };
        }
        
        // Get pending alerts count
        const alertsRef = collection(db, "alerts");
        const alertsQuery = query(
            alertsRef,
            where("patientId", "==", patientId),
            where("read", "==", false)
        );
        const alertsSnap = await getDocs(alertsQuery);
        
        return {
            id: patientId,
            name: patientData.name || patientData.nombre || "Paciente",
            email: patientData.email,
            tipoDiabetes: patientData.tipoDiabetes,
            lastGlucose,
            lastActivity: lastGlucose?.timestamp,
            pendingAlerts: alertsSnap.size
        };
    } catch (error) {
        console.error("Error fetching patient summary:", error);
        return null;
    }
};

/**
 * Get all patient summaries for a caretaker
 */
export const getAllPatientSummaries = async (caretakerId: string): Promise<PatientSummary[]> => {
    const links = await getLinkedPatients(caretakerId);
    const summaries = await Promise.all(
        links.map(link => getPatientSummary(link.patientId))
    );
    return summaries.filter((s): s is PatientSummary => s !== null);
};

// ============ ALERTS ============

/**
 * Create an alert for caretakers
 */
export const createAlert = async (
    patientId: string,
    patientName: string,
    type: PatientAlert["type"],
    severity: PatientAlert["severity"],
    title: string,
    message: string,
    data?: Record<string, unknown>
): Promise<void> => {
    try {
        // Get all caretakers linked to this patient
        const linksRef = collection(db, "caretaker_links");
        const q = query(
            linksRef,
            where("patientId", "==", patientId),
            where("status", "==", "active")
        );
        const linksSnap = await getDocs(q);
        
        // Create alert for each caretaker
        const alertsRef = collection(db, "alerts");
        const alertPromises = linksSnap.docs.map(linkDoc => {
            const linkData = linkDoc.data();
            return addDoc(alertsRef, {
                patientId,
                patientName,
                caretakerId: linkData.caretakerId,
                type,
                severity,
                title,
                message,
                data,
                read: false,
                createdAt: Timestamp.now()
            });
        });
        
        await Promise.all(alertPromises);
    } catch (error) {
        console.error("Error creating alert:", error);
    }
};

/**
 * Get alerts for a caretaker
 */
export const getCaretakerAlerts = async (
    caretakerId: string,
    onlyUnread: boolean = false
): Promise<PatientAlert[]> => {
    try {
        const alertsRef = collection(db, "alerts");
        let q = query(
            alertsRef,
            where("caretakerId", "==", caretakerId),
            orderBy("createdAt", "desc"),
            limit(100)
        );
        
        if (onlyUnread) {
            q = query(
                alertsRef,
                where("caretakerId", "==", caretakerId),
                where("read", "==", false),
                orderBy("createdAt", "desc")
            );
        }
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PatientAlert));
    } catch (error) {
        console.error("Error fetching caretaker alerts:", error);
        return [];
    }
};

/**
 * Mark alert as read
 */
export const markAlertAsRead = async (alertId: string): Promise<boolean> => {
    try {
        await updateDoc(doc(db, "alerts", alertId), {
            read: true,
            readAt: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error marking alert as read:", error);
        return false;
    }
};

/**
 * Mark all alerts as read for a caretaker
 */
export const markAllAlertsAsRead = async (caretakerId: string): Promise<boolean> => {
    try {
        const alerts = await getCaretakerAlerts(caretakerId, true);
        const updatePromises = alerts.map(alert => 
            updateDoc(doc(db, "alerts", alert.id), {
                read: true,
                readAt: Timestamp.now()
            })
        );
        await Promise.all(updatePromises);
        return true;
    } catch (error) {
        console.error("Error marking all alerts as read:", error);
        return false;
    }
};

/**
 * Subscribe to real-time alerts
 */
export const subscribeToAlerts = (
    caretakerId: string,
    callback: (alerts: PatientAlert[]) => void
): Unsubscribe => {
    const alertsRef = collection(db, "alerts");
    const q = query(
        alertsRef,
        where("caretakerId", "==", caretakerId),
        where("read", "==", false),
        orderBy("createdAt", "desc")
    );
    
    return onSnapshot(q, (snapshot) => {
        const alerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PatientAlert));
        callback(alerts);
    }, (error) => {
        console.error("Error subscribing to alerts:", error);
        callback([]);
    });
};

// ============ HELPER FUNCTIONS ============

const getGlucoseStatus = (value: number): "normal" | "low" | "high" | "critical" => {
    if (value < 54) return "critical";
    if (value < 70) return "low";
    if (value > 250) return "critical";
    if (value > 180) return "high";
    return "normal";
};

const createPatientNotification = async (
    patientId: string,
    notification: {
        type: string;
        title: string;
        message: string;
        linkId?: string;
    }
): Promise<void> => {
    try {
        await addDoc(collection(db, "notifications"), {
            userId: patientId,
            ...notification,
            read: false,
            createdAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

/**
 * Check glucose and create alerts if needed
 * Call this when a new glucose reading is saved
 */
export const checkGlucoseAndAlert = async (
    patientId: string,
    patientName: string,
    glucoseValue: number
): Promise<void> => {
    const status = getGlucoseStatus(glucoseValue);
    
    if (status === "critical") {
        await createAlert(
            patientId,
            patientName,
            glucoseValue < 70 ? "hypoglycemia" : "hyperglycemia",
            "critical",
            glucoseValue < 70 ? "⚠️ Hipoglucemia Severa" : "⚠️ Hiperglucemia Severa",
            `${patientName} registró glucosa de ${glucoseValue} mg/dL. Requiere atención inmediata.`,
            { glucoseValue, timestamp: new Date().toISOString() }
        );
    } else if (status === "low") {
        await createAlert(
            patientId,
            patientName,
            "hypoglycemia",
            "high",
            "🔻 Glucosa Baja",
            `${patientName} registró glucosa de ${glucoseValue} mg/dL. Monitorear de cerca.`,
            { glucoseValue, timestamp: new Date().toISOString() }
        );
    } else if (status === "high") {
        await createAlert(
            patientId,
            patientName,
            "hyperglycemia",
            "medium",
            "🔺 Glucosa Alta",
            `${patientName} registró glucosa de ${glucoseValue} mg/dL.`,
            { glucoseValue, timestamp: new Date().toISOString() }
        );
    }
};
