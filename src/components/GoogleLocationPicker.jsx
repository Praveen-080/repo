import { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";

// Free usage strategy: only embed map JS with a key (user must supply); no paid APIs like Places/Directions called.
// Reverse geocoding still handled by Nominatim to avoid Google Geocoding API costs.

const containerStyle = { width: "100%", height: "260px" };

export default function GoogleLocationPicker({ apiKey, onChange, coords }) {
  const [center, setCenter] = useState(coords || { lat: 13.0827, lng: 80.2707 }); // Chennai default
  const [markerPos, setMarkerPos] = useState(center);
  const [loadingLocate, setLoadingLocate] = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({ id: "google-map-script", googleMapsApiKey: apiKey });

  // Geolocate user
  const locate = useCallback(() => {
    if (!navigator.geolocation) return alert("Geolocation unsupported");
    setLoadingLocate(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        const c = { lat: latitude, lng: longitude };
        setCenter(c);
        setMarkerPos(c);
        setAccuracy(acc || null);
        onChange?.({ lat: latitude, lon: longitude });
        setLoadingLocate(false);
      },
      (err) => {
        alert(err.code === 1 ? "Permission denied" : "Failed to get location");
        setLoadingLocate(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [onChange]);

  useEffect(() => {
    if (coords) {
      const c = { lat: coords.lat, lng: coords.lon };
      setCenter(c);
      setMarkerPos(c);
    }
  }, [coords]);

  const handleDragEnd = (e) => {
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPos(newPos);
    onChange?.({ lat: newPos.lat, lon: newPos.lng });
  };

  if (loadError) return <div className="text-red-600 text-sm">Failed to load Google Maps</div>;
  if (!isLoaded) return <div className="text-sm text-muted-foreground">Loading map…</div>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="button" variant="secondary" onClick={locate} disabled={loadingLocate}>
          {loadingLocate ? "Locating…" : "Use My Location"}
        </Button>
        {accuracy != null && (
          <span className="text-xs text-muted-foreground">Accuracy ~{Math.round(accuracy)} m</span>
        )}
      </div>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={16} onClick={(e) => handleDragEnd(e)}>
        <Marker position={markerPos} draggable onDragEnd={handleDragEnd} />
      </GoogleMap>
      <p className="text-xs text-muted-foreground">Drag marker to fine tune the delivery point.</p>
    </div>
  );
}
