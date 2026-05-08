import { createContext, useContext, useState, useCallback } from 'react';

const NewsContext = createContext(null);

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function NewsProvider({ children }) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('technology');
  const [sortBy, setSortBy] = useState('date');
  const [lastFetched, setLastFetched] = useState(null);

  const getCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, timestamp, cachedCategory } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_DURATION) return null;
      if (cachedCategory !== category) return null;
      return data;
    } catch {
      return null;
    }
  };

  const setCache = (data, cat) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
        cachedCategory: cat,
      }));
    } catch { /* ignore */ }
  };

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    if (!forceRefresh) {
      const cached = getCache();
      if (cached) {
        setArticles(cached);
        setIsLoading(false);
        return;
      }
    }

    try {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&category=${category}&language=en&size=10${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      const results = (json.results || []).filter(a => a.title && a.link);
      setArticles(results);
      setCache(results, category);
      setLastFetched(new Date());
    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message || 'Failed to fetch news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [category, query]);

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
    }
    if (sortBy === 'source') {
      return (a.source_id || '').localeCompare(b.source_id || '');
    }
    return 0;
  });

  // Category distribution for pie chart
  const categoryDistribution = articles.reduce((acc, article) => {
    const cats = article.category || ['general'];
    cats.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <NewsContext.Provider value={{
      articles: sortedArticles, rawArticles: articles,
      isLoading, error, query, setQuery,
      category, setCategory, sortBy, setSortBy,
      fetchNews, lastFetched, categoryDistribution
    }}>
      {children}
    </NewsContext.Provider>
  );
}

export const useNews = () => {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be inside NewsProvider');
  return ctx;
};
