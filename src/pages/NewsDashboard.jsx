import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Filter, SortAsc, Calendar, Globe,
  ExternalLink, AlertCircle, Newspaper, Tag, Clock
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { value: 'technology', label: '💻 Tech', color: '#6366f1' },
  { value: 'science', label: '🔬 Science', color: '#06b6d4' },
  { value: 'space', label: '🚀 Space', color: '#a855f7' },
  { value: 'business', label: '💼 Business', color: '#f97316' },
  { value: 'health', label: '🏥 Health', color: '#10b981' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#ec4899' },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
      <div className="skeleton w-full h-44" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>
    </div>
  );
}

function NewsCard({ article, index }) {
  const { isDark } = useTheme();
  const imgFallback = `https://picsum.photos/seed/${encodeURIComponent(article.title || index)}/400/220`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="news-card"
      style={{
        background: isDark ? 'rgba(4,17,40,0.75)' : 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <img
          src={article.image_url || imgFallback}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.src = imgFallback; }}
          style={{ display: 'block' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(2,11,24,0.8) 0%, transparent 60%)'
        }} />
        {article.category?.[0] && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}>
            {article.category[0]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Source & date */}
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 text-xs font-medium"
            style={{ color: '#6366f1' }}>
            <Globe size={10} />
            {article.source_id || 'Unknown Source'}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
            <Clock size={10} />
            {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2"
          style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            {article.description}
          </p>
        )}

        {/* Author */}
        {article.creator?.[0] && (
          <p className="text-xs mb-3" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
            ✍️ {article.creator[0]}
          </p>
        )}

        {/* Read more */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
            border: '1px solid rgba(99,102,241,0.25)',
            color: '#818cf8',
          }}
        >
          Read Article <ExternalLink size={10} />
        </a>
      </div>
    </motion.div>
  );
}

export default function NewsDashboard() {
  const {
    articles, isLoading, error, query, setQuery,
    category, setCategory, sortBy, setSortBy, fetchNews, lastFetched
  } = useNews();
  const { isDark } = useTheme();
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    fetchNews();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(searchInput);
    fetchNews(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <Newspaper size={22} className="text-purple-400" />
            News Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            {articles.length} articles • {lastFetched ? `Updated ${lastFetched.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => fetchNews(true)}
          disabled={isLoading}
          className="btn-ghost disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl p-4 border space-y-4"
        style={{
          background: isDark ? 'rgba(4,17,40,0.6)' : 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(99,102,241,0.15)',
        }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{
              background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
            <Search size={15} style={{ color: '#6366f1', flexShrink: 0 }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search news articles..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
            />
          </div>
          <button type="submit" className="btn-primary px-5">
            <Search size={14} /> Search
          </button>
        </form>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <Tag size={13} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: category === cat.value ? `${cat.color}20` : 'rgba(99,102,241,0.06)',
                  color: category === cat.value ? cat.color : isDark ? '#64748b' : '#94a3b8',
                  border: `1px solid ${category === cat.value ? cat.color + '40' : 'rgba(99,102,241,0.1)'}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <SortAsc size={13} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              style={{
                background: isDark ? 'rgba(4,17,40,0.8)' : '#fff',
                border: '1px solid rgba(99,102,241,0.2)',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="source">Sort by Source</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-6 text-center border"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="font-semibold text-red-400 mb-1">Failed to load news</p>
          <p className="text-sm mb-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{error}</p>
          <button onClick={() => fetchNews(true)} className="btn-primary mx-auto">
            <RefreshCw size={14} /> Try Again
          </button>
        </motion.div>
      )}

      {/* Articles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : articles.map((article, i) => (
              <NewsCard key={article.article_id || i} article={article} index={i} />
            ))
        }
      </div>

      {!isLoading && !error && articles.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📰</div>
          <p className="font-semibold text-lg" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>No articles found</p>
          <p className="text-sm mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            Try a different category or refresh the feed.
          </p>
        </div>
      )}
    </div>
  );
}
