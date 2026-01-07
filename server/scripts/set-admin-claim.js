import 'dotenv/config';
import admin from '../src/firebaseAdmin.js';

async function main() {
  const uid = process.argv[2] || process.env.TARGET_UID;
  if (!uid) {
    console.error('Usage: node scripts/set-admin-claim.js <firebase-uid>');
    process.exit(1);
  }
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log('Admin claim applied to UID:', uid);
  } catch (e) {
    console.error('Failed to set admin claim:', e.message);
    process.exit(1);
  }
}
main();
