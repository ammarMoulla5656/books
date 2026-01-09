'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { FiSun, FiMoon, FiBookmark, FiHome, FiInfo, FiMail } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const { readingSettings, toggleDarkMode } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50 islamic-pattern">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <h1 className="text-2xl font-bold text-gray-900 arabic-text">
                المكتبة الإسلامية
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gray-100 loading-shimmer"></div>
              <div className="w-9 h-9 rounded-lg bg-gray-100 loading-shimmer"></div>
              <div className="w-9 h-9 rounded-lg bg-gray-100 loading-shimmer"></div>
              <div className="w-9 h-9 rounded-lg bg-gray-100 loading-shimmer"></div>
              <div className="w-9 h-9 rounded-lg bg-gray-100 loading-shimmer"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-[#1a2028] shadow-lg sticky top-0 z-50 transition-all duration-300 islamic-pattern border-b-2 border-transparent dark:border-[#d4af37]/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
            <h1 className="text-xl md:text-2xl font-bold arabic-text islamic-gold-text">
              المكتبة الإسلامية
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-all duration-200 text-[#1a5f3f] dark:text-[#d4af37] hover:scale-110"
              title="الرئيسية"
            >
              <FiHome className="w-5 h-5" />
            </Link>

            <Link
              href="/bookmarks"
              className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-all duration-200 text-[#1a5f3f] dark:text-[#d4af37] hover:scale-110"
              title="العلامات المرجعية"
            >
              <FiBookmark className="w-5 h-5" />
            </Link>

            <Link
              href="/about"
              className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-all duration-200 text-[#1a5f3f] dark:text-[#d4af37] hover:scale-110"
              title="من نحن"
            >
              <FiInfo className="w-5 h-5" />
            </Link>

            <Link
              href="/contact"
              className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-all duration-200 text-[#1a5f3f] dark:text-[#d4af37] hover:scale-110"
              title="اتصل بنا"
            >
              <FiMail className="w-5 h-5" />
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-all duration-200 text-[#1a5f3f] dark:text-[#d4af37] hover:scale-110 hover:rotate-12"
              title={readingSettings.darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {readingSettings.darkMode ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
