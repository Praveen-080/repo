import { app } from '@/integrations/firebase/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Bind Firestore to the same initialized app
// Using named database: shakthifishmarket
const db = getFirestore(app, 'shakthifishmarket');

// Admin document location (update this to match your Firestore structure)
const ADMIN_COLLECTION = 'admin';
const ADMIN_DOC_ID = '49Fc7uAxbVCYSDAXf8Py';

/**
 * Fast admin credential check - single direct document fetch
 * Validates: Password and Phn_number must match
 */
export async function adminSignInOrCreate({ name, phn_number, password }) {
  const t0 = performance.now();
  
  // Validate inputs
  if (!phn_number || !password) {
    throw new Error('Phone number and password are required');
  }
  
  const inputPhoneDigits = String(phn_number).replace(/\D/g, '');
  if (!inputPhoneDigits) {
    throw new Error('Invalid phone number format');
  }

  try {
    // Single direct fetch - fast and efficient
    const adminRef = doc(db, ADMIN_COLLECTION, ADMIN_DOC_ID);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
      console.error('[AdminLogin] Document not found:', `${ADMIN_COLLECTION}/${ADMIN_DOC_ID}`);
      throw new Error('Admin account not found. Please contact support.');
    }

    const data = adminSnap.data();
    const docId = adminSnap.id;
    
    // Extract and normalize stored values
    const storedPhoneRaw = (data.Phn_number || data.phn_number || '').trim();
    const storedPhoneDigits = storedPhoneRaw.replace(/\D/g, '');
    const storedPassword = (data.Password || data.password || '').trim();
    const storedName = (data.name || data.Name || '').trim();
    
    // Validate phone match (exact digits comparison)
    if (storedPhoneDigits !== inputPhoneDigits) {
      console.error('[AdminLogin] Phone mismatch:', {
        stored: storedPhoneDigits.replace(/\d(?=\d{3})/g, '*'),
        entered: inputPhoneDigits.replace(/\d(?=\d{3})/g, '*')
      });
      throw new Error('Invalid phone number');
    }
    
    // Validate password match
    if (storedPassword !== password) {
      console.error('[AdminLogin] Password mismatch');
      throw new Error('Invalid password');
    }
    
    // Success - return admin profile
    const profile = {
      uid: data.uid || docId,
      name: storedName || name || 'Admin',
      phn_number: storedPhoneDigits,
      role: 'admin'
    };
    
    const elapsed = Math.round(performance.now() - t0);
    console.log(`[AdminLogin] Success in ${elapsed}ms`);
    
    return profile;
    
  } catch (error) {
    const elapsed = Math.round(performance.now() - t0);
    console.error('[AdminLogin] Failed after', elapsed, 'ms:', error.message);
    
    // Provide user-friendly error messages
    if (error.code === 'permission-denied') {
      throw new Error('Access denied. Check Firebase security rules.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Network error. Please check your connection.');
    }
    
    // Re-throw the error with context
    throw error;
  }
}
