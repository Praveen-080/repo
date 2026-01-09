import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DeliveryStatusBanner } from "@/components/DeliveryStatusBanner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import notify from "@/lib/notify";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { createOrder } from "@/services/firestoreOrders";
import { getProductById } from "@/services/firestoreProducts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
const checkoutSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z
    .string()
    .min(8, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]{8,}$/i, "Enter a valid phone number"),
  deliveryType: z.enum(["cash_on_delivery", "self_pickup"]),
  address: z.string().optional(),
  notes: z.string().max(500).optional(),
});
const Checkout = () => {
  const navigate = useNavigate();
  const { user, setShowLogin, authLoading } = useAuth();
  const { isAfterCutoff, message: deliveryMessage } = useSettings();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryType, setDeliveryType] = useState(isAfterCutoff ? "self_pickup" : "cash_on_delivery");
  const [orderPlaced, setOrderPlaced] = useState(false); // Flag to prevent cart redirect after order placed
  const [address, setAddress] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [pincode, setPincode] = useState("");
  const [coords, setCoords] = useState(null); // {lat, lon}
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerRef = useRef(null);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [acceptedNoCancellation, setAcceptedNoCancellation] = useState(false);
  const [isErodeRegion, setIsErodeRegion] = useState(null); // null=unknown, true=valid, false=invalid
  const [detectedDistrict, setDetectedDistrict] = useState("");
  // Flag reserved for future manual vs auto logic (currently not used)
  // const [addressEdited, setAddressEdited] = useState(false);
  const lastGeocodeKey = useRef("");
  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;
    
    // Require user to be logged in for checkout
    if (!user) {
      notify.warning("Please sign in first to place an order");
      setShowLogin(true);
      navigate("/");
      return;
    }
    
    // Skip loadCart if order was just placed
    if (!orderPlaced) {
      loadCart();
    }
    // We intentionally exclude navigate and loadCart function identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, setShowLogin, navigate, orderPlaced]);
  // Prefill profile from user/localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sfm_checkout_profile") || "null");
    if (saved) {
      setName(saved.name || "");
      setPhone(saved.phone || "");
      setAddress(saved.address || "");
      setFlatNo(saved.flatNo || "");
      setPincode(saved.pincode || "");
      setDeliveryType(saved.deliveryType || "cash_on_delivery");
    } else if (user?.name) {
      setName(user.name);
    }
  }, [user]);
  const loadCart = () => {
    const cartKey = user ? `cart_${user.uid || user.id}` : "cart";
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    if (cart.length === 0) {
      navigate("/cart");
    }
    // ensure defaults for cutting preferences
    const normalized = cart.map((it) => ({
      quantity: 1,
      cutType: "no_cut",
      cutOptions: [],
      needsCleaning: false,
      subtotal: (it.pricePerKg || 0) * (it.quantity || 1),
      ...it,
    }));
    setCartItems(normalized);
  };

  // Helpers
  const INR = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }), []);
  const DELIVERY_FEE = 50;
  const FREE_DELIVERY_THRESHOLD = 5; // kg

  const persistCart = useCallback((items) => {
    const cartKey = user ? `cart_${user.uid || user.id}` : "cart";
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [user]);

  // Persist profile/delivery selections
  useEffect(() => {
    localStorage.setItem(
      "sfm_checkout_profile",
      JSON.stringify({ name, phone, address, flatNo, pincode, deliveryType })
    );
  }, [name, phone, address, flatNo, pincode, deliveryType]);

  // Build combined address with flat, pincode
  const fullAddress = useMemo(() => {
    const parts = [];
    if (flatNo) parts.push(`#${flatNo}`);
    if (address) parts.push(address);
    if (pincode) parts.push(`PIN: ${pincode}`);
    return parts.join(", ");
  }, [flatNo, address, pincode]);

  const updateItem = (idx, patch) => {
    setCartItems((prev) => {
      const next = prev.map((it, i) => {
        if (i !== idx) return it;
        const merged = { ...it, ...patch };
        // Enforce min 1kg and 0.5kg step increments
        const raw = Number(merged.quantity);
        const rounded = Math.round(((isNaN(raw) ? 1 : raw) * 2)) / 2; // nearest 0.5
        const qty = Math.max(1, rounded);
        merged.quantity = qty;
        merged.subtotal = (Number(merged.pricePerKg) || 0) * qty;
        return merged;
      });
    
      // persist for consistency if user navigates away
      persistCart(next);
      return next;
    });
  };

  const removeItem = (idx) => {
    setCartItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      persistCart(next);
      if (next.length === 0) {
        // if cart is empty, go back to cart page
        navigate("/cart");
      }
      return next;
    });
  };
  const handleCheckout = async () => {
    // Require user to be logged in
    if (!user) {
      notify.warning("Please sign in first to place an order");
      setShowLogin(true);
      navigate("/");
      return;
    }
    
    // Check if user accepted no cancellation policy
    if (!acceptedNoCancellation) {
      notify.warning("Please accept the no cancellation policy to proceed");
      return;
    }
    
    // Validate Erode region for cash on delivery
    if (deliveryType === "cash_on_delivery") {
      if (isErodeRegion === false) {
        notify.error(`Delivery is only available in Erode region. Your location: ${detectedDistrict}`);
        return;
      }
      if (isErodeRegion === null && coords) {
        notify.warning("Please wait for location verification or enter address manually");
        return;
      }
    }
    
    try {
      const validated = checkoutSchema.parse({
        name,
        phone,
        deliveryType,
        address: deliveryType === "cash_on_delivery" ? address : undefined,
        notes,
      });
      if (deliveryType === "cash_on_delivery" && !address.trim()) {
        notify.warning("Please enter delivery address");
        return;
      }
      
      // Validate that purchased quantities don't exceed available stock
      setLoading(true);
      for (const item of cartItems) {
        if (item.productId) {
          const product = await getProductById(item.productId);
          const availableStock = product?.stock_type === 'count' ? (product?.count || 0) : (product?.stock_kg || 0);
          const requestedQuantity = Number(item.quantity) || 0;
          const stockUnit = product?.stock_type === 'count' ? 'pieces' : 'kg';
          
          if (requestedQuantity > availableStock) {
            notify.error(`Insufficient stock for ${item.nameEnglish}. Available: ${availableStock} ${stockUnit}, Requested: ${requestedQuantity} kg`);
            setLoading(false);
            return;
          }
        }
      }
      
      const order = await createOrder({
        user_id: user.uid || user.id,
        customer_name: validated.name,
        customer_phone: validated.phone,
        customer_email: user.email || '',
        items: cartItems,
        delivery_type: validated.deliveryType,
        delivery_address: validated.deliveryType === "cash_on_delivery" ? fullAddress : "",
        delivery_flat_no: flatNo,
        delivery_pincode: pincode,
        customer_notes: validated.notes || '',
        delivery_lat: coords?.lat ?? null,
        delivery_lon: coords?.lon ?? null,
        items_subtotal: itemsSubtotal,
        delivery_fee: deliveryFee,
        grand_total: grandTotal,
        payment_method: validated.deliveryType === "cash_on_delivery" ? "cash_on_delivery" : "cash_on_pickup"
      });
      
      // Clear cart
      const cartKey = user ? `cart_${user.uid || user.id}` : "cart";
      localStorage.removeItem(cartKey);
      notify.success(`Order placed! Order #${order.order_number}`);
      
      // Set flag to prevent cart redirect effect from firing
      setOrderPlaced(true);
      
      // Small delay to ensure Firestore write is complete before navigation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ensure navigation happens without delay
      console.log('[Checkout] Order created, redirecting to WhatsApp:', `/wa-order/${order.id}`);
      navigate(`/wa-order/${order.id}`, { replace: true });
    } catch (error) {
      console.error('[Checkout] Order creation failed:', error);
      if (error instanceof z.ZodError) {
        notify.error(error.errors[0].message);
      } else {
        notify.error(error?.message || "Failed to place order");
      }
    } finally {
      setLoading(false);
    }
  };
  const itemsSubtotal = cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const isFreeDelivery = totalWeight >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = deliveryType === "cash_on_delivery" ? (isFreeDelivery ? 0 : DELIVERY_FEE) : 0;
  const grandTotal = itemsSubtotal + deliveryFee;

  // Geolocation + reverse geocoding (Nominatim)
  const getBestPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation unsupported"));
      let best = null;
      const started = Date.now();
      const timeoutMs = 15000; // 15s
      const desiredAccuracyM = 30; // meters
      const watcher = navigator.geolocation.watchPosition(
        (pos) => {
          const acc = typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : null;
          if (!best || (acc != null && acc < (best.acc ?? Infinity))) {
            best = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc };
            setAccuracy(acc ?? null);
            setCoords({ lat: best.lat, lon: best.lon });
          }
          if (acc != null && acc <= desiredAccuracyM) {
            navigator.geolocation.clearWatch(watcher);
            resolve(best);
          } else if (Date.now() - started > timeoutMs) {
            navigator.geolocation.clearWatch(watcher);
            best ? resolve(best) : reject(new Error("Timed out"));
          }
        },
        (err) => {
          navigator.geolocation.clearWatch(watcher);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
      );
    });

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    try {
      setIsLocating(true);
  // setAddressEdited(false); // no-op currently
      const best = await getBestPosition();
      const { lat, lon } = best;
      // coords will trigger reverse geocode effect
      setCoords({ lat, lon });
    } catch (err) {
      if (err.code === 1) {
        alert("Location access denied. Please enable location to auto-fill address or enter manually.");
      } else {
        alert("Unable to fetch precise location. Please try again or enter address manually.");
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Reverse geocode helper: updates address, pincode, and validates Erode region
  const reverseGeocode = useCallback(async (lat, lon) => {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lon),
      zoom: "18",
      addressdetails: "1",
    });
    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await resp.json();
    const a = data?.address || {};
    
    // Check if location is in Erode district
    const district = a.county || a.state_district || "";
    const city = a.city || a.town || a.village || a.hamlet || "";
    const state = a.state || "";
    
    // Validate Erode region (check district, city name, or common Erode localities)
    const isErode = (
      district.toLowerCase().includes("erode") ||
      city.toLowerCase().includes("erode") ||
      state.toLowerCase().includes("tamil nadu") && (
        a.suburb?.toLowerCase().includes("erode") ||
        a.neighbourhood?.toLowerCase().includes("erode")
      )
    );
    
    setDetectedDistrict(district || city || "Unknown");
    setIsErodeRegion(isErode);
    
    if (!isErode) {
      notify.error(`Delivery is only available in Erode region. Detected location: ${district || city || 'Unknown area'}`);
    }
    
    // Build readable address: house no + road, suburb, city/town/village, state, postcode
    const line1 = [a.house_number, a.road].filter(Boolean).join(" ");
    const parts = [line1, a.suburb, a.neighbourhood, city, a.state, a.postcode].filter(Boolean);
    const pretty = parts.join(", ");
    // Always update per request
    if (pretty) setAddress(pretty);
    if (a.postcode) setPincode(String(a.postcode));
  }, []);

  // When coords change, reverse geocode and update address/pincode
  useEffect(() => {
    if (!coords) return;
    const key = `${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`;
    if (lastGeocodeKey.current === key) return;
    lastGeocodeKey.current = key;
    reverseGeocode(coords.lat, coords.lon).catch(() => {});
  }, [coords, reverseGeocode]);

  // Removed shareWhatsAppLocation per requirement: sharing happens only after order creation.

  // Initialize/update Leaflet map when coords change
  useEffect(() => {
    if (!coords) return;
    const { lat, lon } = coords;
    if (!mapObj.current) {
      mapObj.current = L.map(mapRef.current).setView([lat, lon], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapObj.current);
      markerRef.current = L.marker([lat, lon]).addTo(mapObj.current);
    } else {
      mapObj.current.setView([lat, lon], mapObj.current.getZoom());
      if (markerRef.current) markerRef.current.setLatLng([lat, lon]);
      else markerRef.current = L.marker([lat, lon]).addTo(mapObj.current);
    }
  }, [coords]);
  
  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <DeliveryStatusBanner />
      
      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Your Items & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-12 gap-3 relative">
                    <div className="md:col-span-12">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="font-semibold">{item.nameEnglish}</div>
                          <div className="text-sm text-muted-foreground">₹{item.pricePerKg}/kg</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-12 grid md:grid-cols-3 gap-4 items-start">
                      <div>
                        <Label htmlFor={`qty-${idx}`}>Quantity (kg)</Label>
                        <Input
                          id={`qty-${idx}`}
                          type="number"
                          step="0.5"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!Number.isNaN(val) && val < 1) {
                              notify.warning("Minimum quantity is 1 kg");
                            }
                            const rounded = Math.round(((isNaN(val) ? 1 : val) * 2)) / 2;
                            updateItem(idx, { quantity: Math.max(1, rounded) });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Cut Preference</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={`cut-${idx}`}
                              checked={item.cutType === "no_cut"}
                              onChange={() => updateItem(idx, { cutType: "no_cut", cutOptions: [] })}
                            />
                            Full piece
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={`cut-${idx}`}
                              checked={item.cutType === "pieces"}
                              onChange={() => updateItem(idx, { cutType: "pieces", cutOptions: item.cutOptions || [] })}
                            />
                            Cut into pieces
                          </label>
                          {item.cutType === "pieces" && (
                            <div className="pl-6 mt-2 space-y-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name={`cut-option-${idx}`}
                                  checked={item.cutOptions?.[0] === "1_piece"}
                                  onChange={() => updateItem(idx, { cutOptions: ["1_piece"] })}
                                />
                                1 piece
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name={`cut-option-${idx}`}
                                  checked={item.cutOptions?.[0] === "2_piece"}
                                  onChange={() => updateItem(idx, { cutOptions: ["2_piece"] })}
                                />
                                2 piece
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name={`cut-option-${idx}`}
                                  checked={item.cutOptions?.[0] === "square_piece"}
                                  onChange={() => updateItem(idx, { cutOptions: ["square_piece"] })}
                                />
                                Square piece
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Cleaning</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Checkbox
                            id={`clean-${idx}`}
                            checked={!!item.needsCleaning}
                            onCheckedChange={(v) => updateItem(idx, { needsCleaning: Boolean(v) })}
                          />
                          <Label htmlFor={`clean-${idx}`} className="text-sm font-normal">Clean and prepare</Label>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-12 flex items-center justify-between text-sm text-muted-foreground mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(idx)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                      <div className="text-right">
                        Line total: <span className="font-semibold text-foreground">{INR.format(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery Area Notice */}
            <Card className="border-blue-500 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      🚚 Delivery Available Only in Erode Region
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      We currently deliver only within Erode district, Tamil Nadu. For other areas, please choose Self Pickup option.
                    </p>
                    {isErodeRegion === true && detectedDistrict && (
                      <p className="text-xs text-green-700 mt-2 font-medium">
                        ✓ Your location ({detectedDistrict}) is within our delivery area
                      </p>
                    )}
                    {isErodeRegion === false && detectedDistrict && (
                      <p className="text-xs text-red-700 mt-2 font-medium">
                        ✗ Your location ({detectedDistrict}) is outside our delivery area. Please select Self Pickup.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Time Warning */}
            {deliveryMessage && (
              <Card className={isAfterCutoff ? "border-orange-500 bg-orange-50" : "border-green-500 bg-green-50"}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${isAfterCutoff ? "bg-orange-500" : "bg-green-500"}`}></div>
                    <p className={`text-sm font-medium ${isAfterCutoff ? "text-orange-900" : "text-green-900"}`}>
                      {deliveryMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Customer Details & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <Label htmlFor="cust-name">Full Name</Label>
                  <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
                {/* 2. Phone Number */}
                <div>
                  <Label htmlFor="cust-phone">Phone Number</Label>
                  <Input id="cust-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 87783 87107" />
                </div>
                {/* 3. Delivery Options */}
                <div>
                  <Label className="mb-2 block">Delivery Options</Label>
                  <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value)}>
                    <div className="flex items-center gap-2 mb-1">
                      <RadioGroupItem value="cash_on_delivery" id="cod" disabled={isAfterCutoff} />
                      <Label htmlFor="cod" className={isAfterCutoff ? "text-muted-foreground" : ""}>
                        Cash on Delivery (பணம் செலுத்துதல்)
                        {isAfterCutoff && <span className="ml-2 text-xs text-orange-600">(Closed)</span>}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="self_pickup" id="pickup" />
                      <Label htmlFor="pickup">Self Pickup after Cleaning (சுத்தம் பின் எடுத்துச் செல்லுங்கள்)</Label>
                    </div>
                  </RadioGroup>
                </div>
                {/* 4. Location first, then address at bottom when COD */}
                <div>
                  {deliveryType === "cash_on_delivery" && (
                    <>
                      <div className="flex flex-wrap items-center gap-2 justify-center">
                        <Button type="button" variant="secondary" onClick={fetchLocation} disabled={isLocating}>
                          {isLocating ? "Detecting…" : "Locate"}
                        </Button>
                        {accuracy != null && (
                          <span className="text-xs text-muted-foreground">Accuracy ~{Math.round(accuracy)} m</span>
                        )}
                      </div>
                      {coords && (
                        <div className="mt-3 h-64 rounded-md overflow-hidden border" ref={mapRef} aria-label="Map showing your location" />
                      )}
                      {/* Share button removed: location only sent via order WhatsApp message */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="flat">Flat / Door No.</Label>
                          <Input id="flat" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} placeholder="e.g. 12B" />
                        </div>
                        <div>
                          <Label htmlFor="pin">Pincode</Label>
                          <Input id="pin" inputMode="numeric" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 641001" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Textarea
                          id="address"
                          value={address}
                          onChange={(e) => { setAddress(e.target.value); }}
                          placeholder="Auto-filled or enter manually"
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                  {deliveryType !== "cash_on_delivery" && (
                    <div className="mt-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address not required for Pickup"
                        className="mt-2"
                        rows={3}
                        disabled
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions for your order?" rows={3} />
              </CardContent>
            </Card>

            {/* No Cancellation Policy */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="no-cancel-policy"
                    checked={acceptedNoCancellation}
                    onCheckedChange={(checked) => setAcceptedNoCancellation(Boolean(checked))}
                    className="mt-1"
                  />
                  <Label htmlFor="no-cancel-policy" className="text-sm font-medium cursor-pointer">
                    I understand and accept that <strong>orders cannot be cancelled</strong> after placing. 
                    Please ensure all details are correct before proceeding.
                    <span className="block mt-1 text-xs text-muted-foreground">
                      (ஆர்டரை வைத்த பிறகு ரத்து செய்ய முடியாது என்பதை நான் ஏற்றுக்கொள்கிறேன்)
                    </span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Items list with live options */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item, idx) => (
                    <div key={`sum-${item.productId}-${idx}`} className="flex justify-between gap-3">
                      <div className="text-sm">
                        <div className="font-medium">{item.nameEnglish}</div>
                        <div className="text-muted-foreground">
                          {item.quantity} kg @ ₹{item.pricePerKg}/kg
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.cutType === "pieces" && item.cutOptions?.length > 0 
                            ? `Cut: ${item.cutOptions[0].replace('_', ' ')}` 
                            : item.cutType === "pieces" 
                            ? "Cut into pieces" 
                            : "Full piece"}
                          {item.needsCleaning ? " • Cleaned" : ""}
                        </div>
                      </div>
                      <div className="font-medium">{INR.format(item.subtotal)}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Items ({cartItems.length})</span>
                    <span>{INR.format(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span>
                      {deliveryType === "cash_on_delivery" 
                        ? (isFreeDelivery 
                          ? <span className="text-green-600 font-medium">Free (≥{FREE_DELIVERY_THRESHOLD}kg)</span>
                          : INR.format(DELIVERY_FEE))
                        : "Free"}
                    </span>
                  </div>
                  {deliveryType === "cash_on_delivery" && !isFreeDelivery && totalWeight > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Add {(FREE_DELIVERY_THRESHOLD - totalWeight).toFixed(1)}kg more for free delivery
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{INR.format(grandTotal)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleCheckout} 
                  disabled={
                    loading || 
                    !acceptedNoCancellation || 
                    (deliveryType === "cash_on_delivery" && isErodeRegion === false)
                  }
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
                
                {!acceptedNoCancellation && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Please accept the no cancellation policy
                  </p>
                )}
                {deliveryType === "cash_on_delivery" && isErodeRegion === false && (
                  <p className="text-xs text-center text-red-600 mt-2 font-medium">
                    Delivery not available in your area. Please choose Self Pickup.
                  </p>
                )}
                {/* Removed optional share hint */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Checkout;