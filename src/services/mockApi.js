const KEYS = {
  products: "sfm_products",
  orders: "sfm_orders",
  users: "sfm_users",
  store: "sfm_store",
  inventory: "sfm_inventory_batches",
  tickets: "sfm_support_tickets",
  partners: "sfm_delivery_partners",
  otps: "sfm_otps",
};

// Utility
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export function initMockData() {
  // Seed users
  const users = read(KEYS.users, []);
  if (users.length === 0) {
    const seed = [
      { id: "u_admin", email: "admin@sfm.local", name: "Admin", role: "admin", password: "admin123" },
      { id: "u_demo", email: "user@sfm.local", name: "Demo User", role: "user", password: "user123" },
    ];
    write(KEYS.users, seed);
  }
  // Initialize products ONLY if not already present (don't overwrite updated prices)
  const existingProducts = read(KEYS.products, null);
  const now = Date.now();
  const seedProducts = [
      // Sea Fish
      { 
        id: "p1", 
        name_english: "Seer Fish", 
        name_tamil: "வஞ்சிரம்", 
        name_tanglish: "Vanjaram",
        category: "sea_fish", 
        price_per_kg: 900, 
        stock_kg: 50, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/vanjaram-fish.jpeg', import.meta.url).href, 
        description: "Premium quality seer fish, ideal for frying and curries. Known for its firm texture and rich flavor.",
        created_at: now 
      },
      { 
        id: "p2", 
        name_english: "Shark", 
        name_tamil: "சுறா", 
        name_tanglish: "Sura",
        category: "sea_fish", 
        price_per_kg: 850, 
        stock_kg: 30, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/sura.jpg', import.meta.url).href, 
        description: "Fresh shark meat with firm texture, perfect for steaks and grilling. Rich in protein and omega-3.",
        created_at: now 
      },
      { 
        id: "p3", 
        name_english: "Sardine", 
        name_tamil: "மத்தி", 
        name_tanglish: "Mathi",
        category: "sea_fish", 
        price_per_kg: 250, 
        stock_kg: 120, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/Mathi fish.jpg', import.meta.url).href, 
        description: "Tiny silvery fish packed with nutrients. Great for frying, curries, and traditional recipes.",
        created_at: now 
      },
      { 
        id: "p4", 
        name_english: "Red Snapper", 
        name_tamil: "சாங்கரா", 
        name_tanglish: "Sankara",
        category: "sea_fish", 
        price_per_kg: 950, 
        stock_kg: 35, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/sankara-fish.jpg', import.meta.url).href, 
        description: "Delicate white flesh with excellent taste. Perfect for curries, grilling, and special occasions.",
        created_at: now 
      },
      { 
        id: "p5", 
        name_english: "Pomfret", 
        name_tamil: "வவ்வால்", 
        name_tanglish: "Vavval",
        category: "sea_fish", 
        price_per_kg: 1100, 
        stock_kg: 45, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/vaval-fish.webp', import.meta.url).href, 
        description: "White pomfret, highly prized for its delicate taste and boneless meat. Ideal for frying and steaming.",
        created_at: now 
      },
      { 
        id: "p6", 
        name_english: "Anchovy", 
        name_tamil: "நெத்திலி", 
        name_tanglish: "Nethili",
        category: "sea_fish", 
        price_per_kg: 300, 
        stock_kg: 90, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/Nethili-fish.jpg', import.meta.url).href, 
        description: "Small fish perfect for frying, pickles, and traditional preparations. Rich in calcium.",
        created_at: now 
      },
      { 
        id: "p7", 
        name_english: "Silver Pomfret", 
        name_tamil: "வெள்ளி வாவல்", 
        name_tanglish: "Sheela",
        category: "sea_fish", 
        price_per_kg: 1000, 
        stock_kg: 30, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/sheela.jpg', import.meta.url).href, 
        description: "Premium silver pomfret, perfect for special occasions. Mild flavor with tender meat.",
        created_at: now 
      },
      { 
        id: "p8", 
        name_english: "Ribbon Fish", 
        name_tamil: "திருக்கை", 
        name_tanglish: "Thirukai",
        category: "sea_fish", 
        price_per_kg: 350, 
        stock_kg: 70, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/thirukai-fish.jpg', import.meta.url).href, 
        description: "Long silvery fish, excellent for frying and curries. Popular for its unique shape and taste.",
        created_at: now 
      },
      { 
        id: "p9", 
        name_english: "Black Pomfret", 
        name_tamil: "பாவை", 
        name_tanglish: "Paavai",
        category: "sea_fish", 
        price_per_kg: 1150, 
        stock_kg: 25, 
        is_available: true, 
        image_url: new URL('../assets/Sea-Fish/paavai.jpg', import.meta.url).href, 
        description: "Premium black pomfret with rich flavor. Highly sought after for its delicate, buttery texture.",
        created_at: now 
      },

      // River Fish
      { 
        id: "p10", 
        name_english: "Rohu", 
        name_tamil: "ரோகு", 
        name_tanglish: "Rohu",
        category: "river_fish", 
        price_per_kg: 380, 
        stock_kg: 100, 
        is_available: true, 
        image_url: new URL('../assets/River Fish/Rohu.jpg', import.meta.url).href, 
        description: "Popular carp fish with tender meat. Excellent for curries and traditional recipes.",
        created_at: now 
      },
      { 
        id: "p11", 
        name_english: "Katla", 
        name_tamil: "கட்லா", 
        name_tanglish: "Katla",
        category: "river_fish", 
        price_per_kg: 350, 
        stock_kg: 80, 
        is_available: true, 
        image_url: new URL('../assets/River Fish/Katla.jpg', import.meta.url).href, 
        description: "Large freshwater carp, known for its sweet and tender meat. Great for Bengali-style fish curries.",
        created_at: now 
      },
      { 
        id: "p12", 
        name_english: "Tilapia", 
        name_tamil: "திலாப்பியா", 
        name_tanglish: "Tilapia",
        category: "river_fish", 
        price_per_kg: 300, 
        stock_kg: 120, 
        is_available: true, 
        image_url: new URL('../assets/River Fish/tilapia.jpeg', import.meta.url).href, 
        description: "Mild-flavored freshwater fish. Perfect for frying and light curries.",
        created_at: now 
      },
      { 
        id: "p13", 
        name_english: "Catfish", 
        name_tamil: "வாலை", 
        name_tanglish: "Vaalai",
        category: "river_fish", 
        price_per_kg: 400, 
        stock_kg: 70, 
        is_available: true, 
        image_url: new URL('../assets/River Fish/vaalai.png', import.meta.url).href, 
        description: "Whisker fish with sweet tender meat. Excellent for traditional South Indian recipes.",
        created_at: now 
      },

      // Prawns & Shrimp
      { 
        id: "p14", 
        name_english: "Tiger Prawn", 
        name_tamil: "புலி இறால்", 
        name_tanglish: "Puli Iraal",
        category: "prawns", 
        price_per_kg: 900, 
        stock_kg: 50, 
        is_available: true, 
        image_url: new URL('../assets/Shrimp/44933d1f85d4704b529062648358ac18.jpg', import.meta.url).href, 
        description: "Premium tiger prawns with distinctive stripes. Perfect for grilling, frying, and special dishes.",
        created_at: now 
      },
      { 
        id: "p15", 
        name_english: "Jumbo Prawn", 
        name_tamil: "பெரிய இறால்", 
        name_tanglish: "Periya Iraal",
        category: "prawns", 
        price_per_kg: 1000, 
        stock_kg: 40, 
        is_available: true, 
        image_url: new URL('../assets/Shrimp/PlanetSeafoodxMartinDinh-87-Edit-2-655x437.jpg', import.meta.url).href, 
        description: "Large juicy prawns, ideal for barbecue, grills, and premium seafood preparations.",
        created_at: now 
      },

      // Crabs
      { 
        id: "p16", 
        name_english: "Crab", 
        name_tamil: "நண்டு", 
        name_tanglish: "Nandu",
        category: "crabs", 
        price_per_kg: 750, 
        stock_kg: 55, 
        is_available: true, 
        image_url: new URL('../assets/Crab/Crab.jpg', import.meta.url).href, 
        description: "Fresh sea crab, sweet and flavorful. Perfect for crab masala, curries, and traditional preparations.",
        created_at: now 
      },

      // Squid
      { 
        id: "p17", 
        name_english: "Squid", 
        name_tamil: "கணவாய்", 
        name_tanglish: "Kanavai",
        category: "squid", 
        price_per_kg: 650, 
        stock_kg: 60, 
        is_available: true, 
        image_url: new URL('../assets/squid/squid.png', import.meta.url).href, 
        description: "Fresh squid, perfect for frying, grilling, and curries. Tender meat with unique texture.",
        created_at: now 
      },
      
      // Additional Tamil Nadu local varieties (appended; not replacing existing)
      // Sea/Estuarine Fish
      
      { 
        id: "p20", 
        name_english: "Lady Fish", 
        name_tamil: "கிழாங்கன்", 
        name_tanglish: "Kezhangan",
        category: "sea_fish", 
        price_per_kg: 400, 
        stock_kg: 85, 
        is_available: true, 
        image_url: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80", 
        description: "Slender fish common on TN coast. Mild flavor; great for shallow fry.",
        created_at: now 
      },

      // Cephalopods
      

      // Prawns/Shrimp
      { 
        id: "p22", 
        name_english: "Vannamei Shrimp", 
        name_tamil: "வன்னாமி இறால்", 
        name_tanglish: "Vannami Iraal",
        category: "prawns", 
        price_per_kg: 600, 
        stock_kg: 90, 
        is_available: true, 
        image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80", 
        description: "Farmed widely in TN. Sweet, firm shrimp ideal for curries and biryani.",
        created_at: now 
      },

      // Crabs
      

      // River/Backwater Fish
      { 
        id: "p24", 
        name_english: "Pearl Spot", 
        name_tamil: "கரிமீன்", 
        name_tanglish: "Karimeen",
        category: "river_fish", 
        price_per_kg: 900, 
        stock_kg: 30, 
        is_available: true, 
        image_url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80", 
        description: "Backwater delicacy. Fantastic for grilled leaves-wrapped preparations.",
        created_at: now 
      },
      
    ];
  if (!Array.isArray(existingProducts) || existingProducts.length === 0) {
    write(KEYS.products, seedProducts);
  }

  // Seed delivery partners (drivers)
  const partners = read(KEYS.partners, []);
  if (partners.length === 0) {
    write(KEYS.partners, [
      { id: "d1", name: "Kumar", phone: "+91 90000 00001", vehicle: "Bike TN-33-AB-1234", active: true },
      { id: "d2", name: "Selvam", phone: "+91 90000 00002", vehicle: "Scooter TN-56-CD-4567", active: true },
      { id: "d3", name: "Arun", phone: "+91 90000 00003", vehicle: "Bike TN-05-EF-8910", active: true },
    ]);
  }

  // Initialize inventory & tickets if missing
  if (!read(KEYS.inventory, null)) write(KEYS.inventory, []);
  if (!read(KEYS.tickets, null)) write(KEYS.tickets, []);

  // Store setup
  const store = read(KEYS.store, null);
  if (!store) {
    write(KEYS.store, {
      name: "Sakthi Fish Market",
      address: "Main Road, Your City",
      phone: "+91 87783 87107",
      email: "subinbala20092005@gmail.com",
      coordinates: { lat: 13.0827, lng: 80.2707 },
      hours: "6:00 AM - 9:00 PM",
    });
  }
}

