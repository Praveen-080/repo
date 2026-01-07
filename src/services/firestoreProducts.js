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
    const wantsCategory = Boolean(filter.category);
    const wantsAvailability = filter.isAvailable !== undefined;
    const includeUnavailable = Boolean(filter.includeUnavailable);

    const run = async (q, label) => {
      const snapshot = await getDocs(q);
      const products = [];
      snapshot.forEach((snap) => {
        products.push({ id: snap.id, ...snap.data() });
      });
      console.log(`[FirestoreProducts] Loaded ${products.length} products (${label})`);
      return products;
    };

    // We support both schemas:
    // - snake_case: is_available
    // - camelCase: isAvailable
    // Also, some projects need a composite index for (category + is_*). If missing,
    // we fall back to a simpler query and filter client-side.

    // 1) Best-case: category + availability on snake_case
    if (wantsCategory && wantsAvailability) {
      try {
        return await run(
          query(
            productsCollection,
            where('category', '==', filter.category),
            where('is_available', '==', filter.isAvailable)
          ),
          'category + is_available'
        );
      } catch (e) {
        console.warn('[FirestoreProducts] Query failed (category + is_available), trying alternatives:', e?.message || e);
      }
    }

    // 2) Best-case: category + availability on camelCase
    if (wantsCategory && wantsAvailability) {
      try {
        return await run(
          query(
            productsCollection,
            where('category', '==', filter.category),
            where('isAvailable', '==', filter.isAvailable)
          ),
          'category + isAvailable'
        );
      } catch (e) {
        console.warn('[FirestoreProducts] Query failed (category + isAvailable), falling back:', e?.message || e);
      }
    }

    // 3) Availability-only (snake_case)
    if (!wantsCategory && wantsAvailability) {
      try {
        return await run(
          query(productsCollection, where('is_available', '==', filter.isAvailable)),
          'is_available'
        );
      } catch (e) {
        console.warn('[FirestoreProducts] Query failed (is_available), trying isAvailable:', e?.message || e);
      }
    }

    // 4) Availability-only (camelCase)
    if (!wantsCategory && wantsAvailability) {
      try {
        return await run(
          query(productsCollection, where('isAvailable', '==', filter.isAvailable)),
          'isAvailable'
        );
      } catch (e) {
        console.warn('[FirestoreProducts] Query failed (isAvailable), falling back to full scan:', e?.message || e);
      }
    }

    // 5) Category-only, then filter availability in memory
    if (wantsCategory) {
      const base = await run(
        query(productsCollection, where('category', '==', filter.category)),
        'category only'
      );
      if (includeUnavailable) return base;
      if (!wantsAvailability) {
        return base.filter((p) => {
          const val = p.is_available ?? p.isAvailable;
          return Boolean(val) === true;
        });
      }

      return base.filter((p) => {
        const val = p.is_available ?? p.isAvailable;
        return Boolean(val) === Boolean(filter.isAvailable);
      });
    }

    // 6) Full scan, filter client-side
    const base = await run(query(productsCollection), 'full scan');
    return base.filter((p) => {
      if (includeUnavailable) {
        // skip availability filtering entirely
      } else if (wantsAvailability) {
        const val = p.is_available ?? p.isAvailable;
        if (Boolean(val) !== Boolean(filter.isAvailable)) return false;
      } else {
        // Default behavior: hide unavailable products for user-facing pages
        const val = p.is_available ?? p.isAvailable;
        if (Boolean(val) !== true) return false;
      }
      if (wantsCategory && p.category !== filter.category) return false;
      return true;
    });
  } catch (error) {
    console.error('[FirestoreProducts] getProducts failed:', error);
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
    // Route params can occasionally include query/hash fragments (e.g. from bad links).
    // Firestore doc IDs must not include '/' and should be a plain string.
    const safeId = String(productId || '').split('?')[0].split('#')[0];
    if (!safeId) return null;
    const productRef = doc(db, 'products', safeId);
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
      stock_type: productData.stock_type || 'kg',
      stock_kg: Number(productData.stock_kg) || 0,
      count: Number(productData.count) || 0,
      is_available: productData.is_available === undefined ? true : Boolean(productData.is_available),
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
    if (updateData.count !== undefined) {
      updateData.count = Number(updateData.count);
    }
    if (updateData.stock_type !== undefined) {
      updateData.stock_type = String(updateData.stock_type);
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
