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
    username: string;
    email?: string;
    name: string;
    role: "patient" | "caretaker" | "admin";
    profileCompleted?: boolean;
}

// Constants
const FIRESTORE_TIMEOUT = 8000; // 8 seconds
const LOCAL_STORAGE_KEY = "glucobot_current_user";
const PENDING_PROFILE_KEY = "glucobot_pending_profile";

// Helper: get user profile from Firestore with timeout
const getProfile = async (uid: string): Promise<User | null> => {
    const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), FIRESTORE_TIMEOUT)
    );

    const fetchPromise = (async () => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: uid, ...docSnap.data() } as User;
            }
        } catch (e: any) {
            console.warn("Firestore getProfile failed:", e.message || e);
        }
        return null;
    })();

    return Promise.race([fetchPromise, timeoutPromise]);
};

// Helper: save profile to Firestore (non-blocking)
const saveProfileAsync = async (uid: string, profileData: Omit<User, 'id'>): Promise<boolean> => {
    try {
        await setDoc(doc(db, "users", uid), profileData);
        localStorage.removeItem(PENDING_PROFILE_KEY);
        console.log("Profile saved to Firestore");
        return true;
    } catch (e: any) {
        console.warn("Firestore saveProfile failed, saving locally:", e.message);
        localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ uid, ...profileData }));
        return false;
    }
};

// Helper: convert username to email format for Firebase Auth
const toEmail = (username: string): string => {
    if (username.includes("@")) return username.toLowerCase();
    return `${username.replace(/\./g, '')}@glucobot.app`;
};

// ============ PUBLIC API ============

export const loginWithGoogle = async (): Promise<{ user: User | null; error?: string }> => {
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;

        // Create immediate profile from Google Auth data
        const user: User = {
            id: fbUser.uid,
            username: fbUser.email || "",
            email: fbUser.email || undefined,
            name: fbUser.displayName || "Usuario",
            role: "patient"
        };

        // Try to get existing profile from Firestore (with timeout)
        const existingProfile = await getProfile(fbUser.uid);

        if (existingProfile) {
            // User exists in Firestore, use that data
            return { user: existingProfile };
        }

        // New user - save profile asynchronously (don't block login)
        saveProfileAsync(fbUser.uid, {
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role
        });

        return { user };

    } catch (error: any) {
        console.error("Google Sign-In error:", error);

        const errorMessages: Record<string, string> = {
            "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de completar.",
            "auth/popup-blocked": "El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.",
            "auth/cancelled-popup-request": "Se canceló la solicitud de autenticación.",
            "auth/operation-not-allowed": "El inicio de sesión con Google no está habilitado.",
            "auth/network-request-failed": "Error de red. Verifica tu conexión a internet."
        };

        const errorMsg = errorMessages[error.code] || "Hubo un problema al iniciar sesión con Google.";
        return { user: null, error: errorMsg };
    }
};

export const login = async (username: string, password: string): Promise<{ user: User | null; error?: string }> => {
    if (!username || !password) {
        return { user: null, error: "Correo y contraseña son obligatorios" };
    }

    const email = toEmail(username);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Try to get profile from Firestore
        const profile = await getProfile(fbUser.uid);

        // Even if Firestore fails, we can log in with basic info
        const user: User = profile || {
            id: fbUser.uid,
            username: username,
            email: fbUser.email || undefined,
            name: fbUser.displayName || "Usuario",
            role: "patient"
        };

        return { user };

    } catch (error: any) {
        console.error("Login error:", error);

        const errorMessages: Record<string, string> = {
            "auth/user-not-found": "No existe una cuenta con este correo.",
            "auth/wrong-password": "Contraseña incorrecta.",
            "auth/invalid-credential": "Correo o contraseña incorrectos.",
            "auth/invalid-email": "El formato del correo es inválido.",
            "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
            "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
            "auth/network-request-failed": "Error de red. Verifica tu conexión."
        };

        const errorMsg = errorMessages[error.code] || "Error al iniciar sesión.";
        return { user: null, error: errorMsg };
    }
};

const getAuthErrorMessage = (error: any): string => {
    const messages: Record<string, string> = {
        "auth/email-already-in-use": "Este correo ya tiene una cuenta. Intenta iniciar sesión.",
        "auth/invalid-email": "El formato del correo es inválido.",
        "auth/operation-not-allowed": "El registro no está habilitado. Contacta al administrador.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/network-request-failed": "Error de red. Verifica tu conexión."
    };
    return messages[error.code] || "Error al crear la cuenta. Intenta de nuevo.";
};

export const register = async (
    user: Omit<User, 'id'>,
    password: string
): Promise<{ success: boolean; error?: string; user?: User }> => {
    if (!password || password.length < 6) {
        return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const email = toEmail(user.username);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Update Display Name in Firebase Auth
        await updateProfile(fbUser, { displayName: user.name });

        // Create full user object
        const newUser: User = {
            id: fbUser.uid,
            username: user.username,
            email: email,
            name: user.name,
            role: user.role || "patient"
        };

        // Save to Firestore (non-blocking)
        saveProfileAsync(fbUser.uid, {
            username: user.username,
            email: email,
            name: user.name,
            role: user.role || "patient"
        });

        return { success: true, user: newUser };

    } catch (error: any) {
        console.error("Registration error:", error);
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(PENDING_PROFILE_KEY);
    } catch (error) {
        console.error("Logout error:", error);
    }
};

// Auth state listener with resilient profile fetching
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // First, try to sync any pending profile
            const pendingProfile = localStorage.getItem(PENDING_PROFILE_KEY);
            if (pendingProfile) {
                try {
                    const profileData = JSON.parse(pendingProfile);
                    if (profileData.uid === firebaseUser.uid) {
                        await setDoc(doc(db, "users", firebaseUser.uid), {
                            username: profileData.username,
                            email: profileData.email,
                            name: profileData.name,
                            role: profileData.role
                        });
                        localStorage.removeItem(PENDING_PROFILE_KEY);
                        console.log("Synced pending profile to Firestore");
                    }
                } catch (e) {
                    console.warn("Could not sync pending profile:", e);
                }
            }

            // Get profile from Firestore (with timeout fallback)
            const profile = await getProfile(firebaseUser.uid);

            const user: User = profile || {
                id: firebaseUser.uid,
                username: firebaseUser.email || "",
                email: firebaseUser.email || undefined,
                name: firebaseUser.displayName || "Usuario",
                role: "patient"
            };

            // Cache locally
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
            callback(user);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            callback(null);
        }
    });
};

export const deleteAccount = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;

    try {
        // Delete Firestore document first
        try {
            await deleteDoc(doc(db, "users", user.uid));
        } catch (e) {
            console.warn("Could not delete Firestore doc:", e);
        }

        // Delete Firebase Auth user
        await deleteUser(user);

        // Clean up local storage
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(PENDING_PROFILE_KEY);

        return true;
    } catch (error: any) {
        console.error("Delete account error:", error);
        if (error.code === "auth/requires-recent-login") {
            throw new Error("Necesitas volver a iniciar sesión para eliminar tu cuenta.");
        }
        return false;
    }
};

// Get current user from cache (for immediate access)
export const getCachedUser = (): User | null => {
    try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};
