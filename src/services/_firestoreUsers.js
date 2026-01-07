// Firestore user document provisioning helper.
// Creates or updates a user profile document after successful OTP auth.
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';

const db = getFirestore(app, 'shakthifishmarket');

/**
 * Check if user document exists in Firestore
 * @param {string} uid - Firebase Authentication UID
 * @returns {Promise<Object|null>} User document data or null if not found
 */
export async function checkUserExists(uid) {
  if (!uid) throw new Error('uid required');
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('[FirestoreUsers] checkUserExists failed:', error.message);
    throw error;
  }
}

/**
 * Create new user document in Firestore
 * @param {Object} userData - User data including uid, phone, name, email, role
 * @returns {Promise<Object>} Created user document
 */
export async function createUserDocument({ uid, phone, name, email, role = 'user' }) {
  if (!uid) throw new Error('uid required');
  
  try {
    const userRef = doc(db, 'users', uid);
    const userData = {
      uid,
      phone: phone || null,
      name: name || null,
      email: email || null,
      role: role || 'user',
      created_at: serverTimestamp(),
      last_login: serverTimestamp(),
      is_active: true,
      profile_completed: !!(name && phone)
    };
    
    await setDoc(userRef, userData);
    console.log('[FirestoreUsers] User document created:', uid);
    
    return { ...userData, created_at: new Date(), last_login: new Date() };
  } catch (error) {
    console.error('[FirestoreUsers] createUserDocument failed:', error.message);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 * @param {string} uid - Firebase Authentication UID
 * @returns {Promise<void>}
 */
export async function updateUserLastLogin(uid) {
  if (!uid) throw new Error('uid required');
  
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      last_login: serverTimestamp()
    }, { merge: true });
    
    console.log('[FirestoreUsers] Last login updated:', uid);
  } catch (error) {
    console.warn('[FirestoreUsers] updateUserLastLogin failed:', error.message);
    // Non-fatal: don't block login
  }
}

/**
 * Create new user document in Firestore (alias for createUserDocument)
 * @param {Object} userData - User data including uid, email, name, phone, role, etc.
 * @returns {Promise<Object>} Created user document
 */
export async function createUser(userData) {
  if (!userData.uid) throw new Error('uid required');
  
  try {
    const userRef = doc(db, 'users', userData.uid);
    const userDoc = {
      uid: userData.uid,
      email: userData.email || null,
      name: userData.name || null,
      phone: userData.phone || null,
      role: userData.role || 'user',
      created_at: serverTimestamp(),
      last_login: serverTimestamp(),
      is_active: true,
      profile_completed: userData.profile_completed !== undefined ? userData.profile_completed : !!(userData.name && userData.phone)
    };
    
    await setDoc(userRef, userDoc);
    console.log('[FirestoreUsers] User document created:', userData.uid);
    
    return { ...userDoc, created_at: new Date(), last_login: new Date() };
  } catch (error) {
    console.error('[FirestoreUsers] createUser failed:', error.message);
    throw error;
  }
}

/**
 * Update user document with new data
 * @param {string} uid - Firebase Authentication UID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUser(uid, updates) {
  if (!uid) throw new Error('uid required');
  
  try {
    const userRef = doc(db, 'users', uid);
    const updateData = {
      ...updates,
      last_login: serverTimestamp()
    };
    
    await setDoc(userRef, updateData, { merge: true });
    console.log('[FirestoreUsers] User document updated:', uid);
    
    // Fetch and return updated document
    const updatedSnap = await getDoc(userRef);
    return { uid, ...updatedSnap.data() };
  } catch (error) {
    console.error('[FirestoreUsers] updateUser failed:', error.message);
    throw error;
  }
}

/**
 * Update user profile information
 * @param {string} uid - Firebase Authentication UID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
  if (!uid) throw new Error('uid required');
  
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      last_login: serverTimestamp()
    }, { merge: true });
    
    console.log('[FirestoreUsers] Profile updated:', uid);
  } catch (error) {
    console.error('[FirestoreUsers] updateUserProfile failed:', error.message);
    throw error;
  }
}

// LEGACY FUNCTION - kept for backwards compatibility
export async function firebaseAdminUserDocCreate({ uid, phone, name, email, role }) {
  if (!uid) throw new Error('uid required');
  const ref = doc(db, 'users', uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        phone: phone || null,
        name: name || null,
        email: email || null,
        role: role || 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      await setDoc(ref, {
        phone: phone || snap.data().phone || null,
        name: name || snap.data().name || null,
        email: email || snap.data().email || null,
        role: role || snap.data().role || 'user',
        updatedAt: Date.now(),
      }, { merge: true });
    }
  } catch (e) {
    console.warn('[FirestoreUsers] create/update failed:', e.message);
  }
}
