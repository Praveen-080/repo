import admin from 'firebase-admin';
import 'dotenv/config';

// Expect FIREBASE_SERVICE_ACCOUNT to contain JSON string of service account
const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!admin.apps.length) {
  let credential;
  if (svc && svc.trim().startsWith('{')) {
    credential = admin.credential.cert(JSON.parse(svc));
  } else if (svc) {
    // Path case: not recommended on shared hosting, but supported
    credential = admin.credential.cert(svc);
  } else {
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT missing; using applicationDefault (ensure GOOGLE_APPLICATION_CREDENTIALS is set)');
    credential = admin.credential.applicationDefault();
  }
  admin.initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID });
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export default admin;
