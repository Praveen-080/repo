// Firestore stores service
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';

const db = getFirestore(app, 'shakthifishmarket');
const storesCollection = collection(db, 'stores');

/**
 * Get all stores from Firestore
 * @returns {Promise<Array>} Array of stores with email, phone, and business hours
 */
export async function getAllStores() {
  try {
    const snapshot = await getDocs(storesCollection);
    const stores = [];
    
    snapshot.forEach((doc) => {
      stores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[FirestoreStores] Loaded ${stores.length} stores`);
    return stores;
  } catch (error) {
    console.error('[FirestoreStores] getAllStores failed:', error.message);
    throw error;
  }
}

/**
 * Get a single store by ID
 * @param {string} storeId - Store document ID
 * @returns {Promise<Object|null>} Store data or null
 */
export async function getStoreById(storeId) {
  try {
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    
    if (storeSnap.exists()) {
      return {
        id: storeSnap.id,
        ...storeSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('[FirestoreStores] getStoreById failed:', error.message);
    throw error;
  }
}

/**
 * Get stores by city
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of stores in the city
 */
export async function getStoresByCity(city) {
  try {
    const q = query(
      storesCollection,
      where('city', '==', city)
    );
    
    const snapshot = await getDocs(q);
    const stores = [];
    
    snapshot.forEach((doc) => {
      stores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[FirestoreStores] Loaded ${stores.length} stores for city: ${city}`);
    return stores;
  } catch (error) {
    console.error('[FirestoreStores] getStoresByCity failed:', error.message);
    throw error;
  }
}

/**
 * Extract business hours for a specific day
 * @param {Array} businessHours - Array of business hours objects
 * @param {string} day - Day name (e.g., "Monday")
 * @returns {string} Time range or "Closed"
 */
export function getBusinessHoursForDay(businessHours, day) {
  if (!Array.isArray(businessHours)) return "Closed";
  
  const dayHours = businessHours.find(h => h.day === day);
  if (dayHours) {
    return `${dayHours.open_time} - ${dayHours.close_time}`;
  }
  return "Closed";
}

/**
 * Check if a store is currently open based on current time and business hours
 * @param {Array} businessHours - Array of business hours objects
 * @returns {boolean} True if store is currently open
 */
export function isStoreOpen(businessHours) {
  if (!Array.isArray(businessHours)) return false;
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  
  const todayHours = businessHours.find(h => h.day === today);
  if (!todayHours) return false;
  
  const openTime = parseTimeToMinutes(todayHours.open_time);
  const closeTime = parseTimeToMinutes(todayHours.close_time);
  const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
  
  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Parse time string like "6:00 AM" to minutes since midnight
 * @param {string} timeStr - Time string in format "HH:MM AM/PM"
 * @returns {number|null} Minutes since midnight or null if invalid
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'AM' && hours === 12) hours = 0;
  else if (period === 'PM' && hours !== 12) hours += 12;
  
  return hours * 60 + minutes;
}
