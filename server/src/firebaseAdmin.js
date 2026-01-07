import admin from 'firebase-admin';
import 'dotenv/config';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!admin.apps.length) {
  let credential;

  if (serviceAccountJson && serviceAccountJson.trim().startsWith('{')) {
    credential = admin.credential.cert(JSON.parse(serviceAccountJson));
  } else if (serviceAccountPath) {
    console.warn('[firebase-admin] Using FIREBASE_SERVICE_ACCOUNT_PATH; consider GOOGLE_APPLICATION_CREDENTIALS instead.');
    const { default: fs } = await import('node:fs');
    const { default: path } = await import('node:path');
    const absolutePath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(process.cwd(), serviceAccountPath);
    const raw = fs.readFileSync(absolutePath, 'utf8');
    credential = admin.credential.cert(JSON.parse(raw));
  } else {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('[firebase-admin] No service account provided; set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT(_PATH).');
    }
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT,
  });
}

const databaseId = process.env.FIRESTORE_DATABASE_ID;
export const firestore = databaseId ? getFirestore(admin.app(), databaseId) : getFirestore(admin.app());
export const auth = admin.auth();
export default admin;
