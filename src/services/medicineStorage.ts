// Medicine Storage - Local Version (Works offline)

export interface Medicine {
  id: string;
  nombre: string;
  dosis: string;
  horarios: string[];
  duration?: 'chronic' | 'temporary';
  endDate?: string;
  userId?: string;
}

const STORAGE_KEY = "glucobot_medicines";

// Get all medicines from localStorage
export const getMedicines = (): Medicine[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save medicines to localStorage
const saveMedicines = (meds: Medicine[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
  // Dispatch event for subscribers
  window.dispatchEvent(new CustomEvent("medicines-updated", { detail: meds }));
};

// Subscribe to changes (simulates onSnapshot)
export const subscribeToMedicines = (callback: (meds: Medicine[]) => void) => {
  // Initial load
  callback(getMedicines());

  // Listen for changes
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<Medicine[]>;
    callback(customEvent.detail);
  };

  window.addEventListener("medicines-updated", handler);

  // Return unsubscribe function
  return () => window.removeEventListener("medicines-updated", handler);
};

// Add a new medicine
export const addMedicine = async (medicine: Omit<Medicine, "id" | "userId">) => {
  const meds = getMedicines();
  const newMed: Medicine = {
    ...medicine,
    id: Date.now().toString(),
    userId: "local"
  };
  meds.push(newMed);
  saveMedicines(meds);
};

// Update a medicine
export const updateMedicine = async (id: string, updated: Partial<Medicine>) => {
  const meds = getMedicines();
  const index = meds.findIndex(m => m.id === id);
  if (index !== -1) {
    meds[index] = { ...meds[index], ...updated };
    saveMedicines(meds);
  }
};

// Delete a medicine
export const deleteMedicine = async (id: string) => {
  const meds = getMedicines().filter(m => m.id !== id);
  saveMedicines(meds);
};
