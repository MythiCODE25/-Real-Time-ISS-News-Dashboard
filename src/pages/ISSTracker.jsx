import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, MapPin, Zap, Navigation, Clock, Users,
  Satellite, Wifi, WifiOff, Mountain
} from 'lucide-react';
import { useISS } from '../context/ISSContext';
import { useTheme } from '../context/ThemeContext';
import ISSMap from '../map/ISSMap';
import { SpeedChart } from '../charts/SpeedChart';

function InfoCard({ icon: Icon, label, value, color = '#6366f1', sub }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl p-4 border transition-all duration-300"
      style={{
        background: isDark ? 'rgba(4,17,40,0.7)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(12px)',
      }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: isDark ? '#475569' : '#94a3b8' }}>{sub}</p>}
    </motion.div>
  );
}

// Reverse geocode helper using lat/lon
function getOceanOrContinent(lat, lon) {
  if (lat > 66.5) return '🧊 Arctic Ocean / Polar Region';
  if (lat < -66.5) return '🧊 Antarctic Region';
  if (lon > -180 && lon < -30 && lat > 0 && lat < 75) return '🌊 North Atlantic Ocean';
  if (lon > -80 && lon < 20 && lat > -60 && lat < 0) return '🌊 South Atlantic Ocean';
  if (lon > 20 && lon < 147 && lat > -60 && lat < 30) return '🌊 Indian Ocean';
  if (lon > 100 || lon < -140) {
    if (lat > 0) return '🌊 North Pacific Ocean';
    return '🌊 South Pacific Ocean';
  }
  if (lat > 35 && lon > -12 && lon < 40) return '🌍 Europe / Mediterranean';
  if (lat > 0 && lat < 37 && lon > -20 && lon < 50) return '🌍 Africa';
  if (lat > 10 && lat < 77 && lon > 50 && lon < 145) return '🌏 Asia';
  if (lat > 10 && lat < 83 && lon > -170 && lon < -55) return '🌎 North America';
  if (lat > -55 && lat < 10 && lon > -82 && lon < -35) return '🌎 South America';
  if (lat < -10 && lon > 110) return '🌏 Australia / Oceania';
  return '🌍 Unknown Region';
}

export default function ISSTracker() {
  const { issData, issHistory, astronauts, speedHistory, isLoading, lastUpdated, error, fetchISS } = useISS();
  const { isDark } = useTheme();

  // Auto-refresh every 15 seconds
  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 15000);
    return () => clearInterval(interval);
  }, [fetchISS]);

  const nearestRegion = issData ? getOceanOrContinent(issData.lat, issData.lon) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Satellite size={22} className="text-cyan-400" />
            ISS Live Tracker
          </h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            Auto-refresh every 15 seconds • Real-time orbital data
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: error ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.12)',
              color: error ? '#ef4444' : '#34d399',
              border: `1px solid ${error ? 'rgba(239,68,68,0.25)' : 'rgba(52,211,153,0.25)'}`,
            }}>
            {error ? <WifiOff size={12} /> : <Wifi size={12} />}
            {error ? 'Connection Error' : 'LIVE'}
          </div>
          {/* Refresh */}
          <button onClick={fetchISS} disabled={isLoading}
            className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 rounded-xl text-sm flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <WifiOff size={16} /> {error}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <InfoCard icon={Navigation} label="Latitude" value={issData ? `${issData.lat?.toFixed(4)}°` : '—'} color="#06b6d4" />
        <InfoCard icon={Navigation} label="Longitude" value={issData ? `${issData.lon?.toFixed(4)}°` : '—'} color="#6366f1" />
        <InfoCard icon={Zap} label="Speed" value={issData ? `${issData.speed?.toLocaleString()} km/h` : '—'} color="#f97316" sub="Orbital" />
        <InfoCard icon={Mountain} label="Altitude" value={issData ? `${issData.altitude?.toFixed(1)} km` : '—'} color="#a855f7" />
        <InfoCard icon={MapPin} label="Nearest" value={nearestRegion} color="#ec4899" />
        <InfoCard icon={Clock} label="Updated" value={lastUpdated ? lastUpdated.toLocaleTimeString() : '—'} color="#10b981" />
      </div>

      {/* Main Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border"
        style={{
          background: isDark ? 'rgba(4,17,40,0.8)' : 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
          <h2 className="font-bold text-sm flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <span>🌍</span> Live ISS Position Map
            {issHistory.length > 0 && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                {issHistory.length} tracked points
              </span>
            )}
          </h2>
          <div className="flex items-center gap-4 text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#6366f1' }} />
              Trajectory
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base">🛸</span> ISS
            </span>
          </div>
        </div>
        <div className="p-3">
          <ISSMap issData={issData} issHistory={issHistory} />
        </div>
      </motion.div>

      {/* Speed Chart + Astronauts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speed chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 rounded-2xl p-5 border"
          style={{
            background: isDark ? 'rgba(4,17,40,0.7)' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Zap size={15} className="text-primary-400" />
            ISS Speed History
            <span className="ml-1 text-xs font-normal" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              (last {speedHistory.length} readings)
            </span>
          </h2>
          <SpeedChart data={speedHistory} />
        </motion.div>

        {/* Astronaut panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-5 border"
          style={{
            background: isDark ? 'rgba(4,17,40,0.7)' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(168,85,247,0.2)',
          }}>
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Users size={15} className="text-purple-400" />
            Crew in Space
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
              {astronauts.length} total
            </span>
          </h2>
          <div className="space-y-2.5 overflow-y-auto no-scrollbar" style={{ maxHeight: 240 }}>
            {astronauts.length === 0 ? (
              <div className="text-sm text-center py-8" style={{ color: '#475569' }}>
                Loading crew data...
              </div>
            ) : (
              astronauts.map((a, i) => (
                <motion.div key={a.name}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.12)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                    style={{ background: 'rgba(168,85,247,0.15)' }}>
                    🧑‍🚀
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{a.name}</p>
                    <p className="text-xs" style={{ color: '#a855f7' }}>{a.craft}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
