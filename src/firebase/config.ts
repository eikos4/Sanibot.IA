// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAEJ9-Oxb7i_s1rRrC6XRT6h5f8aLHZwAE",
    authDomain: "sannibot-e799c.firebaseapp.com",
    projectId: "sannibot-e799c",
    storageBucket: "sannibot-e799c.firebasestorage.app",
    messagingSenderId: "251524334611",
    appId: "1:251524334611:web:973f32129f038c26e06be6",
    measurementId: "G-7YWJDXJDFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = getAuth(app);

// Use simple getFirestore for maximum compatibility
// This avoids issues with persistent cache that can cause "offline" errors
export const db = getFirestore(app);
