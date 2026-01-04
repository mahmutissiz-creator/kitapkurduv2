
// PERFORMANS: SDK'ları statik olarak import etmiyoruz.
// Sadece tipleri alıyoruz, böylece projenin ilk yükleme boyutunu küçük tutuyoruz.
import type { FirebaseApp } from "firebase/app";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZWkrXQFqAAREVy_OmMayB4mY5BNmGvkk",
  authDomain: "kitapkurduv1.firebaseapp.com",
  projectId: "kitapkurduv1",
  storageBucket: "kitapkurduv1.firebasestorage.app",
  messagingSenderId: "766511797262",
  appId: "1:766511797262:web:cdf0ca9fb26b7b4869d85f",
  measurementId: "G-7KBY9V4NES"
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

// Firebase App Singleton
const getApp = async () => {
  if (appInstance) return appInstance;
  const { initializeApp } = await import("firebase/app");
  appInstance = initializeApp(firebaseConfig);
  return appInstance;
};

// Sadece Firestore modüllerini yükler (İlk açılış için kritik)
export const getFirestoreData = async () => {
  const app = await getApp();
  if (dbInstance) {
    return {
      db: dbInstance,
      firestoreModule: await import("firebase/firestore")
    };
  }
  const firestoreMod = await import("firebase/firestore");
  dbInstance = firestoreMod.getFirestore(app);
  return {
    db: dbInstance,
    firestoreModule: firestoreMod
  };
};

// Sadece Auth modüllerini yükler (Öğretmen paneline girişte yüklenir)
export const getAuthData = async () => {
  const app = await getApp();
  if (authInstance) {
    return {
      auth: authInstance,
      googleProvider: googleProviderInstance,
      authModule: await import("firebase/auth")
    };
  }
  const authMod = await import("firebase/auth");
  authInstance = authMod.getAuth(app);
  googleProviderInstance = new authMod.GoogleAuthProvider();
  return {
    auth: authInstance,
    googleProvider: googleProviderInstance,
    authModule: authMod
  };
};

// Geriye dönük uyumluluk için (Eski kodu bozmamak adına)
export const getFirebase = async () => {
  const [firestore, auth] = await Promise.all([
    getFirestoreData(),
    getAuthData()
  ]);
  return {
    ...firestore,
    ...auth
  };
};
