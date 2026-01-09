'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Real-time search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-12">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الكتب والمحتوى..."
          className="w-full px-6 py-4 pr-14 rounded-xl border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4] placeholder-[#2d7a54]/50 dark:placeholder-[#d4af37]/50 focus:outline-none focus:border-[#d4af37] dark:focus:border-[#d4af37] arabic-text text-lg font-medium shadow-lg transition-all duration-300 focus:shadow-xl focus:shadow-[#d4af37]/20"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#1a5f3f] dark:text-[#d4af37] hover:text-[#d4af37] dark:hover:text-[#e8dcc4] transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="text-[#1a5f3f] dark:text-[#d4af37] hover:text-[#d4af37] dark:hover:text-[#e8dcc4] transition-all hover:scale-110"
          >
            <FiSearch className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
      </div>
      {query && (
        <p className="text-center mt-3 text-sm text-[#2d7a54] dark:text-[#d4af37] arabic-text">
          البحث عن: <span className="font-bold">{query}</span>
        </p>
      )}
    </form>
  );
}