export function getCategories() {
  return [
    { id: "sea_fish", label: "Sea Fish (கடல் மீன்)" },
    { id: "river_fish", label: "River Fish (ஆற்று மீன்)" },
    { id: "crabs", label: "Crabs (நண்டு)" },
    { id: "prawns", label: "Prawns/Eral (இறால்)" },
    { id: "squid", label: "Squid (கணவாய்)" },
  ];
}
export function getProducts(filter = {}) {
  const { category } = filter;
  const all = read(KEYS.products, []);
  return all
    .filter((p) => p.is_available)
    .filter((p) => (category && category !== "all" ? p.category === category : true))
    .sort((a, b) => a.name_english.localeCompare(b.name_english));
}

export function getProductById(id) {
  const all = read(KEYS.products, []);
  return all.find((p) => p.id === id) || null;
}

export function saveProduct(product) {
  const all = read(KEYS.products, []);
  const exists = all.findIndex((p) => p.id === product.id);
  if (exists >= 0) {
    all[exists] = { ...all[exists], ...product };
  } else {
    all.push({ ...product, id: product.id || `p${Date.now()}` });
  }
  write(KEYS.products, all);
  return product.id || all[all.length - 1].id;
}

export function deleteProduct(id) {
  const all = read(KEYS.products, []);
  write(KEYS.products, all.filter((p) => p.id !== id));
}

