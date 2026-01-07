import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { firestore, auth as adminAuth } from '../firebaseAdmin.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();
const USERS = 'users';

// POST /api/admin/login  { phone|phn_number, password, name? }
// Strategy: find Firestore users doc with that phone (field: phone or phn_number) and role:'admin'.
// If not found and name supplied => auto create admin doc with hashed password.
router.post('/login', async (req, res, next) => {
  try {
    const { phone, phn_number, password, name, email } = req.body || {};
    const phoneInput = phone || phn_number;
    if (!phoneInput || !password) return res.status(400).json({ error: 'phone and password required' });

    // Try match on 'phone' then fallback to 'phn_number'
    let snap = await firestore.collection(USERS).where('phone', '==', phoneInput).limit(1).get();
    if (snap.empty) {
      snap = await firestore.collection(USERS).where('phn_number', '==', phoneInput).limit(1).get();
    }

    let doc;
    if (snap.empty) {
      if (!name) return res.status(401).json({ error: 'Invalid credentials' });
      // Auto-create new admin user
      const password_hash = await bcrypt.hash(password, 10);
      const payload = {
        name: name || 'Admin',
        phone: phoneInput,
        phn_number: phoneInput,
        email: email || null,
        role: 'admin',
        password_hash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const ref = await firestore.collection(USERS).add(payload);
      doc = await ref.get();
    } else {
      doc = snap.docs[0];
    }
    const data = doc.data() || {};

    if ((data.role || '').toLowerCase() !== 'admin') return res.status(403).json({ error: 'Not an admin user' });

    const ok = data.password_hash ? await bcrypt.compare(password, data.password_hash) : false;
    if (!ok && !snap.empty) return res.status(401).json({ error: 'Invalid credentials' });

    // Optionally set custom claim if missing
    try {
      if (!data.customClaimsApplied && data.uid) {
        await adminAuth.setCustomUserClaims(data.uid, { admin: true });
        await firestore.collection(USERS).doc(doc.id).set({ customClaimsApplied: true }, { merge: true });
      }
    } catch {}

    const profile = {
      id: doc.id,
      uid: data.uid || null,
      name: data.name || name || null,
      phone: data.phone || data.phn_number || phoneInput,
      email: data.email || email || null,
      role: data.role || 'admin',
      created: snap.empty ? true : false,
    };
    res.json({ ok: true, profile });
  } catch (e) { next(e); }
});

// GET /api/admin/me  — requires Firebase ID token
router.get('/me', verifyFirebaseToken, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    // prefer direct doc by uid if exists
    let docRef = firestore.collection(USERS).doc(uid);
    let doc = await docRef.get();
    if (!doc.exists) {
      // fallback: lookup by uid field
      const snap = await firestore.collection(USERS).where('uid', '==', uid).limit(1).get();
      if (snap.empty) return res.status(404).json({ error: 'User profile not found' });
      doc = snap.docs[0];
    }
    const data = doc.data() || {};
    if ((data.role || '').toLowerCase() !== 'admin' && req.user.admin !== true) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    res.json({ id: doc.id, ...data });
  } catch (e) { next(e); }
});

export default router;
