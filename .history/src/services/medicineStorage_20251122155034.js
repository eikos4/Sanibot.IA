export const getMedicines = () => {
  const data = localStorage.getItem("glucobot_medicines");
  return data ? JSON.parse(data) : [];
};

export const saveMedicines = (medicines) => {
  localStorage.setItem("glucobot_medicines", JSON.stringify(medicines));
};

export const addMedicine = (medicine) => {
  const meds = getMedicines();
  meds.push(medicine);
  saveMedicines(meds);
};

export const updateMedicine = (id, updated) => {
  const meds = getMedicines().map((m) =>
    m.id === id ? { ...m, ...updated } : m
  );
  saveMedicines(meds);
};

export const deleteMedicine = (id) => {
  const meds = getMedicines().filter((m) => m.id !== id);
  saveMedicines(meds);
};