// Users/Auth
export function findUserByEmail(email) {
  const users = read(KEYS.users, []);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserByPhone(phone) {
  if (!phone) return null;
  const users = read(KEYS.users, []);
  const digits = String(phone).replace(/\D/g, "");
  return users.find((u) => String(u.phone || "").replace(/\D/g, "") === digits) || null;
}

export function registerUser({ email, name, password, role = "user", phone = "" }) {
  const users = read(KEYS.users, []);
  if (findUserByEmail(email)) throw new Error("Email already registered");
  const user = { id: `u${Date.now()}`, email, name, role, password, phone };
  users.push(user);
  write(KEYS.users, users);
  return user;
}

export function authenticateWithPassword({ email, password }) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) throw new Error("Invalid credentials");
  return user;
}

// Generate and store a one-time code for an identifier (email or phone)
export function requestOtp({ email = "", phone = "" }) {
  const identifier = (email || phone || "").toLowerCase();
  if (!identifier) throw new Error("Email or phone is required");
  const store = read(KEYS.otps, {});
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const expires_at = Date.now() + 5 * 60 * 1000; // 5 minutes
  store[identifier] = { code, expires_at };
  write(KEYS.otps, store);
  // Dev convenience: return code for local testing
  return { code, expires_at };
}

export function authenticateWithOtp({ email = "", phone = "", otp = "", name = "" }) {
  const identifier = (email || phone || "").toLowerCase();
  if (!identifier) throw new Error("Email or phone is required");
  const store = read(KEYS.otps, {});
  const record = store[identifier];
  const now = Date.now();
  const valid = (record && record.code === otp && record.expires_at > now) || otp === "123456" || otp === "000000";
  if (!valid) throw new Error("Invalid or expired OTP");

  let user = email ? findUserByEmail(email) : findUserByPhone(phone);
  if (!user) {
    // Create a simple account if missing
    const safeEmail = email || `${String(phone).replace(/\D/g, "")}@guest.sfm`;
    user = registerUser({ email: safeEmail, name: name || (email ? email.split("@")[0] : "Guest"), password: "", role: "user", phone });
  } else if (phone && !user.phone) {
    // backfill phone if not saved
    const users = read(KEYS.users, []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx].phone = phone;
      write(KEYS.users, users);
      user = users[idx];
    }
  }
  return user;
}

