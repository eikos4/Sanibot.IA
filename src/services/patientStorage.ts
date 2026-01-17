import { doc, getDoc, setDoc } from "firebase/firestore";
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

const LOCAL_KEY = "glucobot_patient_data";

// Helper for timeout
const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

// Save (Merge) patient data into the user's document
export const savePatientData = async (data: Partial<PatientData>) => {
  const user = auth.currentUser;

  // Also save to localStorage always
  const existingLocal = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  const mergedLocal = { ...existingLocal, ...data, profileCompleted: true };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(mergedLocal));

  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    // Race between Firestore and 3s timeout
    await Promise.race([
      setDoc(userRef, { ...data, profileCompleted: true }, { merge: true }),
      timeoutPromise(3000)
    ]);
  } catch (error) {
    console.warn("Error saving patient data to Firestore (saved locally):", error);
  }
};

export const getPatientData = async (): Promise<Partial<PatientData> | null> => {
  const local = localStorage.getItem(LOCAL_KEY);
  const localData = local ? JSON.parse(local) : null;

  const user = auth.currentUser;
  if (!user) return localData;

  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const cloudData = snapshot.data() as PatientData;
      // Merge with local cache so we don't lose flags (e.g. profileCompleted) when cloud is stale.
      const merged = {
        ...(localData || {}),
        ...(cloudData || {}),
        profileCompleted:
          (cloudData as any)?.profileCompleted === true || (localData as any)?.profileCompleted === true ? true : undefined,
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.error("Error getting patient data from cloud, using local:", error);
  }

  return localData;
};

export const clearPatientData = () => {
  localStorage.removeItem(LOCAL_KEY);
};
