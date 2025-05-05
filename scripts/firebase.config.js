// import { initializeApp, getApp, getApps } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getAuth, initializeAuth, getReactNativePersistence, GoogleAuthProvider } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getStorage } from "firebase/storage";
// import { getMessaging } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };

// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// const db = getFirestore(app);
// const storage = getStorage(app);
// const provider = new GoogleAuthProvider();
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });
// // const messaging = getMessaging(app);

// export { app, auth, db, storage, provider };


// firebase.config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Prevent re-initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  // Only initialize auth if not already initialized
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  if (!/already exists/.test(e.message)) {
    console.error("Firebase Auth init error", e);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