// Orders
export function createOrder({ userId, items, deliveryType, deliveryAddress, notes, customerName, customerPhone, deliveryFee = 0, grandTotal, deliveryLat = null, deliveryLon = null }) {
  const orders = read(KEYS.orders, []);
  const total = (items || []).reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);
  const id = `o${Date.now()}`;
  // Order number based on phone last4 + date + time slice
  const digits = String(customerPhone || "").replace(/\D/g, "");
  const last4 = digits.slice(-4) || "0000";
  const now = new Date();
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const timeSlice = String(now.getTime()).slice(-5);
  const order_number = `SFM-${last4}-${ymd}-${timeSlice}`;
  const status = "received";
  const order = {
    id,
    user_id: userId,
    order_number,
    delivery_type: deliveryType,
    delivery_address: deliveryAddress || "",
    delivery_lat: deliveryLat,
    delivery_lon: deliveryLon,
    total_amount: total,
    delivery_fee: Number(deliveryFee) || 0,
    grand_total: Number(grandTotal ?? total + (Number(deliveryFee) || 0)),
    customer_name: customerName || "",
    customer_phone: customerPhone || "",
    notes: notes || "",
    status,
    created_at: new Date().toISOString(),
    items: items || [],
    delivery_partner_id: null,
  };
  orders.push(order);
  write(KEYS.orders, orders);
  return order;
}

