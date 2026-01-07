// Firestore order status history service
import { 
  getFirestore, 
  collection, 
  addDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';

const db = getFirestore(app, 'shakthifishmarket');
const historyCollection = collection(db, 'order_status_history');

/**
 * Log order status change
 * @param {Object} data - Status change data
 * @returns {Promise<Object>} Created history entry
 */
export async function logOrderStatusChange(data) {
  try {
    const historyEntry = {
      order_id: data.order_id || '',
      old_status: data.old_status || '',
      new_status: data.new_status || '',
      changed_by: data.changed_by || 'system',
      changed_by_name: data.changed_by_name || 'System',
      notes: data.notes || '',
      changed_at: serverTimestamp()
    };
    
    const docRef = await addDoc(historyCollection, historyEntry);
    
    console.log('[OrderHistory] Status change logged:', docRef.id);
    return {
      id: docRef.id,
      ...historyEntry,
      changed_at: new Date()
    };
  } catch (error) {
    console.error('[OrderHistory] Failed to log status change:', error.message);
    throw error;
  }
}

/**
 * Get order history by order ID
 * @param {string} orderId - Order document ID
 * @returns {Promise<Array>} Array of status changes
 */
export async function getOrderHistory(orderId) {
  try {
    const q = query(
      historyCollection,
      where('order_id', '==', orderId),
      orderBy('changed_at', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const history = [];
    
    snapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[OrderHistory] Loaded ${history.length} history entries for order ${orderId}`);
    return history;
  } catch (error) {
    console.error('[OrderHistory] Failed to get order history:', error.message);
    throw error;
  }
}

/**
 * Get all status changes (admin view)
 * @param {number} limitCount - Limit number of results
 * @returns {Promise<Array>} Array of recent status changes
 */
export async function getAllStatusChanges(limitCount = 50) {
  try {
    const q = query(
      historyCollection,
      orderBy('changed_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const changes = [];
    let count = 0;
    
    snapshot.forEach((doc) => {
      if (count < limitCount) {
        changes.push({
          id: doc.id,
          ...doc.data()
        });
        count++;
      }
    });
    
    console.log(`[OrderHistory] Loaded ${changes.length} recent status changes`);
    return changes;
  } catch (error) {
    console.error('[OrderHistory] Failed to get all status changes:', error.message);
    throw error;
  }
}
