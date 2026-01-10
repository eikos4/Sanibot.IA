export interface Medicine {
  id: number;
  nombre: string;
  dosis: string;
  horarios: string[]; // Lista de horas "HH:MM"
  duration?: 'chronic' | 'temporary';
  endDate?: string;
}

export const getMedicines = (): Medicine[] => {
  const data = localStorage.getItem("glucobot_medicines");
  return data ? JSON.parse(data) : [];
};

export const saveMedicines = (medicines: Medicine[]) => {
  localStorage.setItem("glucobot_medicines", JSON.stringify(medicines));
};

export const addMedicine = (medicine: Medicine) => {
  const meds = getMedicines();
  meds.push(medicine);
  saveMedicines(meds);
};

export const updateMedicine = (id: number, updated: Partial<Medicine>) => {
  const meds = getMedicines().map((m) =>
    m.id === id ? { ...m, ...updated } : m
  );
  saveMedicines(meds);
};

export const deleteMedicine = (id: number) => {
  const meds = getMedicines().filter((m) => m.id !== id);
  saveMedicines(meds);
};
