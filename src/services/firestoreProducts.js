// Firestore products service
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/integrations/firebase/firebase';

const db = getFirestore(app, 'shakthifishmarket');
const productsCollection = collection(db, 'products');

/**
 * Get all products from Firestore
 * @param {Object} filter - Optional filter { category, isAvailable }
 * @returns {Promise<Array>} Array of products
 */
export async function getProducts(filter = {}) {
  try {
    let q = query(productsCollection);
    
    // Apply filters
    if (filter.category) {
      q = query(q, where('category', '==', filter.category));
    }
    if (filter.isAvailable !== undefined) {
      q = query(q, where('is_available', '==', filter.isAvailable));
    }
    
    const snapshot = await getDocs(q);
    const products = [];
    
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[FirestoreProducts] Loaded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('[FirestoreProducts] getProducts failed:', error.message);
    throw error;
  }
}

/**
 * Get a single product by ID
 * @param {string} productId - Product document ID
 * @returns {Promise<Object|null>} Product data or null
 */
export async function getProductById(productId) {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('[FirestoreProducts] getProductById failed:', error.message);
    throw error;
  }
}

/**
 * Create a new product in Firestore
 * @param {Object} productData - Product information
 * @returns {Promise<Object>} Created product with ID
 */
export async function createProduct(productData) {
  try {
    const productRef = doc(productsCollection);
    const newProduct = {
      name_english: productData.name_english || '',
      name_tamil: productData.name_tamil || '',
      name_tanglish: productData.name_tanglish || '',
      category: productData.category || '',
      price_per_kg: Number(productData.price_per_kg) || 0,
      stock_kg: Number(productData.stock_kg) || 0,
      is_available: Boolean(productData.is_available),
      image_url: productData.image_url || '',
      image_public_id: productData.image_public_id || '',
      description: productData.description || '',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(productRef, newProduct);
    
    console.log('[FirestoreProducts] Product created:', productRef.id);
    return {
      id: productRef.id,
      ...newProduct,
      created_at: new Date(),
      updated_at: new Date()
    };
  } catch (error) {
    console.error('[FirestoreProducts] createProduct failed:', error.message);
    throw error;
  }
}

/**
 * Update an existing product
 * @param {string} productId - Product document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateProduct(productId, updates) {
  try {
    const productRef = doc(db, 'products', productId);
    
    const updateData = {
      ...updates,
      updated_at: serverTimestamp()
    };
    
    // Convert numeric fields
    if (updateData.price_per_kg !== undefined) {
      updateData.price_per_kg = Number(updateData.price_per_kg);
    }
    if (updateData.stock_kg !== undefined) {
      updateData.stock_kg = Number(updateData.stock_kg);
    }
    if (updateData.is_available !== undefined) {
      updateData.is_available = Boolean(updateData.is_available);
    }
    
    await updateDoc(productRef, updateData);
    
    console.log('[FirestoreProducts] Product updated:', productId);
  } catch (error) {
    console.error('[FirestoreProducts] updateProduct failed:', error.message);
    throw error;
  }
}

/**
 * Delete a product
 * @param {string} productId - Product document ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    
    console.log('[FirestoreProducts] Product deleted:', productId);
  } catch (error) {
    console.error('[FirestoreProducts] deleteProduct failed:', error.message);
    throw error;
  }
}

/**
 * Update product stock
 * @param {string} productId - Product document ID
 * @param {number} stockKg - New stock amount in kg
 * @returns {Promise<void>}
 */
export async function updateProductStock(productId, stockKg) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      stock_kg: Number(stockKg),
      updated_at: serverTimestamp()
    });
    
    console.log('[FirestoreProducts] Stock updated:', productId, stockKg);
  } catch (error) {
    console.error('[FirestoreProducts] updateProductStock failed:', error.message);
    throw error;
  }
}

/**
 * Toggle product availability
 * @param {string} productId - Product document ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<void>}
 */
export async function toggleProductAvailability(productId, isAvailable) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      is_available: Boolean(isAvailable),
      updated_at: serverTimestamp()
    });
    
    console.log('[FirestoreProducts] Availability updated:', productId, isAvailable);
  } catch (error) {
    console.error('[FirestoreProducts] toggleProductAvailability failed:', error.message);
    throw error;
  }
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of products in category
 */
export async function getProductsByCategory(category) {
  return getProducts({ category, isAvailable: true });
}
