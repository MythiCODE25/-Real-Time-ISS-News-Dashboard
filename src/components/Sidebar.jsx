import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite, Newspaper, Bot, BarChart2, Home,
  ChevronLeft, ChevronRight, Moon, Sun, X, Menu,
  Zap, Globe, Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', icon: Home, label: 'Overview', color: '#6366f1' },
  { path: '/iss', icon: Satellite, label: 'ISS Tracker', color: '#06b6d4' },
  { path: '/news', icon: Newspaper, label: 'News Feed', color: '#a855f7' },
  { path: '/charts', icon: BarChart2, label: 'Analytics', color: '#f97316' },
  { path: '/chatbot', icon: Bot, label: 'AI Assistant', color: '#ec4899' },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Close mobile on route change
  useEffect(() => { onMobileClose?.(); }, [location.pathname]);

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 72 },
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen sticky top-0 z-30 overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(4,17,40,0.98) 0%, rgba(7,26,62,0.95) 100%)'
            : 'linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.95) 100%)',
          borderRight: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} isDark={isDark} toggleTheme={toggleTheme} />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50 lg:hidden"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, #041128 0%, #071a3e 100%)'
                : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRight: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-primary-400 hover:bg-primary-400/10 transition-colors"
            >
              <X size={18} />
            </button>
            <SidebarContent collapsed={false} setCollapsed={() => {}} isDark={isDark} toggleTheme={toggleTheme} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ collapsed, setCollapsed, isDark, toggleTheme }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          <Globe size={18} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="font-bold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
              SpaceTrack AI
            </div>
            <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Dashboard v2.0</div>
          </motion.div>
        )}
        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1.5 rounded-lg hidden lg:flex items-center justify-center transition-colors hover:bg-primary-500/10"
          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ path, icon: Icon, label, color }) => (
          <NavLink key={path} to={path} end={path === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive ? color : (isDark ? '#94a3b8' : '#64748b'),
                  background: isActive ? `${color}20` : 'transparent',
                  borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? label : ''}
              >
                <Icon size={18} style={{ color: isActive ? color : 'inherit', flexShrink: 0 }} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="font-medium text-sm"
                  >
                    {label}
                  </motion.span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
        {/* Live status */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(52,211,153,0.08)' }}>
            <div className="live-dot" />
            <span className="text-xs font-medium text-emerald-400">Systems Live</span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-primary-500/10"
          style={{
            color: isDark ? '#94a3b8' : '#64748b',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-primary-400" />}
          {!collapsed && (
            <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        {/* Version badge */}
        {!collapsed && (
          <div className="px-3 py-1.5 text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
            <Zap size={10} className="inline mr-1 text-primary-400" />
            FOAI End Sem Project
          </div>
        )}
      </div>
    </div>
  );
}
