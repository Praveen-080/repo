import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
// Guard against multiple initializations in dev (HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to LOCAL (keeps user logged in across browser sessions)
// Auth state persists until explicit logout - effectively 6+ months
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('[Firebase Auth] Failed to set persistence:', error);
});
if (typeof window !== 'undefined') {
    // Basic one-time config sanity log
    if (!window.__FIREBASE_INIT_LOGGED) {
        console.log("[Firebase] Initialized app:", app.options.projectId, "Auth domain:", app.options.authDomain);
        window.__FIREBASE_INIT_LOGGED = true;
    }
}
export { app, auth, RecaptchaVerifier, signInWithPhoneNumber };
export default app;
// Deprecated inline login helper removed; use phoneAuth.js abstractions instead.