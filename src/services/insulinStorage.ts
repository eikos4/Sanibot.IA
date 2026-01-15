// Insulin Storage - Local Version (Works offline)

export interface InsulinDose {
    id: string;
    description: string;
    units: string;
    time: string;
    type: 'Basal' | 'Rapid' | 'Mix';
    enabled: boolean;
}

const STORAGE_KEY = "glucobot_insulin_plan";

// Get all insulin doses from localStorage
export const getInsulinPlan = async (): Promise<InsulinDose[]> => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Save all insulin doses to localStorage
const saveInsulinDoses = (doses: InsulinDose[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doses));
};

// Add a new insulin dose
export const addInsulinDose = async (dose: Omit<InsulinDose, "id">) => {
    const doses = await getInsulinPlan();
    const newDose: InsulinDose = {
        ...dose,
        id: Date.now().toString()
    };
    doses.push(newDose);
    saveInsulinDoses(doses);
};

// Delete an insulin dose
export const deleteInsulinDose = async (id: string) => {
    const doses = await getInsulinPlan();
    const filtered = doses.filter(d => d.id !== id);
    saveInsulinDoses(filtered);
};

// Toggle insulin dose enabled status
export const toggleInsulinDose = async (id: string, currentStatus: boolean) => {
    const doses = await getInsulinPlan();
    const updated = doses.map(d =>
        d.id === id ? { ...d, enabled: !currentStatus } : d
    );
    saveInsulinDoses(updated);
};

// Compatibility export
export const saveInsulinPlan = async () => {
    console.warn("saveInsulinPlan is deprecated");
};
