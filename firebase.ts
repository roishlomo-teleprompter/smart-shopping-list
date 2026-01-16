import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6gK3BOuFG3y7v4jhCWb9zzLPsmX0CjdU",
  authDomain: "shopping-list-218bd.firebaseapp.com",
  projectId: "shopping-list-218bd",
  storageBucket: "shopping-list-218bd.firebasestorage.app",
  messagingSenderId: "883804592996",
  appId: "1:883804592996:web:61b0bb28cd02ef3961b871",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
