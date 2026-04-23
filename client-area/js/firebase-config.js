/**
 * FIREBASE CONFIG - Cliente Area CRM
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYvLbBw02MbTcCL-CZekBmb5Nv0Cyk5ic",
  authDomain: "cliente-area-crm.firebaseapp.com",
  projectId: "cliente-area-crm",
  storageBucket: "cliente-area-crm.firebasestorage.app",
  messagingSenderId: "584425836546",
  appId: "1:584425836546:web:06ce1d814a750f66a5d71b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);