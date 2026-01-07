import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
void AnimatePresence; void motion;
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { getStoreSettings } from "@/services/firestoreSettings";

const StoreLocator = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  
  // Generate Google Maps embed URL
  const mapSrc = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return '';
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  };

  // Generate Google Maps link to open in new tab
  const getGoogleMapsLink = (lat, lng, address) => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    // Fallback to address search if no coordinates
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Hardcoded coordinates for Erode stores to avoid CORS issues with Nominatim
  const getCoordinatesForAddress = useCallback((address) => {
    if (!address) return null;
    
    const addressLower = address.toLowerCase();
    
    // Erode city center coordinates as fallback
    const erodeCenter = { lat: 11.3410, lng: 77.7172 };
    
    // Match specific locations in Erode with exact coordinates
    // Store 1: Sampath Nagar (148, Sampath Nagar, Edayankattuvalasu)
    if (addressLower.includes('sampath nagar') || addressLower.includes('sambath nagar') || 
        addressLower.includes('edayankattuvalasu') || addressLower.includes('148')) {
      return { lat: 11.343204546878189, lng: 77.7074274030234 };
    }
    
    // Store 2: Chettipalayam (Vaikalmedu Rd, Ashok Nagar, Chettipalayam)
    if (addressLower.includes('vaikalmedu') || addressLower.includes('ashok nagar') || 
        addressLower.includes('chettipalayam') || addressLower.includes('chettipalaym') || 
        addressLower.includes('638002')) {
      return { lat: 11.301480597492205, lng: 77.72557451599518 };
    }
    
    // Store 3: Railway Station (426, EVN Rd, near Railway Station, Periyar Nagar)
    if (addressLower.includes('evn road') || addressLower.includes('evn rd') || 
        addressLower.includes('railway station') || addressLower.includes('periyar nagar') || 
        addressLower.includes('426') || addressLower.includes('638001')) {
      return { lat: 11.330015117801834, lng: 77.72309633635471 };
    }
    
    // Return Erode center for any other address
    return erodeCenter;
  }, []);
  
  // Fetch stores from Firestore directly
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const settings = await getStoreSettings();
        if (settings) {
          console.log('[StoreLocator] Building stores from Firestore settings...');
          const storesData = [];
          for (let i = 1; i <= 3; i++) {
            const storeName = settings[`store_name_${i}`];
            const address = settings[`address_${i}`];
            if (storeName && address) {
              storesData.push({
                id: `store_${i}`,
                name: storeName,
                address: address,
                phone: settings.phone || "+91 87783 87107",
                email: settings.email || settings.business_email || "",
                business_hours: settings.business_hours || {},
              });
            }
          }

          if (storesData.length > 0) {
            // Get coordinates using hardcoded values (no API calls)
            const geocoded = storesData.map(s => {
              const coords = getCoordinatesForAddress(s.address);
              return { ...s, lat: coords?.lat, lng: coords?.lng };
            });
            setStores(geocoded);
            setSelectedStoreId(geocoded[0].id);
            console.log('[StoreLocator] Loaded', geocoded.length, 'stores from Firestore with coords');
          } else {
            console.warn('[StoreLocator] No store data found in settings');
            setStores([]);
          }
        }
      } catch (err) {
        console.error('[StoreLocator] Error building stores:', err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [getCoordinatesForAddress]);
  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  };

  // Get today's hours for a store - handles both array and object formats
  const getTodayHours = (businessHours) => {
    if (!businessHours) return "Closed";
    
    const today = getCurrentDay().toLowerCase();
    
    // If business_hours is an object (from Admin Panel format)
    if (typeof businessHours === 'object' && !Array.isArray(businessHours)) {
      return businessHours[today] || "Closed";
    }
    
    // If business_hours is an array (legacy format)
    if (Array.isArray(businessHours)) {
      const todaySchedule = businessHours.find(schedule => schedule.day === today);
      if (todaySchedule) {
        return `${todaySchedule.open_time} - ${todaySchedule.close_time}`;
      }
    }
    
    return "Closed";
  };

  const parseTimeToMinutes = (label) => {
    if (!label) return null;
    const m = label.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2] || "0", 10);
    const ap = m[3].toUpperCase();
    if (ap === 'AM') {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return hh * 60 + mm;
  };

  const isOpenNow = (todayTime) => {
    if (!todayTime || /closed/i.test(todayTime)) return false;
    const parts = todayTime.split('-');
    if (parts.length !== 2) return false;
    const open = parseTimeToMinutes(parts[0]);
    const close = parseTimeToMinutes(parts[1]);
    if (open == null || close == null) return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    // Simple same-day window (no overnight)
    return nowMin >= open && nowMin <= close;
  };

  const selectedStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1">
          <h1 className="text-4xl font-bold mb-4">Store Locator</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1">
          <h1 className="text-4xl font-bold mb-4">Store Locator</h1>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No stores found</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-12 flex-1">
        <h1 className="text-4xl font-bold mb-4">Store Locator</h1>
        <p className="text-xl text-muted-foreground mb-8">Find a Sakthi Fish Market near you</p>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1 space-y-4">
            {stores.map(store => {
              const isSelected = store.id === selectedStoreId;
              return (
                <button
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`w-full text-left transition-shadow focus:outline-none ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  aria-pressed={isSelected}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-2">{store.name}</h3>
                      <div className="space-y-2 text-muted-foreground">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <span>{store.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary shrink-0" />
                          <a href={`tel:${store.phone}`} className="hover:text-primary transition-colors">
                            {store.phone}
                          </a>
                        </div>
                        {store.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary shrink-0" />
                            <a href={`mailto:${store.email}`} className="hover:text-primary transition-colors">
                              {store.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary shrink-0" />
                          <div className="flex items-center gap-2">
                            <span><span className="font-medium">{getCurrentDay()}:</span> {getTodayHours(store.business_hours)}</span>
                            {isOpenNow(getTodayHours(store.business_hours)) ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs whitespace-nowrap">Open now</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs whitespace-nowrap">Market closed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={getGoogleMapsLink(store.lat, store.lng, store.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="h-4 w-4" />
                        View in Google Maps
                      </a>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStore.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="w-full rounded-lg overflow-hidden shadow-sm will-change-transform"
              >
                {typeof selectedStore?.lat === 'number' && typeof selectedStore?.lng === 'number' && (
                  <iframe
                    title={`map-${selectedStore.id}`}
                    src={mapSrc(selectedStore.lat, selectedStore.lng)}
                    className="w-full h-64 md:h-96 border-0"
                    loading="lazy"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 bg-secondary/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">{selectedStore.name}</h2>
              <p className="text-muted-foreground mb-1">{selectedStore.address}</p>
              
              {/* Today's hours only */}
              {selectedStore.business_hours ? (
                <div className="mt-4 mb-2">
                  <p className="font-semibold text-foreground mb-2">Today's Hours:</p>
                  <div className="text-lg flex items-center gap-2">
                    <span className="font-medium text-primary">{getCurrentDay()}:</span>
                    <span className="text-foreground">{getTodayHours(selectedStore.business_hours)}</span>
                    {isOpenNow(getTodayHours(selectedStore.business_hours)) ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">Open now</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">Market closed</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground mb-1">Hours not available</p>
              )}
              
              <p className="text-muted-foreground mt-3">Contact: <a href={`tel:${selectedStore.phone}`} className="text-primary hover:underline">{selectedStore.phone}</a></p>
              
              {/* Google Maps Link */}
              {typeof selectedStore?.lat === 'number' && typeof selectedStore?.lng === 'number' && (
                <a
                  href={getGoogleMapsLink(selectedStore.lat, selectedStore.lng, selectedStore.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default StoreLocator;