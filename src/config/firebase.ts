// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB_QNtdJxuSI-6BfxE6w8OtVwQiIsmeHKM",
    authDomain: "modoo-menu-a5124.firebaseapp.com",
    projectId: "modoo-menu-a5124",
    storageBucket: "modoo-menu-a5124.firebasestorage.app",
    messagingSenderId: "1030194595835",
    appId: "1:1030194595835:web:683e783cc913bee162ed5e",
    measurementId: "G-GEHPPL8VN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 