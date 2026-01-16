// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration (loaded from Vite env)
const firebaseConfigFromEnv = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Fallback config to avoid blank screens in static deployments where env vars weren't injected at build time.
// Prefer setting VITE_FIREBASE_* in production.
const firebaseConfigFallback = {
    apiKey: "AIzaSyAEJ9-Oxb7i_s1rRrC6XRT6h5f8aLHZwAE",
    authDomain: "sannibot-e799c.firebaseapp.com",
    projectId: "sannibot-e799c",
    storageBucket: "sannibot-e799c.firebasestorage.app",
    messagingSenderId: "251524334611",
    appId: "1:251524334611:web:973f32129f038c26e06be6",
    measurementId: "G-7YWJDXJDFG"
};

const hasEnvConfig =
    !!firebaseConfigFromEnv.apiKey &&
    !!firebaseConfigFromEnv.projectId &&
    !!firebaseConfigFromEnv.appId;

if (!hasEnvConfig) {
    console.warn(
        "Missing Firebase configuration from env (VITE_FIREBASE_*). Falling back to bundled Firebase config. " +
        "For production, set env vars and rebuild."
    );
}

const firebaseConfig = hasEnvConfig ? firebaseConfigFromEnv : firebaseConfigFallback;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = getAuth(app);

// Use simple getFirestore for maximum compatibility
// This avoids issues with persistent cache that can cause "offline" errors
export const db = getFirestore(app);
