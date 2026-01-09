import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbIgncy6lgtdEqWsp8KuAdxQDG0w13KyQ",
  authDomain: "fish-market-becb6.firebaseapp.com",
  projectId: "fish-market-becb6",
  // Use the default appspot.com bucket domain; firebasestorage.app here can cause auth issues
  storageBucket: "fish-market-becb6.appspot.com",
  messagingSenderId: "697772392345",
  appId: "1:697772392345:web:cd2867521d74da50735d08",
  measurementId: "G-T1D1NXDNJY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

if (typeof window !== 'undefined') {
  if (!window.__FIREBASE_INITIALIZED__) {
    console.log("Firebase app initialized:", app.name);
    window.__FIREBASE_INITIALIZED__ = true;
  }
}
export { app, auth, RecaptchaVerifier, signInWithPhoneNumber };
export default app;
