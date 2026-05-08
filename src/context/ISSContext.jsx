import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ISSContext = createContext(null);

// Static crew fallback — used when all astronaut APIs fail
const STATIC_CREW = [
  { name: 'Oleg Kononenko', craft: 'ISS' },
  { name: 'Nikolai Chub', craft: 'ISS' },
  { name: 'Tracy Dyson', craft: 'ISS' },
  { name: 'Matthew Dominick', craft: 'ISS' },
  { name: 'Michael Barratt', craft: 'ISS' },
  { name: 'Jeanette Epps', craft: 'ISS' },
  { name: 'Alexander Grebenkin', craft: 'ISS' },
];

// Fetch with a timeout so slow/rate-limited APIs don't hang the page
async function fetchWithTimeout(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Haversine formula — distance between two lat/lon points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function ISSProvider({ children }) {
  const [issData, setISSData] = useState(null);
  const [issHistory, setISSHistory] = useState([]);
  const [astronauts, setAstronauts] = useState(STATIC_CREW); // ← pre-seeded so never empty
  const [speedHistory, setSpeedHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const prevPosRef = useRef(null);
  const astronautFetchedRef = useRef(false); // only try astronaut APIs once per session

  // ─── Astronaut fetch (completely isolated, never blocks ISS data) ──────────
  const fetchAstronauts = useCallback(async () => {
    if (astronautFetchedRef.current) return; // already succeeded once
    try {
      // Use our own serverless proxy at /api/astronauts — no CORS issues
      const res = await fetchWithTimeout('/api/astronauts', 8000);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const people = json?.people;
      if (Array.isArray(people) && people.length > 0) {
        setAstronauts(people);
        astronautFetchedRef.current = true;
      }
    } catch {
      // Astronaut API failed — static fallback is already set, so do nothing
      console.warn('Astronaut API unavailable — using static crew list');
    }
  }, []);

  // ─── ISS position fetch (wheretheiss.at — good CORS support) ─────────────
  const fetchISS = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout(
        'https://api.wheretheiss.at/v1/satellites/25544',
        8000
      );
      if (!res.ok) throw new Error(`wheretheiss.at responded ${res.status}`);
      const json = await res.json();

      const lat = parseFloat(json.latitude);
      const lon = parseFloat(json.longitude);
      const altitude = parseFloat(json.altitude);
      const velocity = parseFloat(json.velocity); // km/h — already calculated by the API

      const newPoint = { lat, lon, altitude, timestamp: Date.now() };

      // Supplement API velocity with Haversine-derived speed when possible
      let speed = velocity;
      if (prevPosRef.current) {
        const { lat: pLat, lon: pLon, timestamp: pTime } = prevPosRef.current;
        const dist = haversineDistance(pLat, pLon, lat, lon);
        const hours = (Date.now() - pTime) / 3_600_000;
        const derived = hours > 0 ? dist / hours : 0;
        speed = derived > 1000 ? derived : velocity; // sanity-check (ISS ≈ 27 600 km/h)
      }
      prevPosRef.current = newPoint;

      setISSData({ lat, lon, altitude, speed: Math.round(speed), timestamp: json.timestamp });
      setLastUpdated(new Date());
      setISSHistory(prev => [...prev, newPoint].slice(-20));
      setSpeedHistory(prev =>
        [...prev, { time: new Date().toLocaleTimeString(), speed: Math.round(speed) }].slice(-30)
      );
    } catch (err) {
      console.error('ISS position fetch failed:', err);
      // Only show the error banner — do NOT wipe issData so the last known position stays visible
      setError('ISS position temporarily unavailable. Retrying…');
    } finally {
      setIsLoading(false);
    }

    // Fire-and-forget astronaut fetch — completely independent
    fetchAstronauts();
  }, [fetchAstronauts]);

  return (
    <ISSContext.Provider value={{
      issData, issHistory, astronauts, speedHistory,
      isLoading, lastUpdated, error, fetchISS,
    }}>
      {children}
    </ISSContext.Provider>
  );
}

export const useISS = () => {
  const ctx = useContext(ISSContext);
  if (!ctx) throw new Error('useISS must be inside ISSProvider');
  return ctx;
};
