import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';

const db = getFirestore(app, 'shakthifishmarket');

// Fixed document ID for store settings (only one store)
const SETTINGS_DOC_ID = 'ysBEJ09rYaPreXt9T690';

/**
 * Get store settings
 * @returns {Promise<Object|null>} Store settings data or null if not found
 */
export async function getStoreSettings() {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = { id: settingsSnap.id, ...settingsSnap.data() };
      console.log('[UserSettings] Loaded settings:', {
        delivery_cutoff: data.delivery_cutoff,
        delivery_open_message: data.delivery_open_message,
        delivery_closed_message: data.delivery_closed_message
      });
      return data;
    }
    
    // Return default settings if not found
    return {
      id: SETTINGS_DOC_ID,
      store_name: 'Shakthi Fish Market',
      phone: '+91 98765 43210',
      email: 'subinbala20092005@gmail.com',
      address: 'Erode, Tamil Nadu',
      delivery_cutoff: '8:00 PM',
      delivery_open_message: 'Home delivery available until 8:00 PM today.',
      delivery_closed_message: 'Home delivery closed for today after 8:00 PM. Only self pickup available.',
      business_hours: {
        monday: { open: '6:00 AM', close: '8:00 PM', is_open: true },
        tuesday: { open: '6:00 AM', close: '8:00 PM', is_open: true },
        wednesday: { open: '6:00 AM', close: '8:00 PM', is_open: true },
        thursday: { open: '6:00 AM', close: '8:00 PM', is_open: true },
        friday: { open: '6:00 AM', close: '8:00 PM', is_open: true },
        saturday: { open: '6:00 AM', close: '8:00 PM', is_open: true },
        sunday: { open: '6:00 AM', close: '2:00 PM', is_open: true }
      },
      created_at: null,
      updated_at: null
    };
  } catch (error) {
    console.error('[FirestoreSettings] getStoreSettings failed:', error);
    throw error;
  }
}

/**
 * Update store settings (ONLY updates existing data, does not create)
 * @param {Object} settings - Settings data to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateStoreSettings(settings) {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    
    // Check if settings document exists
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      throw new Error('Settings document does not exist. Please create it in Firebase Console first.');
    }
    
    // Only update the provided fields
    const settingsData = {
      store_name: settings.store_name,
      phone: settings.phone,
      
      whatsapp_number: settings.whatsapp_number,
      email: settings.email,
      address: settings.address,
      // Store Locator fields (three locations)
      store_name_1: settings.store_name_1,
      address_1: settings.address_1,
      store_name_2: settings.store_name_2,
      address_2: settings.address_2,
      store_name_3: settings.store_name_3,
      address_3: settings.address_3,
      delivery_cutoff: settings.delivery_cutoff,
      delivery_open_message: settings.delivery_open_message,
      delivery_closed_message: settings.delivery_closed_message,
      business_hours: settings.business_hours,
      updated_at: serverTimestamp()
    };
    
    // Update existing document (merge: true keeps other fields)
    await setDoc(settingsRef, settingsData, { merge: true });
    
    console.log('[FirestoreSettings] Settings updated successfully');
    
    // Return the updated data
    return {
      id: SETTINGS_DOC_ID,
      ...settingsData,
      created_at: settingsSnap.data()?.created_at,
      updated_at: new Date()
    };
  } catch (error) {
    console.error('[FirestoreSettings] updateStoreSettings failed:', error);
    throw error;
  }
}

/**
 * Get business hours for a specific day
 * @param {string} day - Day of week (lowercase, e.g., 'monday')
 * @returns {Promise<Object>} Business hours for the day
 */
export async function getBusinessHoursForDay(day) {
  try {
    const settings = await getStoreSettings();
    return settings.business_hours?.[day.toLowerCase()] || null;
  } catch (error) {
    console.error('[FirestoreSettings] getBusinessHoursForDay failed:', error);
    throw error;
  }
}

/**
 * Check if store is currently open
 * @returns {Promise<boolean>} True if store is open now
 */
export async function isStoreOpen() {
  try {
    const settings = await getStoreSettings();
    const now = new Date();
    const dayName = now.toLocaleLowerCase('en-US', { weekday: 'long' }).toLowerCase();
    
    const todayHours = settings.business_hours?.[dayName];
    
    if (!todayHours || !todayHours.is_open) {
      return false;
    }
    
    // Store is marked as open for today
    return todayHours.is_open;
  } catch (error) {
    console.error('[FirestoreSettings] isStoreOpen failed:', error);
    return true; // Default to open on error
  }
}
