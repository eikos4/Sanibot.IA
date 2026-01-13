import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Save (Merge) patient data into the user's document
export const savePatientData = async (data: any) => {
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
