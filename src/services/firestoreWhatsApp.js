import { 
  getFirestore, 
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';

const db = getFirestore(app, 'shakthifishmarket');

/**
 * Get WhatsApp number from Wa-redirect collection
 * @returns {Promise<string>} WhatsApp number
 */
export async function getWhatsAppNumber() {
  try {
    const waRedirectCollection = collection(db, 'Wa-redirect');
    const snapshot = await getDocs(waRedirectCollection);
    
    if (!snapshot.empty) {
      // Get the first document
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      // Normalize to digits and ensure 91 + 10 digits
      const raw = String(data.phonenumber ?? data.phoneNumber ?? '').trim();
      const digits = raw.replace(/\D/g, '');

      if (!digits) {
        console.warn('[WhatsApp] Empty phonenumber in Wa-redirect doc; using fallback');
        return '919943328133';
      }

      // If starts with 91 and length >= 12, use last 10 after 91
      if (digits.startsWith('91')) {
        const rest = digits.slice(2);
        const last10 = rest.length >= 10 ? rest.slice(-10) : rest.padStart(10, '0');
        return `91${last10}`;
      }

      // Otherwise use last 10 digits and prefix 91
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits.padStart(10, '0');
      return `91${last10}`;
    }
    
    // Fallback number if collection is empty
    console.warn('[WhatsApp] No documents in Wa-redirect collection, using fallback');
    return '919943328133';
  } catch (error) {
    console.error('[WhatsApp] Failed to fetch WhatsApp number:', error);
    // Return fallback number on error
    return '919943328133';
  }
}

/**
 * Update WhatsApp number in Wa-redirect collection
 * @param {string} phoneNumber - New phone number
 * @param {string} docId - Document ID (optional, uses first doc if not provided)
 * @returns {Promise<void>}
 */
export async function updateWhatsAppNumber(phoneNumber, docId = null) {
  try {
    const waRedirectCollection = collection(db, 'Wa-redirect');
    
    if (docId) {
      // Update specific document
      const docRef = doc(db, 'Wa-redirect', docId);
      await updateDoc(docRef, {
        phonenumber: phoneNumber
      });
    } else {
      // Get first document and update it
      const snapshot = await getDocs(waRedirectCollection);
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        await updateDoc(firstDoc.ref, {
          phonenumber: phoneNumber
        });
      } else {
        // Create new document if none exists
        const newDocRef = doc(waRedirectCollection);
        await setDoc(newDocRef, {
          phonenumber: phoneNumber
        });
      }
    }
    
    console.log('[WhatsApp] Phone number updated successfully');
  } catch (error) {
    console.error('[WhatsApp] Failed to update WhatsApp number:', error);
    throw error;
  }
}

/**
 * Get WhatsApp redirect document by ID
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>}
 */
export async function getWhatsAppRedirectDoc(docId) {
  try {
    const docRef = doc(db, 'Wa-redirect', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('[WhatsApp] Failed to fetch redirect doc:', error);
    throw error;
  }
}
