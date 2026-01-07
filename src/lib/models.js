/* JavaScript data model helpers converted from TypeScript version.
   If you later want runtime validation, integrate a library (e.g., zod) similarly.
*/

// --- User Factory ---
export function createUser(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `u_${crypto.randomUUID()}`,
    email: (partial.email || '').toLowerCase(),
    phone: partial.phone,
    name: partial.name || 'User',
    role: partial.role || 'user',
    avatar_url: partial.avatar_url,
    is_phone_verified: partial.is_phone_verified ?? false,
    is_email_verified: partial.is_email_verified ?? false,
    last_login_at: partial.last_login_at,
    created_at: partial.created_at || now,
    updated_at: partial.updated_at || now,
    addresses: partial.addresses || [],
    preferences: partial.preferences || {},
  };
}

// --- Product Factory ---
export function createProduct(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `p_${crypto.randomUUID()}`,
    name_english: partial.name_english,
    name_tamil: partial.name_tamil,
    name_tanglish: partial.name_tanglish,
    category: partial.category,
    price_per_kg: partial.price_per_kg,
    stock_kg: partial.stock_kg ?? 0,
    is_available: partial.is_available ?? true,
    image_url: partial.image_url,
    description: partial.description,
    tags: partial.tags,
    origin_type: partial.origin_type,
    nutritional_info: partial.nutritional_info,
    units_sold: partial.units_sold,
    created_at: partial.created_at || now,
    updated_at: partial.updated_at || now,
  };
}

// --- Inventory Batch ---
export function createInventoryBatch(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `b_${crypto.randomUUID()}`,
    product_id: partial.product_id,
    lot_no: partial.lot_no,
    qty_kg: partial.qty_kg,
    remaining_kg: partial.remaining_kg ?? partial.qty_kg,
    received_at: partial.received_at || now,
    expiry_at: partial.expiry_at,
    vendor: partial.vendor,
    notes: partial.notes,
    updated_at: partial.updated_at || now,
  };
}

// --- Order + Order Item ---
export function createOrderItem(partial) {
  return {
    product_id: partial.product_id,
    name: partial.name,
    quantity_kg: partial.quantity_kg,
    unit_price: partial.unit_price,
    subtotal: partial.subtotal,
    notes: partial.notes,
  };
}

export function createOrder(partial) {
  const now = new Date().toISOString();
  const total = (partial.items || []).reduce((s, i) => s + (i.subtotal || 0), 0);
  return {
    id: partial.id || `o_${crypto.randomUUID()}`,
    order_number: partial.order_number || `SFM-${String(Date.now()).slice(-6)}`,
    user_id: partial.user_id,
    items: partial.items || [],
    delivery_type: partial.delivery_type || 'delivery',
    delivery_address: partial.delivery_address,
    delivery_lat: partial.delivery_lat,
    delivery_lon: partial.delivery_lon,
    total_amount: total,
    delivery_fee: partial.delivery_fee ?? 0,
    grand_total: partial.grand_total ?? total + (partial.delivery_fee ?? 0),
    customer_name: partial.customer_name,
    customer_phone: partial.customer_phone,
    notes: partial.notes,
    status: partial.status || 'received',
    created_at: partial.created_at || now,
    updated_at: partial.updated_at || now,
    delivery_partner_id: partial.delivery_partner_id,
    refund_amount: partial.refund_amount,
    refund_reason: partial.refund_reason,
    cancelled_at: partial.cancelled_at,
    refunded_at: partial.refunded_at,
    replacement_order_id: partial.replacement_order_id,
  };
}

// --- Delivery Partner ---
export function createDeliveryPartner(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `d_${crypto.randomUUID()}`,
    name: partial.name,
    phone: partial.phone,
    vehicle: partial.vehicle,
    active: partial.active ?? true,
    assigned_order_ids: partial.assigned_order_ids || [],
    created_at: partial.created_at || now,
    updated_at: partial.updated_at || now,
  };
}

// --- Support Ticket ---
export function createSupportTicket(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `t_${crypto.randomUUID()}`,
    email: (partial.email || '').toLowerCase(),
    subject: partial.subject,
    message: partial.message,
    status: partial.status || 'open',
    notes: partial.notes || [],
    created_at: partial.created_at || now,
    updated_at: partial.updated_at || now,
    user_id: partial.user_id,
  };
}

// --- OTP Session ---
export function createOtpSession(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `otp_${crypto.randomUUID()}`,
    identifier: (partial.identifier || '').toLowerCase(),
    code: partial.code,
    expires_at: partial.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    created_at: partial.created_at || now,
    consumed_at: partial.consumed_at,
    attempts: partial.attempts ?? 0,
    max_attempts: partial.max_attempts ?? 5,
  };
}

// --- Cart ---
export function createCart(partial) {
  const now = new Date().toISOString();
  return {
    id: partial.id || `c_${crypto.randomUUID()}`,
    user_id: partial.user_id,
    items: partial.items || [],
    updated_at: partial.updated_at || now,
  };
}

export function createCartItem(partial) {
  return {
    product_id: partial.product_id,
    quantity_kg: partial.quantity_kg,
    added_at: partial.added_at || new Date().toISOString(),
  };
}
