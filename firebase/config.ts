import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwjLlYRCdxhy5bA7MlLAzM7WsFwLd6wLY",
  authDomain: "bridgea-app-fixed.firebaseapp.com",
  projectId: "bridgea-app-fixed",
  storageBucket: "bridgea-app-fixed.appspot.com",
  messagingSenderId: "876469848708",
  appId: "1:876469848708:web:141d25e720c785da2210d1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
