
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const CATEGORIES = [
   { id: "education", name: "Education", icon: "🏫" },
  { id: "national", name: "National", icon: "🏛️" },
   { id: "international", name: "InterNational", icon: "🌍" },
  { id: "regional", name: "Andhra Pradesh", icon: "📍" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "politics", name: "Politics", icon: "⚖️" },
  { id: "cinema", name: "Cinema", icon: "🎬" },
  { id: "sports", name: "Sports", icon: "⚽" },
];

function useNews(category, page, perPage, refreshKey) {
  const [state, setState] = useState({
    loading: true,
    items: [],
    total: 0,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await axios.get(`${API_BASE}/news/${category}`, {
          params: { page, per_page: perPage },
        });
        if (!cancelled) {
          setState({
            loading: false,
            items: res.data.items || [],
            total: res.data.total || 0,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            items: [],
            total: 0,
            error: err.message || "Failed to fetch",
          });
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [category, page, perPage, refreshKey]);

  return state;
}

function NewsCard({ item }) {
  const timeAgo = item.published ? dayjs(item.published).fromNow() : "Unknown";
  const summary =
    (item.summary && item.summary.replace(/<[^>]+>/g, "")) || "";

  return (
  <a
  href={item.link}  // opens in the same page
  className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-400"
>

      <div className="relative h-56 bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title || "news image"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-brand-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors duration-200">
          {item.title || "Untitled"}
        </h3>

        <p
          className="text-gray-600 text-sm mb-4"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={summary}
        >
          {summary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="flex items-center text-xs text-gray-500">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {timeAgo}
          </span>
          <span className="text-brand-600 text-sm font-semibold group-hover:underline flex items-center">
            Read more
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
        <div className="flex justify-between pt-3">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        className={`px-4 py-2 rounded-lg border text-sm ${
          canPrev
            ? "bg-white hover:bg-gray-50 border-gray-200"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
      >
        Prev
      </button>
      <span className="px-3 py-2 text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        className={`px-4 py-2 rounded-lg border text-sm ${
          canNext
            ? "bg-white hover:bg-gray-50 border-gray-200"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </div>
  );
}

function AppInner() {
  const [selectedCategory, setSelectedCategory] = useState("national");
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [refreshKey, setRefreshKey] = useState(0);

  const { loading, items, total, error } = useNews(
    selectedCategory,
    page,
    perPage,
    refreshKey
  );

  const totalPages = Math.ceil((total || 0) / perPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                  News
                </span>
                <span className="ml-1.5">Hub</span>
                <span className="ml-3 text-2xl">📰</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Stay updated with the latest headlines
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-sm"
                title="Refresh"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                      : "bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-600 border border-gray-200"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Failed to load news
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: perPage }).map((_, idx) => (
                <LoadingSkeleton key={idx} />
              ))
            : items.map((item) => (
                <NewsCard key={item.id || item.link || Math.random()} item={item} />
              ))}
        </div>

        {/* Empty */}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">
              No articles right now
            </h3>
            <p className="text-gray-500 mt-1">
              Try another category or refresh
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && items.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages || 1}
            onChange={(p) => setPage(p)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        Built with ❤️
      </footer>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // Optionally log
    // console.error(err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-sm">
              Please refresh the page or try again later.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
