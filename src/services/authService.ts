import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface User {
    id: string;
    username: string; // Email en Firebase (o RUT convertido)
    email?: string;
    name: string;
    role: "patient" | "caretaker" | "admin";
    profileCompleted?: boolean;
}

// Helper to get user profile from Firestore
const getProfile = async (uid: string): Promise<User | null> => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: uid, ...docSnap.data() } as User;
        }
    } catch (e) {
        console.error("Error fetching profile", e);
    }
    return null;
};

// Helper to ensure username is an email (for Firebase Auth)
const toEmail = (username: string) => {
    // Basic email regex/check
    if (username.includes("@")) return username;
    // If it looks like a RUT (numbers + k), append domain
    return `${username.replace(/\./g, '')}@glucobot.app`;
};

export const loginWithGoogle = async (): Promise<{ user: User | null; error?: string }> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;

        // Timeout promise for Firestore operations (15s)
        const timeoutPromise = new Promise<{ user: User | null }>((_, reject) =>
            setTimeout(() => reject(new Error("firestore-timeout")), 15000)
        );

        const dbOperation = async (): Promise<{ user: User | null }> => {
            // Check if user exists in Firestore, if not create it
            let profile = await getProfile(fbUser.uid);

            if (!profile) {
                // New Google User -> Create defaults
                profile = {
                    id: fbUser.uid,
                    username: fbUser.email || "",
                    name: fbUser.displayName || "Usuario Google",
                    role: "patient" // Default role for Google Sign-In
                };

                await setDoc(doc(db, "users", fbUser.uid), {
                    username: profile.username,
                    email: fbUser.email,
                    name: profile.name,
                    role: profile.role
                });
            }
            return { user: profile };
        };

        // Race between DB op and Timeout
        return await Promise.race([dbOperation(), timeoutPromise]);

    } catch (error: any) {
        console.error("Error with Google Sign-In", error);
        let errorMsg = "Hubo un problema al iniciar sesión con Google.";

        if (error.message === "firestore-timeout") {
            errorMsg = "La conexión con la base de datos tardó demasiado. Por favor, verifica tu internet.";
        } else if (error.code === "unavailable" || error.code === "failed-precondition" || error.message.includes("offline")) {
            errorMsg = "No se pudo conectar con la base de datos. Verifica tu conexión a internet o cortafuegos.";
        } else if (error.code === "auth/operation-not-allowed") {
            errorMsg = "El inicio de sesión con Google no está habilitado en la consola de Firebase.";
        } else if (error.code === "auth/popup-closed-by-user") {
            errorMsg = "Se cerró la ventana de Google antes de completar.";
        } else if (error.code === "auth/configuration-not-found") {
            errorMsg = "Error de configuración: Habilita el proveedor de Google en la consola de Firebase.";
        } else if (error.code === "permission-denied") {
            errorMsg = "Permisos insuficientes. Verifica que la Base de Datos Firestore esté creada en la consola.";
        }

        return { user: null, error: errorMsg };
    }
};

const getAuthErrorMessage = (error: any): string => {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "Este RUT o correo ya tiene una cuenta. Intenta iniciar sesión en lugar de registrarte.";
        case "auth/invalid-email":
            return "El formato del correo es inválido.";
        case "auth/operation-not-allowed":
            return "El registro con correo y contraseña no está habilitado. Por favor, contacta al administrador.";
        case "auth/weak-password":
            return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
        case "auth/configuration-not-found":
            return "Error de configuración de Firebase. Por favor, habilita 'Email/Password' en la consola de Firebase.";
        default:
            return "Hubo un error inesperado al registrar la cuenta. Por favor, intenta de nuevo.";
    }
};

export const register = async (user: User, password?: string): Promise<{ success: boolean; error?: string; firestoreFailed?: boolean }> => {
    if (!password) {
        return { success: false, error: "La contraseña es obligatoria." };
    }
    const email = toEmail(user.username);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Update Display Name
        await updateProfile(fbUser, { displayName: user.name });

        // Try to save extra data (Rol) to Firestore, but don't block if it fails
        let firestoreFailed = false;
        try {
            await setDoc(doc(db, "users", fbUser.uid), {
                username: user.username, // Save ORIGINAL username (RUT or Email)
                email: email,
                name: user.name,
                role: user.role
            });
        } catch (firestoreError: any) {
            console.warn("Firestore save failed during registration, will retry on next login:", firestoreError);
            firestoreFailed = true;
            // Save to localStorage as backup
            localStorage.setItem("glucobot_pending_profile", JSON.stringify({
                uid: fbUser.uid,
                username: user.username,
                email: email,
                name: user.name,
                role: user.role
            }));
        }

        return { success: true, firestoreFailed };
    } catch (error: any) {
        console.error("Error registering:", error);
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

export const login = async (username: string, password?: string): Promise<User | null> => {
    if (!password) return null;
    const email = toEmail(username);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Fetch full profile including Role
        const profile = await getProfile(userCredential.user.uid);
        return profile || {
            id: userCredential.user.uid,
            username: username, // Return the input username if profile not found
            name: userCredential.user.displayName || "Usuario",
            role: "patient" // Fallback
        };
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

// Listener para cambios de estado con fetch de perfil
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Check if there's a pending profile to sync from localStorage
            const pendingProfile = localStorage.getItem("glucobot_pending_profile");
            if (pendingProfile) {
                try {
                    const profileData = JSON.parse(pendingProfile);
                    if (profileData.uid === firebaseUser.uid) {
                        console.log("Syncing pending profile to Firestore...");
                        await setDoc(doc(db, "users", firebaseUser.uid), {
                            username: profileData.username,
                            email: profileData.email,
                            name: profileData.name,
                            role: profileData.role
                        });
                        localStorage.removeItem("glucobot_pending_profile");
                        console.log("Pending profile synced successfully!");
                    }
                } catch (syncError) {
                    console.warn("Failed to sync pending profile, will retry later:", syncError);
                }
            }

            const profile = await getProfile(firebaseUser.uid);
            callback(profile || {
                id: firebaseUser.uid,
                username: firebaseUser.email || "",
                name: firebaseUser.displayName || "Usuario",
                role: "patient"
            });
        } else {
            callback(null);
        }
    });
};

export const deleteAccount = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;

    try {
        // 1. Convert username/RUT to email format potentially used in ID or just use uid
        // Strategy: Delete firestore document first, then auth user

        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        return true;
    } catch (error) {
        console.error("Error deleting account:", error);
        // If requires recent login, we might need to re-authenticate, but let's try simple first
        return false;
    }
};
