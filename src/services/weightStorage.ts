export interface WeightEntry {
    id: string;
    date: string; // ISO String
    weight: number;
    height: number;
    bmi: number;
}

const HISTORY_KEY = "glucobot_weight_history";
const VITALS_KEY = "glucobot_vitals"; // Keep for backward compatibility / quick access

export const getWeightHistory = (): WeightEntry[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveWeightEntry = (weight: number, height: number, bmi: number) => {
    const history = getWeightHistory();

    const newEntry: WeightEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        weight,
        height,
        bmi
    };

    // Agregar al principio
    const updatedHistory = [...history, newEntry];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    // Update vitals key for other components
    localStorage.setItem(VITALS_KEY, JSON.stringify({ w: weight, h: height }));

    return newEntry;
};

export const deleteWeightEntry = (id: string) => {
    const history = getWeightHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};
