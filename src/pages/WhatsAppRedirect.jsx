import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/services/firestoreOrders";
import { getWhatsAppNumber, getWhatsAppRedirectDoc } from "@/services/firestoreWhatsApp";
function buildReceiptHtml(order) {
  const created = order.created_at?.toDate ? order.created_at.toDate() : new Date(order.created_at || Date.now());
  const dateStr = created.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const itemsRows = (order.items || [])
    .map((it) => {
      const qty = Number(it.quantity || 1);
      const rate = Number(it.price_per_kg || it.pricePerKg || 0);
      const subtotal = Number(it.subtotal || rate * qty);
      const itemName = it.product_name || it.nameEnglish || it.name || "Item";
      const cutType = it.cut_type || it.cutType || "no_cut";
      const cutOptions = it.cut_options || it.cutOptions || [];
      const needsCleaning = it.needs_cleaning || it.needsCleaning;
      
      const cutText = cutType === "pieces" && cutOptions.length > 0 
        ? `Cut: ${cutOptions[0].replace('_', ' ')}` 
        : cutType === "pieces" 
        ? "Cut into pieces" 
        : "Full piece";
      const prefs = `${cutText}${needsCleaning ? " • Cleaned" : ""}`;
      return `<tr>
          <td>${itemName}</td>
          <td style="text-align:center">${qty} kg</td>
          <td style="text-align:right">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(rate)}</td>
          <td style="text-align:right">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subtotal)}</td>
          <td>${prefs}</td>
        </tr>`;
    })
    .join("");
  const itemsTotal = Number(order.items_subtotal || order.total_amount || 0);
  const deliveryFee = Number(order.delivery_fee || 0);
  const grandTotal = Number(order.grand_total || itemsTotal + deliveryFee);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${order.order_number}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    .muted { color: #555; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border-bottom: 1px solid #e5e5e5; padding: 8px; font-size: 12px; }
    th { text-align: left; background: #f8f8f8; }
    .totals { margin-top: 12px; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px; }
    .total { font-weight: 700; font-size: 16px; }
    .footer { margin-top: 16px; font-size: 12px; }
    @media print { .no-print { display: none; } }
  </style>
  </head>
  <body>
    <h1>Sakthi Fish Market — Order Receipt</h1>
    <div class="muted">Order: ${order.order_number}</div>
    <div class="muted">Date: ${dateStr} • ${timeStr}</div>
    <div style="margin-top:8px;">
      <div><strong>Customer:</strong> ${order.customer_name || "Customer"}</div>
      ${order.customer_phone ? `<div><strong>Phone:</strong> ${order.customer_phone}</div>` : ""}
      ${order.delivery_type === "cash_on_delivery" && order.delivery_address ? `<div><strong>Address:</strong> ${order.delivery_address}</div>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Subtotal</th>
          <th>Preferences</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals">
  <div class="row"><span>Items Total</span><span>${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(itemsTotal)}</span></div>
  <div class="row"><span>Delivery</span><span>${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(deliveryFee)}</span></div>
  <div class="row total"><span>Total</span><span>${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(grandTotal)}</span></div>
    </div>

    <div class="footer">
      <div>Thank you for your order!</div>
      <div>For quicker delivery, you can share your live location in WhatsApp (optional).</div>
    </div>

    <button class="no-print" onclick="window.print()">Print / Save PDF</button>
  </body>
</html>`;
}


export default function WhatsAppRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('919943328133'); // Default fallback
  const [autoRedirectToOrders, setAutoRedirectToOrders] = useState(false);

  // Load order and WhatsApp number from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // The /wa-order/:id route uses a Wa-redirect document id.
        // Resolve it to the actual order id when possible.
        const redirectDoc = await getWhatsAppRedirectDoc(id).catch(() => null);
        const resolvedOrderId =
          redirectDoc?.order_id ||
          redirectDoc?.orderId ||
          redirectDoc?.orderID ||
          redirectDoc?.order ||
          id;

        // Load order + WhatsApp number in parallel
        const [orderData, waNumber] = await Promise.all([
          getOrderById(resolvedOrderId),
          getWhatsAppNumber()
        ]);

        setOrder(orderData);
        
        // Set WhatsApp number from Wa-redirect collection
        if (waNumber) {
          setWhatsappNumber(waNumber);
          console.log('[WhatsApp] Using owner number from Wa-redirect:', waNumber);
        }
      } catch (error) {
        console.error('Failed to load order/WhatsApp number:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadData();
    }
  }, [id]);

  const INR = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }), []);

  const message = useMemo(() => {
    if (!order) return "";

    const isCOD = order.delivery_type === "cash_on_delivery";
    const header = isCOD ? "📦 *Cash on Delivery Confirmation*" : "🧾 *Order Confirmation*";

    // Format phone for WhatsApp (+91 xxxxx xxxxx when possible)
    const raw = String(order.customer_phone || "").trim();
    const digits = raw.replace(/\D/g, "");
    let phonePretty = raw;
    if (digits.length === 10) {
      phonePretty = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 12 && digits.startsWith("91")) {
      phonePretty = `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }

    // Use Firestore order.id as Order ID for billing
    const orderIdForBill = order.id || order.order_number;

    // Date and time from order.created_at (Firestore timestamp)
    const created = order.created_at?.toDate ? order.created_at.toDate() : new Date(order.created_at || Date.now());
    const dateStr = created.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const lines = [];
    lines.push(header);
    lines.push("");
    lines.push(`Hello *Sakthi Fish Market Team*,`);
    lines.push(`👤 *Customer Name:* ${order.customer_name || "Customer"}`);
    if (order.customer_phone) lines.push(`📞 *Phone Number:* ${phonePretty}`);
    lines.push(`🧾 *Order ID:* ${orderIdForBill}`);
    lines.push(`📅 *Date:* ${dateStr}`);
    lines.push(`⏰ *Time:* ${timeStr}`);
    
    // Bill details (use grand_total and items_subtotal from Firestore)
    const itemsTotal = Number(order.items_subtotal || 0);
    const deliveryFee = Number(order.delivery_fee || 0);
    const grandTotal = Number(order.grand_total || itemsTotal + deliveryFee);
    lines.push("");
    lines.push("🧾 *Bill Details*");
    for (const it of order.items || []) {
      const qty = Number(it.quantity || 1);
      const rate = Number(it.price_per_kg || it.pricePerKg || 0);
      const subtotal = Number(it.subtotal || rate * qty);
      const itemName = it.product_name || it.nameEnglish || it.name || "Item";
      const cutOpts = it.cut_options || it.cutOptions || [];
      const cut = it.cut_type === "pieces" || it.cutType === "pieces" 
        ? (cutOpts.length > 0 ? ` | Cut: ${cutOpts[0].replace('_', ' ')}` : " | Cut into pieces")
        : " | Full piece";
      const clean = (it.needs_cleaning || it.needsCleaning) ? " | Cleaned" : "";
      lines.push(`• ${itemName} — ${qty} kg × ${INR.format(rate)} = ${INR.format(subtotal)}${cut}${clean}`);
    }
    lines.push(`Subtotal: ${INR.format(itemsTotal)}`);
    lines.push(`Delivery: ${INR.format(deliveryFee)}`);
    lines.push(`Total: *${INR.format(grandTotal)}*`);
    
    // Address for COD
    if (isCOD && order.delivery_address) {
      lines.push("");
      lines.push(`📍 *Delivery Address:* ${order.delivery_address}`);
      // Location link removed by request; user will share location manually in WhatsApp
    }
    lines.push("");
    lines.push(`Kindly confirm the delivery and share the bill copy for my reference.`);
    lines.push("");
    lines.push(`Thank you!`);
    lines.push(`— *${order.customer_name || "Customer"}*`);
    lines.push("");
    lines.push("📍 Please share your live location in WhatsApp (optional) to help our delivery partner reach you faster.");
    return lines.join("\n");
  }, [order, INR]);

  // Auto-download a single HTML receipt file once per order
  useEffect(() => {
    if (!order) return;
    try {
      const key = `sfm_auto_receipt_${order.id}`;
      if (sessionStorage.getItem(key)) return; // avoid duplicate downloads on reload

      const html = buildReceiptHtml(order);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SakthiFishMarket-Receipt-${order.order_number}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore auto-download errors
    }
  }, [order]);

  useEffect(() => {
    if (!order || !whatsappNumber || !message) return;

    // Prevent repeated auto-open loops on refresh.
    const redirectKey = `sfm_wa_opened_${order.id}`;
    if (sessionStorage.getItem(redirectKey)) {
      console.log('[WhatsApp] Already auto-opened for this order; waiting for user.');
      return;
    }

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    console.log('[WhatsApp] Constructed URL:', url);
    console.log('[WhatsApp] Message length:', message.length, 'characters');

    // Try to open WhatsApp once. Do NOT auto-navigate away immediately,
    // otherwise the user may see "Order not found" or lose the page.
    const t1 = setTimeout(() => {
      try {
        if (document.visibilityState === 'visible') {
          console.log('[WhatsApp] Auto-opening WhatsApp via window.open');
          window.open(url, '_blank', 'noopener,noreferrer');
          sessionStorage.setItem(redirectKey, '1');
          setAutoRedirectToOrders(true);
        }
      } catch (e) {
        console.warn('[WhatsApp] Auto-open failed (popup blocked?)', e);
      }
    }, 300);

    return () => {
      clearTimeout(t1);
    };
  }, [order, message, whatsappNumber]);

  // Once we attempted to open WhatsApp, wait a bit then go to orders.
  useEffect(() => {
    if (!autoRedirectToOrders) return;
    const t = setTimeout(() => {
      navigate('/orders', { replace: true });
    }, 3500);
    return () => clearTimeout(t);
  }, [autoRedirectToOrders, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Order not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">We couldn't find that order. Please go back to your orders page.</p>
              <Button asChild>
                <Link to="/orders">Go to My Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const openPrintWindow = () => {
    if (!order) return;
    const html = buildReceiptHtml(order);

    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    // Give the browser a tick to render before auto-print (optional)
    setTimeout(() => {
      try {
        win.print();
      } catch {
        // ignore print errors
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Opening WhatsApp…</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We are redirecting you to WhatsApp to send your order details. You will be automatically redirected to your orders page after opening WhatsApp.</p>
              <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">{message}</div>
              <div className="flex gap-2 flex-wrap">
                <Button asChild>
                  <a href={waUrl}>Open WhatsApp</a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/orders">Go to My Orders</Link>
                </Button>
                <Button variant="outline" onClick={openPrintWindow}>Download Receipt (PDF)</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
