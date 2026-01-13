import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface User {
    id: string;
    username: string; // Email en Firebase (o RUT convertido)
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

export const loginWithGoogle = async (): Promise<User | null> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;

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

        return profile;
    } catch (error) {
        console.error("Error with Google Sign-In", error);
        return null;
    }
};

export const register = async (user: User, password?: string): Promise<boolean> => {
    if (!password) {
        console.error("Password is required for Firebase registration");
        return false;
    }
    const email = toEmail(user.username);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Update Display Name
        await updateProfile(fbUser, { displayName: user.name });

        // Save extra data (Rol) to Firestore
        await setDoc(doc(db, "users", fbUser.uid), {
            username: user.username, // Save ORIGINAL username (RUT or Email)
            email: email,
            name: user.name,
            role: user.role
        });

        return true;
    } catch (error) {
        console.error("Error registering:", error);
        return false;
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
