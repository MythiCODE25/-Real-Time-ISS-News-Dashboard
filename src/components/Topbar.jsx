import { motion } from 'framer-motion';
import { Menu, Bell, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Mission Overview',
  '/iss': 'ISS Live Tracker',
  '/news': 'News Dashboard',
  '/charts': 'Analytics',
  '/chatbot': 'AI Assistant',
};

export default function Topbar({ onMenuClick }) {
  const { isDark } = useTheme();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 py-4"
      style={{
        background: isDark
          ? 'rgba(2,11,24,0.85)'
          : 'rgba(248,250,252,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(99,102,241,0.1)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl transition-colors hover:bg-primary-500/10"
        style={{ color: isDark ? '#94a3b8' : '#64748b' }}
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          {title}
        </h1>
        <p className="text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
          Real-time intelligence dashboard
        </p>
      </div>



      {/* Live badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{
          background: 'rgba(52,211,153,0.12)',
          color: '#34d399',
          border: '1px solid rgba(52,211,153,0.25)',
        }}>
        <div className="live-dot" />
        <span className="hidden sm:inline">LIVE</span>
      </div>

      {/* Notification bell */}
      <button
        className="relative p-2 rounded-xl transition-colors hover:bg-primary-500/10"
        style={{ color: isDark ? '#64748b' : '#94a3b8' }}
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
      </button>
    </motion.header>
  );
}
