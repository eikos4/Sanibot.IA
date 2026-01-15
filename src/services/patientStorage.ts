import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Standards per MINSAL Chile
export interface PatientData {
  // 1. Identificación
  nombre: string;
  rut: string; // Required for Chile
  fechaNacimiento: string;
  genero: "Masculino" | "Femenino" | "Otro" | "";
  prevision: "Fonasa" | "Isapre" | "Particular" | "Otra" | "";
  direccion?: string;
  comuna?: string;

  // 2. Antecedentes Clínicos
  tipoDiabetes: "Tipo 1" | "Tipo 2" | "Gestacional" | "Prediabetes" | "";
  anioDiagnostico?: string;
  tratamiento?: string; // Nuevo
  usoSensor?: boolean;  // Nuevo
  antecedentesFamiliares?: boolean;

  // Comorbilidades frecuentes
  hipertension: boolean;
  hipotiroidismo: boolean;
  dislipidemia: boolean; // Colesterol alto
  renal: boolean; // Enfermedad Renal Crónica

  // 3. Estilo de Vida y Biometría
  peso: string; // kg
  altura: string; // cm
  fumador: boolean;
  alcohol: "Nunca" | "Ocasional" | "Frecuente";
  actividadFisica: "Sedentario" | "Ligera" | "Moderada" | "Intensa";

  // 4. Contacto Emergencia
  emergenciaNombre: string;
  emergenciaTelefono: string;
  emergenciaRelacion?: string;

  // System
  profileCompleted: true;
}

// Save (Merge) patient data into the user's document
export const savePatientData = async (data: Partial<PatientData>) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    // Merge data into the existing user document
    await updateDoc(userRef, {
      ...data,
      profileCompleted: true // Flag to mark profile as complete
    });
  } catch (error) {
    console.error("Error saving patient data:", error);
  }
};

export const getPatientData = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
  } catch (error) {
    console.error("Error getting patient data:", error);
  }
  return null;
};

export const clearPatientData = () => {
  // No-op for cloud, maybe sign out?
  // localStorage.removeItem("glucobot_patient");
};
