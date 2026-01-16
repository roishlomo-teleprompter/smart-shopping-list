import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

if (!apiKey) throw new Error("Missing VITE_FIREBASE_API_KEY. Check your .env file.");
if (!authDomain) throw new Error("Missing VITE_FIREBASE_AUTH_DOMAIN. Check your .env file.");
if (!projectId) throw new Error("Missing VITE_FIREBASE_PROJECT_ID. Check your .env file.");
if (!storageBucket) throw new Error("Missing VITE_FIREBASE_STORAGE_BUCKET. Check your .env file.");
if (!messagingSenderId) throw new Error("Missing VITE_FIREBASE_MESSAGING_SENDER_ID. Check your .env file.");
if (!appId) throw new Error("Missing VITE_FIREBASE_APP_ID. Check your .env file.");

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
