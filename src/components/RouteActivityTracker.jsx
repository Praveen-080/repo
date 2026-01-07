import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getProductById } from "@/services/mockApi";

const STORAGE_KEY = "sfm_recent_routes";
const STORAGE_PRODUCTS = "sfm_recent_products";
const MAX_ITEMS = 15;
const MAX_PRODUCTS = 12;

function titleForPath(pathname) {
  if (pathname === "/") return "Home";
  if (pathname === "/auth") return "Sign In";
  if (pathname === "/products") return "Products";
  if (pathname === "/cart") return "Cart";
  if (pathname === "/checkout") return "Checkout";
  if (pathname === "/orders") return "Orders";
  if (pathname === "/stores") return "Store Locator";
  if (pathname === "/about") return "About";
  if (pathname === "/profile") return "Profile";
  if (pathname.startsWith("/order-tracking/")) return "Order Tracking";
  if (pathname.startsWith("/wa-order/")) return "WhatsApp Order";
  if (pathname.startsWith("/product/")) {
    const id = pathname.split("/product/")[1];
    const p = getProductById(id);
    return p ? `${p.name_english} (Product)` : "Product Detail";
  }
  const seg = pathname.split("/").filter(Boolean).pop();
  return seg ? seg.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : pathname;
}

export default function RouteActivityTracker() {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    // Skip admin routes
    if (pathname.startsWith("/admin")) return;

    // Track product views separately for Recently Viewed Fish
    if (pathname.startsWith("/product/")) {
      const id = pathname.split("/product/")[1];
      if (id) {
        try {
          const raw = localStorage.getItem(STORAGE_PRODUCTS);
          const list = raw ? JSON.parse(raw) : [];
          const filtered = list.filter((x) => x.id !== id);
          filtered.unshift({ id, at: new Date().toISOString() });
          const trimmed = filtered.slice(0, MAX_PRODUCTS);
          localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(trimmed));
        } catch {
          // ignore
        }
      }
    }

    let list = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }

    const last = list[0];
    if (last && last.path === pathname) return; // don't duplicate consecutive

    const entry = {
      path: pathname,
      title: titleForPath(pathname),
      at: new Date().toISOString(),
    };
    // Remove any prior entry of same path
    const filtered = list.filter((e) => e.path !== pathname);
    filtered.unshift(entry);
    const trimmed = filtered.slice(0, MAX_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  }, [location]);

  return null;
}
