import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Satellite, Newspaper, Bot, BarChart2, Activity,
  Users, Globe, Zap, ArrowRight, TrendingUp
} from 'lucide-react';
import { useISS } from '../context/ISSContext';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  }),
};

function StatCard({ icon: Icon, label, value, sub, color, delay, to }) {
  const { isDark } = useTheme();
  const Wrapper = to ? Link : 'div';

  return (
    <motion.div custom={delay} variants={cardVariants} initial="hidden" animate="visible">
      <Wrapper to={to}>
        <div className="stat-card group"
          style={{
            background: isDark ? 'rgba(4,17,40,0.7)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${color}22`,
          }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon size={20} style={{ color }} />
            </div>
            {to && (
              <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color }} />
            )}
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            {value ?? '—'}
          </p>
          <p className="text-sm font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{label}</p>
          {sub && <p className="text-xs mt-1" style={{ color: isDark ? '#475569' : '#94a3b8' }}>{sub}</p>}
        </div>
      </Wrapper>
    </motion.div>
  );
}

function QuickLink({ icon: Icon, label, desc, to, color }) {
  const { isDark } = useTheme();
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className="group p-5 rounded-2xl border transition-all duration-300 cursor-pointer"
        style={{
          background: isDark ? 'rgba(4,17,40,0.6)' : 'rgba(255,255,255,0.7)',
          border: `1px solid ${color}20`,
          backdropFilter: 'blur(12px)',
        }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{label}</h3>
          <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1"
            style={{ color }} />
        </div>
        <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{desc}</p>
      </motion.div>
    </Link>
  );
}

export default function Overview() {
  const { issData, astronauts, fetchISS, isLoading } = useISS();
  const { articles, fetchNews } = useNews();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchISS();
    fetchNews();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        {/* Background orb */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="live-dot" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Mission Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gradient">
            SpaceTrack Intelligence Dashboard
          </h1>
          <p className="text-sm sm:text-base max-w-xl" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Real-time ISS tracking, live news intelligence, and AI-powered insights — all in one command center.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/iss" className="btn-primary">
              <Satellite size={15} /> Track ISS Live
            </Link>
            <Link to="/news" className="btn-ghost">
              <Newspaper size={15} /> Browse News
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
          Live Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Activity} label="ISS Speed" color="#6366f1"
            value={issData ? `${issData.speed?.toLocaleString()} km/h` : 'Loading...'}
            sub="Orbital velocity" delay={0} to="/iss"
          />
          <StatCard
            icon={Globe} label="ISS Position" color="#06b6d4"
            value={issData ? `${issData.lat?.toFixed(2)}°, ${issData.lon?.toFixed(2)}°` : 'Loading...'}
            sub="Lat / Lon" delay={1} to="/iss"
          />
          <StatCard
            icon={Users} label="Crew in Space" color="#a855f7"
            value={astronauts.length || '—'}
            sub="ISS Astronauts" delay={2} to="/iss"
          />
          <StatCard
            icon={Newspaper} label="News Articles" color="#f97316"
            value={articles.length || '—'}
            sub="Live feed" delay={3} to="/news"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
          Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink icon={Satellite} label="ISS Tracker" to="/iss" color="#06b6d4"
            desc="Live position, trajectory, speed charts" />
          <QuickLink icon={Newspaper} label="News Feed" to="/news" color="#a855f7"
            desc="AI-curated tech & space news" />
          <QuickLink icon={BarChart2} label="Analytics" to="/charts" color="#f97316"
            desc="Speed charts, category breakdowns" />
          <QuickLink icon={Bot} label="ARIA Chatbot" to="/chatbot" color="#ec4899"
            desc="Ask ARIA about ISS & news" />
        </div>
      </div>

      {/* Astronaut list */}
      {astronauts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="rounded-2xl p-5"
          style={{
            background: isDark ? 'rgba(4,17,40,0.7)' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Users size={15} className="text-primary-400" />
            Current Space Crew
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              {astronauts.length} people
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {astronauts.map((a, i) => (
              <motion.div key={a.name}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: isDark ? '#c7d7fe' : '#4338ca',
                }}>
                <span>🧑‍🚀</span>
                {a.name}
                <span className="text-xs opacity-60">• {a.craft}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
