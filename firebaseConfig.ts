
// PERFORMANS: SDK'ları statik olarak import etmiyoruz.
// Sadece tipleri alıyoruz, böylece build boyutunu şişirmiyoruz.
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

// Singleton pattern: SDK'lar sadece bir kez yüklenecek
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

// Firebase modüllerini dinamik olarak yükleyen fonksiyon
export const getFirebase = async () => {
  if (appInstance && authInstance && dbInstance) {
    return { 
      app: appInstance, 
      auth: authInstance, 
      db: dbInstance, 
      googleProvider: googleProviderInstance,
      // Helper modülleri de döndür
      authModule: await import("firebase/auth"),
      firestoreModule: await import("firebase/firestore")
    };
  }

  // Paralel import (Waterfall etkisini önlemek için)
  const [
    { initializeApp },
    authMod,
    firestoreMod
  ] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore")
  ]);

  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
  }
  
  authInstance = authMod.getAuth(appInstance);
  dbInstance = firestoreMod.getFirestore(appInstance);
  googleProviderInstance = new authMod.GoogleAuthProvider();

  return { 
    app: appInstance, 
    auth: authInstance, 
    db: dbInstance, 
    googleProvider: googleProviderInstance,
    authModule: authMod,
    firestoreModule: firestoreMod
  };
};
