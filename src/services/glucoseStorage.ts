// Glucose Storage - Local Version (Works offline)

export interface GlucoseRecord {
    id?: string;
    valor: number;
    fecha: string;
    hora: string;
    comida: string;
    timestamp?: number;
}

const STORAGE_KEY = "glucobot_glucose";

// Get all glucose readings from localStorage
export const getGlucoseHistory = (): GlucoseRecord[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Alias for compatibility
export const getGlucoseReadings = getGlucoseHistory;

// Save a new glucose reading
export const saveGlucose = async (record: Omit<GlucoseRecord, "timestamp" | "id">): Promise<boolean> => {
    try {
        const readings = getGlucoseHistory();
        const newRecord: GlucoseRecord = {
            ...record,
            id: Date.now().toString(),
            timestamp: Date.now()
        };
        readings.push(newRecord);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
        return true;
    } catch (e) {
        console.error("Error saving glucose:", e);
        return false;
    }
};

// Get the last glucose reading
export const getLastGlucose = (): GlucoseRecord | null => {
    const readings = getGlucoseHistory();
    if (readings.length === 0) return null;
    return readings[readings.length - 1];
};
