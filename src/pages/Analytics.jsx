import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Zap, Newspaper, Globe, RefreshCw } from 'lucide-react';
import { useISS } from '../context/ISSContext';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';
import { SpeedChart } from '../charts/SpeedChart';
import NewsChart from '../charts/NewsChart';
import ISSMap from '../map/ISSMap';

function ChartCard({ title, icon: Icon, iconColor = '#6366f1', children, desc }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{
        background: isDark ? 'rgba(4,17,40,0.75)' : 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-bold text-sm flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Icon size={15} style={{ color: iconColor }} />
            {title}
          </h2>
          {desc && <p className="text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{desc}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default function Analytics() {
  const { issData, issHistory, speedHistory, fetchISS } = useISS();
  const { articles, categoryDistribution, fetchNews } = useNews();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchISS();
    fetchNews();
    const interval = setInterval(fetchISS, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <BarChart2 size={22} className="text-orange-400" />
            Analytics & Visualization
          </h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            Real-time charts with live data updates every 15s
          </p>
        </div>
        <button onClick={() => { fetchISS(); fetchNews(true); }} className="btn-ghost">
          <RefreshCw size={14} /> Refresh All
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Speed Readings', value: speedHistory.length, icon: Zap, color: '#f97316' },
          { label: 'ISS Path Points', value: issHistory.length, icon: Globe, color: '#06b6d4' },
          { label: 'Articles Indexed', value: articles.length, icon: Newspaper, color: '#a855f7' },
          { label: 'Categories Tracked', value: Object.keys(categoryDistribution).length, icon: BarChart2, color: '#6366f1' },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-4 border text-center"
            style={{
              background: isDark ? 'rgba(4,17,40,0.7)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${item.color}20`,
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `${item.color}18` }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <p className="text-2xl font-extrabold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{item.value}</p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ISS Speed chart */}
        <ChartCard
          title="ISS Speed Over Time"
          icon={Zap}
          iconColor="#f97316"
          desc={`Last ${speedHistory.length} measurements • Auto-updated`}
        >
          <SpeedChart data={speedHistory} />
        </ChartCard>

        {/* News distribution chart */}
        <ChartCard
          title="News Category Distribution"
          icon={Newspaper}
          iconColor="#a855f7"
          desc={`${articles.length} articles across ${Object.keys(categoryDistribution).length} categories`}
        >
          <NewsChart data={categoryDistribution} />
        </ChartCard>
      </div>

      {/* Full-width ISS map */}
      <ChartCard
        title="ISS Live Map"
        icon={Globe}
        iconColor="#06b6d4"
        desc="Interactive map with trajectory path and live position"
      >
        <ISSMap issData={issData} issHistory={issHistory} />
      </ChartCard>

      {/* Speed stats table */}
      {speedHistory.length > 0 && (
        <ChartCard title="Speed Data Log" icon={BarChart2} iconColor="#6366f1"
          desc="Historical orbital velocity readings">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {['#', 'Time', 'Speed (km/h)', 'Deviation'].map(col => (
                    <th key={col} className="text-left pb-3 pr-4 font-semibold"
                      style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {speedHistory.slice(-10).reverse().map((entry, i) => {
                  const avg = speedHistory.reduce((s, e) => s + e.speed, 0) / speedHistory.length;
                  const dev = ((entry.speed - avg) / avg * 100).toFixed(2);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td className="py-2.5 pr-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{i + 1}</td>
                      <td className="py-2.5 pr-4 font-mono" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{entry.time}</td>
                      <td className="py-2.5 pr-4 font-bold" style={{ color: '#6366f1' }}>
                        {entry.speed?.toLocaleString()}
                      </td>
                      <td className="py-2.5" style={{ color: parseFloat(dev) >= 0 ? '#10b981' : '#ef4444' }}>
                        {parseFloat(dev) >= 0 ? '+' : ''}{dev}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