export function getOrdersByUser(userId) {
  const orders = read(KEYS.orders, []);
  return orders.filter((o) => o.user_id === userId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getAllOrders() {
  return read(KEYS.orders, []).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getOrderById(id) {
  const orders = read(KEYS.orders, []);
  return orders.find((o) => o.id === id) || null;
}

export function updateOrderStatus(orderId, status) {
  const orders = read(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    write(KEYS.orders, orders);
    return orders[idx];
  }
  return null;
}

// Delivery partners
export function getDeliveryPartners() {
  return read(KEYS.partners, []);
}
export function saveDeliveryPartner(partner) {
  const list = read(KEYS.partners, []);
  const idx = list.findIndex((p) => p.id === partner.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...partner };
  else list.push({ ...partner, id: partner.id || `d${Date.now()}` });
  write(KEYS.partners, list);
  return partner.id || list[list.length - 1].id;
}
export function deleteDeliveryPartner(id) {
  const list = read(KEYS.partners, []);
  const filtered = list.filter((p) => p.id !== id);
  write(KEYS.partners, filtered);
  return id;
}
export function assignDeliveryPartner(orderId, partnerId) {
  const orders = read(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].delivery_partner_id = partnerId;
    write(KEYS.orders, orders);
    return orders[idx];
  }
  return null;
}

// Order aftercare
export function cancelOrder(orderId, reason) {
  const orders = read(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = "cancelled";
    orders[idx].cancellation_reason = reason || "";
    orders[idx].cancelled_at = new Date().toISOString();
    write(KEYS.orders, orders);
    return orders[idx];
  }
  return null;
}
export function refundOrder(orderId, amount, reason) {
  const orders = read(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = "refunded";
    orders[idx].refund_amount = Number(amount) || 0;
    orders[idx].refund_reason = reason || "";
    orders[idx].refunded_at = new Date().toISOString();
    write(KEYS.orders, orders);
    return orders[idx];
  }
  return null;
}
export function replaceOrder(orderId, replacementOrderId) {
  const orders = read(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = "replaced";
    orders[idx].replacement_order_id = replacementOrderId;
    write(KEYS.orders, orders);
    return orders[idx];
  }
  return null;
}

// Inventory: batches and stock sync
// Batch: { id, product_id, lot_no, qty_kg, remaining_kg, received_at, expiry_at, vendor, notes }
export function getBatches() {
  return read(KEYS.inventory, []);
}
export function getBatchesByProduct(productId) {
  return getBatches().filter((b) => b.product_id === productId);
}
export function addBatch(batch) {
  const inv = read(KEYS.inventory, []);
  const newBatch = {
    id: batch.id || `b${Date.now()}`,
    product_id: batch.product_id,
    lot_no: batch.lot_no || "",
    qty_kg: Number(batch.qty_kg) || 0,
    remaining_kg: Number(batch.qty_kg) || 0,
    received_at: batch.received_at || new Date().toISOString(),
    expiry_at: batch.expiry_at || "",
    vendor: batch.vendor || "",
    notes: batch.notes || "",
  };
  inv.push(newBatch);
  write(KEYS.inventory, inv);
  return newBatch.id;
}
export function consumeFromBatch(batchId, qty, reason) {
  const inv = read(KEYS.inventory, []);
  const idx = inv.findIndex((b) => b.id === batchId);
  if (idx >= 0) {
    inv[idx].remaining_kg = Math.max(0, (Number(inv[idx].remaining_kg) || 0) - (Number(qty) || 0));
    inv[idx].last_depletion_reason = reason || "";
    inv[idx].updated_at = new Date().toISOString();
    write(KEYS.inventory, inv);
    return inv[idx];
  }
  return null;
}
export function getInventoryTotalKg(productId) {
  return getBatchesByProduct(productId).reduce((s, b) => s + (Number(b.remaining_kg) || 0), 0);
}
export function syncProductStockFromInventory(productId) {
  const all = read(KEYS.products, []);
  const idx = all.findIndex((p) => p.id === productId);
  if (idx >= 0) {
    all[idx].stock_kg = getInventoryTotalKg(productId);
    all[idx].is_available = all[idx].stock_kg > 0;
    write(KEYS.products, all);
    return all[idx];
  }
  return null;
}
export function getReorderAlerts(thresholdKg = 20) {
  const all = read(KEYS.products, []);
  return all.filter((p) => (Number(p.stock_kg) || 0) <= thresholdKg).map((p) => ({ id: p.id, name: p.name_english, stock_kg: p.stock_kg }));
}

// Support tickets
// Ticket: { id, email, subject, message, status: 'open'|'pending'|'closed', notes: [], created_at, updated_at }
export function listTickets() { return read(KEYS.tickets, []); }
export function createTicket({ email, subject, message }) {
  const t = read(KEYS.tickets, []);
  const ticket = { id: `t${Date.now()}`, email, subject, message, status: "open", notes: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  t.push(ticket);
  write(KEYS.tickets, t);
  return ticket.id;
}
export function updateTicketStatus(ticketId, status) {
  const t = read(KEYS.tickets, []);
  const idx = t.findIndex((x) => x.id === ticketId);
  if (idx >= 0) {
    t[idx].status = status;
    t[idx].updated_at = new Date().toISOString();
    write(KEYS.tickets, t);
    return t[idx];
  }
  return null;
}
export function addTicketNote(ticketId, note) {
  const t = read(KEYS.tickets, []);
  const idx = t.findIndex((x) => x.id === ticketId);
  if (idx >= 0) {
    t[idx].notes.push({ text: note, at: new Date().toISOString() });
    t[idx].updated_at = new Date().toISOString();
    write(KEYS.tickets, t);
    return t[idx];
  }
  return null;
}

// Reports & analytics helpers
export function getSalesSummary(period = "7d") {
  const ms = { "7d": 7, "30d": 30, "90d": 90 }[period] || 7;
  const since = Date.now() - ms * 24 * 60 * 60 * 1000;
  const orders = read(KEYS.orders, []).filter((o) => new Date(o.created_at).getTime() >= since);
  const byDay = {};
  for (const o of orders) {
    const day = new Date(o.created_at).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + (Number(o.total_amount) || 0);
  }
  const series = Object.keys(byDay).sort().map((d) => ({ date: d, total: byDay[d] }));
  const total = series.reduce((s, x) => s + x.total, 0);
  return { total, series };
}
export function getTopSellers(limit = 5) {
  const orders = read(KEYS.orders, []);
  const counts = {};
  for (const o of orders) {
    for (const it of o.items || []) {
      counts[it.productId] = (counts[it.productId] || 0) + (Number(it.quantity) || 0);
    }
  }
  const products = read(KEYS.products, []);
  const ranked = Object.entries(counts)
    .map(([pid, qty]) => ({ pid, qty, product: products.find((p) => p.id === pid) }))
    .filter((x) => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
  return ranked;
}
export function getRepeatCustomers() {
  const orders = read(KEYS.orders, []);
  const byUser = orders.reduce((acc, o) => ({ ...acc, [o.user_id]: (acc[o.user_id] || 0) + 1 }), {});
  const repeaters = Object.entries(byUser).filter(([, n]) => n > 1).length;
  return { total_customers: Object.keys(byUser).length, repeat_customers: repeaters };
}

export function getStoreDetails() {
  return read(KEYS.store, null);
}

export function saveStoreDetails(details) {
  write(KEYS.store, { ...(read(KEYS.store, {})), ...details });
}