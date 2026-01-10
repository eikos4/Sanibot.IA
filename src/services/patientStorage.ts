export const savePatientData = (data: any) => {
  localStorage.setItem("glucobot_patient", JSON.stringify(data));
};

export const getPatientData = () => {
  const saved = localStorage.getItem("glucobot_patient");
  return saved ? JSON.parse(saved) : null;
};

export const clearPatientData = () => {
  localStorage.removeItem("glucobot_patient");
};
