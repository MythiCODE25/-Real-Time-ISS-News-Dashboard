import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';

// Custom ISS icon — pulsing glow effect
const issIcon = L.divIcon({
  html: `<div style="
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    border-radius: 50%;
    border: 3px solid rgba(99,102,241,0.6);
    box-shadow: 0 0 20px rgba(99,102,241,0.8), 0 0 40px rgba(99,102,241,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    animation: issPulse 2s ease-in-out infinite;
  ">🛸</div>
  <style>
    @keyframes issPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); box-shadow: 0 0 30px rgba(99,102,241,1), 0 0 60px rgba(99,102,241,0.5); }
    }
  </style>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -25],
});

const pathDotIcon = L.divIcon({
  html: `<div style="
    width: 8px; height: 8px;
    background: #06b6d4;
    border-radius: 50%;
    opacity: 0.6;
    box-shadow: 0 0 6px rgba(6,182,212,0.8);
  "></div>`,
  className: '',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

export default function ISSMap({ issData, issHistory }) {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markerRef    = useRef(null);
  const pathRef      = useRef(null);
  const dotsLayerRef = useRef(null); // LayerGroup so we can wipe all dots cleanly
  const { isDark }   = useTheme();

  // ── Initialize map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(
      isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    ).addTo(map);

    // LayerGroup for path dots — easy to clear in bulk
    dotsLayerRef.current = L.layerGroup().addTo(map);

    mapInstance.current = map;

    return () => {
      // Clean up on unmount so HMR doesn't leave a zombie instance
      try { map.remove(); } catch { /* already removed */ }
      mapInstance.current = null;
      markerRef.current   = null;
      pathRef.current     = null;
      dotsLayerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update marker + trajectory when ISS data changes ────────────────────
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !issData) return;

    const { lat, lon, altitude, speed } = issData;

    // Move or create the ISS marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      markerRef.current
        .getPopup()
        ?.setContent(popupContent(lat, lon, altitude, speed));
    } else {
      try {
        markerRef.current = L.marker([lat, lon], { icon: issIcon })
          .addTo(map)
          .bindPopup(popupContent(lat, lon, altitude, speed));
      } catch (err) {
        console.warn('ISSMap: marker creation failed', err);
        return;
      }
    }

    // Redraw trajectory polyline
    if (pathRef.current) {
      try { map.removeLayer(pathRef.current); } catch { /* ok */ }
    }
    if (issHistory.length > 1) {
      pathRef.current = L.polyline(
        issHistory.map(p => [p.lat, p.lon]),
        { color: '#6366f1', weight: 2, opacity: 0.7, dashArray: '8,6' }
      ).addTo(map);
    }

    // Redraw path dots (clear previous batch first)
    if (dotsLayerRef.current) {
      dotsLayerRef.current.clearLayers();
      issHistory.slice(0, -1).forEach(pos => {
        L.marker([pos.lat, pos.lon], { icon: pathDotIcon })
          .addTo(dotsLayerRef.current);
      });
    }

    // Smoothly pan to ISS
    map.panTo([lat, lon], { animate: true, duration: 1 });
  }, [issData, issHistory]);

  return (
    /*
     * isolation: isolate scopes Leaflet's internal z-indices (tiles=200,
     * overlays=400, popups=700…) so they cannot cover fixed UI elements
     * (chatbot FAB, sidebar) that live outside this subtree.
     */
    <div
      className="relative w-full"
      style={{ height: 420, isolation: 'isolate', zIndex: 0 }}
    >
      <div
        ref={mapRef}
        style={{ height: '100%', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}
      />
      {!issData && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(2,11,24,0.75)', zIndex: 1 }}
        >
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">🛸</div>
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
              Loading ISS position…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function popupContent(lat, lon, altitude, speed) {
  return `
    <div style="font-family: Inter, sans-serif; min-width: 180px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#818cf8;">🛸 ISS Position</div>
      <div style="font-size:12px;line-height:1.8;color:#e2e8f0;">
        <div>📍 <b>Lat:</b> ${lat?.toFixed(4)}°</div>
        <div>📍 <b>Lon:</b> ${lon?.toFixed(4)}°</div>
        <div>🚀 <b>Alt:</b> ${altitude?.toFixed(2)} km</div>
        <div>⚡ <b>Speed:</b> ${speed?.toLocaleString()} km/h</div>
      </div>
    </div>`;
}
