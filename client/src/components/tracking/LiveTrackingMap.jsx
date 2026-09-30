/**
 * Live Tracking Leaflet Map
 * 
 * Features:
 * - Real-Time animated delivery rider marker moving along route polyline
 * - Custom Glowing SVG Map Icons (Restaurant, Delivery Scooter, Destination)
 * - OpenStreetMap tiles (100% Free, Zero API Keys required)
 * - Automatic bounds fitting and interactive recenter button
 */

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Compass, MapPin, Store, Bike, Home } from 'lucide-react';

// Custom SVG HTML Icons for Leaflet
const createCustomIcon = (htmlContent, size = [42, 42]) => {
  return L.divIcon({
    html: htmlContent,
    className: 'custom-leaflet-marker',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
  });
};

const restaurantIcon = createCustomIcon(`
  <div class="rider-marker-container">
    <div style="background: linear-gradient(135deg, #ff416c, #ff4b2b); width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(255,75,31,0.6); border: 2px solid #ffffff;">
      <span style="font-size: 18px;">🍳</span>
    </div>
  </div>
`);

const customerIcon = createCustomIcon(`
  <div class="rider-marker-container">
    <div style="background: linear-gradient(135deg, #00f0ff, #0072ff); width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,240,255,0.6); border: 2px solid #ffffff;">
      <span style="font-size: 18px;">🏠</span>
    </div>
  </div>
`);

const createRiderIcon = heading => {
  return createCustomIcon(`
    <div class="rider-marker-container">
      <div class="pulse-ring"></div>
      <div style="background: linear-gradient(135deg, #ff7a00, #ff4b1f); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(255,122,0,0.8); border: 3px solid #ffffff; transform: rotate(${heading || 0}deg); transition: transform 0.4s ease;">
        <span style="font-size: 20px; transform: rotate(-${heading || 0}deg);">🛵</span>
      </div>
    </div>
  `, [48, 48]);
};

// Map View Controller Helper Component
const MapViewController = ({ riderPos, restaurantPos, customerPos }) => {
  const map = useMap();

  useEffect(() => {
    if (riderPos && riderPos.lat && riderPos.lng) {
      map.panTo([riderPos.lat, riderPos.lng], { animate: true, duration: 1.5 });
    }
  }, [riderPos, map]);

  return null;
};

export const LiveTrackingMap = ({
  restaurantPos,
  customerPos,
  riderPos,
  routePolyline = [],
  restaurantName = 'Restaurant',
  customerAddress = 'Delivery Destination',
  riderName = 'Rider Alex',
  riderHeading = 0,
  orderStatus = 'Out for Delivery',
}) => {
  const defaultCenter = riderPos || restaurantPos || { lat: 37.7833, lng: -122.4167 };
  const mapRef = useRef(null);

  // Convert polyline objects to leaflet [lat, lng] tuples
  const polylineCoords = routePolyline.map(p => [p.lat, p.lng]);

  const handleRecenter = () => {
    if (mapRef.current && riderPos) {
      mapRef.current.setView([riderPos.lat, riderPos.lng], 15, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full dark-map-tiles"
        ref={mapRef}
      >
        {/* Free OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Map Controller */}
        <MapViewController
          riderPos={riderPos}
          restaurantPos={restaurantPos}
          customerPos={customerPos}
        />

        {/* 1. Restaurant Marker */}
        {restaurantPos && (
          <Marker position={[restaurantPos.lat, restaurantPos.lng]} icon={restaurantIcon}>
            <Popup className="custom-popup">
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-dark-900">{restaurantName}</p>
                <p className="text-[10px] text-slate-600">Kitchen & Pickup Origin</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Customer Destination Marker */}
        {customerPos && (
          <Marker position={[customerPos.lat, customerPos.lng]} icon={customerIcon}>
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-dark-900">Your Delivery Address</p>
                <p className="text-[10px] text-slate-600">{customerAddress}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Live Animated Delivery Rider Marker */}
        {riderPos && (
          <Marker
            position={[riderPos.lat, riderPos.lng]}
            icon={createRiderIcon(riderHeading)}
          >
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-dark-900">{riderName}</p>
                <p className="text-[10px] text-emerald-600 font-bold">● Active Transit ({riderPos.speedKmh || 28} km/h)</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Glowing Route Polyline Path */}
        {polylineCoords.length > 0 && (
          <>
            {/* Background glowing halo */}
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: '#ff4b1f',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
              }}
            />
            {/* Foreground crisp route */}
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: '#ff7a00',
                weight: 4,
                opacity: 0.9,
                dashArray: '8, 8',
                lineCap: 'round',
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="px-3.5 py-1.5 rounded-xl glass-panel text-xs font-bold text-white shadow-lg flex items-center gap-2 border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-Time GPS Active</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[400]">
        <button
          onClick={handleRecenter}
          className="p-3 rounded-2xl glass-panel bg-dark-900/90 text-slate-200 hover:text-white border border-white/20 shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold"
          title="Recenter Map on Rider"
        >
          <Navigation className="w-4 h-4 text-brand-400" />
          <span>Recenter Rider</span>
        </button>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
