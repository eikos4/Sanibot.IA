export interface InsulinDose {
    id: string;
    description: string; // "Lantus noche", "Rápida almuerzo"
    units: string; // "20", "15-20"
    time: string; // HH:MM
    type: 'Basal' | 'Rapid' | 'Mix';
    enabled: boolean;
}

const STORAGE_KEY = "glucobot_insulin_plan";

export const getInsulinPlan = (): InsulinDose[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveInsulinPlan = (plan: InsulinDose[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
};

export const addInsulinDose = (dose: InsulinDose) => {
    const plan = getInsulinPlan();
    plan.push(dose);
    saveInsulinPlan(plan);
};

export const deleteInsulinDose = (id: string) => {
    const plan = getInsulinPlan();
    const updated = plan.filter(d => d.id !== id);
    saveInsulinPlan(updated);
};

export const toggleInsulinDose = (id: string) => {
    const plan = getInsulinPlan();
    const dose = plan.find(d => d.id === id);
    if (dose) {
        dose.enabled = !dose.enabled;
        saveInsulinPlan(plan);
    }
};
