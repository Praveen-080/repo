// Firestore orders service
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';
import { logOrderStatusChange } from './firestoreOrderHistory';

const db = getFirestore(app, 'shakthifishmarket');
const ordersCollection = collection(db, 'orders');

/**
 * Generate a unique order number
 * Format: SFM-YYYYMMDD-XXX
 */
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `SFM-${year}${month}${day}-${random}`;
}

/**
 * Create a new order in Firestore
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Created order with ID
 */
export async function createOrder(orderData) {
  try {
    const orderRef = doc(ordersCollection);
    const orderNumber = generateOrderNumber();
    
    const newOrder = {
      // Customer Information
      user_id: orderData.user_id || '',
      customer_name: orderData.customer_name || '',
      customer_phone: orderData.customer_phone || '',
      customer_email: orderData.customer_email || '',
      
      // Order Items
      items: orderData.items || [],
      
      // Delivery Information
      delivery_type: orderData.delivery_type || 'cash_on_delivery',
      delivery_address: orderData.delivery_address || '',
      delivery_flat_no: orderData.delivery_flat_no || '',
      delivery_pincode: orderData.delivery_pincode || '',
      delivery_lat: orderData.delivery_lat || null,
      delivery_lon: orderData.delivery_lon || null,
      
      // Payment & Pricing
      items_subtotal: Number(orderData.items_subtotal) || 0,
      delivery_fee: Number(orderData.delivery_fee) || 0,
      grand_total: Number(orderData.grand_total) || 0,
      payment_method: orderData.payment_method || 'cash_on_delivery',
      payment_status: 'pending',
      
      // Order Status
      order_status: 'pending',
      order_number: orderNumber,
      
      // Notes
      customer_notes: orderData.customer_notes || '',
      
      // Timestamps
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    // Use batch to ensure atomicity of order creation and stock updates
    const batch = writeBatch(db);
    
    // Add order
    batch.set(orderRef, newOrder);
    
    // Update product stock for each item in the order
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        if (item.product_id && item.quantity) {
          const productRef = doc(db, 'products', item.product_id);
          const productSnap = await getDoc(productRef);
          
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock_kg || 0;
            const newStock = Math.max(0, currentStock - Number(item.quantity));
            batch.update(productRef, {
              stock_kg: newStock,
              updated_at: serverTimestamp()
            });
            console.log(`[FirestoreOrders] Stock updated for product ${item.product_id}: ${currentStock} -> ${newStock}`);
          }
        }
      }
    }
    
    // Commit batch
    await batch.commit();
    
    // Log initial status in history
    await logOrderStatusChange({
      order_id: orderRef.id,
      old_status: '',
      new_status: 'pending',
      changed_by: orderData.user_id || 'system',
      changed_by_name: orderData.customer_name || 'Customer',
      notes: 'Order created'
    }).catch(err => console.warn('Failed to log order creation:', err));
    
    console.log('[FirestoreOrders] Order created:', orderRef.id, orderNumber);
    return {
      id: orderRef.id,
      ...newOrder,
      created_at: new Date(),
      updated_at: new Date()
    };
  } catch (error) {
    console.error('[FirestoreOrders] createOrder failed:', error.message);
    throw error;
  }
}

/**
 * Get a single order by ID
 * @param {string} orderId - Order document ID
 * @returns {Promise<Object|null>} Order data or null
 */
export async function getOrderById(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('[FirestoreOrders] getOrderById failed:', error.message);
    throw error;
  }
}

/**
 * Get all orders for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user orders
 */
export async function getUserOrders(userId) {
  try {
    const q = query(
      ordersCollection,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const orders = [];
    
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[FirestoreOrders] Loaded ${orders.length} orders for user ${userId}`);
    return orders;
  } catch (error) {
    console.error('[FirestoreOrders] getUserOrders failed:', error.message);
    throw error;
  }
}

/**
 * Get all orders (admin view)
 * @param {Object} filter - Optional filter { status, limit }
 * @returns {Promise<Array>} Array of orders
 */
export async function getAllOrders(filter = {}) {
  try {
    let q = query(ordersCollection, orderBy('created_at', 'desc'));
    
    // Apply filters
    if (filter.status) {
      q = query(q, where('order_status', '==', filter.status));
    }
    if (filter.limit) {
      q = query(q, limit(filter.limit));
    }
    
    const snapshot = await getDocs(q);
    const orders = [];
    
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[FirestoreOrders] Loaded ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error('[FirestoreOrders] getAllOrders failed:', error.message);
    throw error;
  }
}

/**
 * Update order status
 * @param {string} orderId - Order document ID
 * @param {string} status - New status
 * @param {Object} options - Optional parameters { changedBy, changedByName, notes }
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, status, options = {}) {
  try {
    // Get current order to log old status
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const oldStatus = orderSnap.data().order_status || 'unknown';
    
    const updateData = {
      order_status: status,
      updated_at: serverTimestamp()
    };
    
    // Add timestamp for specific statuses
    if (status === 'confirmed') {
      updateData.confirmed_at = serverTimestamp();
    } else if (status === 'delivered') {
      updateData.delivered_at = serverTimestamp();
    }
    
    await updateDoc(orderRef, updateData);
    
    // Log status change in history
    await logOrderStatusChange({
      order_id: orderId,
      old_status: oldStatus,
      new_status: status,
      changed_by: options.changedBy || 'system',
      changed_by_name: options.changedByName || 'System',
      notes: options.notes || `Status changed from ${oldStatus} to ${status}`
    }).catch(err => console.warn('Failed to log status change:', err));
    
    console.log('[FirestoreOrders] Order status updated:', orderId, status);
  } catch (error) {
    console.error('[FirestoreOrders] updateOrderStatus failed:', error.message);
    throw error;
  }
}

/**
 * Update payment status
 * @param {string} orderId - Order document ID
 * @param {string} paymentStatus - New payment status
 * @returns {Promise<void>}
 */
export async function updatePaymentStatus(orderId, paymentStatus) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      payment_status: paymentStatus,
      updated_at: serverTimestamp()
    });
    
    console.log('[FirestoreOrders] Payment status updated:', orderId, paymentStatus);
  } catch (error) {
    console.error('[FirestoreOrders] updatePaymentStatus failed:', error.message);
    throw error;
  }
}

/**
 * Update order details
 * @param {string} orderId - Order document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateOrder(orderId, updates) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    const updateData = {
      ...updates,
      updated_at: serverTimestamp()
    };
    
    await updateDoc(orderRef, updateData);
    
    console.log('[FirestoreOrders] Order updated:', orderId);
  } catch (error) {
    console.error('[FirestoreOrders] updateOrder failed:', error.message);
    throw error;
  }
}

/**
 * Get orders by status
 * @param {string} status - Order status to filter by
 * @returns {Promise<Array>} Array of orders with specified status
 */
export async function getOrdersByStatus(status) {
  return getAllOrders({ status });
}

/**
 * Delete an order
 * @param {string} orderId - Order document ID
 * @returns {Promise<void>}
 */
export async function deleteOrder(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
    console.log('[FirestoreOrders] Order deleted:', orderId);
  } catch (error) {
    console.error('[FirestoreOrders] deleteOrder failed:', error.message);
    throw error;
  }
}
